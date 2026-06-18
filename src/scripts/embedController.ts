/**
 * Live Embed lifecycle for the Showcase. Lazy-mounts a cross-origin <iframe> over a
 * Project's Poster, runs the two-way readiness handshake (with a graceful fallback),
 * fades the Poster out on reveal, keeps mounted embeds alive across switches (LRU-capped),
 * and warms embed origins at idle / on Selector intent. Pure logic: embedLifecycle.ts.
 * Plain processed module (no framework island) — mirrors showcaseController.ts.
 */
import {
  PROTOCOL_VERSION, embedOrigin, isReadyMessage,
  createRevealRace, lruEvict, shouldMount, type RevealRace,
} from './embedLifecycle';

const LIVE_CAP = 3;
const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const showcase = document.getElementById('showcase');

// JS gate must stay in sync with the CSS breakpoint (--showcase-embed-min in global.css).
const bp = getComputedStyle(document.documentElement)
  .getPropertyValue('--showcase-embed-min').trim() || '800px';
const isDesktop = () => window.matchMedia(`(min-width: ${bp})`).matches;

interface EmbedEntry {
  id: string;
  stage: HTMLElement;
  iframe: HTMLIFrameElement;
  poster: HTMLElement;
  url: string;
  origin: string;
  requiresLaunch: boolean;
  embedMobile: boolean;
  mounted: boolean;
  revealed: boolean;
  race?: RevealRace;
  helloTimer?: number;
  posterEndHandler?: () => void;
}

const entries = new Map<string, EmbedEntry>();
const mountOrder: string[] = [];
const warmed = new Set<string>();

function collect() {
  for (const stage of document.querySelectorAll<HTMLElement>('.stage[data-embed-url]')) {
    const id = stage.dataset.project;
    const iframe = stage.querySelector<HTMLIFrameElement>('iframe[data-embed-frame]');
    const poster = stage.querySelector<HTMLElement>('[data-embed-poster]');
    const url = stage.dataset.embedUrl;
    if (!id || !iframe || !poster || !url) continue;
    entries.set(id, {
      id, stage, iframe, poster, url, origin: embedOrigin(url),
      requiresLaunch: stage.dataset.embedRequiresLaunch !== undefined,
      embedMobile: stage.dataset.embedMobile !== undefined,
      mounted: false, revealed: false,
    });
  }
}

function warm(origin: string) {
  if (warmed.has(origin)) return;
  warmed.add(origin);
  for (const rel of ['preconnect', 'dns-prefetch']) {
    const link = document.createElement('link');
    link.rel = rel;
    link.href = origin;
    if (rel === 'preconnect') link.crossOrigin = '';
    document.head.appendChild(link);
  }
}

function reveal(entry: EmbedEntry) {
  if (entry.revealed) return;
  entry.revealed = true;
  if (entry.helloTimer) window.clearInterval(entry.helloTimer);
  entry.iframe.removeAttribute('inert');
  entry.iframe.removeAttribute('tabindex');
  entry.stage.classList.add('embed-revealed'); // CSS fades the poster + drops the pointer shield
  if (reduceMotion()) {
    entry.poster.style.display = 'none';
  } else {
    const onEnd = () => {
      entry.poster.style.display = 'none';
      entry.poster.removeEventListener('transitionend', onEnd);
      entry.posterEndHandler = undefined;
    };
    // Tracked on the entry so unmount can detach it. Otherwise an eviction mid-fade
    // leaves this listener attached; when unmount removes `embed-revealed` the poster's
    // opacity transition reverses and fires transitionend, re-hiding a poster that
    // should now be visible (blank Stage), and listeners accumulate across re-mounts.
    entry.posterEndHandler = onEnd;
    entry.poster.addEventListener('transitionend', onEnd);
  }
}

function mount(entry: EmbedEntry) {
  if (entry.mounted) return;
  entry.mounted = true;
  entry.race = createRevealRace({ onReveal: () => reveal(entry) });
  // load → grace reveal + parent "hello" (covers child-ready-before-parent-listener)
  entry.iframe.addEventListener('load', () => {
    entry.race?.onLoad();
    let tries = 0;
    entry.helloTimer = window.setInterval(() => {
      entry.iframe.contentWindow?.postMessage({ type: 'portfolio:hello', v: PROTOCOL_VERSION }, entry.origin);
      if (++tries >= 10 || entry.revealed) window.clearInterval(entry.helloTimer);
    }, 250);
  }, { once: true });
  entry.iframe.src = entry.url; // the actual lazy load
}

function touchLRU(id: string) {
  const i = mountOrder.indexOf(id);
  if (i !== -1) mountOrder.splice(i, 1);
  mountOrder.push(id);
  const evict = lruEvict(mountOrder, LIVE_CAP);
  if (evict && evict !== id) unmount(evict);
}

function unmount(id: string) {
  const entry = entries.get(id);
  if (!entry || !entry.mounted) return;
  entry.race?.cancel();
  if (entry.helloTimer) window.clearInterval(entry.helloTimer);
  if (entry.posterEndHandler) {
    entry.poster.removeEventListener('transitionend', entry.posterEndHandler);
    entry.posterEndHandler = undefined;
  }
  entry.iframe.removeAttribute('src');
  entry.iframe.setAttribute('inert', '');
  entry.iframe.setAttribute('tabindex', '-1');
  entry.stage.classList.remove('embed-revealed');
  entry.poster.style.display = '';
  entry.mounted = false;
  entry.revealed = false;
  const i = mountOrder.indexOf(id);
  if (i !== -1) mountOrder.splice(i, 1);
}

function maybeMount(id: string) {
  const entry = entries.get(id);
  if (!entry) return;
  if (!shouldMount({ mode: 'embed', isDesktop: isDesktop(), embedMobile: entry.embedMobile, requiresLaunch: entry.requiresLaunch })) return;
  mount(entry);
  touchLRU(id);
}

const onIdle = 'requestIdleCallback' in window
  ? (cb: () => void) => (window as Window & typeof globalThis & { requestIdleCallback(cb: () => void, o?: { timeout: number }): number }).requestIdleCallback(cb, { timeout: 2000 })
  : (cb: () => void) => window.setTimeout(cb, 200);

if (showcase) {
  collect();

  // One global message handler: validate origin + source + shape, ack, reveal.
  window.addEventListener('message', (e) => {
    for (const entry of entries.values()) {
      if (!entry.mounted) continue;
      if (e.origin !== entry.origin) continue;
      if (e.source !== entry.iframe.contentWindow) continue;
      if (!isReadyMessage(e.data)) continue;
      entry.iframe.contentWindow?.postMessage({ type: 'portfolio:ack', v: PROTOCOL_VERSION }, entry.origin);
      entry.race?.onMessage();
      break;
    }
  });

  // Mount on activation (showcaseController dispatches this).
  showcase.addEventListener('showcase:activate', (e) => {
    const id = (e as CustomEvent<{ id: string }>).detail?.id;
    if (id) maybeMount(id);
  });

  // requiresLaunch: explicit mount on the launch button.
  showcase.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-embed-launch]');
    const id = btn?.closest<HTMLElement>('.stage')?.dataset.project;
    const entry = id ? entries.get(id) : undefined;
    if (entry) { mount(entry); touchLRU(entry.id); }
  });

  // Selector intent → warm the hovered/focused Project's origin.
  const tablist = document.querySelector('.selector-list[role="tablist"]');
  const onIntent = (e: Event) => {
    const tab = (e.target as HTMLElement).closest<HTMLElement>('[role="tab"]');
    const id = tab?.dataset.project;
    const entry = id ? entries.get(id) : undefined;
    if (entry) warm(entry.origin);
  };
  tablist?.addEventListener('pointerenter', onIntent, true);
  tablist?.addEventListener('focusin', onIntent);

  // After the hero is interactive + idle: warm + mount the default Project, then warm the rest.
  const boot = () => onIdle(() => {
    const active = document.querySelector<HTMLElement>('.stage[data-embed-url]:not([hidden])');
    if (active?.dataset.project) {
      const e = entries.get(active.dataset.project);
      if (e) warm(e.origin);
      maybeMount(active.dataset.project);
    }
    for (const entry of entries.values()) warm(entry.origin);
  });
  if (document.readyState === 'complete') boot();
  else window.addEventListener('load', boot, { once: true });
}

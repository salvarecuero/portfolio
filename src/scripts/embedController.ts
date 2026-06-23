/**
 * Live Embed lifecycle for the Showcase. Lazy-mounts a cross-origin <iframe> behind a flat
 * loading cover, runs the two-way readiness handshake, and reveals the iframe ONLY on the
 * handshake (fading the cover out). A delayed spinner appears if the wait becomes evident;
 * if no handshake arrives (ceiling) or the iframe errors, the Stage falls back to its media
 * gallery and the failure is remembered for the session. Mounted embeds are kept alive
 * across switches (LRU-capped) and origins are warmed at idle / on Selector intent.
 * Pure logic: embedLifecycle.ts.
 */
import {
  PROTOCOL_VERSION, embedOrigin, isReadyMessage,
  createEmbedTimers, lruEvict, shouldMount, type EmbedTimers,
} from './embedLifecycle';
import {
  bounceShowcaseEscape,
  cancelShowcaseEscapeBounce,
  createEscapeState,
  decideShowcaseEscape,
} from './showcaseScrollEscape';

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
  cover: HTMLElement;
  url: string;
  origin: string;
  requiresLaunch: boolean;
  embedMobile: boolean;
  mounted: boolean;
  revealed: boolean;
  failed: boolean;
  timers?: EmbedTimers;
  helloTimer?: number;
  coverEndHandler?: () => void;
}

const entries = new Map<string, EmbedEntry>();
const escapeState = createEscapeState();
const mountOrder: string[] = [];
const warmed = new Set<string>();
// Embeds that failed the handshake this session render media directly on re-activation,
// instead of re-attempting the iframe and waiting out the ceiling again.
const failed = new Set<string>();

function collect() {
  for (const stage of document.querySelectorAll<HTMLElement>('.stage[data-embed-url]')) {
    const id = stage.dataset.project;
    const iframe = stage.querySelector<HTMLIFrameElement>('iframe[data-embed-frame]');
    const cover = stage.querySelector<HTMLElement>('[data-embed-cover]');
    const url = stage.dataset.embedUrl;
    if (!id || !iframe || !cover || !url) continue;
    entries.set(id, {
      id, stage, iframe, cover, url, origin: embedOrigin(url),
      requiresLaunch: stage.dataset.embedRequiresLaunch !== undefined,
      embedMobile: stage.dataset.embedMobile !== undefined,
      mounted: false, revealed: false, failed: failed.has(id),
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
  if (entry.revealed || entry.failed) return;
  entry.revealed = true;
  if (entry.helloTimer) window.clearInterval(entry.helloTimer);
  entry.iframe.removeAttribute('inert');
  entry.iframe.removeAttribute('tabindex');
  entry.stage.classList.remove('is-spinning');
  entry.stage.classList.add('embed-revealed'); // CSS fades the cover + drops the click shield
  if (reduceMotion()) {
    entry.cover.style.display = 'none';
  } else {
    const onEnd = () => {
      entry.cover.style.display = 'none';
      entry.cover.removeEventListener('transitionend', onEnd);
      entry.coverEndHandler = undefined;
    };
    // Tracked on the entry so unmount can detach it. Otherwise an eviction mid-fade leaves
    // this listener attached; removing `embed-revealed` reverses the opacity transition and
    // fires transitionend, re-hiding a cover that should now be visible.
    entry.coverEndHandler = onEnd;
    entry.cover.addEventListener('transitionend', onEnd);
  }
}

function fallback(entry: EmbedEntry) {
  if (entry.revealed || entry.failed) return;
  entry.failed = true;
  failed.add(entry.id);
  entry.timers?.cancel();
  if (entry.helloTimer) window.clearInterval(entry.helloTimer);
  entry.stage.classList.remove('is-spinning');
  entry.stage.classList.add('embed-failed'); // CSS hides .embed, shows the media gallery
  // Stop the broken/blocked iframe from holding the connection, and drop it from the live set.
  entry.iframe.removeAttribute('src');
  entry.iframe.setAttribute('inert', '');
  entry.iframe.setAttribute('tabindex', '-1');
  const i = mountOrder.indexOf(entry.id);
  if (i !== -1) mountOrder.splice(i, 1);
  entry.mounted = false;
}

function mount(entry: EmbedEntry) {
  if (entry.mounted || entry.failed) return;
  entry.mounted = true;
  entry.timers = createEmbedTimers({
    onSpinner: () => { if (!entry.revealed && !entry.failed) entry.stage.classList.add('is-spinning'); },
    onReveal: () => reveal(entry),
    onFallback: () => fallback(entry),
  });
  // load → parent "hello" retries (covers child-ready-before-parent-listener). The grace
  // reveal is gone: reveal is handshake-only now.
  entry.iframe.addEventListener('load', () => {
    let tries = 0;
    entry.helloTimer = window.setInterval(() => {
      entry.iframe.contentWindow?.postMessage({ type: 'portfolio:hello', v: PROTOCOL_VERSION }, entry.origin);
      if (++tries >= 10 || entry.revealed || entry.failed) window.clearInterval(entry.helloTimer);
    }, 250);
  }, { once: true });
  entry.iframe.addEventListener('error', () => entry.timers?.onError(), { once: true });
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
  entry.timers?.cancel();
  if (entry.helloTimer) window.clearInterval(entry.helloTimer);
  if (entry.coverEndHandler) {
    entry.cover.removeEventListener('transitionend', entry.coverEndHandler);
    entry.coverEndHandler = undefined;
  }
  entry.iframe.removeAttribute('src');
  entry.iframe.setAttribute('inert', '');
  entry.iframe.setAttribute('tabindex', '-1');
  entry.stage.classList.remove('embed-revealed', 'is-spinning');
  entry.cover.style.display = '';
  entry.mounted = false;
  entry.revealed = false;
  const i = mountOrder.indexOf(id);
  if (i !== -1) mountOrder.splice(i, 1);
}

function maybeMount(id: string) {
  const entry = entries.get(id);
  if (!entry) return;
  if (!shouldMount({ mode: 'embed', isDesktop: isDesktop(), embedMobile: entry.embedMobile, requiresLaunch: entry.requiresLaunch })) return;
  if (entry.failed) return; // already known bad → the stage already shows media (embed-failed)
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
      const data = e.data as { type?: unknown; v?: unknown; deltaY?: unknown } | null;
      if (data?.type === 'portfolio:scroll-escape' && data.v === PROTOCOL_VERSION) {
        const main = document.querySelector<HTMLElement>('main');
        if (!main || !showcase) break;
        const action = decideShowcaseEscape({
          deltaY: typeof data.deltaY === 'number' ? data.deltaY : -1,
          scrollTop: main.scrollTop,
          showcaseTop: showcase.offsetTop,
          now: performance.now(),
          state: escapeState,
        });
        if (action === 'bounce') bounceShowcaseEscape(main, showcase);
        else if (action === 'allow') {
          cancelShowcaseEscapeBounce();
          main.scrollTo({ top: 0, behavior: 'smooth' });
        }
        break;
      }
      if (!isReadyMessage(e.data)) continue;
      entry.iframe.contentWindow?.postMessage({ type: 'portfolio:ack', v: PROTOCOL_VERSION }, entry.origin);
      entry.timers?.onReady();
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
    if (entry && !entry.failed) { mount(entry); touchLRU(entry.id); }
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
    const active = document.querySelector<HTMLElement>('.stage[data-embed-url].is-active');
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

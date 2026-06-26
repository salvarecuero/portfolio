/**
 * Client wiring for the Showcase Selector: switches the active Project (render-all +
 * toggle), crossfades the Stage swap in place with plain CSS (the Stages are stacked in
 * one grid cell), keeps the #<project-id> hash in sync, and implements the APG tablist
 * keyboard model. Pure selection math lives in projectSelection.ts (unit-tested).
 *
 * The swap deliberately does NOT use the View Transitions API: a view transition
 * snapshots and freezes the whole document for the swap, which rasterises + repaints the
 * Selector tabs every time (they read as "reloading"). A CSS crossfade scoped to the
 * Stage leaves the tabs as live DOM.
 */
import { projectFromHash, nextTab, prevTab } from './projectSelection';
import { decideHashSync } from './showcaseHashSync';
import { prefersReducedMotion as reduceMotion } from './reduceMotion';

// Crossfade duration read from CSS (--stage-swap) so the keyframes and the controller share a
// single source. Lazy + memoized to keep getComputedStyle off module evaluation. The build
// step may emit the value in either unit (e.g. "240ms" or ".24s"), so normalize to ms.
let swapMs: number | undefined;
const getSwapMs = () => {
  if (swapMs === undefined) {
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--stage-swap').trim();
    const n = parseFloat(raw);
    swapMs = Number.isFinite(n) ? (raw.endsWith('ms') ? n : n * 1000) : 240;
  }
  return swapMs;
};

const tablist = document.querySelector<HTMLElement>('.selector-list[role="tablist"]');
const showcase = document.getElementById('showcase');

if (tablist && showcase) {
  const tabs = Array.from(tablist.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
  const ids = tabs.map((t) => t.dataset.project ?? '').filter(Boolean);

  const tabFor = (id: string) => tabs.find((t) => t.dataset.project === id);
  const panelFor = (id: string) =>
    document.getElementById(`panel-${id}`) as HTMLElement | null;
  const currentId = () =>
    tabs.find((t) => t.getAttribute('aria-selected') === 'true')?.dataset.project ?? ids[0];

  // Move from SSR's [hidden] (display:none on inactive Stages) to class-driven
  // visibility, so an outgoing Stage can stay painted while it fades out.
  const panels = ids.map(panelFor).filter((p): p is HTMLElement => !!p);
  panels.forEach((p) => { p.hidden = false; });

  let finishSwap: (() => void) | null = null;

  // Crossfade the active Stage. is-entering/is-leaving drive the CSS fade; they are
  // cleared on animationend (with a timeout fallback) so only .is-active remains.
  // `animate: false` snaps instantly (deep-link on load, reduced motion).
  function crossfade(id: string, animate = true) {
    const incoming = panelFor(id);
    if (!incoming) return;
    const outgoing = panels.find((p) => p !== incoming && p.classList.contains('is-active'));

    finishSwap?.(); // settle any in-flight swap before starting the next (rapid switching)
    if (!outgoing && incoming.classList.contains('is-active')) return;

    if (!animate || reduceMotion()) {
      panels.forEach((p) => p.classList.toggle('is-active', p === incoming));
      return;
    }

    incoming.classList.add('is-active', 'is-entering');
    outgoing?.classList.remove('is-active');
    outgoing?.classList.add('is-leaving');

    const onEnd = (e: AnimationEvent) => { if (e.target === incoming) finishSwap?.(); };
    incoming.addEventListener('animationend', onEnd);
    const timer = window.setTimeout(() => finishSwap?.(), getSwapMs() + 80);
    finishSwap = () => {
      finishSwap = null;
      window.clearTimeout(timer);
      incoming.removeEventListener('animationend', onEnd);
      incoming.classList.remove('is-entering');
      outgoing?.classList.remove('is-leaving');
    };
  }

  // Synchronous DOM update: ARIA, roving tabindex, accent (live tabs - never frozen),
  // then the Stage crossfade.
  function setActive(id: string, animate = true) {
    for (const t of tabs) {
      const on = t.dataset.project === id;
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
    }
    const accent = tabFor(id)?.dataset.accent;
    if (accent) showcase!.style.setProperty('--accent', accent);
    else showcase!.style.removeProperty('--accent');
    crossfade(id, animate);
    // Notify the embed controller (decoupled): mount/keep-alive the activated Project.
    showcase!.dispatchEvent(new CustomEvent('showcase:activate', { detail: { id } }));
  }

  // Activation. `push` records a history entry; `focus` moves DOM focus.
  // No-op when the target is already active: avoids duplicate history entries (which
  // make the Back button appear dead) and a needless crossfade.
  function activate(id: string, opts: { focus?: boolean; push?: boolean } = {}) {
    if (id === currentId()) return;
    // A switch during the intro would otherwise restart the per-tab beat-* reveal (it
    // holds opacity 0 for ~1s → tabs blink). Finalising the intro hands opacity to the
    // resting rules so the swap just crossfades. Init/deep-link uses setActive, not this.
    document.documentElement.classList.add('intro-done');
    setActive(id);
    if (opts.focus) tabFor(id)?.focus();
    if (opts.push) history.pushState({ project: id }, '', `#${id}`);
  }

  tabs.forEach((t) =>
    t.addEventListener('click', () => activate(t.dataset.project!, { push: true })),
  );

  tablist.addEventListener('keydown', (e) => {
    const i = tabs.findIndex((t) => t.dataset.project === currentId());
    let next = i;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = nextTab(i, tabs.length);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = prevTab(i, tabs.length);
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = tabs.length - 1;
    else return;
    e.preventDefault();
    activate(tabs[next].dataset.project!, { focus: true, push: true });
  });

  // Deep-link on load: open the hashed Project without adding an entry, scroll into view.
  const initial = projectFromHash(location.hash, ids);
  if (initial) {
    history.replaceState({ project: initial }, '', `#${initial}`);
    setActive(initial, false); // snap on load, no crossfade
    showcase.scrollIntoView();
  }

  // Keep the hash in sync with the scrolled-to section. The hash deep-links the Showcase
  // on reload, so it must reflect the active Project while the Showcase is in view and be
  // dropped once the Presentation is (else a reload jumps back into the Showcase). Scroll
  // is not a discrete navigation, so this replaces the entry rather than stacking history.
  const scrollRoot = showcase.closest('main');
  if (scrollRoot) {
    const sync = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.target !== showcase) continue;
          const action = decideHashSync({
            inShowcase: e.isIntersecting && e.intersectionRatio >= 0.5,
            activeId: currentId(),
            currentHash: location.hash,
          });
          if (action.type === 'set') {
            history.replaceState({ project: action.id }, '', `#${action.id}`);
          } else if (action.type === 'clear') {
            history.replaceState(null, '', location.pathname + location.search);
          }
        }
      },
      { root: scrollRoot, threshold: [0, 0.5, 1] },
    );
    sync.observe(showcase);
  }

  // Back / forward through visited Projects.
  window.addEventListener('popstate', () => {
    const id = projectFromHash(location.hash, ids) ?? ids[0];
    activate(id);
  });
}

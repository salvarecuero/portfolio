/**
 * Client wiring for the Showcase Selector: switches the active Project (render-all +
 * toggle), animates the swap with a crossfade View Transition scoped to .stage-viewport,
 * keeps the #<project-id> hash in sync, and implements the APG tablist keyboard model.
 * Pure selection math lives in projectSelection.ts (unit-tested).
 */
import { projectFromHash, nextTab, prevTab } from './projectSelection';

const reduceMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const tablist = document.querySelector<HTMLElement>('.selector[role="tablist"]');
const showcase = document.getElementById('showcase');

if (tablist && showcase) {
  const tabs = Array.from(tablist.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
  const ids = tabs.map((t) => t.dataset.project ?? '').filter(Boolean);

  const tabFor = (id: string) => tabs.find((t) => t.dataset.project === id);
  const currentId = () =>
    tabs.find((t) => t.getAttribute('aria-selected') === 'true')?.dataset.project ?? ids[0];

  // Synchronous DOM update: visibility, ARIA, roving tabindex, accent.
  function setActive(id: string) {
    for (const t of tabs) {
      const on = t.dataset.project === id;
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(`panel-${t.dataset.project}`);
      if (panel) (panel as HTMLElement).hidden = !on;
    }
    const accent = tabFor(id)?.dataset.accent;
    if (accent) showcase!.style.setProperty('--accent', accent);
    else showcase!.style.removeProperty('--accent');
  }

  // Animated activation. `push` records a history entry; `focus` moves DOM focus.
  // No-op when the target is already active: avoids duplicate history entries (which
  // make the Back button appear dead) and a crossfade of identical pixels.
  function activate(id: string, opts: { focus?: boolean; push?: boolean } = {}) {
    if (id === currentId()) return;
    const run = () => {
      setActive(id);
      if (opts.focus) tabFor(id)?.focus();
    };
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => void;
    };
    if (!reduceMotion() && typeof doc.startViewTransition === 'function') {
      doc.startViewTransition(run);
    } else {
      run();
    }
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
    setActive(initial);
    showcase.scrollIntoView();
  }

  // Back / forward through visited Projects.
  window.addEventListener('popstate', () => {
    const id = projectFromHash(location.hash, ids) ?? ids[0];
    activate(id);
  });
}

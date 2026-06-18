/**
 * Portfolio portal orchestrator. The "Portfolio" tab activates #panel-portfolio; this
 * arms the cosmic-rift reveal. Capability-only decision (chooseReveal): with WebGL +
 * motion we lazy-import the Three.js scene (riftScene) — never in the initial bundle —
 * otherwise a CSS-only static reveal. Disposes the GL scene + pauses RAF on leave/hidden/
 * off-screen so the rift only runs while the portal is the active, visible Stage.
 */
import type { RiftHandle } from './riftScene';

export type Reveal = 'webgl' | 'fallback';

export function chooseReveal(f: {
  reduceMotion: boolean;
  webglAvailable: boolean;
  loadFailed: boolean;
}): Reveal {
  if (f.reduceMotion || !f.webglAvailable || f.loadFailed) return 'fallback';
  return 'webgl';
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function webglAvailable(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

// DOM bootstrap. Guarded so the module is importable under the node test environment
// (vitest unit-tests chooseReveal directly); in the browser this wires up the portal.
if (typeof document !== 'undefined') {
  const showcase = document.getElementById('showcase');
  const panel = document.getElementById('panel-portfolio');
  const canvas = panel?.querySelector<HTMLCanvasElement>('canvas[data-rift]') ?? null;

  if (showcase && panel && canvas) {
    let handle: RiftHandle | null = null;
    let armed = false;
    let loadFailed = false;
    let armGen = 0;
    let docHidden = false;
    let offscreen = false;

    // Combine the two pause sources: the scene must stay paused while EITHER the document
    // is hidden OR the panel is off-screen, so neither input resumes RAF while the other
    // still requires it (last-writer-wins between the two listeners would otherwise resume).
    const updatePaused = () => handle?.setPaused(docHidden || offscreen);

    const accent: [number, number, number] = [0.169, 0.561, 0.839]; // #2b8fd6
    const energy: [number, number, number] = [0.545, 0.424, 1.0];   // violet

    const arm = async () => {
      if (armed) return;
      armed = true;
      const gen = ++armGen;
      panel.classList.add('portal-armed');

      const reveal = chooseReveal({
        reduceMotion: prefersReducedMotion(),
        webglAvailable: webglAvailable(),
        loadFailed,
      });

      if (reveal === 'fallback') {
        panel.classList.add('portal-fallback');
        return;
      }

      try {
        const { createRiftScene } = await import('./riftScene');
        if (gen !== armGen) return; // superseded by a newer arm/disarm during the await
        handle = createRiftScene(canvas, { accent, energy });
        panel.classList.add('portal-webgl');
        updatePaused(); // apply current hidden/off-screen state to the freshly created scene
      } catch {
        if (gen !== armGen) return; // stale failed import must not flip state for a newer generation
        loadFailed = true;
        panel.classList.add('portal-fallback');
      }
    };

    const disarm = () => {
      if (!armed) return;
      armed = false;
      armGen++; // invalidate any in-flight arm even with no re-arm
      handle?.dispose();
      handle = null;
      panel.classList.remove('portal-armed', 'portal-webgl', 'portal-fallback');
    };

    // The controller dispatches showcase:activate on every switch (and on deep-link load).
    showcase.addEventListener('showcase:activate', (e) => {
      const id = (e as CustomEvent<{ id: string }>).detail?.id;
      if (id === 'portfolio') void arm();
      else disarm();
    });

    // Pause the scene when the document is hidden or the showcase scrolls off-screen.
    document.addEventListener('visibilitychange', () => {
      docHidden = document.hidden;
      updatePaused();
    });
    const io = new IntersectionObserver(
      (entries) => {
        offscreen = !entries[0]?.isIntersecting;
        updatePaused();
      },
      { threshold: 0 },
    );
    io.observe(panel);

    // Arm on load if the portal is already the active Stage: a #portfolio deep-link makes
    // the controller call setActive (and dispatch showcase:activate) at its module-eval
    // time, which runs before this script is imported — so that initial event is missed.
    // The panel being un-hidden is the controller's source of truth for "active".
    if (!panel.hidden) void arm();
  }
}

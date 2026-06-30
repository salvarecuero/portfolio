// src/scripts/viewModeController.ts
/**
 * Client wiring for the embed/media view switcher. Owns the per-Stage view class
 * (stage--view-embed / stage--view-media) and the segmented switcher's ARIA, reads/writes
 * the session preference, and feeds the chrome viewer toolbar from gallery:change. It does
 * NOT mount/park iframes itself — it dispatches showcase:view and embedController reacts.
 * Pure logic: viewMode.ts.
 */
import {
  readViewPreference,
  writeViewPreference,
  resolveView,
  switcherAria,
  viewToPreference,
  type ViewMode,
} from "./viewMode";

const showcase = document.getElementById("showcase");
const switchEl = document.querySelector<HTMLElement>("[data-view-switch]");

if (showcase && switchEl) {
  const embedBtn = switchEl.querySelector<HTMLButtonElement>('[data-view-set="embed"]');
  const mediaBtn = switchEl.querySelector<HTMLButtonElement>('[data-view-set="media"]');
  const failedIds = new Set<string>();

  const pref = () => {
    try {
      return readViewPreference(sessionStorage);
    } catch {
      return "interactive" as const;
    }
  };
  const savePref = (view: ViewMode) => {
    try {
      writeViewPreference(sessionStorage, viewToPreference(view));
    } catch {
      /* private mode: in-memory only for this load */
    }
  };

  const stageFor = (id: string) => document.getElementById(`panel-${id}`) as HTMLElement | null;
  const isEmbed = (stage: HTMLElement | null) => !!stage?.classList.contains("stage--embed");

  function applyView(stage: HTMLElement, view: ViewMode) {
    stage.classList.toggle("stage--view-embed", view === "embed");
    stage.classList.toggle("stage--view-media", view === "media");
  }

  function syncSwitch(view: ViewMode, interactiveDisabled: boolean, visible: boolean) {
    switchEl!.hidden = !visible;
    if (!visible) return;
    const a = switcherAria(view, interactiveDisabled);
    embedBtn?.setAttribute("aria-pressed", a.embedPressed);
    mediaBtn?.setAttribute("aria-pressed", a.mediaPressed);
    embedBtn?.toggleAttribute("disabled", a.interactiveDisabled);
  }

  let activeId =
    document.querySelector<HTMLElement>(".stage.is-active")?.dataset.project ??
    document.querySelector<HTMLElement>(".stage")?.dataset.project ??
    null;

  // Set the view class + switcher for the active Project. Does NOT dispatch showcase:view:
  // initial mounting is owned by embedController's boot/activate (which is preference-gated),
  // so we avoid a duplicate (and early, non-idle) mount.
  function reflect(id: string) {
    const stage = stageFor(id);
    if (!stage) return;
    activeId = id;
    if (!isEmbed(stage)) {
      syncSwitch("embed", false, false);
      return;
    }
    const { view, interactiveDisabled } = resolveView({
      preference: pref(),
      embedFailed: failedIds.has(id),
    });
    applyView(stage, view);
    syncSwitch(view, interactiveDisabled, true);
  }

  showcase.addEventListener("showcase:activate", (e) => {
    const id = (e as CustomEvent<{ id: string }>).detail?.id;
    if (id) reflect(id);
  });

  showcase.addEventListener("showcase:embed-failed", (e) => {
    const id = (e as CustomEvent<{ id: string }>).detail?.id;
    if (!id) return;
    failedIds.add(id);
    const stage = stageFor(id);
    if (stage) applyView(stage, "media");
    if (id === activeId) syncSwitch("media", true, true);
  });

  switchEl.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-view-set]");
    if (!btn || btn.disabled || !activeId) return;
    const view = btn.dataset.viewSet === "media" ? "media" : "embed";
    const stage = stageFor(activeId);
    if (!stage) return;
    applyView(stage, view);
    syncSwitch(view, failedIds.has(activeId), true);
    savePref(view);
    showcase.dispatchEvent(new CustomEvent("showcase:view", { detail: { id: activeId, view } }));
  });

  // Mirror the active embed Stage's desktop gallery position into the chrome viewer toolbar.
  showcase.addEventListener("gallery:change", (e) => {
    const root = e.target as HTMLElement | null;
    if (!root || !root.classList.contains("media-gallery--desktop")) return;
    const stage = root.closest<HTMLElement>(".stage");
    if (!stage || !stage.classList.contains("stage--embed")) return;
    const d = (e as CustomEvent<{ index: number; total: number; caption: string }>).detail;
    const cap = stage.querySelector<HTMLElement>("[data-view-caption]");
    if (cap) cap.textContent = d.caption;
    for (const pos of stage.querySelectorAll<HTMLElement>("[data-view-pos]")) {
      pos.textContent = `${d.index + 1} / ${d.total}`;
    }
  });

  // Seed the view class on EVERY embed Stage, not just the active one. The keep-alive /
  // proactive-preload model (embedController) mounts background embeds while their Stage sits
  // at visibility:hidden, and the embed iframe only lays out (so the embedded app boots and
  // completes its handshake) when it is display:block, which the CSS gate keys off
  // stage--view-embed. Without seeding the inactive Stages they keep their SSR stage--view-media,
  // render display:none, and a real app that defers boot to first paint never sends "ready" →
  // handshake timeout → embed-failed. Seeding does not mount anything (embedController owns that)
  // and is invisible while the Stage is hidden; it only restores the iframe's layout box.
  for (const stage of document.querySelectorAll<HTMLElement>(".stage--embed")) {
    const id = stage.dataset.project;
    if (!id) continue;
    const { view } = resolveView({ preference: pref(), embedFailed: failedIds.has(id) });
    applyView(stage, view);
  }

  // Initial state for the default active Project (also syncs the switcher).
  if (activeId) reflect(activeId);
}

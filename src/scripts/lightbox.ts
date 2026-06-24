// Minimal image lightbox: the only client JS island on the Tool page. The pure
// helpers are unit-tested; initLightbox() is the thin DOM-wiring shell.
export function setLightboxOpen(
  overlay: { classList: { add(c: string): void; remove(c: string): void }; setAttribute(k: string, v: string): void },
  open: boolean,
): void {
  if (open) {
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
  } else {
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
  }
}

// Focus trap target: given the focusable elements inside the dialog, the active
// element, and whether Shift is held, return the element focus should wrap to
// (last on Shift+Tab from the first, first on Tab from the last) or null to let
// the browser move focus normally. Pure so it can be unit-tested without a DOM.
export function trapFocusTarget<T>(focusables: T[], active: T | null, shiftKey: boolean): T | null {
  if (focusables.length === 0) return null;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (shiftKey && active === first) return last;
  if (!shiftKey && active === last) return first;
  return null;
}

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

// Constrain a pan offset (one axis) so the scaled image's edges stay within the
// viewport. The image is centered at offset 0; it can move at most half the
// overflow in either direction. No overflow => no panning. Pure, unit-tested.
export function clampPan(offset: number, scaledSize: number, viewportSize: number): number {
  const limit = Math.max(0, scaledSize - viewportSize) / 2;
  return Math.max(-limit, Math.min(limit, offset));
}

export function initLightbox(root: Document = document): void {
  const overlay = root.querySelector<HTMLElement>("[data-lightbox]");
  if (!overlay) return;
  const img = overlay.querySelector<HTMLImageElement>("[data-lightbox-img]");
  const cap = overlay.querySelector<HTMLElement>("[data-lightbox-cap]");
  const closeBtn = overlay.querySelector<HTMLElement>("[data-lightbox-close]");
  const triggers = root.querySelectorAll<HTMLButtonElement>("[data-lightbox-trigger]");

  // The element focus returns to when the dialog closes (the trigger that opened it).
  let lastFocused: HTMLElement | null = null;
  const isOpen = () => overlay.classList.contains("open");

  triggers.forEach((btn) => {
    btn.addEventListener("click", () => {
      const src = btn.getAttribute("data-full") ?? "";
      const alt = btn.getAttribute("data-alt") ?? "";
      const caption = btn.getAttribute("data-cap") ?? "";
      if (img) { img.src = src; img.alt = alt; }
      if (cap) { cap.textContent = caption; cap.hidden = !caption; }
      lastFocused = root.activeElement as HTMLElement | null;
      setLightboxOpen(overlay, true);
      closeBtn?.focus();
    });
  });

  const close = () => {
    if (!isOpen()) return;
    setLightboxOpen(overlay, false);
    lastFocused?.focus();
    lastFocused = null;
  };

  closeBtn?.addEventListener("click", close);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
  root.addEventListener("keydown", (e) => {
    const ev = e as KeyboardEvent;
    if (!isOpen()) return;
    if (ev.key === "Escape") { close(); return; }
    if (ev.key === "Tab") {
      const focusables = Array.from(overlay.querySelectorAll<HTMLElement>(FOCUSABLE));
      const target = trapFocusTarget(focusables, root.activeElement as HTMLElement | null, ev.shiftKey);
      if (target) { ev.preventDefault(); target.focus(); }
    }
  });
}

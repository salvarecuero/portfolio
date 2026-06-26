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

// Zoom level applied when the image is toggled to zoomed-in (2x the fitted size).
export const ZOOM_SCALE = 2;

export type ZoomState = { zoomed: boolean; offsetX: number; offsetY: number };

// Pan offset (one axis) that keeps the point at `pointerRel` (signed distance from
// the image centre, in fitted px) under the cursor after zooming, clamped so the
// image edges stay in view. With scale = scaledSize/viewportSize, a point p maps to
// scale*p + offset; holding it fixed gives offset = -p*(scale-1). Pure, unit-tested.
export function zoomPan(pointerRel: number, scaledSize: number, viewportSize: number): number {
  if (viewportSize <= 0) return 0;
  const scale = scaledSize / viewportSize;
  const offset = clampPan(-pointerRel * (scale - 1), scaledSize, viewportSize);
  return offset === 0 ? 0 : offset; // normalise -0 (a centred click yields +0)
}

// Next zoom state for a toggle click at (relX, relY) - signed distances from the
// image centre. Zooming in centres on the clicked point (clamped to the edges);
// zooming out returns to the fitted, centred view. Pure, unit-tested.
export function nextZoom(
  state: ZoomState,
  relX: number,
  relY: number,
  scaledW: number,
  scaledH: number,
  viewW: number,
  viewH: number,
): ZoomState {
  if (state.zoomed) return { zoomed: false, offsetX: 0, offsetY: 0 };
  return { zoomed: true, offsetX: zoomPan(relX, scaledW, viewW), offsetY: zoomPan(relY, scaledH, viewH) };
}

// Apply a drag delta to the pan offset, clamped per axis so the image edges stay
// in view. No-op (returns the same state) when not zoomed. The shell passes the
// base offset plus the total delta since drag start, so this stays a pure clamp.
export function applyPan(
  state: ZoomState,
  dx: number,
  dy: number,
  scaledW: number,
  scaledH: number,
  viewW: number,
  viewH: number,
): ZoomState {
  if (!state.zoomed) return state;
  return {
    zoomed: true,
    offsetX: clampPan(state.offsetX + dx, scaledW, viewW),
    offsetY: clampPan(state.offsetY + dy, scaledH, viewH),
  };
}

export function initLightbox(root: Document = document): void {
  const overlay = root.querySelector<HTMLElement>("[data-lightbox]");
  if (!overlay) return;
  const img = overlay.querySelector<HTMLImageElement>("[data-lightbox-img]");
  const cap = overlay.querySelector<HTMLElement>("[data-lightbox-cap]");
  const closeBtn = overlay.querySelector<HTMLElement>("[data-lightbox-close]");
  // The non-transformed wrapper around the image: its box stays put while the image
  // animates its transform, so it is the stable reference for the click-to-zoom centre.
  const view = overlay.querySelector<HTMLElement>("[data-lightbox-view]");
  const triggers = root.querySelectorAll<HTMLButtonElement>("[data-lightbox-trigger]");

  // The element focus returns to when the dialog closes (the trigger that opened it).
  let lastFocused: HTMLElement | null = null;
  const isOpen = () => overlay.classList.contains("open");

  // Lock background scroll while the overlay is open so wheel/touch does not scroll the
  // article behind the fixed dialog (which would also lose the reader's position on close).
  let prevOverflow = "";
  const lockScroll = (lock: boolean) => {
    const el = root.documentElement;
    if (!el) return;
    if (lock) {
      prevOverflow = el.style.overflow;
      el.style.overflow = "hidden";
    } else {
      el.style.overflow = prevOverflow;
    }
  };

  let zoom: ZoomState = { zoomed: false, offsetX: 0, offsetY: 0 };
  let dragging = false;
  let moved = false;
  // The pointer currently captured for a drag, so capture can be released even when
  // the drag does not end normally (e.g. the dialog is closed mid-drag).
  let activePointerId: number | null = null;

  const applyTransform = () => {
    if (!img) return;
    const scale = zoom.zoomed ? ZOOM_SCALE : 1;
    img.style.transform = `translate(${zoom.offsetX}px, ${zoom.offsetY}px) scale(${scale})`;
    img.classList.toggle("is-zoomed", zoom.zoomed);
  };

  const resetZoom = () => {
    zoom = { zoomed: false, offsetX: 0, offsetY: 0 };
    dragging = false;
    moved = false;
    if (img && activePointerId !== null && img.hasPointerCapture(activePointerId)) {
      img.releasePointerCapture(activePointerId);
    }
    activePointerId = null;
    img?.classList.remove("is-dragging");
    applyTransform();
  };

  triggers.forEach((btn) => {
    btn.addEventListener("click", () => {
      const src = btn.getAttribute("data-full") ?? "";
      const alt = btn.getAttribute("data-alt") ?? "";
      const caption = btn.getAttribute("data-cap") ?? "";
      if (img) { img.src = src; img.alt = alt; }
      if (cap) { cap.textContent = caption; cap.hidden = !caption; }
      resetZoom();
      lastFocused = root.activeElement as HTMLElement | null;
      setLightboxOpen(overlay, true);
      lockScroll(true);
      closeBtn?.focus();
    });
  });

  const close = () => {
    if (!isOpen()) return;
    setLightboxOpen(overlay, false);
    lockScroll(false);
    resetZoom();
    lastFocused?.focus();
    lastFocused = null;
  };

  // Click/tap toggles fit <-> zoomed; while zoomed, drag pans. A small movement
  // threshold separates a pan-drag from a toggle-click. Pointer events cover
  // mouse and touch with one path; pointer capture keeps a drag tracking even
  // when it leaves the image.
  const MOVE_THRESHOLD = 6;

  if (img) {
    let startX = 0;
    let startY = 0;
    let base: ZoomState = zoom;

    img.addEventListener("pointerdown", (e) => {
      const ev = e as PointerEvent;
      // Ignore secondary pointers (multi-touch) and re-entrant presses so the
      // captured pointer and drag origin are never overwritten mid-drag.
      if (!ev.isPrimary || dragging) return;
      dragging = true;
      moved = false;
      startX = ev.clientX;
      startY = ev.clientY;
      base = zoom;
      activePointerId = ev.pointerId;
      img.setPointerCapture(ev.pointerId);
      if (zoom.zoomed) img.classList.add("is-dragging");
    });

    img.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const ev = e as PointerEvent;
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      // Only a pan (zoomed) gesture sets moved: an unzoomed tap that drifts a few
      // pixels - common on touch - must still toggle zoom rather than be suppressed.
      if (!zoom.zoomed) return;
      if (Math.abs(dx) > MOVE_THRESHOLD || Math.abs(dy) > MOVE_THRESHOLD) moved = true;
      const scaledW = img.clientWidth * ZOOM_SCALE;
      const scaledH = img.clientHeight * ZOOM_SCALE;
      zoom = applyPan(base, dx, dy, scaledW, scaledH, img.clientWidth, img.clientHeight);
      applyTransform();
    });

    const endDrag = (e: Event) => {
      if (!dragging) return;
      const ev = e as PointerEvent;
      dragging = false;
      activePointerId = null;
      img.classList.remove("is-dragging");
      if (img.hasPointerCapture(ev.pointerId)) img.releasePointerCapture(ev.pointerId);
      if (!moved) {
        // Centre the zoom on the clicked point, measured against the wrapper: its box
        // matches the fitted image but does not move while the image transform
        // animates (reading the image rect mid-animation gives a wrong centre).
        const ref = view ?? img;
        const rect = ref.getBoundingClientRect();
        const relX = ev.clientX - (rect.left + rect.width / 2);
        const relY = ev.clientY - (rect.top + rect.height / 2);
        const scaledW = ref.clientWidth * ZOOM_SCALE;
        const scaledH = ref.clientHeight * ZOOM_SCALE;
        zoom = nextZoom(zoom, relX, relY, scaledW, scaledH, ref.clientWidth, ref.clientHeight);
        applyTransform();
      }
    };
    img.addEventListener("pointerup", endDrag);
    img.addEventListener("pointercancel", endDrag);
  }

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

// Minimal image lightbox: the only client JS island on the Tool page. The pure
// toggle is unit-tested; initLightbox() is the thin DOM-wiring shell.
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

export function initLightbox(root: Document = document): void {
  const overlay = root.querySelector<HTMLElement>("[data-lightbox]");
  if (!overlay) return;
  const img = overlay.querySelector<HTMLImageElement>("[data-lightbox-img]");
  const cap = overlay.querySelector<HTMLElement>("[data-lightbox-cap]");
  const triggers = root.querySelectorAll<HTMLButtonElement>("[data-lightbox-trigger]");

  triggers.forEach((btn) => {
    btn.addEventListener("click", () => {
      const src = btn.getAttribute("data-full") ?? "";
      const alt = btn.getAttribute("data-alt") ?? "";
      const caption = btn.getAttribute("data-cap") ?? "";
      if (img) { img.src = src; img.alt = alt; }
      if (cap) { cap.textContent = caption; cap.hidden = !caption; }
      setLightboxOpen(overlay, true);
    });
  });

  const close = () => setLightboxOpen(overlay, false);
  overlay.querySelector<HTMLElement>("[data-lightbox-close]")?.addEventListener("click", close);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
  root.addEventListener("keydown", (e) => { if ((e as KeyboardEvent).key === "Escape") close(); });
}

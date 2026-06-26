/**
 * Client wiring for the Showcase backdrop reveal toggle: flips the .is-revealing state on
 * the .showcase root (CSS fades the foreground so the fixed cosmos shows through), marks the
 * faded foreground `inert` so it leaves the keyboard focus order + a11y tree (CSS
 * pointer-events:none only covers the mouse), keeps the button's aria-pressed/aria-label in
 * sync, and restores on Esc. Pure state logic lives in backdropReveal.ts (unit-tested).
 */
import { createBackdropReveal, backdropAria } from "./backdropReveal";

const showcase = document.getElementById("showcase");
const button = document.querySelector<HTMLButtonElement>(".backdrop-toggle");
const foreground = showcase?.querySelector<HTMLElement>(".to");

if (showcase && button) {
  const reveal = createBackdropReveal((revealed) => {
    showcase.classList.toggle("is-revealing", revealed);
    foreground?.toggleAttribute("inert", revealed);
    const aria = backdropAria(revealed);
    button.setAttribute("aria-pressed", aria.pressed);
    button.setAttribute("aria-label", aria.label);
  });

  button.addEventListener("click", () => reveal.toggle());
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") reveal.restore();
  });

  // Restore the foreground once the Showcase stops being the dominant section (scrolled
  // away while revealed), so returning lands on the live UI rather than the bare cosmos. The
  // fade-back runs off-screen. A 0.5 threshold (not 0) avoids the flush-boundary case: with
  // scroll-snap the section rests exactly below the viewport, where ratio 0 is an ambiguous
  // intersection the observer may never report. The intro is one-shot (introTrigger
  // unobserves after firing), so the '$ showcase' reveal never replays on return.
  const exitObserver = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) reveal.restore();
      }
    },
    { threshold: 0.5 },
  );
  exitObserver.observe(showcase);
}

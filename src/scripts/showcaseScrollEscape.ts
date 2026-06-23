export interface EscapeState {
  confirmAfter: number;
  armedUntil: number;
}

export type EscapeAction = "ignore" | "bounce" | "block" | "allow";

const DEFAULT_CONFIRM_DELAY_MS = 150;
const DEFAULT_ARMED_MS = 2200;
const BOUNCE_OUT_MS = 160;
const BOUNCE_HOLD_MS = 25;
const BOUNCE_BACK_MS = 210;

let bounceFrame = 0;
let bounceTimer = 0;
let restoreSnap: (() => void) | undefined;
let restoreCue: (() => void) | undefined;

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function animateScrollTop(opts: {
  element: HTMLElement;
  from: number;
  to: number;
  duration: number;
  ease: (t: number) => number;
  done?: () => void;
}) {
  const start = performance.now();
  const tick = (now: number) => {
    const progress = Math.min(1, (now - start) / opts.duration);
    opts.element.scrollTop = opts.from + (opts.to - opts.from) * opts.ease(progress);
    if (progress < 1) {
      bounceFrame = requestAnimationFrame(tick);
    } else {
      opts.done?.();
    }
  };
  bounceFrame = requestAnimationFrame(tick);
}

export function cancelShowcaseEscapeBounce() {
  if (bounceFrame) {
    cancelAnimationFrame(bounceFrame);
    bounceFrame = 0;
  }
  if (bounceTimer) {
    window.clearTimeout(bounceTimer);
    bounceTimer = 0;
  }
  restoreSnap?.();
  restoreSnap = undefined;
  restoreCue?.();
  restoreCue = undefined;
}

function setEscapeCue() {
  const cue = document.querySelector<HTMLElement>("[data-scroll-cue]");
  const label = cue?.querySelector<HTMLElement>("[data-scroll-cue-label]");
  const arrow = cue?.querySelector<HTMLElement>("[data-scroll-cue-arrow]");
  if (!cue || !label || !arrow) return;

  const previousLabel = label.textContent ?? "Scroll";
  const previousArrow = arrow.textContent ?? "↓";
  const wasEscape = cue.classList.contains("is-escape");
  cue.classList.add("is-escape");
  label.textContent = "Keep scrolling!";
  arrow.textContent = "↑";
  restoreCue = () => {
    cue.classList.toggle("is-escape", wasEscape);
    label.textContent = previousLabel;
    arrow.textContent = previousArrow;
  };
}

export function createEscapeState(): EscapeState {
  return { confirmAfter: 0, armedUntil: 0 };
}

export function decideShowcaseEscape(opts: {
  deltaY: number;
  scrollTop: number;
  showcaseTop: number;
  now: number;
  state: EscapeState;
  tolerance?: number;
  confirmDelayMs?: number;
  armedMs?: number;
}): EscapeAction {
  const tolerance = opts.tolerance ?? 8;
  const atShowcaseTop = Math.abs(opts.scrollTop - opts.showcaseTop) <= tolerance;

  if (opts.deltaY >= 0 || !atShowcaseTop) {
    opts.state.confirmAfter = 0;
    opts.state.armedUntil = 0;
    return "ignore";
  }

  if (opts.now < opts.state.confirmAfter) return "block";

  if (opts.now <= opts.state.armedUntil) {
    opts.state.confirmAfter = 0;
    opts.state.armedUntil = 0;
    return "allow";
  }

  const confirmDelayMs = opts.confirmDelayMs ?? DEFAULT_CONFIRM_DELAY_MS;
  const armedMs = opts.armedMs ?? DEFAULT_ARMED_MS;
  opts.state.confirmAfter = opts.now + confirmDelayMs;
  opts.state.armedUntil = opts.now + armedMs;
  return "bounce";
}

export function bounceShowcaseEscape(main: HTMLElement, showcase: HTMLElement) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  cancelShowcaseEscapeBounce();

  const top = showcase.offsetTop;
  const originalSnap = main.style.scrollSnapType;
  const peek = Math.max(88, Math.min(180, window.innerHeight * 0.18));
  const peekTop = Math.max(0, top - peek);

  main.style.scrollSnapType = "none";
  setEscapeCue();
  restoreSnap = () => {
    main.style.scrollSnapType = originalSnap;
  };
  animateScrollTop({
    element: main,
    from: main.scrollTop,
    to: peekTop,
    duration: BOUNCE_OUT_MS,
    ease: easeOutCubic,
    done: () => {
      bounceTimer = window.setTimeout(() => {
        bounceTimer = 0;
        animateScrollTop({
          element: main,
          from: main.scrollTop,
          to: top,
          duration: BOUNCE_BACK_MS,
          ease: easeInOutCubic,
          done: () => {
            restoreSnap?.();
            restoreSnap = undefined;
            restoreCue?.();
            restoreCue = undefined;
          },
        });
      }, BOUNCE_HOLD_MS);
    },
  });
}

function isWheelOverActiveEmbedFrame(event: WheelEvent) {
  const frame = document.querySelector<HTMLIFrameElement>(
    ".stage--embed.is-active.embed-revealed iframe[data-embed-frame]",
  );
  if (!frame) return false;
  const rect = frame.getBoundingClientRect();
  return (
    event.clientX >= rect.left &&
    event.clientX <= rect.right &&
    event.clientY >= rect.top &&
    event.clientY <= rect.bottom
  );
}

const canWireDom = typeof document !== "undefined" && typeof window !== "undefined";
const main = canWireDom ? document.querySelector<HTMLElement>("main") : null;
const showcase = canWireDom ? document.getElementById("showcase") : null;

if (main && showcase) {
  const state = createEscapeState();

  main.addEventListener(
    "wheel",
    (event) => {
      if (!isWheelOverActiveEmbedFrame(event)) return;

      const action = decideShowcaseEscape({
        deltaY: event.deltaY,
        scrollTop: main.scrollTop,
        showcaseTop: showcase.offsetTop,
        now: performance.now(),
        state,
      });

      if (action === "ignore") return;
      if (action === "allow") {
        cancelShowcaseEscapeBounce();
        return;
      }
      event.preventDefault();
      if (action === "bounce") bounceShowcaseEscape(main, showcase);
    },
    { passive: false },
  );
}

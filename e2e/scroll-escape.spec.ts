import { test, expect } from "@playwright/test";
import { gotoShowcase, revealShowcaseInView } from "./helpers/harness";

// Scroll-escape wiring (ADR 0003): a scroll-escape message from a revealed embed, while the
// Showcase is snapped at its top, bounces back and surfaces the cue; a second gesture inside the
// armed window is let through and escapes to the Presentation. Decision math is unit-tested
// (decideShowcaseEscape); this proves the embedController -> bounce/allow glue.
const ACTIVE_IFRAME = "#panel-simple-tool-stack iframe[data-embed-frame]";

// Records (deterministically) whether the cue ever flips to its "Keep scrolling!" escape state,
// which is transient during the bounce animation.
async function installCueProbe(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    (window as unknown as { __escapeCueShown: boolean }).__escapeCueShown = false;
    addEventListener("DOMContentLoaded", () => {
      const label = document.querySelector("[data-scroll-cue-label]");
      if (!label) return;
      const check = () => {
        if ((label.textContent ?? "").includes("Keep scrolling")) {
          (window as unknown as { __escapeCueShown: boolean }).__escapeCueShown = true;
        }
      };
      check();
      new MutationObserver(check).observe(label, {
        childList: true,
        characterData: true,
        subtree: true,
      });
    });
  });
}

function emitEscape(page: import("@playwright/test").Page, selector: string) {
  return page.evaluate((sel) => {
    const frame = document.querySelector<HTMLIFrameElement>(sel);
    frame?.contentWindow?.postMessage({ type: "test:emit-escape", deltaY: -120 }, "*");
  }, selector);
}

test("a scroll-escape over a revealed embed bounces and shows the cue; a second gesture escapes", async ({
  page,
}) => {
  await installCueProbe(page);
  await gotoShowcase(page);
  await revealShowcaseInView(page);
  await expect(page.locator("#panel-simple-tool-stack")).toHaveClass(/embed-revealed/, {
    timeout: 10_000,
  });

  // Snap the Showcase to its top so the escape decision sees atShowcaseTop.
  await page.evaluate(() => {
    const main = document.querySelector<HTMLElement>("main");
    const showcase = document.getElementById("showcase");
    if (main && showcase) main.scrollTop = showcase.offsetTop;
  });
  const showcaseTop = await page.evaluate(() => document.getElementById("showcase")!.offsetTop);
  expect(showcaseTop).toBeGreaterThan(0);

  // First gesture: bounce + cue. The cue probe latches __escapeCueShown for a later assertion.
  await emitEscape(page, ACTIVE_IFRAME);
  await expect
    .poll(() =>
      page.evaluate(() => (window as unknown as { __escapeCueShown: boolean }).__escapeCueShown),
    )
    .toBe(true);

  // Wait for the bounce to FINISH before the second gesture, condition-based rather than a fixed
  // sleep: the armed window (ESCAPE_ARMED_MS = 2200) is a wall-clock budget from the first bounce,
  // so a fixed wait plus polling latency can overrun it under load and the second gesture would
  // bounce again instead of being allowed. The bounce sets main's inline scroll-snap to "none" for
  // its whole duration and restores it exactly when scroll returns to the Showcase top, so its
  // restore is the precise, race-free "settled and atShowcaseTop again" signal.
  await expect
    .poll(() => page.evaluate(() => document.querySelector("main")!.style.scrollSnapType))
    .not.toBe("none");

  // Second gesture inside the armed window: let through, escaping to the Presentation (top 0).
  await emitEscape(page, ACTIVE_IFRAME);
  await expect
    .poll(() => page.evaluate(() => document.querySelector("main")!.scrollTop))
    .toBeLessThan(10);
});

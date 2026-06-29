import { test, expect } from "@playwright/test";

// Lightbox wiring on the project detail page (initLightbox). The pure helpers (clampPan, nextZoom,
// trapFocusTarget) are unit-tested; this proves the DOM glue: open/close, the background-scroll
// lock + restore, focus return to the trigger, and click-to-zoom then drag-to-pan staying clamped.
const DETAIL = "/projects/simple-tool-stack/";
const overlay = "[data-lightbox]";
const firstTrigger = "[data-lightbox-trigger]";

test.describe("Lightbox", () => {
  test("opens from a trigger, locks background scroll, and focuses the close button", async ({
    page,
  }) => {
    await page.goto(DETAIL);
    await expect(page.locator(overlay)).not.toHaveClass(/open/);

    await page.locator(firstTrigger).first().click();

    await expect(page.locator(overlay)).toHaveClass(/open/);
    await expect(page.locator(overlay)).toHaveAttribute("aria-hidden", "false");
    // Background scroll is locked while the dialog is open.
    expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("hidden");
    await expect(page.locator("[data-lightbox-close]")).toBeFocused();
  });

  test("Esc closes, restores scroll, and returns focus to the opening trigger", async ({
    page,
  }) => {
    await page.goto(DETAIL);
    const trigger = page.locator(firstTrigger).first();
    await trigger.click();
    await expect(page.locator(overlay)).toHaveClass(/open/);

    await page.keyboard.press("Escape");

    await expect(page.locator(overlay)).not.toHaveClass(/open/);
    // Overflow restored to its prior (empty) value, not left as "hidden".
    expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("");
    await expect(trigger).toBeFocused();
  });

  test("a backdrop click closes the dialog", async ({ page }) => {
    await page.goto(DETAIL);
    await page.locator(firstTrigger).first().click();
    await expect(page.locator(overlay)).toHaveClass(/open/);

    // Click a corner of the overlay, away from the centered figure.
    await page.locator(overlay).click({ position: { x: 5, y: 5 } });

    await expect(page.locator(overlay)).not.toHaveClass(/open/);
    // The close path also restores background scroll.
    expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("");
  });

  test("click-to-zoom then drag-to-pan stays within bounds", async ({ page }) => {
    await page.goto(DETAIL);
    await page.locator(firstTrigger).first().click();
    const img = page.locator("[data-lightbox-img]");
    await expect(page.locator(overlay)).toHaveClass(/open/);

    const box = (await img.boundingBox())!;
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;

    // A tap (no drag) toggles zoom in. img.click waits for the image to be stable and uses a
    // realistic press duration; a zero-duration page.mouse.click can race the pointer-capture
    // setup under load and drop the pointerup that toggles zoom.
    await img.click({ delay: 50 });
    await expect(img).toHaveClass(/is-zoomed/);

    // Drag far to the right; the pan must clamp so the image edge cannot leave the viewport.
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx + 1000, cy, { steps: 8 });
    await page.mouse.up();

    const { translateX, halfWidth } = await img.evaluate((el) => {
      const m = new DOMMatrixReadOnly(getComputedStyle(el).transform);
      return { translateX: m.m41, halfWidth: (el as HTMLElement).clientWidth / 2 };
    });
    // Dragging 1000px right far exceeds the clamp limit (w/2 for a 2x zoom), so the pan must
    // land exactly at that limit: it moved (not stuck at 0) AND the edge stayed in view.
    expect(translateX).toBeGreaterThanOrEqual(halfWidth - 1);
    expect(translateX).toBeLessThanOrEqual(halfWidth + 1);
  });
});

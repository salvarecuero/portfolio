import { test, expect } from "@playwright/test";
import { galleryFixtureMarkup, gotoWithInjectedBody } from "./helpers/harness";

// MediaGallery wiring (galleryController). Index math (galleryNav/gallerySwipe) is unit-tested;
// this proves the DOM glue: keyboard navigation, touch-swipe advance, and that reduced motion
// never loads the video. Fixtures are injected into the index, where the controller is loaded,
// so the real wiring runs against a deterministic slide set.

test.describe("MediaGallery", () => {
  test("keyboard navigation moves the carousel (arrows, Home, End)", async ({ page }) => {
    await gotoWithInjectedBody(page, galleryFixtureMarkup("g-nav", { slides: 3 }));
    const gallery = page.locator("#g-nav");
    const counter = gallery.locator("[data-counter]");
    await expect(counter).toHaveText("1 / 3");

    // Focus a control inside the gallery so keydown bubbles to the gallery root handler.
    await gallery.locator("[data-next]").focus();
    await page.keyboard.press("ArrowRight");
    await expect(counter).toHaveText("2 / 3");

    await page.keyboard.press("End");
    await expect(counter).toHaveText("3 / 3");

    await page.keyboard.press("Home");
    await expect(counter).toHaveText("1 / 3");
  });

  test("a horizontal touch swipe advances the carousel", async ({ page }) => {
    await gotoWithInjectedBody(page, galleryFixtureMarkup("g-swipe", { slides: 3 }));
    const gallery = page.locator("#g-swipe");
    await expect(gallery.locator("[data-counter]")).toHaveText("1 / 3");

    // Swipe left (finger moves right-to-left) past the threshold -> next slide.
    await gallery.evaluate((root) => {
      const touch = (x: number, y: number) =>
        new Touch({ identifier: 1, target: root, clientX: x, clientY: y });
      root.dispatchEvent(
        new TouchEvent("touchstart", { changedTouches: [touch(220, 100)], bubbles: true }),
      );
      root.dispatchEvent(
        new TouchEvent("touchend", { changedTouches: [touch(80, 104)], bubbles: true }),
      );
    });

    await expect(gallery.locator("[data-counter]")).toHaveText("2 / 3");
  });

  test("reduced motion never loads the gallery video", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await gotoWithInjectedBody(page, galleryFixtureMarkup("g-rm", { slides: 0, video: true }));
    const source = page.locator("#g-rm video source");

    // Give the (skipped) IntersectionObserver path time to NOT run.
    await page.waitForTimeout(500);
    // The source keeps only data-src; src is never promoted, so the video never loads.
    expect(await source.getAttribute("src")).toBeNull();
    expect(await page.locator("#g-rm video").getAttribute("data-loaded")).toBeNull();
  });

  test("without reduced motion, a visible gallery video is loaded", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await gotoWithInjectedBody(page, galleryFixtureMarkup("g-vid", { slides: 0, video: true }));
    const source = page.locator("#g-vid video source");

    // The fixture is fixed in the viewport, so the IntersectionObserver promotes data-src -> src.
    await expect.poll(() => source.getAttribute("src")).not.toBeNull();
  });
});

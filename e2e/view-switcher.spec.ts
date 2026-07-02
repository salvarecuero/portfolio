// e2e/view-switcher.spec.ts
import { test, expect } from "@playwright/test";
import { gotoShowcase, revealShowcaseInView } from "./helpers/harness";

const ACTIVE = "#panel-simple-tool-stack";

test.describe("Embed/media view switcher", () => {
  test("starts on the live embed with the switcher visible", async ({ page }) => {
    await gotoShowcase(page);
    await revealShowcaseInView(page);
    await expect(page.locator(ACTIVE)).toHaveClass(/stage--view-embed/, { timeout: 10_000 });
    await expect(page.locator("[data-view-switch]")).toBeVisible();
    await expect(page.locator('[data-view-set="embed"]')).toHaveAttribute("aria-pressed", "true");
  });

  test("switching to Screenshots shows the gallery, morphs the chrome, parks the iframe", async ({
    page,
  }) => {
    await gotoShowcase(page);
    await revealShowcaseInView(page);
    await expect(page.locator(ACTIVE)).toHaveClass(/embed-revealed/, { timeout: 10_000 });

    await page.locator('[data-view-set="media"]').click();
    await expect(page.locator(ACTIVE)).toHaveClass(/stage--view-media/);
    await expect(page.locator(`${ACTIVE} .media-gallery--desktop`)).toBeVisible();
    await expect(page.locator('[data-view-set="media"]')).toHaveAttribute("aria-pressed", "true");
    // chrome viewer toolbar position is seeded
    await expect(page.locator(`${ACTIVE} .stage-caption__pos`)).toContainText("/");
    // the live iframe is parked (src dropped) to free the connection
    await expect
      .poll(() =>
        page.locator(`${ACTIVE} iframe[data-embed-frame]`).evaluate((el) => el.getAttribute("src")),
      )
      .toBeNull();

    // back to Interactive remounts
    await page.locator('[data-view-set="embed"]').click();
    await expect(page.locator(ACTIVE)).toHaveClass(/stage--view-embed/);
    await expect
      .poll(() =>
        page.locator(`${ACTIVE} iframe[data-embed-frame]`).evaluate((el) => el.getAttribute("src")),
      )
      .not.toBeNull();
  });

  test("non-active embed stages also open in embed view so their preloaded iframes can load", async ({
    page,
  }) => {
    // Regression guard: the keep-alive / proactive-preload model mounts background embeds while
    // their stage is visibility:hidden. The embed iframe only lays out (and so boots + completes
    // its handshake) when it is display:block, which the gate keys off stage--view-embed. If the
    // controller only seeds the active stage, background embeds stay stage--view-media (the SSR
    // default), render display:none, and a real app that defers boot to first paint never sends
    // "ready" → handshake timeout → embed-failed. So every embed stage must open in embed view
    // under the default (interactive) preference, not just the active one.
    await gotoShowcase(page);
    await revealShowcaseInView(page);
    await expect(page.locator(ACTIVE)).toHaveClass(/stage--view-embed/, { timeout: 10_000 });
    for (const id of ["#panel-bye-bg", "#panel-rangetube"]) {
      await expect(page.locator(id)).toHaveClass(/stage--view-embed/);
      await expect(page.locator(id)).not.toHaveClass(/stage--view-media/);
    }
  });

  test("the Screenshots choice persists across Projects in the session", async ({ page }) => {
    await gotoShowcase(page);
    await revealShowcaseInView(page);
    await page.locator('[data-view-set="media"]').click();
    await expect(page.locator(ACTIVE)).toHaveClass(/stage--view-media/);

    // switch to another embed Project: it should open in screenshots too
    await page.locator("#tab-rangetube").click();
    await expect(page.locator("#panel-rangetube")).toHaveClass(/is-active/);
    await expect(page.locator("#panel-rangetube")).toHaveClass(/stage--view-media/);
  });

  test("embed screenshots are contained in media view", async ({ page }) => {
    await gotoShowcase(page);
    await revealShowcaseInView(page);
    await page.locator("#tab-bye-bg").click();
    await expect(page.locator("#panel-bye-bg")).toHaveClass(/is-active/);
    await page.locator('[data-view-set="media"]').click();
    await expect(page.locator("#panel-bye-bg")).toHaveClass(/stage--view-media/);

    const embedMedia = page.locator("#panel-bye-bg .media-gallery--desktop .gallery-media");
    await expect(embedMedia.nth(0)).toHaveCSS("object-fit", "contain");
    await expect(embedMedia.nth(2)).toHaveClass(/gallery-media--portrait/);
    await expect(embedMedia.nth(2)).toHaveCSS("object-fit", "contain");
  });

  test("RangeTube desktop screenshots also fit below the chrome instead of cropping", async ({
    page,
  }) => {
    await gotoShowcase(page);
    await revealShowcaseInView(page);
    await page.locator("#tab-rangetube").click();
    await expect(page.locator("#panel-rangetube")).toHaveClass(/is-active/);
    await page.locator('[data-view-set="media"]').click();
    await expect(page.locator("#panel-rangetube")).toHaveClass(/stage--view-media/);

    const media = page.locator("#panel-rangetube .media-gallery--desktop .gallery-media");
    await expect(media.first()).toHaveCSS("object-fit", "contain");
  });

  test("a failed embed forces media and disables Interactive", async ({ page }) => {
    await gotoShowcase(page, { embeds: { "simple-tool-stack": { ready: false } } });
    await revealShowcaseInView(page);
    await expect(page.locator(ACTIVE)).toHaveClass(/embed-failed/, { timeout: 10_000 });
    await expect(page.locator(ACTIVE)).toHaveClass(/stage--view-media/);
    await expect(page.locator('[data-view-set="embed"]')).toBeDisabled();
  });
});

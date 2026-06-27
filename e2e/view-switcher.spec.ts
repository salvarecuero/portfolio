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
    await expect(page.locator(`${ACTIVE} [data-view-pos]`)).toContainText("/");
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

  test("a failed embed forces media and disables Interactive", async ({ page }) => {
    await gotoShowcase(page, { embeds: { "simple-tool-stack": { ready: false } } });
    await revealShowcaseInView(page);
    await expect(page.locator(ACTIVE)).toHaveClass(/embed-failed/, { timeout: 10_000 });
    await expect(page.locator(ACTIVE)).toHaveClass(/stage--view-media/);
    await expect(page.locator('[data-view-set="embed"]')).toBeDisabled();
  });
});

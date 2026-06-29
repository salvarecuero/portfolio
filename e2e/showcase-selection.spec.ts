import { test, expect } from "@playwright/test";
import { gotoShowcase, revealShowcaseInView } from "./helpers/harness";

// Showcase selection wiring: tab activation swaps the active Stage and keeps the clean-slug hash
// in sync, and a deep-link hash on load opens the right Project. The keys are the index-free
// slugs (ADR 0008): the hash is #rangetube, never #02-rangetube.

test.describe("Showcase selection", () => {
  test("clicking a Selector tab switches the active Stage and syncs the clean-slug hash", async ({
    page,
  }) => {
    await gotoShowcase(page);
    await revealShowcaseInView(page);

    // Default active Project is the first by `order` (simple-tool-stack).
    await expect(page.locator("#panel-simple-tool-stack")).toHaveClass(/is-active/);
    await expect(page.locator("#tab-rangetube")).toHaveAttribute("aria-selected", "false");

    await page.locator("#tab-rangetube").click();

    await expect(page.locator("#tab-rangetube")).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#panel-rangetube")).toHaveClass(/is-active/);
    await expect(page.locator("#panel-simple-tool-stack")).not.toHaveClass(/is-active/);
    // Clean slug in the hash, no order-index prefix.
    await expect.poll(() => new URL(page.url()).hash).toBe("#rangetube");
  });

  test("keyboard navigation moves the active tab (APG tablist model)", async ({ page }) => {
    await gotoShowcase(page);
    await revealShowcaseInView(page);

    await page.locator("#tab-simple-tool-stack").focus();
    await page.keyboard.press("ArrowRight");

    await expect(page.locator("#tab-bye-bg")).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#panel-bye-bg")).toHaveClass(/is-active/);
    await expect.poll(() => new URL(page.url()).hash).toBe("#bye-bg");
  });

  test("a deep-link hash on load activates that Project", async ({ page }) => {
    await gotoShowcase(page, { hash: "#rangetube" });

    await expect(page.locator("#panel-rangetube")).toHaveClass(/is-active/);
    await expect(page.locator("#tab-rangetube")).toHaveAttribute("aria-selected", "true");
    // The showcase is scrolled into view on a deep link.
    await expect(page.locator("#showcase")).toBeInViewport();
  });
});

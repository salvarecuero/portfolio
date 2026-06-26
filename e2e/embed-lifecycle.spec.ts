import { test, expect } from "@playwright/test";
import type { Locator } from "@playwright/test";
import { gotoShowcase, revealShowcaseInView } from "./helpers/harness";

// Embed lifecycle wiring (embedController + the cross-origin handshake, ADR 0002/0004). These
// exercise the imperative DOM glue the unit suite cannot reach: reveal on handshake, fallback on
// the ceiling, the remembered failure, origin validation, and the delayed spinner. The active
// Project on load is simple-tool-stack (order 0), which the controller mounts at idle.
const ACTIVE = "#panel-simple-tool-stack";

function iframeSrc(panel: Locator) {
  return panel.locator("iframe[data-embed-frame]").evaluate((el) => el.getAttribute("src"));
}

test.describe("Embed lifecycle", () => {
  test("reveals the iframe when the handshake completes", async ({ page }) => {
    await gotoShowcase(page);
    await revealShowcaseInView(page);

    await expect(page.locator(ACTIVE)).toHaveClass(/embed-revealed/, { timeout: 10_000 });
    await expect(page.locator(ACTIVE)).not.toHaveClass(/embed-failed/);
    // The cover fades out and is hidden once revealed.
    await expect(page.locator(`${ACTIVE} [data-embed-cover]`)).toHaveCSS("display", "none");
  });

  test("falls back to the media gallery when no handshake arrives", async ({ page }) => {
    await gotoShowcase(page, { embeds: { "simple-tool-stack": { ready: false } } });
    await revealShowcaseInView(page);

    // The ceiling (EMBED_FALLBACK_MS = 4000) elapses, then the Stage shows media.
    await expect(page.locator(ACTIVE)).toHaveClass(/embed-failed/, { timeout: 10_000 });
    await expect(page.locator(ACTIVE)).not.toHaveClass(/embed-revealed/);
    // The broken iframe is parked (src dropped) so it stops holding a connection.
    expect(await iframeSrc(page.locator(ACTIVE))).toBeNull();
  });

  test("remembers the failure across re-activation (no re-attempt)", async ({ page }) => {
    await gotoShowcase(page, { embeds: { "simple-tool-stack": { ready: false } } });
    await revealShowcaseInView(page);
    await expect(page.locator(ACTIVE)).toHaveClass(/embed-failed/, { timeout: 10_000 });

    // Switch away and back; the failed embed must stay on media, not re-mount the iframe.
    await page.locator("#tab-rangetube").click();
    await expect(page.locator("#panel-rangetube")).toHaveClass(/is-active/);
    await page.locator("#tab-simple-tool-stack").click();
    await expect(page.locator(ACTIVE)).toHaveClass(/is-active/);

    await expect(page.locator(ACTIVE)).toHaveClass(/embed-failed/);
    expect(await iframeSrc(page.locator(ACTIVE))).toBeNull();
  });

  test("ignores a ready message from the wrong origin/source", async ({ page }) => {
    // ready:false so the embed never reveals on its own; the only revealing trigger would be the
    // forged message below. If origin + source validation works, it stays unrevealed.
    await gotoShowcase(page, { embeds: { "simple-tool-stack": { ready: false } } });
    await revealShowcaseInView(page);
    await expect.poll(() => iframeSrc(page.locator(ACTIVE))).not.toBeNull(); // mounted

    // Posted from the top window: e.origin is the page origin (not the embed origin) and e.source
    // is not the iframe's contentWindow, so embedController must reject it.
    await page.evaluate(() => {
      window.postMessage({ type: "portfolio:ready", v: 1 }, "*");
    });

    // Give the (rejected) message time to be processed; the embed must NOT reveal from it.
    await page.waitForTimeout(800);
    await expect(page.locator(ACTIVE)).not.toHaveClass(/embed-revealed/);
  });

  test("shows the loading spinner only after the delay, then reveals", async ({ page }) => {
    // Child waits 1200ms before the handshake: longer than SPINNER_DELAY_MS (600), so the spinner
    // appears, then reveal clears it. A fast handshake never trips the spinner.
    await gotoShowcase(page, { embeds: { "simple-tool-stack": { delay: 1200 } } });
    await revealShowcaseInView(page);

    await expect(page.locator(ACTIVE)).toHaveClass(/is-spinning/, { timeout: 5_000 });
    await expect(page.locator(ACTIVE)).toHaveClass(/embed-revealed/, { timeout: 10_000 });
    await expect(page.locator(ACTIVE)).not.toHaveClass(/is-spinning/);
  });
});

import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { gotoShowcase, revealShowcaseInView } from "./helpers/harness";
import { LIVE_CAP } from "../src/scripts/showcaseTiming";

// LRU eviction wiring (embedController + lruEvict). With a 4th embed injected, mounting beyond
// LIVE_CAP evicts the oldest, and re-activating an evicted Project re-mounts it cleanly (the
// AbortController fix: no orphaned load listener, no duplicate hello loop). The invariant asserted
// throughout is that the live set never exceeds the cap; LIVE_CAP is imported so it stays in step.
const EMBED_IDS = ["simple-tool-stack", "bye-bg", "rangetube", "stub-4"];

// Ids whose iframe currently has a src, i.e. the live (mounted) embeds.
function mountedIds(page: Page): Promise<string[]> {
  return page.evaluate((ids) => {
    return ids.filter((id) => {
      const frame = document.querySelector(`#panel-${id} iframe[data-embed-frame]`);
      return !!frame?.getAttribute("src");
    });
  }, EMBED_IDS);
}

function activate(page: Page, id: string): Promise<void> {
  return page.evaluate((projectId) => {
    document
      .getElementById("showcase")
      ?.dispatchEvent(new CustomEvent("showcase:activate", { detail: { id: projectId } }));
  }, id);
}

test("a 4th live embed evicts the oldest; re-activating it re-mounts cleanly within the cap", async ({
  page,
}) => {
  // Suppress proactive preload so only the explicit showcase:activate calls below mount embeds:
  // proactiveMountQueue() short-circuits on Save-Data, which isolates the re-mount assertion from
  // the idle preload pass (otherwise an evicted embed could be re-mounted by preload, not by the
  // activation path under test).
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "connection", {
      configurable: true,
      value: { saveData: true },
    });
  });

  await gotoShowcase(page, {
    embeds: {
      "simple-tool-stack": { ready: true },
      "bye-bg": { ready: true },
      rangetube: { ready: true },
    },
    extraEmbeds: { "stub-4": { ready: true } },
  });
  await revealShowcaseInView(page);

  // Drive the three real embeds live (boot/preload may already have); settle at the cap.
  await activate(page, "bye-bg");
  await activate(page, "rangetube");
  await expect.poll(() => mountedIds(page).then((m) => m.length)).toBe(LIVE_CAP);

  // Mounting the 4th must evict the oldest: the 4th is live and the cap still holds.
  await activate(page, "stub-4");
  await expect.poll(() => mountedIds(page)).toContain("stub-4");
  await expect.poll(() => mountedIds(page).then((m) => m.length)).toBe(LIVE_CAP);

  // Identify the evicted Project and re-activate it: it re-mounts, still within the cap.
  const live = await mountedIds(page);
  const toRemount = EMBED_IDS.find((id) => !live.includes(id))!;
  expect(toRemount).toBeTruthy();

  await activate(page, toRemount);
  await expect.poll(() => mountedIds(page)).toContain(toRemount);
  await expect.poll(() => mountedIds(page).then((m) => m.length)).toBe(LIVE_CAP);
});

import type { Page } from "@playwright/test";

// The stub child's origin (must match playwright.config.ts STUB_PORT). Repointing the embed
// URLs here means entry.origin, the iframe src, and the child's postMessage origin all line up
// on this single cross-origin host, so the parent's origin validation runs for real.
export const STUB_ORIGIN = "http://localhost:4399";

// The real embed origins baked into the production build (one per project). The harness rewrites
// each to the stub origin so no test ever hits the live deployed apps.
export const REAL_EMBED_ORIGINS: Record<string, string> = {
  "simple-tool-stack": "https://simpletoolstack.com",
  "bye-bg": "https://bye-bg.salvarecuero.dev",
  rangetube: "https://rangetube.netlify.app",
};

export type StubBehavior = {
  // false => the child never sends ready, forcing the parent's fallback-to-media ceiling.
  ready?: boolean;
  // ms to wait before the child starts the ready loop (forces the delayed spinner).
  delay?: number;
};

function stubUrl(behavior: StubBehavior = {}): string {
  const params = new URLSearchParams();
  if (behavior.ready === false) params.set("ready", "0");
  if (behavior.delay) params.set("delay", String(behavior.delay));
  const qs = params.toString();
  return qs ? `${STUB_ORIGIN}/?${qs}` : `${STUB_ORIGIN}/`;
}

// Markup for an extra embed Stage injected for the LRU test. embedController.collect() queries
// the whole document for `.stage[data-embed-url]`, so a 4th entry anywhere in <body> registers
// without needing a matching Selector tab (the spec drives it via the showcase:activate event).
// This mirrors the controller hooks in Stage.astro / Embed.astro (data-embed-url, data-embed-frame,
// data-embed-cover); keep it in step if those hooks change, or the 4th stage is silently ignored.
function extraStageMarkup(id: string, url: string): string {
  return `<section class="stage stage--embed" role="tabpanel" id="panel-${id}" data-project="${id}" data-embed-url="${url}" aria-labelledby="tab-${id}" hidden>
    <div class="embed" data-embed>
      <iframe class="embed-frame" data-embed-frame aria-label="${id}" loading="lazy" inert tabindex="-1"></iframe>
      <div class="embed-cover" data-embed-cover><div class="embed-spinner" data-embed-spinner aria-hidden="true"><span class="embed-ring"></span></div></div>
    </div>
  </section>`;
}

export type ShowcaseOptions = {
  // Per-project stub behavior, keyed by slug. Projects omitted default to ready=immediately.
  embeds?: Record<string, StubBehavior>;
  // Extra embed Stages to inject (id -> stub behavior), for the LRU eviction test.
  extraEmbeds?: Record<string, StubBehavior>;
};

// Install the in-flight rewrite of the index HTML: every embed URL repointed to the stub origin
// (with per-project behavior) and any extra embed Stages injected. Rewriting before parse means
// the controllers see the stub URLs from the very first collect(). Call before navigating.
export async function installShowcaseRoute(
  page: Page,
  options: ShowcaseOptions = {},
): Promise<void> {
  const { embeds = {}, extraEmbeds = {} } = options;

  await page.route(
    // Match only the preview's top-level index (port 4329), never the cross-origin stub (4399).
    (url) => url.hostname === "localhost" && url.port === "4329" && url.pathname === "/",
    async (route) => {
      const response = await route.fetch();
      let body = await response.text();

      for (const [slug, real] of Object.entries(REAL_EMBED_ORIGINS)) {
        body = body
          .split(`data-embed-url="${real}"`)
          .join(`data-embed-url="${stubUrl(embeds[slug])}"`);
      }

      const injected = Object.entries(extraEmbeds)
        .map(([id, behavior]) => extraStageMarkup(id, stubUrl(behavior)))
        .join("\n");
      if (injected) body = body.replace("</body>", `${injected}</body>`);

      await route.fulfill({ response, body });
    },
  );
}

// Install the rewrite, then navigate to the Showcase index (optionally with a deep-link hash).
export async function gotoShowcase(
  page: Page,
  options: ShowcaseOptions & { hash?: string } = {},
): Promise<void> {
  await installShowcaseRoute(page, options);
  await page.goto(options.hash ? `/${options.hash}` : "/");
}

// Bring the Showcase into the viewport so its lazy embed iframes actually load (loading="lazy"
// defers off-screen frames, which would otherwise never fire load -> hello -> reveal).
export async function revealShowcaseInView(page: Page): Promise<void> {
  await page.locator("#showcase").scrollIntoViewIfNeeded();
}

// Markup for a standalone gallery that the real galleryController (already loaded on the index)
// will wire on parse. Used to exercise the carousel glue with deterministic slide counts and an
// optional video, independent of the embed-covered galleries inside the Stages. Note the video
// slide is itself a [data-slide], so a video-only fixture (slides: 0) still has n === 1 and the
// controller does not early-return on an empty track.
export function galleryFixtureMarkup(
  id: string,
  opts: { slides: number; video?: boolean },
): string {
  const imageSlides = Array.from(
    { length: opts.slides },
    (_, i) =>
      `<div class="gallery-slide" data-slide aria-hidden="${i === 0 ? "false" : "true"}">slide ${i + 1}</div>`,
  ).join("");
  const videoSlide = opts.video
    ? `<div class="gallery-slide" data-slide aria-hidden="true"><video data-video muted loop playsinline preload="none"><source data-src="${STUB_ORIGIN}/clip.webm" type="video/webm" /></video></div>`
    : "";
  const thumbCount = opts.slides + (opts.video ? 1 : 0);
  const thumbs = Array.from(
    { length: thumbCount },
    (_, i) => `<button type="button" data-thumb="${i}"></button>`,
  ).join("");
  return `<div id="${id}" class="media-gallery" data-gallery data-index="0" role="group" style="position:fixed;bottom:0;left:0;width:300px;height:200px;z-index:9999;background:#000">
    <div class="gallery-track" data-track style="transform:translateX(0%)">${imageSlides}${videoSlide}</div>
    <button type="button" data-prev aria-label="Previous media">prev</button>
    <button type="button" data-next aria-label="Next media">next</button>
    <div class="gallery-counter" data-counter>1 / ${thumbCount}</div>
    <div class="gallery-thumbs">${thumbs}</div>
  </div>`;
}

// Inject arbitrary markup before </body> on the index, then navigate. Used to add gallery
// fixtures that the real controllers pick up at parse time.
export async function gotoWithInjectedBody(page: Page, markup: string): Promise<void> {
  await page.route(
    // Match only the preview's top-level index (port 4329), never the cross-origin stub (4399).
    (url) => url.hostname === "localhost" && url.port === "4329" && url.pathname === "/",
    async (route) => {
      const response = await route.fetch();
      const body = (await response.text()).replace("</body>", `${markup}</body>`);
      await route.fulfill({ response, body });
    },
  );
  await page.goto("/");
}

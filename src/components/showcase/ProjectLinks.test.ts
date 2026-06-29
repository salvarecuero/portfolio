import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, it, expect } from "vitest";
import ProjectLinks from "./ProjectLinks.astro";

const base = { title: "RangeTube", slug: "rangetube" };

async function render(props: any) {
  const c = await AstroContainer.create();
  return c.renderToString(ProjectLinks, { props });
}

describe("ProjectLinks.astro", () => {
  it("embed mode: no live pill (open-in-new-tab lives in the chrome)", async () => {
    const html = await render({
      ...base,
      mode: "embed",
      links: { live: "https://rangetube.netlify.app" },
    });
    expect(html).not.toContain("Open in new tab");
    expect(html).not.toContain('class="lnk live"');
    expect(html).toContain("Details"); // Details still present
  });

  it('media mode: primary CTA is "Live site" with the globe icon', async () => {
    const html = await render({ ...base, mode: "media", links: { live: "https://rangetube.dev" } });
    expect(html).toContain("Live site");
    expect(html).not.toContain("Open in new tab");
    expect(html).toContain("M3 12h18"); // globe glyph fragment
  });

  it("Details link points to the project detail page", async () => {
    const html = await render({ ...base, mode: "embed", links: {} });
    expect(html).toContain('href="/projects/rangetube/"');
    expect(html).toContain("Details");
  });

  it("renders the GitHub anchor only when links.repo is set", async () => {
    const withRepo = await render({
      ...base,
      mode: "embed",
      links: { repo: "https://github.com/x/y" },
    });
    expect(withRepo).toContain('aria-label="GitHub"');
    const without = await render({ ...base, mode: "embed", links: {} });
    expect(without).not.toContain('aria-label="GitHub"');
  });

  it("omits the live anchor when links.live is absent", async () => {
    const html = await render({
      ...base,
      mode: "embed",
      links: { repo: "https://github.com/x/y" },
    });
    expect(html).not.toContain('class="lnk live"');
  });
});

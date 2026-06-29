// src/components/showcase/ViewSwitcher.test.ts
import { describe, it, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import ViewSwitcher from "./ViewSwitcher.astro";

async function render(props: any) {
  const c = await AstroContainer.create();
  return c.renderToString(ViewSwitcher, { props });
}

describe("ViewSwitcher.astro", () => {
  it("renders two view buttons with data-view-set and a labelled group", async () => {
    const html = await render({ visible: true });
    expect(html).toContain("data-view-switch");
    expect(html).toContain('aria-label="Stage view"');
    expect(html).toMatch(/data-view-set="embed"[^>]*aria-pressed="true"/);
    expect(html).toMatch(/data-view-set="media"[^>]*aria-pressed="false"/);
    expect(html).toContain("Interactive");
    expect(html).toContain("Screenshots");
  });

  it("is hidden by default when not visible (non-embed default Project)", async () => {
    const html = await render({ visible: false });
    expect(html).toMatch(/data-view-switch[^>]*\shidden/);
  });
});

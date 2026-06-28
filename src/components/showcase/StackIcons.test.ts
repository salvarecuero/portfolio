import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, it, expect } from "vitest";
import StackIcons from "./StackIcons.astro";

async function render(props: any) {
  const c = await AstroContainer.create();
  return c.renderToString(StackIcons, { props });
}

describe("StackIcons.astro", () => {
  it("renders one accessible list item per stack entry", async () => {
    const html = await render({ stack: ["Docker", "React", "Sablier"] });
    expect((html.match(/<li/g) ?? []).length).toBe(3);
    expect(html).toContain('aria-label="Tech stack"');
    expect(html).toContain('aria-label="Docker"');
    expect(html).toContain('aria-label="React"');
    expect(html).toContain('aria-label="Sablier"');
  });

  it("renders a path icon as an inline svg (Docker)", async () => {
    const html = await render({ stack: ["Docker"] });
    expect(html).toContain("M13.983 11.078"); // Docker path fragment
    expect(html).toContain("<svg");
  });

  it("renders a mask icon as a masked span (Sablier)", async () => {
    const html = await render({ stack: ["Sablier"] });
    expect(html).toContain("stack-ic__mask");
    expect(html).toContain("data:image/webp;base64,UklGR"); // webp mask data-uri
  });

  it("makes each icon focusable so the tooltip reveals on keyboard focus", async () => {
    const html = await render({ stack: ["Docker"] });
    expect(html).toContain('tabindex="0"');
  });

  it("renders nothing for an empty stack", async () => {
    const html = await render({ stack: [] });
    expect(html).not.toContain("<ul");
  });
});

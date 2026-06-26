import { describe, it, expect } from "vitest";
import { toShowcaseProjects, projectSlug } from "./showcaseProjects";

const img = { src: "/x.webp", width: 10, height: 10, format: "webp" } as any;
const raw = [
  {
    id: "b",
    data: {
      title: "B",
      order: 2,
      icon: "target",
      accent: "#f00",
      summary: "s",
      mode: "media",
      stack: [],
      links: { live: "https://b.dev" },
      media: [{ type: "image", src: img, alt: "b0" }],
    },
  },
  {
    id: "a",
    data: {
      title: "A",
      order: 1,
      icon: undefined,
      accent: "#0f0",
      summary: "s",
      mode: "media",
      stack: [],
      links: { repo: "https://git/a" },
      media: [{ type: "image", src: img, alt: "a0" }],
      mediaMobile: [{ type: "image", src: img, alt: "a0m" }],
    },
  },
];

describe("toShowcaseProjects", () => {
  it("sorts by order and marks the first active", () => {
    const out = toShowcaseProjects(raw as any);
    expect(out.map((p) => p.title)).toEqual(["A", "B"]);
    expect(out[0].active).toBe(true);
    expect(out[1].active).toBe(false);
  });
  it("resolves a default icon path when icon is missing", () => {
    const out = toShowcaseProjects(raw as any);
    expect(out[0].iconPath.length).toBeGreaterThan(0);
  });
  it("passes links through", () => {
    const out = toShowcaseProjects(raw as any);
    expect(out[0].links?.repo).toBe("https://git/a");
  });
  it("passes the media set through; media[0] is the poster", () => {
    const out = toShowcaseProjects(raw as any);
    expect(out[0].media).toHaveLength(1);
    expect(out[0].media[0].alt).toBe("a0");
    expect(out[0].mediaMobile?.[0].alt).toBe("a0m");
    expect(out[1].mediaMobile).toBeUndefined();
  });
});

describe("toShowcaseProjects - embed fields", () => {
  const base = {
    title: "X",
    summary: "s",
    media: [
      { type: "image", src: { src: "/p.webp", width: 10, height: 10, format: "webp" }, alt: "a" },
    ],
    order: 0,
    stack: [],
  } as any;

  it("surfaces mode and embed (url/requiresLaunch/mobile)", () => {
    const [p] = toShowcaseProjects([
      {
        id: "rt",
        data: {
          ...base,
          mode: "embed",
          embed: { url: "https://rangetube.netlify.app", requiresLaunch: false, mobile: false },
        },
      },
    ] as any);
    expect(p.mode).toBe("embed");
    expect(p.embed).toEqual({
      url: "https://rangetube.netlify.app",
      requiresLaunch: false,
      mobile: false,
    });
  });

  it('media-mode project has mode "media" and no embed', () => {
    const [p] = toShowcaseProjects([{ id: "m", data: { ...base, mode: "media" } }] as any);
    expect(p.mode).toBe("media");
    expect(p.embed).toBeUndefined();
  });
});

describe("projectSlug", () => {
  it("strips a leading order prefix (NN- or NN_)", () => {
    expect(projectSlug("01-rangetube")).toBe("rangetube");
    expect(projectSlug("02-bye-bg")).toBe("bye-bg");
    expect(projectSlug("10_foo")).toBe("foo");
  });
  it("leaves ids without a numeric prefix unchanged", () => {
    expect(projectSlug("plain")).toBe("plain");
  });
});

describe("toShowcaseProjects - slug", () => {
  it("derives a slug from the entry id", () => {
    const out = toShowcaseProjects([
      {
        id: "01-rangetube",
        data: {
          title: "RangeTube",
          order: 0,
          summary: "s",
          mode: "media",
          stack: [],
          media: [
            {
              type: "image",
              src: { src: "/x.webp", width: 10, height: 10, format: "webp" },
              alt: "a",
            },
          ],
        },
      },
    ] as any);
    expect(out[0].slug).toBe("rangetube");
  });
});

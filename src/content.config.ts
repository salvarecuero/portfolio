import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

// Showcase Project catalog. The schema reflects the Presentation modes (embed/media/custom)
// and the embed contract (see docs/adr/0004). `media` is a navigable gallery; media[0] is
// the Poster for Media mode. For Embed mode `media` is the SSR/no-JS baseline and the
// fallback shown when the readiness handshake never arrives (it is not the embed loading
// layer - the live embed loads behind a flat cover, see ADR 0002).
const projects = defineCollection({
  loader: glob({ base: "./src/content/projects", pattern: "**/[^_]*.{md,mdx}" }),
  schema: ({ image }) => {
    const mediaItem = z.discriminatedUnion("type", [
      z.object({
        type: z.literal("image"),
        src: image(), // src/assets path -> ImageMetadata (optimized by astro:assets)
        alt: z.string(),
      }),
      z.object({
        type: z.literal("video"),
        poster: image(), // optimized still: base layer + reduced-motion fallback
        sources: z
          .array(z.object({ src: z.string(), type: z.string() }))
          .min(1),
        alt: z.string(),
      }),
    ]);

    return z.object({
      title: z.string(),
      summary: z.string(),
      // Long-form description as ordered paragraphs. Source of truth for the detail
      // page body (replaces the former markdown body). Defaulted so media/custom
      // Projects without prose still validate.
      description: z.array(z.string()).default([]),
      // Presentation mode in the Showcase.
      mode: z.enum(["embed", "media", "custom"]),
      // Media set (desktop / landscape). media[0] is the Poster (Media mode); the gallery
      // is also the Embed failure fallback / no-JS baseline.
      media: z.array(mediaItem).min(1),
      // Media set for narrow viewports (the mobile-rendered site, portrait). Optional;
      // falls back to `media` cover-cropped when absent.
      mediaMobile: z.array(mediaItem).optional(),
      // Order in the Selector (lower = first).
      order: z.number().default(0),
      // Project identity accent; overrides the --accent var.
      accent: z.string().optional(),
      // Selector tab glyph: a key into src/data/showcaseIcons.ts (falls back to a default).
      icon: z.string().optional(),
      // Embed contract - only for mode: "embed". See ADR 0004.
      embed: z
        .object({
          url: z.url(),
          requiresLaunch: z.boolean().default(false),
          // Opt a single mobile-oriented Project into mounting its Embed on mobile.
          mobile: z.boolean().default(false),
        })
        .optional(),
      links: z
        .object({
          live: z.url().optional(),
          repo: z.url().optional(),
        })
        .optional(),
      stack: z.array(z.string()).default([]),
    });
  },
});

export const collections = { projects };

import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

// Showcase Project catalog. The schema reflects the Presentation modes
// (see CONTEXT.md) and the embed contract (see docs/adr/0004). It evolves as
// implementation proceeds.
const projects = defineCollection({
  loader: glob({ base: "./src/content/projects", pattern: "**/[^_]*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    // Presentation mode in the Showcase.
    mode: z.enum(["embed", "media", "custom"]),
    // Poster: base visual layer (Media, and Embed background during fade-in).
    poster: z.string(),
    // Order in the Selector (lower = first).
    order: z.number().default(0),
    // Project identity accent; overrides the --accent var.
    accent: z.string().optional(),
    // Selector tab glyph: a key into src/data/showcaseIcons.ts (falls back to a default).
    icon: z.string().optional(),
    // Embed contract — only for mode: "embed". See ADR 0004.
    embed: z
      .object({
        url: z.url(),
        // bye-bg-style: requires an explicit launch instead of a live iframe.
        requiresLaunch: z.boolean().default(false),
      })
      .optional(),
    links: z
      .object({
        live: z.url().optional(),
        repo: z.url().optional(),
      })
      .optional(),
    stack: z.array(z.string()).default([]),
  }),
});

export const collections = { projects };

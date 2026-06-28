import type { CollectionEntry } from "astro:content";
import { iconPath } from "../data/showcaseIcons";

// Canonical project key for every URL surface (the Showcase deep-link hash, the Stage/Selector
// DOM ids, and the /projects/<slug> detail route). Content filenames are index-free, so this is
// an identity for current ids; it stays as a guard that strips any legacy order prefix
// (e.g. "01-rangetube"). Sorting is driven by the `order` frontmatter, not the filename. ADR 0008.
export function projectSlug(id: string): string {
  return id.replace(/^\d+[-_]/, "");
}

// Derived from the `projects` collection schema (content.config.ts) so these never drift
// from the source of truth - add a mode or a media field there and these follow.
type ProjectData = CollectionEntry<"projects">["data"];

export type EmbedMode = ProjectData["mode"];

export type MediaItem = ProjectData["media"][number];

export type VideoSource = Extract<MediaItem, { type: "video" }>["sources"][number];

export type EmbedConfig = Extract<ProjectData, { mode: "embed" }>["embed"];

interface ShowcaseBase {
  id: string;
  slug: string;
  title: string;
  summary: string;
  stack: string[];
  iconPath: string;
  accent?: string;
  active: boolean;
  links?: ProjectData["links"];
  // Media set. media[0] is the Poster for the media-gallery paths; for embeds the gallery is
  // the no-JS baseline and the handshake-failure fallback, not a loading layer.
  media: MediaItem[];
  // Portrait set for narrow viewports; absent => fall back to `media`.
  mediaMobile?: MediaItem[];
}

// Discriminated on mode, mirroring the schema: only embed Projects carry the embed contract,
// so consumers narrow on `project.mode` instead of asserting `embed` is present.
export type ShowcaseProject =
  | (ShowcaseBase & { mode: "embed"; embed: EmbedConfig })
  | (ShowcaseBase & { mode: "media" | "custom"; embed?: undefined });

// A media item is portrait when its intrinsic height exceeds its width. The gallery frame is
// landscape (viewport-sized), so object-fit:cover would zoom a portrait capture to an illegible
// sliver; the gallery renders portrait items contained instead (see showcase.css). Square counts
// as landscape (cover, no letterbox). Reads the image src, or a video's poster.
export function isPortrait(item: MediaItem): boolean {
  const asset = item.type === "image" ? item.src : item.poster;
  return asset.height > asset.width;
}

export function toShowcaseProjects(
  entries: Pick<CollectionEntry<"projects">, "id" | "data">[],
): ShowcaseProject[] {
  return [...entries]
    .sort((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0))
    .map((e, i) => {
      const base = {
        id: e.id,
        slug: projectSlug(e.id),
        title: e.data.title,
        summary: e.data.summary,
        stack: e.data.stack,
        iconPath: iconPath(e.data.icon),
        accent: e.data.accent,
        active: i === 0,
        links: e.data.links,
        media: e.data.media,
        mediaMobile: e.data.mediaMobile,
      };
      return e.data.mode === "embed"
        ? { ...base, mode: "embed" as const, embed: e.data.embed }
        : { ...base, mode: e.data.mode };
    });
}

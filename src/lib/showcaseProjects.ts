import type { CollectionEntry } from 'astro:content';
import type { ImageMetadata } from 'astro';
import { iconPath } from '../data/showcaseIcons';

export type VideoSource = { src: string; type: string };

export type MediaItem =
  | { type: 'image'; src: ImageMetadata; alt: string }
  | { type: 'video'; poster: ImageMetadata; sources: VideoSource[]; alt: string };

export interface ShowcaseProject {
  id: string;
  title: string;
  summary: string;
  iconPath: string;
  accent?: string;
  active: boolean;
  links?: { live?: string; repo?: string };
  // Media set. media[0] is the Poster (base layer / anti-spinner / Embed fade-in).
  media: MediaItem[];
  // Portrait set for narrow viewports; absent => fall back to `media`.
  mediaMobile?: MediaItem[];
}

export function toShowcaseProjects(
  entries: Pick<CollectionEntry<'projects'>, 'id' | 'data'>[],
): ShowcaseProject[] {
  return [...entries]
    .sort((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0))
    .map((e, i) => ({
      id: e.id,
      title: e.data.title,
      summary: e.data.summary,
      iconPath: iconPath(e.data.icon),
      accent: e.data.accent,
      active: i === 0,
      links: e.data.links,
      media: e.data.media,
      mediaMobile: e.data.mediaMobile,
    }));
}

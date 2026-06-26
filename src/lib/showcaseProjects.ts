import type { CollectionEntry } from 'astro:content';
import { iconPath } from '../data/showcaseIcons';

// Clean public slug for a project's own page (/projects/<slug>). The content id carries an
// order prefix (e.g. "01-rangetube") for sorting; the slug strips it for a tidy URL.
export function projectSlug(id: string): string {
  return id.replace(/^\d+[-_]/, '');
}

// Derived from the `projects` collection schema (content.config.ts) so these never drift
// from the source of truth - add a mode or a media field there and these follow.
type ProjectData = CollectionEntry<'projects'>['data'];

export type EmbedMode = ProjectData['mode'];

export type MediaItem = ProjectData['media'][number];

export type VideoSource = Extract<MediaItem, { type: 'video' }>['sources'][number];

export interface ShowcaseProject {
  id: string;
  slug: string;
  title: string;
  summary: string;
  iconPath: string;
  accent?: string;
  active: boolean;
  mode: EmbedMode;
  embed?: { url: string; requiresLaunch: boolean; mobile: boolean };
  links?: { live?: string; repo?: string };
  // Media set. media[0] is the Poster for the media-gallery paths; for embeds the gallery is
  // the no-JS baseline and the handshake-failure fallback, not a loading layer.
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
      slug: projectSlug(e.id),
      title: e.data.title,
      summary: e.data.summary,
      iconPath: iconPath(e.data.icon),
      accent: e.data.accent,
      active: i === 0,
      mode: e.data.mode,
      embed: e.data.embed,
      links: e.data.links,
      media: e.data.media,
      mediaMobile: e.data.mediaMobile,
    }));
}

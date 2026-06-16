import type { CollectionEntry } from 'astro:content';
import { iconPath } from '../data/showcaseIcons';

export interface ShowcaseProject {
  id: string;
  title: string;
  summary: string;
  iconPath: string;
  accent?: string;
  poster: string;
  active: boolean;
  links?: { live?: string; repo?: string };
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
      poster: e.data.poster,
      active: i === 0,
      links: e.data.links,
    }));
}

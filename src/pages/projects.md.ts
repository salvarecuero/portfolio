import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { presentation } from "../data/presentation";
import { siteOrigin } from "../lib/seo";
import { renderProjectsMarkdown } from "../lib/projectsMarkdown";

// Agent-facing markdown index of the Showcase Projects, generated from the `projects`
// content collection so it never drifts from the source of truth. Emitted as the static
// file /projects.md; its text/markdown Content-Type at serve time comes from public/_headers
// (a static build keeps the body but not this Response's headers). See ADR 0007.
export const GET: APIRoute = async ({ site }) => {
  const origin = siteOrigin(site, `${presentation.domain}/`);
  const projects = await getCollection("projects");
  return new Response(renderProjectsMarkdown(projects, origin), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};

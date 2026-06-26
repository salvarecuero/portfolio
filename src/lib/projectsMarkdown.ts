import { projectSlug } from "./showcaseProjects";

// Minimal shape the renderer needs from a `projects` collection entry. Kept structural
// (not the full CollectionEntry) so the renderer is a pure function testable with fixtures,
// independent of astro:content.
export interface ProjectMarkdownEntry {
  id: string;
  data: {
    title: string;
    summary: string;
    description: string[];
    stack: string[];
    order: number;
    links?: { live?: string; repo?: string };
  };
}

// Renders the agent-facing /projects.md body from the project catalog. Pure and
// deterministic: sorts by `order` (matching the Selector) and derives the project-page URL
// from `origin` + the public slug, so the output never drifts from the content collection.
export function renderProjectsMarkdown(projects: ProjectMarkdownEntry[], origin: string): string {
  const sections = [...projects]
    .sort((a, b) => a.data.order - b.data.order)
    .map((entry) => {
      const d = entry.data;
      // Trailing slash to match the page's own canonical / og:url / CreativeWork @id
      // (Astro's default directory build format serves project pages at /projects/<slug>/).
      const pageUrl = new URL(`projects/${projectSlug(entry.id)}/`, origin).href;
      const lines = [`## ${d.title}`, "", d.summary, ""];
      for (const paragraph of d.description) lines.push(paragraph, "");
      if (d.stack.length) lines.push(`Stack: ${d.stack.join(", ")}`, "");
      lines.push(`Project page: ${pageUrl}`);
      if (d.links?.live) lines.push(`Live: ${d.links.live}`);
      if (d.links?.repo) lines.push(`Repo: ${d.links.repo}`);
      return lines.join("\n");
    });

  return (
    [
      "# Projects by Salvador Recuero",
      "",
      "Selected software projects, generated from the portfolio's project catalog.",
      "For a hiring overview see /hire.md; for contact details see /contact.md.",
      "",
      sections.join("\n\n"),
    ].join("\n") + "\n"
  );
}

// Single source of truth for the Presentation section. Both the visible markup
// and the schema.org/Person JSON-LD read from here, so adding or removing a
// technology is a one-line edit.

interface Presentation {
  name: string;
  role: string;
  stack: readonly string[];
  knowsAbout: readonly string[];
  description: string;
  domain: string;
  socials: { github: string; linkedin: string };
  cvUrl: string;
}

export const presentation = {
  name: "Salvador Recuero",
  role: "Software Engineer",
  // Visible chips — curated signal, not a laundry list.
  stack: ["TypeScript", "Node.js", "React", "Next.js", "Astro", "Docker", "AWS"],
  // Schema-only: broader set for crawlers (Person.knowsAbout). Not rendered.
  knowsAbout: [
    "TypeScript", "Node.js", "React", "Next.js", "Astro", "Docker", "AWS",
    "Full-Stack Development", "JavaScript", "REST APIs", "PostgreSQL",
    "CI/CD", "Web Performance",
  ],
  description:
    "Salvador Recuero — Software Engineer building fast, reliable, " +
    "well-engineered software across the full stack: TypeScript, Node.js, " +
    "React/Next.js, Astro, AWS.",
  domain: "https://salvarecuero.dev",
  socials: {
    github: "https://github.com/salvarecuero",
    linkedin: "https://www.linkedin.com/in/salvarecuero/",
  },
  // Served as a static file from public/. The PDF asset itself is added separately.
  cvUrl: "/cv.pdf",
} as const satisfies Presentation;

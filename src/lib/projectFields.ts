import { z } from "astro/zod";

// Shared validators for the `projects` content schema (content.config.ts), kept here so the
// constraints are unit-testable without pulling the content layer into the test runner.

// Project identity accent, written verbatim into a `--accent` inline style. Constrain it to a
// hex color (#RGB / #RRGGBB / #RRGGBBAA) so a typo'd or malformed value fails the build instead
// of silently injecting into the style attribute.
export const accentColor = z
  .string()
  .regex(
    /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/,
    "accent must be a hex color, e.g. #0ea5e9",
  )
  .optional();

// Selector order (lower = first). A non-negative integer: floats and negatives sort fine but are
// never intended, so reject them to keep the ordering keys clean.
export const projectOrder = z.number().int().nonnegative().default(0);

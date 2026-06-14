// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://salvarecuero.dev',
  // Presentation typography. Self-hosted + subset via Astro's Fonts API (no CDN):
  // Geist (display + body) and Geist Mono (role / stack / chip / links) carry the
  // engineer signal; the strapline uses three characterful faces, one weight each
  // (Yellowtail = "Beautiful", Oswald = "fast", Zilla Slab = "reliable").
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Geist',
      cssVariable: '--font-geist',
      weights: [300, 400, 500, 600, 700],
      styles: ['normal'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'Geist Mono',
      cssVariable: '--font-geist-mono',
      weights: [400, 500, 600],
      styles: ['normal'],
      fallbacks: ['ui-monospace', 'monospace'],
    },
    {
      provider: fontProviders.google(),
      name: 'Yellowtail',
      cssVariable: '--font-yellowtail',
      weights: [400],
      styles: ['normal'],
      fallbacks: ['cursive'],
    },
    {
      provider: fontProviders.google(),
      name: 'Oswald',
      cssVariable: '--font-oswald',
      weights: [600],
      styles: ['normal'],
      fallbacks: ['sans-serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'Zilla Slab',
      cssVariable: '--font-zilla',
      weights: [700],
      styles: ['normal'],
      fallbacks: ['serif'],
    },
  ],
  // The editor's TS server may flag a Vite PluginOption type mismatch here from pnpm's peer-differentiated vite copies; astro check, tsc and build are unaffected.
  vite: {
    plugins: [tailwindcss()]
  }
});
// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://salvarecuero.dev',
  // The editor's TS server may flag a Vite PluginOption type mismatch here from pnpm's peer-differentiated vite copies; astro check, tsc and build are unaffected.
  vite: {
    plugins: [tailwindcss()]
  }
});
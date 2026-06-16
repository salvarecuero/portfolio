import { describe, it, expect, beforeAll } from 'vitest';
import { execSync } from 'node:child_process';
import { statSync, existsSync } from 'node:fs';
import sharp from 'sharp';

const OUT = 'src/assets/showcase/cosmos.webp';

describe('bake-cosmos', () => {
  beforeAll(() => { execSync('node scripts/bake-cosmos.mjs', { stdio: 'inherit' }); });

  it('writes a non-trivial WebP at the expected dimensions', async () => {
    expect(existsSync(OUT)).toBe(true);
    expect(statSync(OUT).size).toBeGreaterThan(5_000);     // real content, not empty
    const meta = await sharp(OUT).metadata();
    expect(meta.format).toBe('webp');
    expect(meta.width).toBe(2560);
    expect(meta.height).toBe(1440);
  });
});

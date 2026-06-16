// Bakes the calibrated "rich" cosmos starfield into a single cover WebP.
// Deterministic (seeded mulberry32). Run: node scripts/bake-cosmos.mjs
// "rich" preset is locked in the intro/shell specs.
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

const W = 2560, H = 1440;
const RICH = { scale: 1.15, bright: 1.15, neb: 0.120, seed: 1337 };
// Cover image (non-tiling): scatter stars over the whole canvas. Tune STAR_COUNT
// to visually match the mockup's "rich" density at this resolution.
const STAR_COUNT = 1100;

function mulberry32(a){return function(){a|=0;a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}

const rnd = mulberry32(RICH.seed);
let stars = '';
for (let i = 0; i < STAR_COUNT; i++) {
  const x = (rnd() * W).toFixed(1);
  const y = (rnd() * H).toFixed(1);
  const r = ((0.7 + Math.pow(rnd(), 2.2) * 1.4) * RICH.scale).toFixed(2);
  const op = Math.min(1, (0.28 + Math.pow(rnd(), 1.3) * 0.57) * RICH.bright).toFixed(2);
  const tint = rnd() < 0.18 ? '200,222,255' : '255,255,255';
  stars += `<circle cx="${x}" cy="${y}" r="${r}" fill="rgb(${tint})" fill-opacity="${op}"/>`;
}
const nbBlue = (RICH.neb * 0.9).toFixed(3);
const nbViolet = (RICH.neb * 0.75).toFixed(3);
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="nb" cx="80%" cy="10%" r="55%">
      <stop offset="0%" stop-color="rgb(43,143,214)" stop-opacity="${nbBlue}"/>
      <stop offset="70%" stop-color="rgb(43,143,214)" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="nv" cx="10%" cy="94%" r="45%">
      <stop offset="0%" stop-color="rgb(120,90,200)" stop-opacity="${nbViolet}"/>
      <stop offset="70%" stop-color="rgb(120,90,200)" stop-opacity="0"/>
    </radialGradient>
    <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="0.35"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="#020206"/>
  <rect width="${W}" height="${H}" fill="url(#nb)"/>
  <rect width="${W}" height="${H}" fill="url(#nv)"/>
  <g filter="url(#soft)">${stars}</g>
</svg>`;

const out = 'src/assets/showcase/cosmos.webp';
await mkdir(dirname(out), { recursive: true });
await sharp(Buffer.from(svg)).webp({ quality: 82 }).toFile(out);
console.log('baked', out, `(${STAR_COUNT} stars, ${W}x${H})`);

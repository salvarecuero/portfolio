// One-shot: prints registry entries to paste into src/data/presentationIcons.ts.
// Fetches simple-icons SVG paths and builds the Sablier mask data-URI from the
// source logo. Brand hexes are hand-tuned to read on the light wall (same policy
// as the existing entries). Run: node scripts/gen-stack-icons.mjs
import sharp from "sharp";

const SIMPLE = {
  Cloudflare: ["cloudflare", "#F38020"],
  WebAssembly: ["webassembly", "#654FF0"],
  Turborepo: ["turborepo", "#EF4444"],
  Traefik: ["traefikproxy", "#24A1C1"],
  Hono: ["hono", "#E36002"],
  Mantine: ["mantine", "#339AF0"],
  Netlify: ["netlify", "#00C7B7"],
  "YouTube IFrame API": ["youtube", "#FF0000"],
  "ONNX Runtime Web": ["onnx", "#005CED"],
};

let out = "";
for (const [name, [slug, brand]] of Object.entries(SIMPLE)) {
  const svg = await (
    await fetch(`https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${slug}.svg`)
  ).text();
  const m = svg.match(/ d="([^"]+)"/);
  if (!m) throw new Error(`no path found for ${slug}`);
  const d = m[1];
  out += `  ${JSON.stringify(name)}: { brand: "${brand}", path: ${JSON.stringify(d)} },\n`;
}

const webp = await sharp("src/assets/stack/sablier.png")
  .trim()
  .resize(40, 40, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .webp({ lossless: true })
  .toBuffer();
const uri = "data:image/webp;base64," + webp.toString("base64");
out += `  Sablier: { brand: "#F2810E", mask: ${JSON.stringify(uri)} },\n`;

const webgpuWebp = await sharp("src/assets/stack/webgpu.png")
  .trim()
  .resize(40, 40, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .webp({ lossless: true })
  .toBuffer();
const webgpuUri = "data:image/webp;base64," + webgpuWebp.toString("base64");
out += `  WebGPU: { brand: "#0066B0", mask: ${JSON.stringify(webgpuUri)} },\n`;

process.stdout.write(out);

/**
 * Procedural cosmic-rift scene (Three.js). Created lazily by riftPortal ONLY on Portfolio
 * activation, so `three` is code-split out of the initial bundle (this is the only module
 * that imports `three`). Fullscreen-quad fragment shader: procedural starfield + nebula +
 * a centre-origin fracture that ruptures (progress 0->1) then settles into a slow ambient
 * shimmer. Owns its RAF + ResizeObserver; setPaused() halts the loop (hidden/off-screen);
 * dispose() frees all GL resources and the context.
 *
 * All visuals are generated in GLSL — zero downloaded texture assets. Heavy math runs on
 * the GPU; the JS side only feeds uTime/uProgress uniforms and sizes the canvas.
 */
import {
  WebGLRenderer,
  Scene,
  OrthographicCamera,
  Mesh,
  PlaneGeometry,
  ShaderMaterial,
  Vector2,
  Vector3,
  Timer,
} from 'three';

export interface RiftHandle {
  setPaused(paused: boolean): void;
  dispose(): void;
}

const vert = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

// Centre-origin cosmic rift. The tear opens from the middle outward (symmetric), with
// electric-blue -> violet fractured filaments, then settles into a low-frequency ambient
// shimmer. Three procedural layers (starfield, nebula, fracture) composited additively so
// the bright edges read like a bloom-lit rupture without a post-processing pass.
const frag = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform vec2 uRes;
  uniform float uTime;
  uniform float uProgress;   // 0 at rupture start -> 1 settled
  uniform float uFrameR;     // settled rupture radius — frames the centered window's edge
  uniform vec3 uAccent;      // brand sky #2b8fd6
  uniform vec3 uEnergy;      // violet

  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x),
               mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }

  float fbm(vec2 p){
    float v = 0.0, a = 0.5;
    mat2 rot = mat2(0.8, -0.6, 0.6, 0.8); // rotate octaves to break axis-aligned banding
    for (int i = 0; i < 6; i++){ v += a * noise(p); p = rot * p * 2.0; a *= 0.5; }
    return v;
  }

  // Domain-warped fbm: gives the nebula and fracture organic, curling structure rather
  // than the smooth blobs raw fbm produces.
  float warpedFbm(vec2 p){
    vec2 q = vec2(fbm(p + vec2(0.0, 0.0)), fbm(p + vec2(5.2, 1.3)));
    return fbm(p + 3.0 * q);
  }

  // Twinkling procedural starfield. Cell-hashed points with a soft radial falloff and a
  // per-star sine twinkle, layered at two densities for depth.
  float starLayer(vec2 uv, float density, float seed){
    vec2 g = uv * density;
    vec2 cell = floor(g);
    vec2 f = fract(g) - 0.5;
    float h = hash(cell + seed);
    if (h < 0.965) return 0.0;                       // sparse: only a few cells hold a star
    vec2 jitter = vec2(hash(cell + seed + 11.0), hash(cell + seed + 23.0)) - 0.5;
    float d = length(f - jitter * 0.6);
    float star = smoothstep(0.06, 0.0, d);           // tight core
    float tw = 0.55 + 0.45 * sin(uTime * 2.0 + h * 40.0);
    return star * tw * (0.4 + 0.6 * hash(cell + seed + 7.0));
  }

  void main(){
    // Aspect-correct, centre-origin coordinates.
    vec2 uv = (vUv - 0.5) * vec2(uRes.x / uRes.y, 1.0);
    float r = length(uv);
    float ang = atan(uv.y, uv.x);

    // Settle factor: 0 mid-rupture (hot, energetic) -> 1 fully settled (calm shimmer).
    float settle = smoothstep(0.6, 1.0, uProgress);
    float calm = 1.0 - 0.55 * settle;

    // --- Deep space base ---
    vec3 col = vec3(0.006, 0.008, 0.028);

    // --- Starfield (two layers for parallax depth) ---
    float stars = starLayer(vUv, 90.0, 0.0) + 0.6 * starLayer(vUv, 160.0, 31.0);
    col += vec3(0.85, 0.9, 1.0) * stars;

    // --- Nebula: domain-warped clouds, brighter and pulled toward centre by the rift ---
    float nb = warpedFbm(uv * 2.4 + vec2(uTime * 0.015, -uTime * 0.01));
    nb = pow(nb, 1.6);
    float nebPull = mix(0.18, 0.42, smoothstep(1.2, 0.0, r)); // denser near the tear
    vec3 nebCol = mix(uAccent, uEnergy, smoothstep(0.3, 0.8, nb));
    col += nebCol * nb * nebPull;

    // --- Centre-origin fracture, FRAMING the centered portal window ---
    // uFrameR is the rupture's settled radius: it is sized to roughly match the centered
    // tear window's half-extent (in these aspect-corrected, vertical-normalised coords), so
    // the brightest fracture/energy concentrates around the window's edge and reads as the
    // torn rim of the tear, with cracks radiating OUTWARD into the surrounding cosmos and the
    // centre (behind the window) calmer. The front sweeps from 0 to uFrameR as progress
    // climbs, then holds at the framing radius instead of expanding past the stage.
    float front = uProgress * uFrameR;
    float filament = warpedFbm(vec2(ang * 2.5, r * 5.0 - uTime * 0.12));
    float crackR = r + (filament - 0.5) * 0.18;        // perturb radius by the crack noise

    // Bright fractured edge: a thin shell at the rupture front.
    float edgeW = mix(0.015, 0.05, calm);               // edge fattens slightly as it calms
    float edge = smoothstep(edgeW, 0.0, abs(crackR - front));

    // Angular fracture lines radiating from the centre OUTWARD past the rim into the cosmos.
    // Gated to start at the rim and reach beyond it so the cracks read as tearing outward
    // from the tear's edge rather than filling the calm window interior.
    float spokes = warpedFbm(vec2(ang * 6.0, 3.0));
    float spokeMask = smoothstep(0.62, 0.78, spokes);
    float spoke = spokeMask
      * smoothstep(front - 0.04, front + 0.02, crackR)   // begins at the rim
      * smoothstep(front + uFrameR, front, crackR);       // fades outward into space

    // Calm core: the centre behind the window stays quiet. A soft, dim fill that opens during
    // the rupture and settles — NOT a blown-out hot core, so the glimpsed Presentation isn't
    // washed out by the rift behind it.
    float core = smoothstep(front, front * 0.4, crackR);
    float corePulse = mix(0.6, 0.28, settle);
    vec3 coreCol = mix(uAccent, vec3(0.9, 0.95, 1.0), 0.5);

    // Edge colour: electric blue on the inside, violet on the outer lip of the crack.
    float lip = smoothstep(front - 0.06, front + 0.04, crackR);
    vec3 edgeCol = mix(uAccent * 1.2, uEnergy, lip);

    // Additive glow (bloom-like falloff) around the rupture front.
    float glowFall = exp(-pow(abs(crackR - front) * 9.0, 1.4));

    // The bright rim is the framing element — keep it lit after the rupture settles (it is the
    // torn lip the masked window sits inside), so it does NOT fade out with the core.
    float rimEnergy = mix(1.6, 1.0, settle);

    // Ambient shimmer once settled: low-frequency drift over the whole field, replacing the
    // hot rupture energy so the scene breathes instead of looping hot.
    float shimmer = 0.5 + 0.5 * sin(uTime * 0.6 + warpedFbm(uv * 1.5) * 6.28);
    float shimmerAmt = settle * 0.12;

    // Composite the fracture energy. The bright edge + glow frame the window edge; cracks
    // radiate outward; the calm core stays dim behind the glimpsed Presentation.
    col += edgeCol * edge * rimEnergy;
    col += edgeCol * glowFall * (0.45 + 0.35 * rimEnergy);
    col += mix(uAccent, uEnergy, 0.5) * spoke * 0.55 * rimEnergy;
    col += coreCol * core * corePulse;
    col += mix(uAccent, uEnergy, shimmer) * shimmerAmt;

    // Vignette framing the tear: keep the corners in deep space and gently darken the calm
    // centre behind the window so the glimpsed Presentation reads against a quiet backdrop.
    float vig = smoothstep(1.3, 0.2, r);
    float centreCalm = mix(0.55, 1.0, smoothstep(0.0, uFrameR, r));
    col *= mix(0.7, 1.0, vig) * centreCalm;
    col *= calm;

    // Filmic-ish tone curve to tame the additive highlights without hard clipping.
    col = col / (col + vec3(0.85));
    col = pow(col, vec3(0.85));

    gl_FragColor = vec4(col, 1.0);
  }
`;

export function createRiftScene(
  host: HTMLCanvasElement,
  opts: { accent: [number, number, number]; energy: [number, number, number] },
): RiftHandle {
  // Render into a fresh canvas inserted alongside the host, NOT into the host itself.
  // dispose() calls renderer.forceContextLoss(), which permanently poisons the GL context
  // bound to whatever canvas element it ran on — a force-lost canvas can never acquire a
  // new context. The orchestrator caches a single host canvas and reuses it on every
  // Portfolio re-activation, so rendering directly into it would make the second arm's
  // `new WebGLRenderer` fail (TypeError reading 'precision' off a null context) and silently
  // fall back. Using a throwaway canvas per scene keeps the host pristine, so each
  // create/dispose cycle gets a working context and the rupture re-runs every time.
  const owner = host.parentNode;
  const canvas = document.createElement('canvas');
  canvas.className = host.className; // inherit .rift-canvas layout + state-driven CSS
  canvas.setAttribute('aria-hidden', 'true');
  // Hand the host's CSS role to the fresh canvas for the scene's lifetime so background
  // rules (.portal-webgl .rift-canvas) apply to exactly one element; restored on dispose.
  const hostClass = host.className;
  host.className = '';
  owner?.insertBefore(canvas, host.nextSibling);

  // WebGLRenderer construction can throw on per-canvas GL context-creation failure even when
  // the orchestrator's capability probe (on a different canvas) passed — live-context limits,
  // GPU process reset, failIfMajorPerformanceCaveat, driver quirks. If it throws here the host
  // has already been stripped of its CSS role and the throwaway is in the DOM, so restore the
  // host's role and drop the orphan before rethrowing — that way the orchestrator's fallback
  // path renders on the pristine host canvas instead of a dead leftover.
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({
      canvas,
      antialias: false, // fullscreen quad has no geometry edges; MSAA would only cost fill rate
      alpha: false,
      powerPreference: 'low-power',
    });
  } catch (e) {
    host.className = hostClass;
    canvas.remove();
    throw e;
  }
  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  // Timer (the supported successor to the deprecated Clock): elapsed time advances only
  // across update() calls, so while paused (no update) it does not accrue wall-clock time —
  // a reset() before the first frame on resume keeps the animation from jumping.
  const timer = new Timer();

  const uniforms = {
    uRes: { value: new Vector2(1, 1) },
    uTime: { value: 0 },
    uProgress: { value: 0 },
    // Framing radius (aspect-corrected, vertical-normalised units). The portal window is
    // ~min(74vh,38rem) tall and centered; its half-height as a fraction of the stage half-
    // height lands near this value, so the bright rupture rim concentrates around the
    // window's edge and frames the tear rather than expanding off-stage.
    uFrameR: { value: 0.34 },
    uAccent: { value: new Vector3(...opts.accent) },
    uEnergy: { value: new Vector3(...opts.energy) },
  };
  const material = new ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms });
  const geometry = new PlaneGeometry(2, 2);
  const mesh = new Mesh(geometry, material);
  scene.add(mesh);

  function size() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2); // cap DPR: raw Retina DPR 3 quadruples fill cost
    // The fresh canvas inherited .rift-canvas (inset:0), so it tracks the stage frame; fall
    // back to the host's box on the first tick before layout settles.
    const w = canvas.clientWidth || host.clientWidth || 1;
    const h = canvas.clientHeight || host.clientHeight || 1;
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    uniforms.uRes.value.set(w * dpr, h * dpr);
  }
  const ro = new ResizeObserver(size);
  ro.observe(canvas);
  size();

  let raf = 0;
  let paused = false;
  const RUPTURE_S = 1.6; // seconds from tear start to fully settled shimmer

  function frame(timestamp?: number) {
    timer.update(timestamp);
    const t = timer.getElapsed();
    uniforms.uTime.value = t;
    uniforms.uProgress.value = Math.min(t / RUPTURE_S, 1);
    renderer.render(scene, camera);
    if (!paused) raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  return {
    setPaused(p: boolean) {
      if (p === paused) return;
      paused = p;
      if (p) {
        // Halt the loop: cancel the pending frame so no work runs while hidden/off-screen.
        cancelAnimationFrame(raf);
        raf = 0;
      } else {
        // Reset the timer's per-step baseline so the first resumed frame produces a small
        // delta (no jump from the time spent paused), then restart the loop.
        timer.reset();
        raf = requestAnimationFrame(frame);
      }
    },
    dispose() {
      cancelAnimationFrame(raf);
      raf = 0;
      ro.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss(); // release the GPU context promptly (poisons this throwaway canvas only)
      canvas.remove();
      host.className = hostClass; // hand the CSS role back to the pristine host for the next arm
    },
  };
}

---
title: "bye-bg"
summary: "Remove image backgrounds in your browser — 100% local, no uploads, works offline."
mode: "embed"
embed:
  url: "https://bye-bg.salvarecuero.dev"
  requiresLaunch: false
  mobile: false
media:
  - type: image
    src: ../../assets/showcase/bye-bg/poster.png
    alt: "bye-bg — in-browser background removal"
mediaMobile:
  - type: image
    src: ../../assets/showcase/bye-bg/poster-mobile.png
    alt: "bye-bg on mobile — in-browser background removal"
order: 1
accent: "#0ea5e9"
icon: "wand"
links:
  live: "https://bye-bg.salvarecuero.dev"
stack: ["React", "ONNX Runtime Web", "WebGPU", "WebAssembly"]
---

bye-bg removes the background from an image entirely in the browser — no uploads, no
accounts, works offline. The AI model runs locally via ONNX Runtime Web, on WebGPU
(primary) with a single-threaded WASM fallback. Neither path requires `SharedArrayBuffer`,
so the deploy stays un-isolated (no COOP/COEP) and can be a live co-mounted Embed in the
Showcase under the embed contract (`frame-ancestors` + readiness handshake — see ADR 0004).
On mobile it falls back to its Media gallery (see ADR 0002).

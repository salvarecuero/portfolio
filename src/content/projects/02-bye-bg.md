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
(primary) with a single-threaded WASM fallback. Its deploy sets COOP/COEP to enable
multi-threaded WASM (`SharedArrayBuffer`) but does not require it, so it runs as a live
co-mounted Embed under the embed contract (`frame-ancestors` + readiness handshake — see
ADR 0004): inside the Showcase iframe it runs un-isolated, without `SharedArrayBuffer`
(WebGPU / single-threaded WASM), while standalone it keeps the multi-threaded path. On
mobile it falls back to its Media gallery (see ADR 0002).

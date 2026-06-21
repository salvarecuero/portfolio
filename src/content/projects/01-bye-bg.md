---
title: "bye-bg"
summary: "Remove image backgrounds in your browser. Fully local, no uploads, works offline."
description:
  - "bye-bg removes the background from an image directly in the browser. Nothing is uploaded, there are no accounts, and it keeps working with the tab offline."
  - "The cutout model runs locally on the device. It uses WebGPU where the browser supports it and falls back to WebAssembly where it does not, so the processing stays on the user's machine."
mode: "embed"
embed:
  url: "https://bye-bg.salvarecuero.dev"
  requiresLaunch: false
  mobile: false
media:
  - type: image
    src: ../../assets/showcase/bye-bg/poster.png
    alt: "bye-bg: in-browser background removal"
mediaMobile:
  - type: image
    src: ../../assets/showcase/bye-bg/poster-mobile.png
    alt: "bye-bg on mobile: in-browser background removal"
order: 1
accent: "#0ea5e9"
icon: "wand"
links:
  live: "https://bye-bg.salvarecuero.dev"
stack: ["React", "ONNX Runtime Web", "WebGPU", "WebAssembly"]
---

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
    src: ../../assets/showcase/bye-bg/before-after.png
    alt: "bye-bg desktop: before and after slider comparing a cut-out image against the original, with the processing controls panel"
  - type: image
    src: ../../assets/showcase/bye-bg/batch.png
    alt: "bye-bg desktop: batch queue with four images processed and download all or ZIP options"
  - type: image
    src: ../../assets/showcase/bye-bg/panel.png
    alt: "bye-bg controls: engine, device, model, background and export settings with per-step processing timings"
mediaMobile:
  - type: image
    src: ../../assets/showcase/bye-bg/before-after-mobile.png
    alt: "bye-bg on mobile: before and after slider with download, reprocess and reset actions"
  - type: image
    src: ../../assets/showcase/bye-bg/batch-mobile.png
    alt: "bye-bg on mobile: batch queue with four images processed and download all or ZIP options"
  - type: image
    src: ../../assets/showcase/bye-bg/panel.png
    alt: "bye-bg controls: engine, device, model, background and export settings with per-step processing timings"
order: 1
accent: "#0ea5e9"
icon: "wand"
links:
  live: "https://bye-bg.salvarecuero.dev"
stack: ["React", "ONNX Runtime Web", "WebGPU", "WebAssembly"]
---

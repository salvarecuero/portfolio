---
title: "bye-bg"
summary: "Remove image backgrounds in your browser — 100% local, no uploads, works offline."
mode: "media"
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
stack: ["React", "WebAssembly", "WebGPU"]
---

bye-bg removes the background from an image entirely in the browser — no uploads, no
accounts, works offline. The AI model runs locally via WebAssembly/WebGPU, which means
the page is cross-origin isolated (COOP/COEP). That isolation is incompatible with a live
co-mounted iframe (it would force the whole Showcase into cross-origin isolation and break
the other Embeds), so bye-bg is presented in Media mode with an explicit launch to the live
app — see ADR 0002.

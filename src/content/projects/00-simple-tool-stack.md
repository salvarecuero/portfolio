---
title: "Simple Tool Stack"
summary: "Free image and text tools that run entirely in your browser. No uploads, no sign-up."
description:
  - "Simple Tool Stack is a hub of small, focused image and text tools. The free ones run entirely in the browser, so files are processed on the device and never uploaded."
  - "The image tools compress, convert between formats, and strip EXIF metadata; the text tools clean and reshape copy, convert case, and generate URL slugs. Each runs instantly, with no server round trip."
  - "The heavier tools run server-side, each as an isolated container behind a Traefik edge router and scaled to zero with Sablier when idle, which keeps the whole platform on a single small VPS. Accounts and billing are wired through Better Auth and Polar, ready to switch on for the paid tier."
mode: "embed"
embed:
  url: "https://simpletoolstack.com"
  requiresLaunch: false
  mobile: true
media:
  - type: image
    src: ../../assets/showcase/simple-tool-stack/poster.png
    alt: "Simple Tool Stack: free in-browser image and text tools"
mediaMobile:
  - type: image
    src: ../../assets/showcase/simple-tool-stack/poster-mobile.png
    alt: "Simple Tool Stack on mobile: free in-browser image and text tools"
order: 0
accent: "#6366F1"
icon: "layers"
links:
  live: "https://simpletoolstack.com"
stack: ["Next.js", "Docker", "Cloudflare", "WebAssembly", "Turborepo", "Traefik", "Hono", "Mantine", "Sablier"]
---

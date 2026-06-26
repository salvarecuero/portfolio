---
title: "Simple Tool Stack"
summary: "A hub of small tools that each do one thing well. The quick ones run on your device; heavier jobs run server-side."
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
    src: ../../assets/showcase/simple-tool-stack/image-compressor-result.png
    alt: "Simple Tool Stack: the Image Compressor showing a before and after of a compressed photo, 92 percent smaller, with a download button"
  - type: image
    src: ../../assets/showcase/simple-tool-stack/homepage.png
    alt: "Simple Tool Stack: the home page with the 'Free image and text tools, right in your browser' hero above the Image tools grid (compressor, converter, crop, resize, circle crop, EXIF remover)"
  - type: image
    src: ../../assets/showcase/simple-tool-stack/circle-crop.png
    alt: "Simple Tool Stack: the Circle Crop tool fitting a photo into a circular frame with output size options"
  - type: image
    src: ../../assets/showcase/simple-tool-stack/merge-pdf.png
    alt: "Simple Tool Stack: the Merge PDF tool with two files queued to combine into one document"
  - type: image
    src: ../../assets/showcase/simple-tool-stack/image-compressor.png
    alt: "Simple Tool Stack: the Image Compressor controls with quality, target size and email modes and output format options"
mediaMobile:
  - type: image
    src: ../../assets/showcase/simple-tool-stack/homepage-mobile.png
    alt: "Simple Tool Stack on mobile: the home page headline and the start of the image tools list"
  - type: image
    src: ../../assets/showcase/simple-tool-stack/circle-crop-mobile.png
    alt: "Simple Tool Stack on mobile: the Circle Crop tool with a photo in a circular frame and output size options"
  - type: image
    src: ../../assets/showcase/simple-tool-stack/date-duration-mobile.png
    alt: "Simple Tool Stack on mobile: the Date Duration Calculator showing the days between two dates"
order: 0
accent: "#6366F1"
icon: "layers"
links:
  live: "https://simpletoolstack.com"
stack:
  [
    "Next.js",
    "Docker",
    "Cloudflare",
    "WebAssembly",
    "Turborepo",
    "Traefik",
    "Hono",
    "Mantine",
    "Sablier",
  ]
---

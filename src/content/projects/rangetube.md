---
title: "RangeTube"
summary: "A polished A-B looper for YouTube with saved loops, shareable ranges, speed control, and focus mode."
description:
  - "RangeTube loops a YouTube video between two points you pick. Paste a link, set A and B on the custom range control, and it replays that section without making you scrub the timeline again."
  - "The v2 rewrite turned the old single-page React app into a static Astro site with a Preact looper island. The player uses a click-to-load YouTube facade, a source-agnostic loop engine, keyboard Mark-In and Mark-Out, playback speed control, saved loops, and URLs that sync to the current range."
  - "Content pages ship as zero-JS HTML for SEO, while the interactive tool hydrates only when needed. The portfolio embed contract is preserved, so the live app can still run inside this showcase."
mode: "embed"
embed:
  url: "https://rangetube.salvarecuero.dev"
  requiresLaunch: false
  mobile: false
media:
  - type: image
    src: ../../assets/showcase/rangetube/v2-working.png
    alt: "RangeTube v2 on desktop: a YouTube video loaded above the redesigned A-B loop deck, playback speed controls, copy link, and saved loop form"
  - type: image
    src: ../../assets/showcase/rangetube/v2-home.png
    alt: "RangeTube v2 on desktop: the home screen with the new wordmark, value proposition, YouTube URL input, paste button, load button, and example link"
  - type: image
    src: ../../assets/showcase/rangetube/v2-focus.png
    alt: "RangeTube v2 on desktop: focus mode with a dark background, the YouTube player, compact loop range controls, and keyboard exit hint"
mediaMobile:
  - type: image
    src: ../../assets/showcase/rangetube/v2-working-mobile.png
    alt: "RangeTube v2 on mobile: a loaded YouTube video, compact A-B loop controls, playback speed, copy link, and saved loops panel"
  - type: image
    src: ../../assets/showcase/rangetube/v2-home-mobile.png
    alt: "RangeTube v2 on mobile: the home screen with the new wordmark, YouTube URL input, load action, and three-step prompt"
order: 2
accent: "#00a99d"
icon: "range"
links:
  live: "https://rangetube.salvarecuero.dev"
  repo: "https://github.com/salvarecuero/rangetube"
stack: ["Astro", "Preact", "TypeScript", "Tailwind CSS", "YouTube IFrame API", "Cloudflare"]
---

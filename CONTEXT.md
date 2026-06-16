# Portfolio v2

Glossary of the personal portfolio (v2). v1 is frozen at tag `v1.0`; v2 starts from scratch. This file is only a glossary of the project's language — it is not a spec or a record of implementation decisions.

## Language

**Presentation**:
The first section of the page: name, photo, role and stack, with a scroll cue toward the Showcase. Takes a full viewport.
_Avoid_: Hero, landing, cover

**Showcase**:
The second section, where Projects are displayed immersively. Takes a full viewport; the visitor iterates between Projects without leaving the page.
_Avoid_: Gallery, projects section, canvas

**Project**:
A portfolio piece displayed in the Showcase. Each Project is shown through one of three Presentation modes.
_Avoid_: Work, demo, item

**Presentation mode**:
The way a given Project is shown in the Showcase. There are three: Embed, Media and Custom view.

**Embed**:
The mode that shows the Project's real, live, interactive app. Reserved for web Projects that allow being embedded. Every Embed is mounted on top of its Poster, which acts as the base layer while the live app is not ready yet.
_Avoid_: iframe (that is implementation)

**Media**:
The mode that shows a Project through a navigable set of media (images and/or a short looping video), without a live app. The set has a desktop (landscape) variant and an optional mobile (portrait) variant — the site as rendered on a phone. The mode for Projects that cannot or should not be embedded live (e.g. bye-bg, due to the weight/isolation of its WASM).

**Poster**:
The static visual representation of a Project (image/video) the Showcase can always use to show it in a polished way. It is the base layer of both Media mode and Embed mode (the live app fades in over the Poster). It replaces any spinner: the Showcase never shows a spinner, it shows the Poster. It is the first item of the Media set (the rest of the set are additional captures); it remains the only "loading state" Embed shows.
_Avoid_: Thumbnail, preview, loading state

**Custom view**:
The mode where a presentation with its own visual identity (product-landing-like) is built inside the portfolio for Projects that have no web of their own (e.g. a desktop tool).

**Stage**:
The viewport-sized region, inside the Showcase, where a Project's Embed is mounted (or its Poster / Custom view is shown). It lives framed by the portfolio chrome, never edge-to-edge: that frame guarantees a non-iframe area that captures scroll and provides an exit from the immersion.
_Avoid_: Canvas, viewport

**Selector**:
The static menu, part of the portfolio chrome, that lets the visitor iterate between Projects within the Showcase. It is both the branding (makes clear you are still in the portfolio, not inside the app) and the escape hatch from the immersion. It must be evident.
_Avoid_: Navbar, generic menu. (The *visual* is an elevated, branded top-tab row — the term "Selector" is kept; a plain browser-tab/navbar look is what's avoided.)

**Project links**:
The floating menu, part of the portfolio chrome, of the *current* Project's external links (its live site, its repository). Sits bottom-center over the Stage. Distinct from the Selector: the Selector navigates *between* Projects; Project links point *out* to the active Project's real presence. Reuses the Presentation link-pill language. The accent is not used here (accent = identity/"the promise").
_Avoid_: toolbar, footer, actions

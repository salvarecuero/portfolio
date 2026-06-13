# No scroll-hijack: chrome-framed Showcase and native scroll-snap

Transitions between the Presentation and the Showcase use native CSS scroll-snap (reinforced with View Transitions), not scroll-hijacking. The Embed is mounted in a Stage framed by the portfolio chrome (Selector + border), never edge-to-edge.

The reason is both accessibility and technical: scroll-hijack is hostile to a11y/usability, and a live Embed captures wheel/touch events, so an edge-to-edge layout would trap the visitor with no way out of the immersion. The chrome guarantees a non-iframe area that captures scroll and provides an exit; it is simultaneously the branding ("you are still in the portfolio") and the escape hatch.

## Considered Options

- **Edge-to-edge + scroll-hijack:** more full-screen "wow", but bad for a11y, contradicts the "no full immersion" rule, and traps the visitor due to the iframe's event capture. Rejected.

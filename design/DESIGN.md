# Design system: "Dusk"

Source: the portrait at dusk over the Copenhagen harbour. The photo reads top to bottom as slate-lavender sky,
pale haze, a gold horizon, deep blue-grey water. **The site scrolls through that same dusk.**

## The one idea: the horizon line
A single gold hairline, the horizon of the photo, runs through the whole site.
- Landing: it draws itself across the viewport at the exact height of the horizon in the portrait. Name and role
  sit above it on sky, pitch and CTAs below it on water. The portrait is on the right and its own horizon lines up.
- Further down it becomes the rim of the card-fan hub, the CV timeline connector, the baseline of live charts,
  and the wipe edge of page transitions. One line, never two competing ornaments.

## Palette (sampled by eye from the photo; flat bands, never a smooth hero gradient)
```css
:root{
  --sky-700:#565c73;  /* upper sky, deep slate-lavender */
  --sky-500:#7e839a;  /* sky */
  --sky-300:#b4b4c6;  /* lower sky */
  --haze-200:#ddd6cc; /* haze above the horizon */
  --haze-100:#ece7df; /* light page ground */
  --paper:#f5f3ee;    /* the white tee: lightest surface, text on dark */
  --gold-400:#f0bf4f; /* sun: THE accent. Lines, focus, one CTA. Never body text on light */
  --amber-500:#e09a2e;/* low sun: hover/active of gold */
  --amber-800:#8a560a;/* gold as text on light grounds (AA) */
  --water-900:#141a22;/* deepest water: dark ground, ink on light */
  --water-800:#1d2631;/* dark surface */
  --water-600:#34414f;/* borders on dark, muted fills */
  --water-400:#66737f;/* muted text on dark is --sky-300, this is for rules */
  --taupe-500:#6f6759;/* the jacket: secondary accent, tags, quiet buttons */
  --taupe-300:#a39a8a;
}
```
Rules: gold covers under 5% of any screen. Text is `--water-900` on light, `--paper` on dark; muted text is
`--sky-700` on light and `--sky-300` on dark. Body contrast at least 4.5:1. Sections change ground in flat bands
(sky → haze → water) joined by a dither dissolve, not a gradient. Corners are square or 2px; only the fan cards
get a radius (10px), because they are physical cards.

## Type (Google Fonts, self-hosted at build)
- **Display: Archivo**, variable width + weight. Headlines at `wdth 125, wght 800`, uppercase, tight tracking
  (-0.02em), line-height 0.92. The kinetic word uses a solid copy and an outline copy (`-webkit-text-stroke: 1.5px`)
  and animates the width axis 62 → 125 as it rolls.
- **Text: Schibsted Grotesk** 400/500 (a Nordic grotesque, fits the harbour). Body 17-18px, line-height 1.55,
  measure 60-68ch.
- **Data: Martian Mono** 400, 11-12px, uppercase, tracking 0.08em: labels, coordinates, dates, live numbers.
- Scale (fluid): 12 / 14 / 17 / 22 / 32 / 56 / clamp(64px, 11vw, 176px).
- Not allowed: Inter, Space Grotesk, Fraunces, Roboto, serif italics as decoration.

## Layout
12-column grid, 24px gutters, margins clamp(20px, 5vw, 80px). Asymmetric: text holds columns 1-7, imagery 7-12
and may bleed off the edge. Mono labels pin to the margins (index numbers, coordinates "55.67 N 12.57 E", dates).
Generous vertical air; no card grids, no icon-plus-three-lines feature rows, no emoji.

## Motion language
One ease, `tide` = `cubic-bezier(0.16, 1, 0.3, 1)`. Durations 0.6s (UI), 0.9s (reveals), 1.4s (scene moves).
Stagger 0.06s. Everything enters from the horizon line or dissolves; nothing bounces.
1. **Dither dissolve**: images and section grounds swap through an ordered (Bayer 8×8) pixel threshold in two
   palette colours. Used for image hover swaps, section joins, page transitions. Canvas/WebGL, lazy.
2. **Self-drawing line**: the horizon and its descendants (timeline, connectors, chart baselines) draw with scroll.
3. **Kinetic type**: outline and solid copies of a word roll vertically through a masked slot and stretch on the
   width axis.
4. **Card fan**: project cards on an arc around a half-disc hub at the bottom edge. Scroll or drag rotates the fan;
   the centred card lifts, its title and index print in mono in the hub. Click morphs the card into the project
   page hero (Flip / View Transition).
5. **Water**: a slow shimmer on the water band of the landing (subtle displacement; off on phones and reduced motion).
6. **Numbers**: live values tick in mono, with a small gold pulse on the line when data refreshes.

Reduced motion: every scene has a complete static layout; the fan becomes a horizontal list, dissolves become
150ms fades, lines are already drawn. Phones: no WebGL above the fold, the portrait is the LCP image.

## Screens
1. Landing: nav, hero on the horizon, short "about" strip with three mono facts, portfolio section, footer CTA.
2. Portfolio section (inside the landing file): kinetic PROJECTS word + 8-card fan + hub.
3. Project page (AnunțulCasei): hero that receives the morphed card, key numbers, the story in 3-4 scenes linked
   by the line, stack, a "live" strip (placeholder numbers marked as sample), next-project handoff.

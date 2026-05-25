## Direction

Reframe the landing page from "storybook of a pet" to **a grief sanctuary and community for pet loss**. The storybook craft (warm paper, Fraunces serif, Caveat handwriting, polaroids, tape) stays — it's the right emotional register — but the *story* the page tells changes:

> Your grief deserves a place. Your memory deserves a wall. Your companion deserves to be remembered — and you don't have to carry it alone.

Core actions promoted on the page:
1. **Post an obituary / tribute** (primary CTA)
2. **Pin a memory to the wall** (secondary)
3. **Join the community** (tertiary)

## Page structure (top → bottom)

```text
┌─────────────────────────────────────────────────┐
│ 1. HERO — The Wall of Memory                    │
│    Full-bleed corkboard / paper wall            │
│    8–12 polaroids scattered at varying          │
│    rotations, taped, with handwritten notes,    │
│    pet names, dates, one-line tributes.         │
│    Center overlay:                              │
│       eyebrow: "a sanctuary for pet grief"      │
│       H1:     "Your memory deserves a wall."    │
│       sub:    1–2 lines on what this is         │
│       CTAs:   [Pin their memory]  [Read the wall]│
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│ 2. EMOTIONAL PROMISE strip                      │
│    3 short lines, handwriting + serif mix:      │
│    "Your grief is welcome here."                │
│    "Your companion will be recognized."         │
│    "You are not alone in this."                 │
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│ 3. HOW IT WORKS — "Let it out, gently"          │
│    4 numbered steps in a soft book-card grid:   │
│      1. Share a photo & a name                  │
│      2. Write what you need to say              │
│      3. Pin it to the wall                      │
│      4. Receive love from the community         │
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│ 4. POST AN OBITUARY — primary feature spotlight │
│    Split layout: mock obituary card on the      │
│    left (photo + name + dates + tribute), copy  │
│    on the right explaining the obituary post    │
│    and how it goes to the wall + community feed.│
│    CTA: [Write their obituary]                  │
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│ 5. COMMUNITY — "A circle that understands"      │
│    Faux feed preview: 2–3 tribute posts with    │
│    candle counts, soft replies ("sending love"),│
│    quiet stats (X candles lit this week).       │
│    CTA: [Visit the community]                   │
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│ 6. PULL QUOTE                                   │
│    "Grief is love with nowhere to go.           │
│     Here, it has somewhere to go."              │
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│ 7. CLOSING CTA                                  │
│    "Their name belongs here."                   │
│    [Pin their memory]   "Free, always."         │
└─────────────────────────────────────────────────┘
```

The existing "chapters of a pet's life" section and "library shelf" are removed from the landing page — they distract from the grief/community core. The polaroid + paper aesthetic from those sections is repurposed into the hero wall and the community preview.

## Copy direction (replacing pet-story tone)

- Eyebrow: `a sanctuary for pet loss`
- H1: `Your memory deserves a wall.`
- Sub: `A gentle place to grieve, remember, and be held by people who understand. Pin a photo. Write what you need to say. Light a candle for someone you loved.`
- Strip lines: `Your grief is welcome here. · Your companion will be recognized. · You are not alone in this.`
- Obituary section H2: `Write their obituary. Let the grief out.`
- Community H2: `A circle that understands.`
- Final H2: `Their name belongs here.`

## Technical scope

Files touched:

- `src/routes/index.tsx` — full rewrite of the landing composition described above. Reuses existing image assets, `Button`, `SiteHeader`, `SiteFooter`, `PawIcon`, `book-card`, `polaroid`, `tape`, `paper-bg`, `paper-grain`, `chapter-rule`, `candle-glow` utilities. Routes (`/signup`, `/garden`, `/community`) already exist — links wired to those.
- `src/styles.css` — small additive changes only (no palette/font changes):
  - `.memory-wall` — corkboard / paper wall backdrop (subtle warm grid + vignette) for the hero.
  - `.note-card` — small handwritten note variant (Caveat font, soft tinted paper, no photo) used among the polaroids.
  - `.polaroid` already exists; add `--rot` CSS var pattern so we can scatter rotations inline cleanly.
- Page `head()` meta updated: title and description to reflect grief support / community positioning.

No backend, schema, route, or auth changes. UI/presentation only.

## Imagery

Reuse the existing Unsplash pet images (`pet1–pet4`, `heroImg`, `candleImg`) for the wall polaroids. The hero wall mixes ~6 polaroids (pets) + ~3 handwritten note cards (pure text, no photo) for emotional density and visual rhythm. All set in a sepia-warm filter to match the paper aesthetic.

## Out of scope (this turn)

- Building an actual obituary editor or community feed (those routes/features already exist — landing just promotes and links to them).
- Changing typography, palette, or `Button` component.
- Any other route.

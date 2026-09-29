# Platform-wide visibility and candle refinement

## What will change
- Establish one accessible warm ivory-and-plum contrast system for page backgrounds, cards, headings, body copy, muted copy, links, icons, fields, and disabled states.
- Apply those semantic colors across every public and signed-in screen, while preserving deliberate dark memorial and night-sky panels with explicit light text.
- Strengthen the shared header, navigation drawer, dialogs, and mobile navigation so labels and icons remain clearly visible on their backgrounds.
- Replace the current candle drawing with a more natural ivory wax candle, shaped flame, restrained warm halo, wick detail, and subtle irregular flicker.
- Respect reduced-motion preferences and keep the small candle version legible in buttons and compact rows.

## Validation
- Check representative public, garden, community, dashboard, pet, profile, creation, settings, and admin screens on mobile and desktop.
- Verify readable text/background pairings, visible icons, smooth candle motion, no page errors, and a clean build.

## Technical details
- Consolidate contrast fixes in semantic theme tokens and scoped warm-platform utilities instead of adding one-off colors.
- Correct remaining legacy color classes only where they conflict with warm surfaces; keep explicit dark-scene styling isolated.
- Rework the existing shared `PawLamp` SVG so every use updates consistently.

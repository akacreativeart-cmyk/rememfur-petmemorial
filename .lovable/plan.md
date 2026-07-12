Replace the homepage hero’s background and CTA buttons with the uploaded RememFur design.

### 1. Update the cosmos background in `src/styles.css`
Replace the current `.cosmos-bg` block with the uploaded design’s full fixed cosmos layer:
- `.cosmos-bg` base gradient: `radial-gradient(130% 80% at 50% -10%, #0D1530 0%, var(--void) 58%)`.
- Three nebula blobs (`.n1`, `.n2`, `.n3`) with the purple/amber gradients and slow drift animations.
- Milky-way band, grain overlay, and shooting-star `.shooter` styling.
- Keep the existing reduced-motion media query.
- Add the CSS custom properties the uploaded design uses (`--void`, `--deep`, `--gold`, `--ember`, `--ivory`, `--parchment`, `--faint`, `--hair`) as aliases to the current palette so the rest of the app still resolves its tokens.

### 2. Add reusable button/link utilities
Add two new `@utility` classes in `src/styles.css`:
- `btn-gold` — matches the uploaded `.btn` (gold/amber gradient, rounded-full, uppercase tracking, dark text, lift + shadow on hover).
- `link-gold` — matches the uploaded `.link` (faint cream text, underline on hover).

### 3. Update `CosmosBg` in `src/routes/index.tsx`
- Render the new markup: base, three nebula divs, milkyway, and a `.sky` container.
- Generate the starfield on mount: ~130 stars with random position, size, warm/blue class, opacity, and twinkle duration/delay, matching the uploaded script.
- Keep the existing shooting-star spawning logic but adapt the generated star styles to match the upload’s `.star` class.
- Keep `prefers-reduced-motion` handling so stars and shooters pause for users who prefer reduced motion.

### 4. Replace the hero CTA buttons
In `src/routes/index.tsx` `Hero`:
- Apply `btn-gold` to the primary “Write a memorial” button (keep the existing route and label unless you want the uploaded copy instead).
- Apply `link-gold` to the secondary link.
- Keep the existing hover/active/tap behavior via the new utility classes.

### 5. Type-check and verify
- Run `bunx tsc --noEmit` or `tsgo` to confirm the edits are type-safe.
- Open the preview and confirm the background shows the three nebula blobs, the new gold CTA button, and the shooting stars still appear.

Out of scope: other pages, the tab bar, or the overall page layout/content beyond the hero background and its two CTAs.
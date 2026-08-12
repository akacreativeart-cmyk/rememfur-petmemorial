# Multi-photo posts, memorial claiming, richer profiles, realistic flame

Four changes, built in this order.

## 1. Multiple images

Photos become a list instead of a single URL, everywhere people add them:

- **Community posts** — pick up to 6 photos at once, reorder or remove before posting. The feed card shows them as a swipeable carousel with dots; a single photo looks exactly as it does today.
- **Memorial creation** — after the main portrait step, add extra photos to a small gallery. These show on the memorial page.
- **Pet memory timeline** — a memory entry can carry several photos.
- **Auto slideshow** — when a post or memorial gallery has more than one image, it gently auto-advances (about 4s per slide), pausing on touch/hover and honouring reduced-motion.

Uploads stay in the existing photo storage under the signed-in user's folder, uploaded in parallel with per-file progress and per-file error messages.

## 2. Claiming an owner-less memorial

Memorials created by a stranger (no owner) can be claimed by the real person:

- On any memorial with no owner, a signed-in visitor sees a quiet "This memorial has no keeper — claim it" panel with a short "why this is your pet" message box.
- Submitting creates a pending claim. The claimant sees "Claim submitted — we'll review it" and cannot submit twice.
- Admins get a **Claims** section in the admin page: pending list with memorial, claimant and message, and Approve / Reject. Approving sets the memorial's owner to the claimant and notifies them; rejecting notifies too.
- Memorials that already have a keeper never show the claim panel.

## 3. Profile activity

The public profile page (`/u/:userId`) gets tabbed activity:

- **Posts** — as today.
- **Memorials** — public memorials they created.
- **Paw lamps** — lamps they lit, with the memorial name and their message.
- **Activity** — recent comments they left and posts they liked.

Only publicly visible content is listed, and each tab shows a calm empty state. Counts in the profile header include lamps lit.

## 4. More realistic candle and flame

Replace the current paw-glyph lamp with a proper memorial candle rendering:

- Layered SVG: wax pillar with subtle vertical wax texture and a warm rim light, a melted rim with a small pooled-wax highlight, a dark wick, and a teardrop flame with a blue-hot base, amber body and pale core.
- Multi-frequency flicker (flame sway + independent glow pulse) so it never looks like a single loop, plus a soft light pool cast on the surface below.
- Small sizes (list rows, buttons) render a simplified flame-only variant so it stays legible at 16–20px.
- Reduced-motion users get a still, non-animated candle.

## Technical notes

- **Schema**: new `post_images` (post_id, url, position) and `memorial_photos` already exists — reuse it for the memorial gallery; new `memory_photos` (memory_id, url, position); new `memorial_claims` (memorial_id, claimant_id, message, status, reviewed_by, reviewed_at) with unique pending claim per user+memorial. All with GRANTs, RLS, and owner/admin-scoped policies. Existing `posts.image_url` is kept and backfilled as position 0 so nothing breaks.
- **Claim approval** runs through a security-definer function callable only by admins (`public.is_admin`), which sets `memorials.owner_id` and inserts a notification.
- New server functions in `src/lib/claims.functions.ts` (submit/list/review) and additions to `feed.functions.ts` and `profile.functions.ts` for the profile tabs; multi-image hydration added to the existing post hydrator.
- New `src/components/site/PhotoCarousel.tsx` (swipe + dots + autoplay) and `src/components/site/MultiPhotoUpload.tsx` shared by post, memorial and memory forms.
- `PawLamp.tsx` rewritten as the realistic candle, keeping the same export name and props so every existing import keeps working; flicker keyframes added to `src/styles.css`.

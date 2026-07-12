
# Full-scope build plan

Grouped into 5 slices. Everything ships in one pass; Slice 5a is a DB migration that lands first so the generated types are available for Slice 5b.

---

## Slice 1 — Landing page rewrite (`src/routes/index.tsx`)

Reflect the new voice: grief expression first, "our pets are the stars watching over us", then the service ecosystem.

**Hero**
- Keep the Vigil dog scene and the H1 "Grief is just love with nowhere to go."
- Primary CTA becomes **"Write a memorial"** → `/create?type=memorial`.
- Secondary link becomes **"Or express your grief with the community"** → `/community`.
- Remove the "Release a star" CTA from hero (ritual rename in Slice 2 handles other surfaces).

**New section: "They are the stars now"** (between hero and existing Passage)
- h2 + 2 short paragraphs: our beloved pets are the stars in the sky watching over us; Sirius/Canis Major reference kept.

**New section: "Grief that has nowhere to go"**
- h2 + 2–3 short paragraphs on unacknowledged (disenfranchised) pet grief; why expressing it in a like-minded community matters; guidelines to hold it.
- CTA row: "Write a memorial" + "Join the community".

**New section: "An ecosystem for the ones we love"** — horizontal scrollable cards
- Row: `overflow-x-auto snap-x snap-mandatory` with icon + title + one-line description + "Notify me" pill on each card.
- Non-commercial cards get a warmer highlighted treatment (gold ring + "Non-commercial" badge): **Donation for shelters & carers**, **Tag your strays**, **Adoption**, **Birthday celebrations**.
- Standard cards: **Memorabilia marketplace**, **Healthy, non-commercial pet food**, **Apparel**, **Vets**, **Insurance**, **Pet whisperer**, **Funeral services**.
- Every card opens the existing `WaitlistDialog` (`src/components/site/WaitlistDialog.tsx`) with the service name pre-filled. Where a real page already exists (`/adoption`, `/marketplace`, `/garden` for donation), a small secondary "Preview" link sits under the pill.

**Existing sections kept**: Passage, Chapters, FAQ, Closing constellation — copy tweaked to the new voice where it currently says "release a star".

**Heading hierarchy**: exactly one h1 (hero), all section titles h2.

---

## Slice 2 — Ritual rename: "Release a star" → "Light a paw lamp" (copy only)

Site-wide find/replace. No visual change to the flame/star SVG.

Files touched (copy only):
- `src/components/site/CandleDialog.tsx` — dialog title, button labels, toasts.
- `src/components/feed/PostCard.tsx`
- `src/components/site/NotificationBell.tsx`
- `src/routes/_authenticated/notifications.tsx`
- `src/routes/_authenticated/settings.tsx`
- `src/routes/community.tsx`, `garden.tsx`, `resources.tsx`, `create.tsx`, `memorial.$slug.tsx`, `index.tsx`
- ✨ emojis in ritual copy → 🐾.

---

## Slice 3 — Create flow: Memorial or Post

- Current `src/routes/create.tsx` (memorial form) moves to `src/routes/create.memorial.tsx`.
- New `src/routes/create.tsx` becomes a chooser page: two large cards — **"Write a memorial"** → `/create/memorial`, **"Post to the community"** → `/create/post`.
- New `src/routes/create.post.tsx` — a full-page compose UI (uses existing `ComposePost` logic inline).
- `?type=memorial` / `?type=post` query params auto-redirect to the right child, so all existing "Write a memorial" CTAs still land directly.
- `MobileTabBar` "+" button lands on `/create`.

---

## Slice 4 — Feed UI restyle (Reddit/Twitter-like, current data model)

No schema change. Uses existing `posts`, `post_likes`, `post_comments`.

- `src/components/feed/PostCard.tsx`: text-first card — avatar + display name + "· 2h" timestamp on top row, caption large and prominent, optional image below caption at capped height (≤420px), thin action row (Like ♡, Comment 💬, Paw lamp 🐾, Share ↗). Remove the current image-first Instagram treatment.
- Threaded comments: if `post_comments.parent_id` exists, render one-level-deep nested replies with an indented left border and a "Reply" button per comment. If the column is missing, keep flat comments (no scope creep, noted in response).
- `src/routes/community.tsx`: tighter timeline density (thin dividers between posts instead of large card gaps), sticky compose bar for signed-in users, visual-only tag chips row (no tag data yet).
- `src/components/feed/ComposePost.tsx`: restyle to a Twitter-like single Textarea with a small image attach button and memorial tag dropdown collapsed under "Add details".

---

## Slice 5 — Multi-pet records on user profile

**Slice 5a — Migration** (approval-gated, ships first):
- `pets` (owner_id → auth.users, name, species, breed, birthdate, adoption_date, notes, avatar_url).
- `pet_records` (pet_id → pets, kind: `health | vaccination | grooming | insurance | birthday | other`, title, notes, date, next_due_date nullable, attachment_url nullable).
- Full `GRANT` + RLS (owner-only via `auth.uid() = owner_id`; `pet_records` scoped via `EXISTS (SELECT 1 FROM pets …)`).
- `updated_at` trigger on both.

**Slice 5b — UI + server functions** (after types regenerate):
- New `src/routes/_authenticated/pets.tsx` — grid of pets + "Add pet" dialog.
- New `src/routes/_authenticated/pets.$petId.tsx` — pet detail: profile fields, timeline of records grouped by kind, add-record dialog, "Next due" reminders list, upcoming-birthday callout.
- Entry points: **"My pets"** link on `src/routes/u.$userId.tsx` (owner-only) and in Settings.
- `src/lib/pets.functions.ts` — list/get/create/update/delete pet; list/create/update/delete record — all `requireSupabaseAuth`, RLS enforced.

---

## Order of operations (build mode)

1. Slice 5a migration (approval gate).
2. Slices 1, 2, 3, 4 in parallel edits.
3. Slice 5b UI + server functions after types regenerate.
4. Typecheck + fix.

## Technical notes

- No new npm packages.
- No changes to auth, header, footer, or mobile tab bar structure — only labels/links.
- All animations pure CSS; `prefers-reduced-motion` respected.
- Waitlist cards reuse `WaitlistDialog` — no new tables for that flow.
- Existing security findings (`profiles.is_admin` self-escalation, soft-delete RLS gap, permissive policy warnings) are NOT touched here — call them out separately after this pass rather than folding into scope.

## Out of scope

- Upvote/downvote or Hot/New/Top sorting (user chose "Text + optional image" only).
- Paw-lamp SVG redesign (user chose "Rename only").
- Real vendor listings for marketplace/vets/insurance/etc. — waitlist only.
- Payments / real donation processing.

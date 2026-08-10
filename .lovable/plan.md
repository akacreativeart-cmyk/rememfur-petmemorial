Initial health checks are clean: TypeScript passes, production build succeeds, Lovable Cloud backend is healthy, and current console/network logs show no errors. The next step is to verify the actual user journeys through the UI.

Proposed audit — PREVIEW ONLY, no deploy:

1. Landing page + CTAs
   - Load `/` at 360px and 1280px, confirm no horizontal overflow.
   - Verify World Toggle works and cross-fades Memory/Life worlds.
   - Tap each primary CTA: "Write a memorial", "Light a paw lamp", "Send them your last letter".
   - Confirm Their Sky band renders the real Unsplash sky + drawn constellation legibly.
   - Confirm intro candle animation and gold shooting stars appear.

2. Auth + create memorial
   - Sign-up flow (email and Google) from the landing CTA.
   - Walk through the 5-step create memorial flow: name/nickname/species, dates/pronouns/location, photo upload/crop OR no-photo path, AI-assisted message, Polaroid preview.
   - Verify the cropped image is stored and becomes `hero_image_url`.
   - Verify "Download keepsake" generates a 1200×1500 PNG.
   - Verify the flow lands on the new memorial page and redirects make sense.

3. Memorial page + owner actions
   - Public view: pet info, story, Their Sky, paw-lamp section, tributes/messages.
   - Signed-in owner: edit memorial, add photos, light a paw lamp, soft-delete, hard-delete.
   - Verify the 5 new columns (`breed`, `nickname`, `pronouns`, `approx_age`, `location`) read/write correctly.

4. Other flows
   - Community/feed: create/view posts, reactions.
   - Journal: create/view entries.
   - Marketplace rails: notify-me dialog writes to `marketplace_waitlist`, beta invite writes to `beta_invites` with source tags.
   - Header: session-aware header, "Write a memorial" button, mobile slide-out menu.

Deliverables:
- A summary of any broken flow, console error, or UI regression found.
- Screenshots for the key states.
- If fixes are needed, a ranked list of what to repair first.
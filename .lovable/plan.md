
## Reality check

Your ask is 10 substantial areas — realistically 2–5 days of focused work, with multiple DB migrations, a WebGL shader, new routes, and cross-cutting sweeps. If I try to do it all in one turn I will half-ship several and break others. I'd like to agree on batches before starting.

## Audit — what already exists vs. what's missing

**1. Account & Settings** — partial
- ✅ Edit display name + avatar upload, sign out
- ❌ Change password, account deletion (with "preserve vs delete memorials" choice)

**2. Memorial Management** — mostly there
- ✅ Edit route exists, share button
- ❌ Verify gallery add/remove UI, public/private toggle, soft-delete flow, confirm og meta on `/memorial/$slug` uses loader data

**3. Notifications Center** — bell popover exists
- ❌ Full `/notifications` page, empty state polish, verify badge decrement

**4. Journal** — basic create/list/delete
- ❌ Edit entry, prompt suggestions, richer empty state

**5. Feed** — compose/post/like/comment likely exist
- ❌ Audit delete-own for posts + comments, guest CTA, count integrity

**6. Follows** — table exists, toggleFollow exists on user profile
- ❌ Follow button on memorial page, "Following" section in dashboard/garden, 10th-candle milestone notification (needs SQL trigger update)

**7. Garden** — grid + search exist
- ❌ Sort dropdown (recent / most candles)

**8. Candle flame WebGL** — net-new
- Shader canvas component + CSS fallback, wired into memorial page + candle strip. Non-trivial (~half day alone to look good).

**9. Pet silhouette SVG** — net-new asset + placeholder swap sitewide

**10. No dead ends sweep** — 404 page, loading/error states audit, console+typecheck clean

Out of scope confirmed: email, marketplace checkout.

## Proposed batching (pick what to ship first)

**Batch A — Account & content control (1 turn)**
Items 1, 2, 3 — settings completion (password, delete-account), memorial management gaps (gallery, private toggle, soft delete), full notifications page. One migration (soft-delete column, deletion RPC).

**Batch B — Social loops (1 turn)**
Items 4, 5, 6, 7 — journal edit + prompts, feed audit + guest CTA, follows on memorial + Following list, garden sort, 10th-candle trigger migration.

**Batch C — Craft & polish (1 turn)**
Items 8, 9, 10 — WebGL flame + fallback, universal silhouette SVG + swap-in, 404 route, loading/error state sweep, typecheck clean.

Each batch is independently shippable and verifiable. Doing all three in one response would produce sloppy work in every area.

## Assumptions I'll make unless you say otherwise

- Account deletion: preserve memorials by default (owner_id nulled, marked "in loving memory of a friend of Rememfur"), checkbox to delete-all-cascade.
- Soft delete: `deleted_at` column on `memorials`; excluded from all public queries; owner sees "Restore" for 30 days in Dashboard.
- Milestone notification: trigger fires only when `candle_count % 10 == 0`, notifies all followers of the memorial.
- WebGL flame: ~64×96 canvas per candle, single shared context if possible; fallback = current CSS flame.
- 404: styled with existing navy celestial + "This page has drifted off…" copy.

## What I need from you

Reply with either:
- **"Go A"** (or B, or C, or "all in order") — I start the first batch now, one per turn.
- **Adjust** — change scope, assumptions, or order.

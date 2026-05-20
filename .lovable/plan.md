## Rememfur — Pet Memorial Platform

A gentle, full-featured pet memorial platform matching the uploaded mockup's warm, painterly aesthetic. Built on TanStack Start with Lovable Cloud (auth + database + storage) and Lovable AI for portrait transformations.

### Visual direction (from mockup)

- **Palette**: warm cream `#f5efe4`, sage green `#7b8a6e`, terracotta `#c97a5d`, soft mauve `#b89bb5`, deep navy `#243044`, ink `#2d2a26`
- **Typography**: Playfair Display (headings), Inter (body)
- **Feel**: soft painterly, generous whitespace, rounded cards, gentle shadows, botanical accents
- **Tone**: tender, respectful, never saccharine — "Your love mattered. Your grief is welcome here."

### Pages / routes

```
/                              Landing — hero, ecosystem overview, journey, CTA
/about                         Our ritual, philosophy, who it's for
/resources                     Grief support articles, helplines
/login, /signup                Email/password + Google
/garden                        Public Memorial Garden — browse all memorials
/memorial/$slug                Public memorial page (Luna-style)
/_authenticated/dashboard      User's memorials hub
/_authenticated/create         4-step ritual: Photo → Transform → Tribute → Candle → Complete
/_authenticated/journal        Private memory journal
/_authenticated/anniversaries  Reminders list
/_authenticated/settings       Profile + account
```

### Core features

1. **Auth** — email/password + Google via Lovable broker; profiles table auto-created on signup.
2. **Memorial creation ritual** (4 steps, mirrors mockup):
   - Upload pet photo to Cloud storage
   - Choose transformation style (Memory Painting / Storybook / Sketch / Watercolor) — AI-generated via Lovable AI Gateway (`google/gemini-3.1-flash-image-preview`)
   - Write tribute (name, dates, story, "what made them uniquely them")
   - Light first candle
3. **Memorial page** — hero portrait, dates, tribute, gallery, candle count, message wall, light-a-candle button (anyone signed in can light one).
4. **Memorial Garden** — searchable/filterable grid (All / Dogs / Cats / Others), sort by recently added.
5. **Memory Journal** — private rich-text entries per memorial.
6. **Anniversaries** — auto-generated reminders (Angel Day = death date each year).
7. **Candles & Messages** — both tracked per memorial with counts.

### Database schema (Lovable Cloud)

```
profiles(id PK→auth.users, display_name, avatar_url, created_at)
memorials(id, owner_id→profiles, slug, pet_name, species, birth_date,
          passing_date, epitaph, story, hero_image_url, transformed_image_url,
          transform_style, is_public, created_at)
memorial_photos(id, memorial_id, image_url, caption, created_at)
candles(id, memorial_id, lit_by→profiles nullable, message, created_at)
messages(id, memorial_id, author_id→profiles, body, created_at)
journal_entries(id, memorial_id, author_id, title, body, created_at)
```

Storage buckets: `pet-photos` (public), `transformed` (public), `gallery` (public).

RLS: owners full CRUD; public read on public memorials, candles, messages, photos; journal entries strictly owner-only.

### Server functions / routes

- `src/lib/memorials.functions.ts` — list garden, get memorial by slug, create memorial, update, add photo
- `src/lib/candles.functions.ts` — light candle, list candles
- `src/lib/messages.functions.ts` — post message, list messages
- `src/lib/journal.functions.ts` — CRUD private entries (requireSupabaseAuth)
- `src/lib/transform.functions.ts` — calls Lovable AI Gateway image model with chosen style prompt, returns new image URL (uploads result to `transformed` bucket)

### Technical details

- TanStack Start file routes; `_authenticated` layout for protected pages with `beforeLoad` session gate.
- `attachSupabaseAuth` registered in `src/start.ts` for bearer-token passthrough.
- Lovable Cloud enabled; Google OAuth configured via `supabase--configure_social_auth`.
- `LOVABLE_API_KEY` provisioned for AI image transform.
- Curated stock-style hero/ambient imagery generated via `imagegen` (soft painterly meadows, candles) and stored under `src/assets/`.
- SEO: unique `head()` per route, OG image at leaf routes, JSON-LD on memorial pages.
- Mobile-responsive throughout.

### Out of scope (this pass)

- Print/keepsakes commerce (shown as "coming soon" card)
- Donations / Giving Back integration (link to placeholder)
- Email notifications for anniversaries (DB schema ready; sending is a follow-up)
- Realtime updates on candles/messages (uses normal queries with invalidation)

### Build order

1. Enable Lovable Cloud + provision LOVABLE_API_KEY
2. DB migration: profiles, memorials, photos, candles, messages, journal + RLS + storage buckets + trigger
3. Design tokens in `src/styles.css`, font imports
4. Auth pages + `_authenticated` layout + Google OAuth wiring
5. Landing, About, Resources pages with generated hero imagery
6. Memorial Garden + public memorial page
7. Create-memorial ritual flow (4 steps) including AI transform server fn
8. Dashboard, Journal, Anniversaries, Settings
9. Polish, SEO, responsive QA

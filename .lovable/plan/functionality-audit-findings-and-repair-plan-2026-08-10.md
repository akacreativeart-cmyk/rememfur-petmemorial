# Functionality audit — findings and repair plan

I traced the routes, server functions, navigation and the database. Nothing is structurally broken: guests can light a paw lamp, the memorial flow works end to end, and owner CRUD is wired. The gaps are about *unfinished experience* — places where a person can reach a promise with nothing behind it, or can't find a page that exists.

## What I verified
- Live data: 6 memorials, 32 paw lamps, 7 accounts, 12 notifications, 1 beta request — but 0 posts, 0 journal entries, 0 pets, 0 follows, 0 marketplace signups. The social half of the app has never been used.
- No page calls a sign-in-only backend function from a public loader, so no build/SSR breakage.
- Waitlist, beta-invite and feedback dialogs do save to the database.

## Gaps found

### 1. Signed-in pages are effectively hidden
Dashboard, Journal, Pets, Notifications, Settings, Profile and Admin exist but appear only inside the hamburger menu (`SiteHeader.tsx:41-47`). The desktop nav (`:49-53`) and the mobile tab bar (`MobileTabBar.tsx:60-66`) show only Home / Garden / Feed / Shop / Create. There is no "Pets" entry anywhere, and the dashboard links out only to memorials and `/create` (`dashboard.tsx:96-167`). Those menu links also use raw `<a href>`, which forces a full page reload on every tap.

**Fix:** add an account menu (avatar dropdown on desktop, grouped section on mobile) with Dashboard, Journal, Pets, Notifications, Settings, Profile, Admin; convert the raw anchors to router links; add cross-links from the dashboard to Journal, Pets and Notifications.

### 2. Promises with nothing behind them
"Send them your last letter" is the third call to action in the hero (`index.tsx:605-614`) but only opens an early-access dialog. Same for the "Pawtrait Tales" chapter and the Life-world and keepsake tiles.

**Fix:** keep the features as early-access, but label them honestly at the point of the click — move "Their last letter" out of the hero's primary call-to-action stack into the chapters section where the "In development" badge is visible, and make every early-access dialog confirm clearly that the person has been added to a list, with a date-free "we'll write to you" message.

### 3. Nobody is told when someone signs up for a waitlist
`beta_invites` and `marketplace_waitlist` receive rows, but there is no email and no admin screen listing them — the admin page only shows feedback.

**Fix:** add a "Requests" tab to `/admin` listing beta invites and marketplace waitlist entries (email, item, source, date), admin-only. Actual outbound email is a separate decision — see the question below.

### 4. A refresh mid-creation loses the photo
The create flow saves text fields to local storage but the chosen photo lives only in memory (`create.memorial.tsx:105-142`), so a hard refresh at the crop step silently drops it.

**Fix:** restore the photo from local storage too, or show a short "your photo isn't saved yet" note on the crop step.

### 5. Inconsistent guest entry to creating
The mobile tab bar sends signed-out people to `/signup` (`MobileTabBar.tsx:58`) while the landing page sends them straight into the flow. The flow itself only asks for sign-in at publish, which is the better experience.

**Fix:** point the tab bar's Create at the flow for everyone.

### 6. Empty community with no on-ramp
Feed, Journal and Pets have zero rows and the empty states point back to creating a memorial.

**Fix:** make each empty state offer the action for *that* page (write your first post, first journal entry, add your pet) rather than redirecting elsewhere.

### 7. Missing failure screens on data pages
`memorial/$slug` and the memorial edit page load data but define no error screen (`memorial.$slug.tsx:33`, `memorial.$slug.edit.tsx:37`); only the app root has one.

**Fix:** give both routes their own error and not-found screens with a way back to the garden.

## Technical notes
- Files touched: `src/components/site/SiteHeader.tsx`, `src/components/site/MobileTabBar.tsx`, `src/routes/_authenticated/dashboard.tsx`, `src/routes/index.tsx`, `src/routes/admin.tsx`, `src/lib/admin.functions.ts`, `src/routes/create.memorial.tsx`, `src/routes/memorial.$slug.tsx`, `src/routes/_authenticated/memorial.$slug.edit.tsx`, `src/routes/community.tsx`, `src/routes/_authenticated/journal.tsx`, `src/routes/_authenticated/pets.tsx`.
- Admin listing reads through an admin-verified server function; no schema change and no new tables.
- Preview only, no deploy.

## One question before building
Should waitlist/beta signups also trigger an email (a confirmation to the person, and/or a notice to you)? That needs an email service connected; without it, item 3 stays as an in-app admin list.

# Current tasks
- [ ] Resolve eight open design comments on home, garden, community and login; verify before resolving threads.
- [ ] Route returning members to their own profile and new members to welcome, preserving intended destinations.

- [x] Build the public memorial archive with pet/name, passing-date range and paw-lamp count filters and pagination; verified real memorial results, sorting, reset, direct memorial links and desktop/mobile layouts; filter tests pass.

- [x] Add direct memorial invitation links and email-app invitations; verified clipboard, email-draft launch and signed-in return on desktop/mobile with no page errors; invitation tests pass.
- [ ] Enable hosted memorial-invitation sending. Blocked until the sending-domain setup is completed.

- [x] Set up managed email sending for notify.rememfur.com and wire memorial-owner paw-lamp/comment emails (templates, send helper, triggers on signed-in and guest lamps, memorial messages and post comments). Sending starts once DNS verification completes; monitor in Cloud → Emails. Publish required for the live app.
- [x] Repeat full signed-in desktop/mobile checks for dashboard, pets, journal, notifications, settings, profile and memorial creation, including persistence and temporary-data cleanup. Verified real saves, uploads, edits, refreshes, profile tabs, notification links, keepsake downloads and memorial take-down; corrected memorial title contrast and mobile control wrapping. Account deletion/password changes and marking existing notifications read were deliberately not performed on the owner's account.
- [x] Make the intro Enter button visible, high-contrast, and available without waiting.

- [x] Request platform publishing following security readiness checks.
- [x] Verify live Google/Apple destination links and member-session return to memorial creation.
- [ ] Verify the complete Google/Apple provider sign-in round-trip. Blocked: external provider sign-in is not available in the test browser.

Publishing explicitly requested on October 12, 2026.
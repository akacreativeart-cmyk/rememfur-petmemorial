# Project Rules

- Scope the warm ivory-and-plum application theme with `warm-platform`; this preserves intentional dark memorial scenes while keeping shared semantic tokens consistent.
- Wrap every non-home route outlet in `warm-platform`; this guarantees consistent accessible semantic colors across public and signed-in screens.
- Route default sign-ins and sign-ups through `/welcome`; this avoids protected-data races and gives first-time members one clear memorial action.
- Scope the intro and mobile navigation with their own semantic tokens because they render outside the page theme wrapper.
- Parent content routes must render an Outlet for nested detail paths so direct links and refreshed detail pages display the correct screen.
- Memorial invitations use canonical public memorial links and retain that destination through sign-in; invitations do not grant ownership or bypass privacy, and email-app drafts remain explicit until hosted email sending is configured.
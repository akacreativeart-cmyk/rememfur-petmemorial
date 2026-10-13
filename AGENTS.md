# Project Rules

- Scope the warm ivory-and-plum application theme with `warm-platform`; this preserves intentional dark memorial scenes while keeping shared semantic tokens consistent.
- Wrap every non-home route outlet in `warm-platform`; this guarantees consistent accessible semantic colors across public and signed-in screens.
- Resolve default authentication destinations with the shared auth-destination helper; returning members open their profile, first-session members see welcome, and explicit same-origin destinations take precedence.
- Scope the intro and mobile navigation with their own semantic tokens because they render outside the page theme wrapper.
- Parent content routes must render an Outlet for nested detail paths so direct links and refreshed detail pages display the correct screen.
- Memorial invitations use canonical public memorial links and retain that destination through sign-in; invitations do not grant ownership or bypass privacy, and email-app drafts remain explicit until hosted email sending is configured.
- The public archive uses a bounded aggregate database RPC with explicit public/non-deleted predicates and non-hidden lamp counts; server-side pagination applies after filters so every public memorial remains browsable without leaking identities.
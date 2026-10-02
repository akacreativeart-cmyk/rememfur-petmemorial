# Post-auth recovery and homepage feedback

## Goal
Make sign-in and sign-up land safely on a welcoming first-memorial screen, while correcting the homepage sections called out in comments.

## Changes
- Stabilize authentication navigation so session updates cannot race the protected-page check or trigger duplicate redirects.
- Add a signed-in welcome page for first-time members with a prominent “Write your first memorial” action and a secondary home link.
- Send normal sign-ins and new sign-ups through the welcome/dashboard experience instead of briefly bouncing through conflicting pages.
- Correct low-contrast homepage copy and card text in every commented section.
- Replace the commented legacy candle displays with the shared realistic candle, improve the requested image-led section, and restore the dark night-sky closing scene with shooting stars and a realistic seated dog image.
- Remove the homepage constellation hydration mismatch found in the preview logs.
- Verify sign-in state, welcome navigation, homepage appearance, mobile layout, and current build diagnostics.

## Technical details
- Keep protected account data behind the existing signed-in route guard and authenticated server calls.
- Use one controlled post-auth destination and wait for the browser session before navigation.
- Preserve the warm ivory-and-plum design elsewhere; scope dark styling only to the memorial night scene.
- Do not deploy.

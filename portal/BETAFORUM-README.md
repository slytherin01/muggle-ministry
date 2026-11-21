# BetaForum — standalone rebuild

The rebuilt portal is isolated from the legacy portal and uses the same dark home-page styling, widgets, navigation and footer across all views.

## Pages and features
- Dashboard
- FAQ search
- Ticket Support with the 9 requested support categories and direct links to each Forumotion support forum\n- Forumotion username and numeric user ID are detected from the forum page and passed as ticket metadata (no manual ID field)
- Mijn tickets and conversation view
- Staff ticketbeheer, status changes, responses
- FAQ management: create, edit, publish/unpublish, delete
- Email/password authentication
- Responsive layout and iframe CSS isolation

## Support categories\n\n- Forumfouten & Bugs → https://testforumjoost.forumactie.com/f36-forumfouten-bugs-support\n- Account → https://testforumjoost.forumactie.com/f14-account-support\n- Autorisaties → https://testforumjoost.forumactie.com/f11-autorisaties-support\n- Leerlingenkamer → https://testforumjoost.forumactie.com/f13-leerlingenkamer-support\n- Forumwinkel & Galjoenen → https://testforumjoost.forumactie.com/f17-forumwinkel-galjoenen-support\n- Donatiesysteem → https://testforumjoost.forumactie.com/f15-donatiesysteem-support\n- Klachten → https://testforumjoost.forumactie.com/f18-klachten-support\n- Roep een Modje → https://testforumjoost.forumactie.com/f16-roep-een-modje-support\n- Overige → https://testforumjoost.forumactie.com/f37-overige-support\n\n## Hosting
Once merged into `main`, GitHub Pages serves:
`https://slytherin01.github.io/muggle-ministry/portal/betaforum.html`

## Forumotion embed
Paste the following into the Forumotion page:
```html
<div id="betaforum-embed"></div>
<script src="https://slytherin01.github.io/muggle-ministry/portal/betaforum-embed.js"></script>
```
The embed creates an isolated iframe and adjusts its height based on the portal content.

## Forumotion identity note\n\nThe embed script reads Forumotion's available page user data (`_userdata`) or visible profile links and sends username/user ID to the embedded BetaForum frame. This is metadata for ticket identification only; it does not create a secure Forumotion single-sign-on session. BetaForum authentication is still required until a verified server-side SSO bridge is implemented.\n\n## Supabase
Project: `efqnlbhrtofkjmxfbcck`
The frontend uses the publishable key only. Never put a service-role key in client-side code.

Ticket creation runs through `betaforum_create_ticket` (atomic ticket + first message, max 5 tickets per user per 30 minutes).
Migration: `20261121000400_betaforum_atomic_ticket_creation_and_rate_limit.sql`

## First staff/admin
Register the intended staff account, then add its UUID to `public.betaforum_admins` with role `admin`. Staff controls appear after refresh/login.

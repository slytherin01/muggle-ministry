# BetaForum — standalone rebuild

The rebuilt portal is isolated from the legacy portal and uses the same dark home-page styling, widgets, navigation and footer across all views.

## Pages and features
- Dashboard
- FAQ search
- Ticket Support with category, Forumotion username/ID and ticket body
- Mijn tickets and conversation view
- Staff ticketbeheer, status changes, responses
- FAQ management: create, edit, publish/unpublish, delete
- Email/password authentication
- Responsive layout and iframe CSS isolation

## Hosting
Once merged into `main`, GitHub Pages serves:
`https://slytherin01.github.io/muggle-ministry/portal/betaforum.html`

## Forumotion embed
Paste the following into the Forumotion page:
```html
<div id="betaforum-embed"></div>
<script src="https://slytherin01.github.io/muggle-ministry/portal/betaforum-embed.js"></script>
```
The embed creates an isolated iframe and adjusts its height based on the portal content.

## Supabase
Project: `efqnlbhrtofkjmxfbcck`
The frontend uses the publishable key only. Never put a service-role key in client-side code.

Ticket creation runs through `betaforum_create_ticket` (atomic ticket + first message, max 5 tickets per user per 30 minutes).
Migration: `20261121000400_betaforum_atomic_ticket_creation_and_rate_limit.sql`

## First staff/admin
Register the intended staff account, then add its UUID to `public.betaforum_admins` with role `admin`. Staff controls appear after refresh/login.

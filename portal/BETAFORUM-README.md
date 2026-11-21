# BetaForum (rebuild)

Separate rebuild; legacy portal remains untouched.

## Deploy
- Host `betaforum.html`, `betaforum.css`, `betaforum.js` as static files (GitHub Pages).
- Supabase project: `efqnlbhrtofkjmxfbcck`.
- Public client key is publishable/anon and is embedded in the frontend; never use service-role keys in browser.

## First admin
1. Register a user through the portal.
2. In Supabase SQL editor, promote that auth user UUID:
   `insert into public.betaforum_admins(user_id,role) values ('USER-UUID','admin');
3. Admin menu appears after next login/refresh.

## Pages
Dashboard, FAQ, Ticket Support, Mijn tickets, staff Ticketbeheer, authentication.

# BetaForum RC — test checklist

Test this release candidate before merging to the live portal.

## Access
- Beta standalone preview: https://raw.githack.com/slytherin01/muggle-ministry/betaforum-release-candidate/portal/betaforum.html
- Forum test site: https://testforumjoost.forumactie.com/
- Branch: `betaforum-release-candidate`

> Forumotion identity (username + numeric ID) is only metadata from the parent forum page. It is not secure SSO. For beta, testers still register/login with a BetaForum account.

## Test flow
1. Open the preview from the forum while logged in, and confirm your Forumotion username appears in the portal header and support form.
2. Register a test account (use a test email address), sign in, and sign out.
3. Submit one ticket in each category (or at least sample several): verify the category preview and its “Bekijk forumcategorie” link.
4. Create a ticket with a valid subject and body; confirm the first message appears in the conversation.
5. Open “Mijn tickets”; verify only tickets from your signed-in BetaForum account are shown.
6. Reply to a ticket; verify the message and author label are correct.
7. Verify staff account can access Ticketbeheer, search tickets, filter by status, change status, and reply.
8. Verify non-staff account cannot access staff controls.
9. FAQ: search published items; staff create/edit/publish/unpublish/delete an item.
10. Test responsive behavior on mobile and desktop; check navigation, iframe sizing, and category links.

## Known beta limitations / release gates
- Forumotion identity is not authenticated by a secure server-side bridge. A forum username/user ID sent to the iframe is metadata and can be spoofed. Ticket ownership and permissions rely on Supabase Auth/RLS.
- News feed and forum widgets are placeholders/links pending integrations.
- Staff must be provisioned in `public.betaforum_admins`; do not grant staff from client-side UI.
- Before production: confirm all RLS policies, verify staff provisioning, test email confirmation/password recovery, and decide whether secure Forumotion SSO is required.

## Categories
- Forumfouten & Bugs
- Account
- Autorisaties
- Leerlingenkamer
- Forumwinkel & Galjoenen
- Donatiesysteem
- Klachten
- Roep een Modje
- Overige Support
- Sorteerhoed

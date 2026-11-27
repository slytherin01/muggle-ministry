# BetaForum Ticketdesk — Forumotion-installatie

Plaats op de Forumotion HTML-pagina **h3-portaal** op de plek waar de ticketdesk zichtbaar moet worden:

```html
<div id="betaforum-ticketdesk"></div>
<script src="https://raw.githubusercontent.com/slytherin01/muggle-ministry/betaforum-release-candidate/portal/forumotion-ticketdesk-loader.js"></script>
```

De loader haalt de ticketdesk-markup en -scripts op en plaatst ze rechtstreeks in de pagina. Er wordt geen iframe gebruikt.

## Belangrijke toegangsbeperking

Forumotion biedt hier geen ondersteunde, cryptografisch betrouwbare SSO-identiteit voor een externe Supabase-app. Daarom gebruikt deze ticketdesk op dit moment een afzonderlijk BetaForum-ticketaccount. De gedetecteerde Forumotion-gebruikersnaam is alleen een weergavelabel en wordt **niet** vertrouwd voor autorisatie. Deel dus nooit je Forumotion-wachtwoord in de ticketdesk.

## Wat is aangesloten

- Privé-ticketoverzicht en ticketberichten via Supabase RLS.
- Supportcategorieën: Forumfouten & Bugs, Account, Autorisaties, Leerlingenkamer, Forumwinkel & Galjoenen, Donatiesysteem, Klachten, Roep een Modje en Overige Support.
- Moderatoroverzicht en statusbeheer voor accounts die in `betaforum_admins` als staff zijn geregistreerd.
- Ticketaanmaak via een rate-limited databasefunctie.

## Nog niet geactiveerd

- Automatische Forumotion-login/SSO.
- Automatische Forumotion-PB en e-mailmeldingen.
- Moderatoraccounts zijn nog niet toegewezen; voeg pas geverifieerde Supabase-auth-user-ID's toe aan `betaforum_admins`.

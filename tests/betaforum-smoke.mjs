import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(path, "utf8");
const app = await read("portal/betaforum.js");
const embed = await read("portal/betaforum-embed.js");
const html = await read("portal/betaforum.html");
const sql = await read("supabase/migrations/20261121000400_betaforum_atomic_ticket_creation_and_rate_limit.sql");
const hardening = await read("supabase/migrations/20261121000500_betaforum_category_and_staff_rpc_hardening.sql");

const categories = [
  "Forumfouten & Bugs",
  "Account",
  "Autorisaties",
  "Leerlingenkamer",
  "Forumwinkel & Galjoenen",
  "Donatiesysteem",
  "Klachten",
  "Roep een Modje",
  "Overige",
];

for (const category of categories) {
  assert.ok(app.includes(category), `Support category missing: ${category}`);
}
assert.ok(app.includes("betaforum_create_ticket"), "Ticket creation must use the atomic RPC");
assert.ok(app.includes("betaforum_ticket_messages"), "Ticket conversation feature must query messages");
assert.ok(app.includes("betaforum_admins"), "Staff access must be checked against the admin table");
assert.ok(app.includes("const esc="), "User-provided HTML must be escaped");
assert.ok(app.includes("const nl="), "Ticket messages must render escaped text with line breaks");
assert.ok(app.includes("betaforum-forum-identity"), "Forum identity message contract must be present");
assert.ok(app.includes("admin_content"), "News must connect to the existing portal news table");
assert.ok(app.includes(".eq(\"published\",true)"), "BetaForum must only display published portal news");
assert.ok(app.includes("renderNewsPreview"), "Dashboard news preview must be implemented");
assert.ok(app.includes('case"news":content=await news();break;'), "News page must await its async data before rendering");
assert.ok(app.includes("forumactie.com"), "Incoming identity messages must validate Forumotion origin");
assert.ok(app.includes("event.source!==window.parent"), "Forumotion identity messages must come from the embedding parent");
assert.ok(!/service[_-]?role/i.test(app), "Service-role credentials must never be present in frontend code");

assert.ok(embed.includes("portal/betaforum.html?embed=1"), "Embed must load the isolated BetaForum iframe");
assert.ok(embed.includes("https://slytherin01.github.io"), "Identity messages must target the expected iframe origin");
assert.ok(embed.includes("betaforum-height"), "Embed must support dynamic iframe height");
assert.ok(html.includes("betaforum.css"), "Standalone page must load its stylesheet");
assert.ok(html.includes("betaforum.js"), "Standalone page must load the app script");

assert.ok(sql.includes("security definer"), "Ticket creation RPC must be SECURITY DEFINER");
assert.ok(sql.includes("auth.uid()"), "Ticket creation RPC must require an authenticated user");
assert.ok(sql.includes("pg_advisory_xact_lock"), "Rate limiting must serialize concurrent ticket creation");
assert.ok(sql.includes("grant execute on function public.betaforum_create_ticket"), "RPC execute must be granted only to authenticated users");
assert.ok(sql.includes("revoke all on function public.betaforum_create_ticket"), "RPC must revoke default/public execution");
assert.ok(hardening.includes("Kies een geldige supportcategorie"), "Ticket RPC must whitelist categories");
assert.ok(hardening.includes("revoke all on function public.betaforum_is_staff() from public, anon"), "Staff helper must not be publicly executable");
assert.ok(hardening.includes("anon read published FAQ"), "Anonymous FAQ reads must not require the staff helper");
assert.ok(hardening.includes("revoke insert on public.betaforum_tickets from anon, authenticated"), "Ticket creation must be forced through the rate-limited RPC");
assert.ok(hardening.includes("drop policy if exists \"users create own tickets\""), "Direct ticket insert policy must be removed");
assert.ok(hardening.includes("users send own open ticket messages"), "Users must not bypass the closed-ticket reply restriction");

console.log("BetaForum smoke checks passed.");

-- BetaForum hardening: whitelist ticket categories and restrict staff-helper RPC.
begin;

create or replace function public.betaforum_create_ticket(
  p_category text,
  p_subject text,
  p_body text,
  p_forumotion_user_id text default null,
  p_forumotion_username text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_id uuid;
  v_now timestamptz := now();
  v_rate public.betaforum_ticket_rate_limit%rowtype;
  v_category text := trim(coalesce(p_category, ''));
begin
  if v_uid is null then
    raise exception 'Je moet ingelogd zijn.';
  end if;

  if v_category not in (
    'Forumfouten & Bugs',
    'Account',
    'Autorisaties',
    'Leerlingenkamer',
    'Forumwinkel & Galjoenen',
    'Donatiesysteem',
    'Klachten',
    'Roep een Modje',
    'Overige'
  ) then
    raise exception 'Kies een geldige supportcategorie.';
  end if;

  if length(trim(coalesce(p_subject, ''))) not between 3 and 120 then
    raise exception 'Onderwerp moet 3 tot 120 tekens bevatten.';
  end if;
  if length(trim(coalesce(p_body, ''))) not between 10 and 8000 then
    raise exception 'Bericht moet 10 tot 8000 tekens bevatten.';
  end if;
  if p_forumotion_user_id is not null and p_forumotion_user_id !~ '^[0-9]{1,20}$' then
    raise exception 'Ongeldig Forumotion-user-ID.';
  end if;
  if p_forumotion_username is not null and length(trim(p_forumotion_username)) > 80 then
    raise exception 'Forumotion-gebruikersnaam is te lang.';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_uid::text, 0));
  select * into v_rate
  from public.betaforum_ticket_rate_limit
  where user_id = v_uid
  for update;

  if not found then
    insert into public.betaforum_ticket_rate_limit(user_id, window_started_at, ticket_count)
    values(v_uid, v_now, 1);
  else
    if v_rate.window_started_at < v_now - interval '30 minutes' then
      update public.betaforum_ticket_rate_limit
      set window_started_at = v_now, ticket_count = 1
      where user_id = v_uid;
    elsif v_rate.ticket_count >= 5 then
      raise exception 'Je hebt te veel tickets aangemaakt. Probeer over 30 minuten opnieuw.';
    else
      update public.betaforum_ticket_rate_limit
      set ticket_count = ticket_count + 1
      where user_id = v_uid;
    end if;
  end if;

  insert into public.betaforum_tickets(
    user_id, forumotion_user_id, forumotion_username, category, subject
  )
  values(
    v_uid,
    nullif(trim(p_forumotion_user_id), ''),
    nullif(trim(p_forumotion_username), ''),
    v_category,
    trim(p_subject)
  )
  returning id into v_id;

  insert into public.betaforum_ticket_messages(
    ticket_id, author_user_id, author_name, is_staff, body
  )
  values(
    v_id,
    v_uid,
    coalesce(nullif(trim(p_forumotion_username), ''), auth.jwt()->>'email', 'Gebruiker'),
    false,
    trim(p_body)
  );

  return v_id;
end
$$;

revoke all on function public.betaforum_create_ticket(text, text, text, text, text) from public, anon;
grant execute on function public.betaforum_create_ticket(text, text, text, text, text) to authenticated;

revoke insert on public.betaforum_tickets from anon, authenticated;
drop policy if exists "users create own tickets" on public.betaforum_tickets;
revoke all on public.betaforum_ticket_rate_limit from anon, authenticated;

create or replace function public.betaforum_is_staff()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select auth.uid() is not null
    and exists (
      select 1 from public.betaforum_admins a
      where a.user_id = auth.uid()
    );
$$;

revoke all on function public.betaforum_is_staff() from public, anon;
grant execute on function public.betaforum_is_staff() to authenticated;

drop policy if exists "public read published FAQ" on public.betaforum_faq;
drop policy if exists "anon read published FAQ" on public.betaforum_faq;
drop policy if exists "authenticated read published FAQ or staff" on public.betaforum_faq;

create policy "anon read published FAQ"
on public.betaforum_faq
for select to anon
using (is_published = true);

create policy "authenticated read published FAQ or staff"
on public.betaforum_faq
for select to authenticated
using (is_published = true or public.betaforum_is_staff());

commit;

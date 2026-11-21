-- BetaForum: atomic ticket creation and abuse-rate limiting
begin;
create table if not exists public.betaforum_ticket_rate_limit (
 user_id uuid primary key references auth.users(id) on delete cascade,
 window_started_at timestamptz not null default now(),
 ticket_count integer not null default 0
);
alter table public.betaforum_ticket_rate_limit enable row level security;
revoke all on public.betaforum_ticket_rate_limit from anon, authenticated;
create or replace function public.betaforum_create_ticket(p_category text,p_subject text,p_body text,p_forumotion_user_id text default null,p_forumotion_username text default null)
returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare v_uid uuid:=auth.uid(); v_id uuid; v_now timestamptz:=now(); v_rate public.betaforum_ticket_rate_limit%rowtype;
begin
 if v_uid is null then raise exception 'Je moet ingelogd zijn.'; end if;
 if length(trim(coalesce(p_category,''))) not between 2 and 80 then raise exception 'Kies een geldige categorie.'; end if;
 if length(trim(coalesce(p_subject,''))) not between 3 and 120 then raise exception 'Onderwerp moet 3 tot 120 tekens bevatten.'; end if;
 if length(trim(coalesce(p_body,''))) not between 10 and 8000 then raise exception 'Bericht moet 10 tot 8000 tekens bevatten.'; end if;
 perform pg_advisory_xact_lock(hashtextextended(v_uid::text,0));
 select * into v_rate from public.betaforum_ticket_rate_limit where user_id=v_uid for update;
 if not found then
  insert into public.betaforum_ticket_rate_limit(user_id,window_started_at,ticket_count) values(v_uid,v_now,1);
 else
  if v_rate.window_started_at < v_now - interval '30 minutes' then
   update public.betaforum_ticket_rate_limit set window_started_at=v_now,ticket_count=1 where user_id=v_uid;
  elsif v_rate.ticket_count >= 5 then
   raise exception 'Je hebt te veel tickets aangemaakt. Probeer over 30 minuten opnieuw.';
  else
   update public.betaforum_ticket_rate_limit set ticket_count=ticket_count+1 where user_id=v_uid;
  end if;
 end if;
 insert into public.betaforum_tickets(user_id,forumotion_user_id,forumotion_username,category,subject)
 values(v_uid,nullif(trim(p_forumotion_user_id),''),nullif(trim(p_forumotion_username),''),trim(p_category),trim(p_subject))
 returning id into v_id;
 insert into public.betaforum_ticket_messages(ticket_id,author_user_id,author_name,is_staff,body)
 values(v_id,v_uid,coalesce(nullif(trim(p_forumotion_username),''),auth.jwt()->>'email','Gebruiker'),false,trim(p_body));
 return v_id;
end $$;
revoke all on function public.betaforum_create_ticket(text,text,text,text,text) from public,anon;
grant execute on function public.betaforum_create_ticket(text,text,text,text,text) to authenticated;
commit;

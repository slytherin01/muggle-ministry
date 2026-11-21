-- Protect legacy portal Ticketbeheer RPCs with Supabase Auth.
-- Forumotion IDs remain an additional role check, but are no longer trusted alone.
begin;

create or replace function public.forumotion_portal_admin_list_tickets(p_forum_id bigint)
returns setof jsonb
language plpgsql
security definer
set search_path to public
as $function$
begin
  if auth.uid() is null or not (
    exists (select 1 from public.translation_admins ta where ta.user_id = auth.uid())
    or exists (select 1 from public.tool_access_roles tar where tar.user_id = auth.uid() and tar.role = 'administrator')
  ) then
    raise exception 'Geen Supabase-autorisatie voor Ticketbeheer';
  end if;
  if not exists (
    select 1 from public.forumotion_portal_role_map
    where forum_user_id = p_forum_id and role = 'administrator'
  ) then
    raise exception 'Geen Forumotion-autorisatie voor Ticketbeheer';
  end if;
  return query
  select jsonb_build_object(
    'id', t.id, 'ticket_number', t.ticket_number, 'subject', t.subject,
    'forumotion_username', t.forumotion_username, 'forumotion_user_id', t.forumotion_user_id,
    'status', t.status, 'priority', t.priority, 'category', t.category,
    'department', t.department, 'updated_at', t.updated_at,
    'close_requested', t.close_requested, 'close_request_note', t.close_request_note
  )
  from public.forumotion_portal_tickets t
  order by t.updated_at desc;
end
$function$;

create or replace function public.forumotion_portal_admin_get_ticket(p_forum_id bigint, p_ticket_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to public
as $function$
declare t public.forumotion_portal_tickets; msgs jsonb;
begin
  if auth.uid() is null or not (
    exists (select 1 from public.translation_admins ta where ta.user_id = auth.uid())
    or exists (select 1 from public.tool_access_roles tar where tar.user_id = auth.uid() and tar.role = 'administrator')
  ) then
    raise exception 'Geen Supabase-autorisatie voor Ticketbeheer';
  end if;
  if not exists (
    select 1 from public.forumotion_portal_role_map
    where forum_user_id = p_forum_id and role = 'administrator'
  ) then
    raise exception 'Geen Forumotion-autorisatie voor Ticketbeheer';
  end if;
  select * into t from public.forumotion_portal_tickets where id = p_ticket_id;
  if not found then raise exception 'Ticket niet gevonden'; end if;
  select coalesce(jsonb_agg(jsonb_build_object(
    'author_name', m.author_name, 'body', m.body, 'is_staff', m.is_staff, 'created_at', m.created_at
  ) order by m.created_at), '[]'::jsonb)
  into msgs
  from public.forumotion_portal_ticket_messages m where m.ticket_id = t.id;
  return jsonb_build_object('ticket', to_jsonb(t), 'messages', msgs);
end
$function$;

create or replace function public.forumotion_portal_admin_reply(
  p_forum_id bigint, p_ticket_id uuid, p_body text, p_status text, p_priority text default null
)
returns jsonb
language plpgsql
security definer
set search_path to public
as $function$
declare t public.forumotion_portal_tickets;
begin
  if auth.uid() is null or not (
    exists (select 1 from public.translation_admins ta where ta.user_id = auth.uid())
    or exists (select 1 from public.tool_access_roles tar where tar.user_id = auth.uid() and tar.role = 'administrator')
  ) then
    raise exception 'Geen Supabase-autorisatie voor Ticketbeheer';
  end if;
  if not exists (
    select 1 from public.forumotion_portal_role_map
    where forum_user_id = p_forum_id and role = 'administrator'
  ) then
    raise exception 'Geen Forumotion-autorisatie voor Ticketbeheer';
  end if;
  if length(trim(coalesce(p_body, ''))) < 2 then raise exception 'Reactie is te kort'; end if;
  if p_status not in ('open', 'in_progress', 'waiting', 'closed') then raise exception 'Ongeldige status'; end if;
  if p_priority is not null and p_priority not in ('low', 'normal', 'high', 'urgent') then raise exception 'Ongeldige prioriteit'; end if;
  select * into t from public.forumotion_portal_tickets where id = p_ticket_id;
  if not found then raise exception 'Ticket niet gevonden'; end if;
  insert into public.forumotion_portal_ticket_messages(ticket_id, author_name, body, is_staff)
  values (t.id, 'Ministerie', trim(p_body), true);
  update public.forumotion_portal_tickets
  set status = p_status, priority = coalesce(p_priority, priority),
      close_requested = false, close_request_note = '', updated_at = now()
  where id = t.id;
  return jsonb_build_object('ok', true);
end
$function$;

revoke execute on function public.forumotion_portal_admin_list_tickets(bigint) from public, anon, authenticated;
revoke execute on function public.forumotion_portal_admin_get_ticket(bigint, uuid) from public, anon, authenticated;
revoke execute on function public.forumotion_portal_admin_reply(bigint, uuid, text, text, text) from public, anon, authenticated;
grant execute on function public.forumotion_portal_admin_list_tickets(bigint) to authenticated;
grant execute on function public.forumotion_portal_admin_get_ticket(bigint, uuid) to authenticated;
grant execute on function public.forumotion_portal_admin_reply(bigint, uuid, text, text, text) to authenticated;

commit;

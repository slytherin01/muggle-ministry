-- Include close-request state in the customer ticket detail RPC.
create or replace function public.forumotion_portal_get_ticket(p_ticket_id uuid, p_forum_id bigint, p_token text)
returns jsonb
language plpgsql
security definer
set search_path to public, extensions
as $function$
declare t public.forumotion_portal_tickets; msgs jsonb;
begin
  select * into t
  from public.forumotion_portal_tickets
  where id = p_ticket_id
    and forumotion_user_id = p_forum_id
    and access_token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex');
  if not found then raise exception 'Ticket niet gevonden of geen toegang'; end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'author_name', m.author_name,
    'body', m.body,
    'is_staff', m.is_staff,
    'created_at', m.created_at
  ) order by m.created_at), '[]'::jsonb)
  into msgs
  from public.forumotion_portal_ticket_messages m
  where m.ticket_id = t.id;

  return jsonb_build_object(
    'ticket', jsonb_build_object(
      'id', t.id,
      'ticket_number', t.ticket_number,
      'subject', t.subject,
      'status', t.status,
      'priority', t.priority,
      'category', t.category,
      'created_at', t.created_at,
      'updated_at', t.updated_at,
      'close_requested', t.close_requested,
      'close_request_note', t.close_request_note
    ),
    'messages', msgs
  );
end
$function$;

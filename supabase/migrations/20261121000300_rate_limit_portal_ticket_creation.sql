-- Rate-limit public Forumotion ticket creation and enforce server-side length limits.
create or replace function public.forumotion_portal_create_ticket(
  p_forum_id bigint,
  p_forum_name text,
  p_token text,
  p_category text,
  p_department text,
  p_subject text,
  p_body text
)
returns jsonb
language plpgsql
security definer
set search_path to public, extensions
as $function$
declare
  t public.forumotion_portal_tickets;
  v_rate_user uuid;
  v_rate_count integer;
begin
  if p_forum_id is null or p_forum_id <= 0
     or coalesce(trim(p_forum_name), '') = ''
     or length(trim(p_forum_name)) > 100 then
    raise exception 'Forumotion-account niet herkend';
  end if;
  if length(coalesce(p_token, '')) < 32 or length(coalesce(p_token, '')) > 128 then
    raise exception 'Ongeldige ticket-toegangscode';
  end if;
  if length(trim(coalesce(p_subject, ''))) < 3 or length(trim(p_subject)) > 200 then
    raise exception 'Onderwerp moet 3 tot 200 tekens bevatten';
  end if;
  if length(trim(coalesce(p_body, ''))) < 10 or length(p_body) > 60000 then
    raise exception 'Bericht moet 10 tot 60000 tekens bevatten';
  end if;
  if length(trim(coalesce(p_category, ''))) < 1 or length(p_category) > 100 then
    raise exception 'Ongeldige ticketcategorie';
  end if;
  if length(coalesce(p_department, '')) > 100 then
    raise exception 'Afdeling is te lang';
  end if;

  -- Rate limit per claimed Forumotion ID: at most five tickets per 30 minutes.
  -- The public RPC cannot independently verify Forumotion cookies, so this is
  -- abuse throttling rather than a cryptographic identity check.
  v_rate_user := md5('forumotion-ticket-create:' || p_forum_id::text)::uuid;
  insert into public.portal_security_rate_limits(user_id, action, window_started_at, request_count)
  values (v_rate_user, 'forumotion_ticket_create', now(), 1)
  on conflict (user_id, action) do update
    set window_started_at = case
          when public.portal_security_rate_limits.window_started_at < now() - interval '30 minutes'
          then now()
          else public.portal_security_rate_limits.window_started_at
        end,
        request_count = case
          when public.portal_security_rate_limits.window_started_at < now() - interval '30 minutes'
          then 1
          else public.portal_security_rate_limits.request_count + 1
        end
    where public.portal_security_rate_limits.window_started_at < now() - interval '30 minutes'
       or public.portal_security_rate_limits.request_count < 5
  returning request_count into v_rate_count;

  if not found then
    raise exception 'Je hebt te veel tickets aangemaakt. Probeer over 30 minuten opnieuw.';
  end if;

  insert into public.forumotion_portal_tickets(
    forumotion_user_id, forumotion_username, category, department, subject, access_token_hash
  )
  values (
    p_forum_id, trim(p_forum_name), trim(p_category),
    coalesce(nullif(trim(p_department), ''), 'Algemeen'),
    trim(p_subject), encode(extensions.digest(p_token, 'sha256'), 'hex')
  )
  returning * into t;

  insert into public.forumotion_portal_ticket_messages(ticket_id, author_name, body, is_staff)
  values (t.id, t.forumotion_username, trim(p_body), false);

  return jsonb_build_object(
    'id', t.id, 'ticket_number', t.ticket_number, 'subject', t.subject,
    'status', t.status, 'created_at', t.created_at
  );
end
$function$;

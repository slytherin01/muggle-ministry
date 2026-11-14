-- Extend helpdesk metadata and audit access to the current ticket-management roles.
-- Keep legacy translation administrators working.
begin;
drop policy if exists "Helpdesk tool roles can read ticket metadata" on public.helpdesk_ticket_metadata;
create policy "Helpdesk tool roles can read ticket metadata" on public.helpdesk_ticket_metadata for select to authenticated
using (public.has_admin_permission('can_manage_permissions') or exists (select 1 from public.tool_access_roles r where r.user_id=auth.uid() and r.role in ('administrator','support_moderator')) or exists (select 1 from public.translation_admins a where a.user_id=auth.uid()));
drop policy if exists "Helpdesk tool roles can insert ticket metadata" on public.helpdesk_ticket_metadata;
create policy "Helpdesk tool roles can insert ticket metadata" on public.helpdesk_ticket_metadata for insert to authenticated
with check (public.has_admin_permission('can_manage_permissions') or exists (select 1 from public.tool_access_roles r where r.user_id=auth.uid() and r.role in ('administrator','support_moderator')) or exists (select 1 from public.translation_admins a where a.user_id=auth.uid()));
drop policy if exists "Helpdesk tool roles can update ticket metadata" on public.helpdesk_ticket_metadata;
create policy "Helpdesk tool roles can update ticket metadata" on public.helpdesk_ticket_metadata for update to authenticated
using (public.has_admin_permission('can_manage_permissions') or exists (select 1 from public.tool_access_roles r where r.user_id=auth.uid() and r.role in ('administrator','support_moderator')) or exists (select 1 from public.translation_admins a where a.user_id=auth.uid()))
with check (public.has_admin_permission('can_manage_permissions') or exists (select 1 from public.tool_access_roles r where r.user_id=auth.uid() and r.role in ('administrator','support_moderator')) or exists (select 1 from public.translation_admins a where a.user_id=auth.uid()));
drop policy if exists "Helpdesk tool roles can read ticket events" on public.helpdesk_ticket_events;
create policy "Helpdesk tool roles can read ticket events" on public.helpdesk_ticket_events for select to authenticated
using (public.has_admin_permission('can_manage_permissions') or exists (select 1 from public.tool_access_roles r where r.user_id=auth.uid() and r.role in ('administrator','support_moderator')) or exists (select 1 from public.translation_admins a where a.user_id=auth.uid()));
drop policy if exists "Helpdesk tool roles can append ticket events" on public.helpdesk_ticket_events;
create policy "Helpdesk tool roles can append ticket events" on public.helpdesk_ticket_events for insert to authenticated
with check (actor_user_id=auth.uid() and (public.has_admin_permission('can_manage_permissions') or exists (select 1 from public.tool_access_roles r where r.user_id=auth.uid() and r.role in ('administrator','support_moderator')) or exists (select 1 from public.translation_admins a where a.user_id=auth.uid())));
grant select, insert, update on public.helpdesk_ticket_metadata to authenticated;
grant select, insert on public.helpdesk_ticket_events to authenticated;
notify pgrst, 'reload schema';
commit;

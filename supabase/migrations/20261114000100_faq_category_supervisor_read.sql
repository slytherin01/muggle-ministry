-- Allow FAQ supervisors to manage and view inactive FAQ categories.
-- Active categories remain publicly readable; inactive categories are visible only
-- to users with the FAQ approval permission.
drop policy if exists "FAQ categories visible read" on public.faq_categories;
create policy "FAQ categories visible read"
on public.faq_categories
for select
to anon, authenticated
using (is_active = true or public.has_portal_permission('can_approve_faq'));

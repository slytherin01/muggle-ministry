-- Add a shared SLA/deadline field to Forumotion helpdesk metadata.
-- Existing ticket rows remain valid; NULL means no deadline has been set.
alter table public.helpdesk_ticket_metadata
  add column if not exists due_at timestamptz;

create index if not exists helpdesk_ticket_metadata_due_at_idx
  on public.helpdesk_ticket_metadata (due_at)
  where due_at is not null;

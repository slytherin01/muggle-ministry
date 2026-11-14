-- Use the globally unique Forumotion topic id as the stable synchronization key.
-- This keeps ticket metadata and moderator assignments attached when a topic moves forums.
begin;
create unique index if not exists helpdesk_ticket_metadata_topic_uidx on public.helpdesk_ticket_metadata(forumotion_topic_id);
notify pgrst, 'reload schema';
commit;

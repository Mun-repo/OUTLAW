alter table registrations
  add column if not exists reminder_sent boolean not null default false;

create index if not exists registrations_reminder_idx
  on registrations (reminder_sent, event_id);

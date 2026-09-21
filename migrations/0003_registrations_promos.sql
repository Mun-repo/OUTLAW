alter table events
  add column if not exists event_time text not null default '22:00';

create table if not exists registrations (
  id          serial primary key,
  event_id    integer not null references events(id) on delete cascade,
  last_name   text not null,
  first_name  text not null,
  email       text not null,
  ticket_code text not null,
  created_at  timestamptz not null default now()
);

create unique index if not exists registrations_event_email_idx
  on registrations (event_id, lower(email));

create table if not exists promo_codes (
  id          serial primary key,
  code        text not null,
  kind        text not null,
  value       numeric(10, 2) not null default 0,
  description text not null default '',
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

create unique index if not exists promo_codes_code_idx
  on promo_codes (lower(code));

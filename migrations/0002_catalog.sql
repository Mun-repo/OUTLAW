-- Outlaw boutique catalog (unowned rows — public read, admin-gated writes)
create table if not exists products (
  id          serial primary key,
  title       text not null,
  description text not null default '',
  price       numeric(10, 2) not null,
  image_url   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists events (
  id          serial primary key,
  title       text not null,
  event_date  date not null,
  location    text not null default '',
  description text not null default '',
  banner_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

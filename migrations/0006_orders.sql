create table if not exists orders (
  id                 serial primary key,
  order_number       text not null unique,
  first_name         text not null,
  last_name          text not null,
  email              text not null,
  items_json         text not null default '[]',
  total              numeric(10, 2) not null,
  status             text not null default 'pending',
  stripe_session_id  text unique,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists orders_status_idx on orders (status, created_at desc);

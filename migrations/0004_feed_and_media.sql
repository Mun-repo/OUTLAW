alter table events
  add column if not exists sort_order integer not null default 0;

alter table events
  add column if not exists ended boolean not null default false;

alter table events
  add column if not exists organizer text not null default '';

alter table events
  add column if not exists guidelines text not null default '';

update events
set sort_order = id
where sort_order = 0;

alter table products
  add column if not exists image_urls text not null default '[]';

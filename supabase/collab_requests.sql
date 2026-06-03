-- Заявки на коллаборацию (предложить свой товар).
-- Выполни этот SQL один раз в Supabase → SQL Editor.

create table if not exists collab_requests (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text,
  telegram    text,
  phone       text,
  title       text,
  description text,
  price       text,
  images      jsonb not null default '[]'::jsonb,
  status      text  not null default 'new'  -- new | seen | archived
);

create index if not exists collab_requests_created_at_idx
  on collab_requests (created_at desc);

-- RLS: доступ только через service role (серверные роуты). Публичный ключ ничего не видит.
alter table collab_requests enable row level security;

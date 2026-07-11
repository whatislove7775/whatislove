-- Ссылки на странице /links (управляются из админки).
-- Выполни этот SQL один раз в Supabase → SQL Editor.

create table if not exists links (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  label      text not null default '',
  url        text not null default '',
  sort_order integer not null default 0
);

create index if not exists links_sort_order_idx on links (sort_order);

-- RLS: публичное чтение (страница /links), запись только через service role (админка).
alter table links enable row level security;

create policy "Public read access" on links
  for select using (true);

-- Начальные значения — те же, что были захардкожены на сайте.
insert into links (label, url, sort_order) values
  ('[КАНАЛ В ТГ]', 'https://t.me/whatislove_r', 0),
  ('[АВТОР В ТГ]', 'https://t.me/babydonthurtmovich', 1),
  ('[ПОЧТА]', 'mailto:babydonthurtmovich@mail.ru', 2)
on conflict do nothing;

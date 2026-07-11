-- Колонки для группировки ссылок на странице /links.
-- Выполни один раз в Supabase → SQL Editor (после links.sql).

create table if not exists link_columns (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title      text not null default '',
  sort_order integer not null default 0
);

-- RLS: публичное чтение (страница /links), запись только через service role (админка).
alter table link_columns enable row level security;

create policy "Public read access" on link_columns
  for select using (true);

-- Ссылка на колонку. NULL = ссылка без колонки (старое поведение — одна строка).
alter table links add column if not exists column_id uuid references link_columns(id) on delete set null;

create index if not exists links_column_id_idx on links (column_id);

-- Ручная сортировка товаров и портфолио (управляется из админки стрелками ▲▼).
-- Выполни один раз в Supabase → SQL Editor.

alter table products add column if not exists sort_order integer;
alter table cases add column if not exists sort_order integer;

-- Заполняем текущим порядком отображения, чтобы после миграции ничего не переместилось.
with ranked as (
  select id, row_number() over (order by id desc) - 1 as rn from products
)
update products set sort_order = ranked.rn
from ranked where products.id = ranked.id and products.sort_order is null;

with ranked as (
  select id, row_number() over (order by year desc nulls last, id desc) - 1 as rn from cases
)
update cases set sort_order = ranked.rn
from ranked where cases.id = ranked.id and cases.sort_order is null;

alter table products alter column sort_order set default 0;
alter table cases alter column sort_order set default 0;

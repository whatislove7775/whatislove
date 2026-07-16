-- Доставка (несколько сервисов на товар), отметка "отправлен" на заказах,
-- и дополнительные админ-пользователи для обработки заказов.
-- Выполни один раз в Supabase → SQL Editor.

-- ─── 1. Сервисы доставки для товара ────────────────────────────────
-- Массив ключей сервисов: 'cdek' | 'ozon' | 'yandex'. Несколько одновременно.
alter table products add column if not exists delivery_services jsonb;

-- Бэкфилл из старого текстового поля delivery.
update products set delivery_services = (
  case
    when delivery ilike '%both%'                                  then '["cdek","yandex"]'::jsonb
    when delivery ilike '%ozon%' or delivery ilike '%озон%'       then '["ozon"]'::jsonb
    when delivery ilike '%yandex%' or delivery ilike '%яндекс%'   then '["yandex"]'::jsonb
    else '["cdek"]'::jsonb
  end
) where delivery_services is null;

alter table products alter column delivery_services set default '["cdek"]'::jsonb;

-- ─── 2. Отметка "отправлен" на заказах ─────────────────────────────
alter table order_notifications add column if not exists shipped     boolean not null default false;
alter table order_notifications add column if not exists shipped_at   timestamptz;

-- ─── 3. Дополнительные админ-пользователи ──────────────────────────
-- Владелец по-прежнему входит по ADMIN_PASSWORD (роль owner, полный доступ).
-- Здесь — сотрудники с ролью processor: видят заказы/доставку и отмечают отправку,
-- но не управляют товарами/настройками.
create table if not exists admin_users (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  username   text not null,
  password   text not null,
  role       text not null default 'processor'  -- 'processor' | 'owner'
);

create unique index if not exists admin_users_password_idx on admin_users (password);

-- Доступ только через service role (серверные роуты).
alter table admin_users enable row level security;

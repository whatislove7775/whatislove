-- Предзаказы: запускать один раз в Supabase → SQL Editor

-- 1. Добавляем переключатель режима предзаказа на товаре
ALTER TABLE products ADD COLUMN IF NOT EXISTS preorder_mode boolean NOT NULL DEFAULT false;

-- 2. Таблица предзаказов
CREATE TABLE IF NOT EXISTS preorders (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   timestamptz NOT NULL DEFAULT now(),
  product_id   bigint      NOT NULL,
  product_name text,
  product_slug text,
  size         text,
  name         text        NOT NULL,
  telegram     text        NOT NULL,
  notified_at  timestamptz,
  admin_notified boolean   NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS preorders_product_id_idx ON preorders(product_id);
CREATE INDEX IF NOT EXISTS preorders_notified_idx   ON preorders(notified_at NULLS FIRST);

-- Доступ только через service role
ALTER TABLE preorders ENABLE ROW LEVEL SECURITY;

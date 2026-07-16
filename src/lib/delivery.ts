// Единый список сервисов доставки. Ключи хранятся в products.delivery_services.
export const DELIVERY_SERVICES = [
  { key: 'cdek', label: 'СДЭК' },
  { key: 'ozon', label: 'Ozon' },
  { key: 'yandex', label: 'Яндекс Доставка' },
] as const;

export type DeliveryKey = (typeof DELIVERY_SERVICES)[number]['key'];

const LABEL_BY_KEY: Record<string, string> = Object.fromEntries(
  DELIVERY_SERVICES.map((s) => [s.key, s.label])
);

export function serviceLabel(key: string): string {
  return LABEL_BY_KEY[key] ?? key;
}

// Нормализуем значение из БД (jsonb-массив, строка или старый текст) в массив ключей.
export function normalizeServices(raw: any): DeliveryKey[] {
  let keys: string[] = [];
  if (Array.isArray(raw)) {
    keys = raw.map(String);
  } else if (typeof raw === 'string' && raw.trim()) {
    // Старое текстовое поле delivery: 'both' | 'cdek' | 'yandex' | 'ozon' | свободный текст
    const v = raw.toLowerCase();
    if (v.includes('both')) keys = ['cdek', 'yandex'];
    else if (v.includes('ozon') || v.includes('озон')) keys = ['ozon'];
    else if (v.includes('yandex') || v.includes('яндекс')) keys = ['yandex'];
    else keys = ['cdek'];
  }
  // Фильтруем по известным ключам, сохраняя порядок из DELIVERY_SERVICES.
  const set = new Set(keys);
  const result = DELIVERY_SERVICES.map((s) => s.key).filter((k) => set.has(k));
  return (result.length ? result : ['cdek']) as DeliveryKey[];
}

export function serviceLabels(raw: any): string[] {
  return normalizeServices(raw).map(serviceLabel);
}

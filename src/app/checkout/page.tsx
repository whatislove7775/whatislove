'use client';
import { useState, useEffect, useRef, useMemo } from 'react'; // useRef used for dropdown
import Breadcrumbs from '@/components/Breadcrumbs';
import { useCartStore } from '@/store/cartStore';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { DELIVERY_SERVICES, DeliveryKey, normalizeServices, serviceLabel } from '@/lib/delivery';

function DeliveryAddressBlock({ serviceKey, city, address, setAddress, setDeliveryCost, priceFor }: any) {
  const price: number | null = priceFor(serviceKey, city);
  const unavailable = price === null;
  const label = serviceLabel(serviceKey);

  useEffect(() => {
    setDeliveryCost(unavailable ? 0 : (price ?? 0));
  }, [city, serviceKey, price, unavailable]);

  if (unavailable) {
    return (
      <div style={{ fontSize: '13px', fontWeight: 700, color: '#c00', padding: '10px 0' }}>
        {label} доступна только в Москве, Санкт-Петербурге и городах-миллионниках. Для других городов выберите другой сервис.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '14px', textTransform: 'lowercase' }}>адрес доставки или пункт выдачи</label>
      <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required placeholder="улица, дом, квартира или адрес ПВЗ" style={{ padding: '12px', border: '1px solid #ccc', fontFamily: 'inherit', fontSize: '14px', width: '100%', boxSizing: 'border-box' }} />
      <span style={{ fontSize: '12px', color: '#888', lineHeight: 1.4 }}>
        можно указать любой адрес или адрес пункта выдачи — мы доставим в ближайший удобный
      </span>
      {price != null && price > 0 && <span style={{ fontSize: '12px', fontWeight: 700 }}>{price} руб — доставка {label}</span>}
    </div>
  );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizePhoneDigits(phone: string): string {
  return phone.replace(/\D/g, '');
}

function isValidPhone(phone: string): boolean {
  const digits = normalizePhoneDigits(phone);
  return digits.length === 10 || (digits.length === 11 && /^[78]/.test(digits));
}

export default function CheckoutPage() {
  const { items, updateQuantity, updateItemSize, totalPrice, clearCart } = useCartStore();
  const [address, setAddress] = useState('');
  const [deliveryService, setDeliveryService] = useState<DeliveryKey>('cdek');
  const [deliveryCost, setDeliveryCost] = useState(0);
  const [productData, setProductData] = useState<Record<string, { imageUrl?: string; oldPrice?: number; sizes: number[] }>>({});
  const [productDeliv, setProductDeliv] = useState<Record<string, DeliveryKey[]>>({});
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [touched, setTouched] = useState<{ email?: boolean; phone?: boolean }>({});

  const emailValid = EMAIL_RE.test(email.trim());
  const phoneValid = isValidPhone(phone);

  useEffect(() => {
    if (items.length === 0) return;
    const ids = Array.from(new Set(items.map((i) => i.id)));
    supabase.from('products').select('id, image_url, oldPrice, product_variants(attribute_value)').in('id', ids)
      .then(({ data }) => {
        if (data) {
          const map: Record<string, { imageUrl?: string; oldPrice?: number; sizes: number[] }> = {};
          data.forEach((p: any) => {
            const sizes = (p.product_variants || []).map((v: any) => Number(v.attribute_value)).sort((a: number, b: number) => a - b);
            map[p.id] = { imageUrl: p.image_url || undefined, oldPrice: p.oldPrice || undefined, sizes };
          });
          setProductData(map);
        }
      });
    // Отдельный (best-effort) запрос за сервисами доставки — не ломается, если колонки ещё нет.
    supabase.from('products').select('id, delivery_services').in('id', ids)
      .then(({ data }) => {
        if (data) {
          const map: Record<string, DeliveryKey[]> = {};
          data.forEach((p: any) => { map[p.id] = normalizeServices(p.delivery_services); });
          setProductDeliv(map);
        }
      });
  }, [items.length]);

  const [isLoading, setIsLoading] = useState(false);
  const [consent, setConsent] = useState(false);
  const [city, setCity] = useState('');

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const ALL_KEYS = DELIVERY_SERVICES.map((s) => s.key) as DeliveryKey[];

  // Доступные сервисы = пересечение доступных сервисов по всем товарам корзины.
  const availableKeys = useMemo<DeliveryKey[]>(() => {
    const ids = Array.from(new Set(items.map((i) => i.id)));
    if (ids.length === 0) return ALL_KEYS;
    let acc: DeliveryKey[] | null = null;
    for (const id of ids) {
      const list = (productDeliv[id]?.length ? productDeliv[id] : ALL_KEYS);
      acc = acc === null ? [...list] : acc.filter((k) => list.includes(k));
    }
    const result = acc ?? ALL_KEYS;
    return result.length ? result : ALL_KEYS; // если пересечение пустое — показываем все
  }, [items, productDeliv]);

  // Если выбранный сервис стал недоступен — переключаемся на первый доступный.
  useEffect(() => {
    if (!availableKeys.includes(deliveryService)) {
      setDeliveryService(availableKeys[0]);
    }
  }, [availableKeys]);

  const MILLIONS = ['новосибирск', 'екатеринбург', 'казань', 'нижний новгород', 'челябинск', 'самара', 'уфа', 'ростов', 'краснодар', 'омск', 'воронеж', 'пермь', 'волгоград', 'красноярск', 'саратов', 'тюмень', 'тольятти', 'ижевск', 'барнаул', 'ульяновск', 'иркутск', 'хабаровск', 'ярославль', 'владивосток', 'махачкала', 'томск'];

  const getCdekPrice = (c: string): number => {
    const v = c.toLowerCase().trim();
    if (/москв/.test(v)) return 400;
    if (/петербург|питер|ленинград/.test(v)) return 450;
    if (MILLIONS.some(m => v.includes(m))) return 550;
    return 750;
  };

  const getOzonPrice = (c: string): number => {
    const v = c.toLowerCase().trim();
    if (/москв/.test(v)) return 350;
    if (/петербург|питер|ленинград/.test(v)) return 400;
    if (MILLIONS.some(m => v.includes(m))) return 500;
    return 700;
  };

  const getYandexPrice = (c: string): number | null => {
    const v = c.toLowerCase().trim();
    if (/москв/.test(v)) return 450;
    if (/петербург|питер|ленинград/.test(v)) return 500;
    if (MILLIONS.some(m => v.includes(m))) return 600;
    return null; // Яндекс недоступен в малых городах
  };

  // Цена по ключу сервиса. Возвращает null, если сервис недоступен для этого города.
  const priceFor = (key: DeliveryKey, c: string): number | null => {
    if (!c) return 0;
    if (key === 'cdek') return getCdekPrice(c);
    if (key === 'ozon') return getOzonPrice(c);
    if (key === 'yandex') return getYandexPrice(c);
    return 0;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  useEffect(() => {
    setAddress('');
    setDeliveryCost(0);
  }, [deliveryService]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (items.length === 0) return;
    if (!emailValid || !phoneValid) {
      setTouched({ email: true, phone: true });
      return;
    }
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const orderData = {
      name: formData.get('name'),
      email: email.trim(),
      phone: phone.trim(),
      tg: formData.get('tg'),
      city: formData.get('city'),
      delivery: formData.get('delivery'),
      address: address,
      deliveryCost: deliveryCost,
      items: items,
      total: totalPrice(),
      website: formData.get('website'),
    };

    try {
      const res = await fetch('/api/yookassa/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderData }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(`Ошибка оплаты: ${data.error}`);
        setIsLoading(false);
        return;
      }
      window.location.href = data.confirmation_url;
    } catch {
      alert('Произошла ошибка при создании платежа.');
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center' }}>
      <div style={{ width: '100%' }}>
        <Breadcrumbs path={[
          { name: 'WH4T!SLOV3', href: '/', icon: '📁' },
          { name: 'МАГАЗИН', href: '/products', icon: '📦' },
          { name: 'ЗАКАЗ', icon: '💳' },
        ]} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '450px', marginTop: '20px' }}>
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', fontWeight: 700, marginTop: '50px' }}>корзина пуста...</div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>

            {/* Honeypot: скрыто от людей стилями, боты часто заполняют все поля вслепую */}
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}
              aria-hidden="true"
            />

            {items.map((item, idx) => {
              const pData = productData[item.id];
              const oldPrice = pData?.oldPrice || Math.round(item.price * 1.4);
              const availableSizes = pData?.sizes?.length ? pData.sizes : [16, 17, 18, 19];
              return (
                <div key={`${item.id}-${item.size}-${idx}`} style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
                  {(() => {
                    const imgUrl = item.imageUrl || pData?.imageUrl || null;
                    return (
                      <div style={{ width: '120px', height: '120px', backgroundColor: '#e5e5e5', position: 'relative', flexShrink: 0, overflow: 'hidden' }}>
                        {imgUrl ? (
                          <Image src={imgUrl} alt={item.name} fill sizes="120px" style={{ objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '20px' }}>&lt;3</div>
                        )}
                      </div>
                    );
                  })()}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '14px', textTransform: 'lowercase' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                      <span style={{ fontSize: '16px' }}>{item.name}</span>
                      <span style={{ userSelect: 'none' }}>
                        {item.quantity}
                        <span onClick={() => updateQuantity(item.id, item.size, 1)} style={{ cursor: 'pointer', margin: '0 4px', color: '#000' }}>[+]</span>
                        <span onClick={() => updateQuantity(item.id, item.size, -1)} style={{ cursor: 'pointer', color: '#000' }}>[-]</span>
                      </span>
                    </div>
                    <div style={{ fontWeight: 800, marginTop: '5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '13px' }}>{oldPrice * item.quantity} руб</span>
                      <span>{item.price * item.quantity} руб со скидкой</span>
                    </div>
                    <div style={{ marginTop: '15px', lineHeight: '1.4' }}>
                      хирургическая сталь<br />
                      размер:<br />
                      <span style={{ fontWeight: 800, fontSize: '15px', display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                        {availableSizes.map((s) => {
                          const isSelected = item.size === s;
                          return (
                            <span key={s} onClick={() => updateItemSize(item.id, item.size, s)} style={{ cursor: 'pointer', userSelect: 'none', display: 'inline-flex', alignItems: 'center' }}>
                              {isSelected ? (
                                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#d32f2f', border: '1.5px solid #d32f2f', borderRadius: '50%', minWidth: '26px', height: '26px', padding: '0 4px' }}>{s}</span>
                              ) : `[ ${s} ]`}
                            </span>
                          );
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            <div style={{ fontWeight: 700, marginBottom: '20px', textTransform: 'lowercase' }}>данные для доставки:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '14px', marginBottom: '5px', textTransform: 'lowercase' }}>ФИО получателя (полностью)</label>
                <input name="name" required type="text" placeholder="Петров Петр Петрович" style={{ padding: '12px', border: '1px solid #ccc', fontFamily: 'inherit', fontSize: '14px', width: '100%', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '14px', marginBottom: '5px', textTransform: 'lowercase' }}>email</label>
                <input
                  name="email"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  style={{ padding: '12px', border: `1px solid ${touched.email && !emailValid ? '#c00' : '#ccc'}`, fontFamily: 'inherit', fontSize: '14px', width: '100%', boxSizing: 'border-box' }}
                />
                {touched.email && !emailValid && (
                  <span style={{ fontSize: '12px', color: '#c00', marginTop: '4px' }}>укажите корректный email</span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '14px', marginBottom: '5px', textTransform: 'lowercase' }}>телефон</label>
                <input
                  name="phone"
                  required
                  type="tel"
                  placeholder="+7 (000) 000-00 00"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                  style={{ padding: '12px', border: `1px solid ${touched.phone && !phoneValid ? '#c00' : '#ccc'}`, fontFamily: 'inherit', fontSize: '14px', width: '100%', boxSizing: 'border-box' }}
                />
                {touched.phone && !phoneValid && (
                  <span style={{ fontSize: '12px', color: '#c00', marginTop: '4px' }}>укажите корректный номер телефона</span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '14px', marginBottom: '5px', textTransform: 'lowercase' }}>telegram</label>
                <input name="tg" required type="text" placeholder="@username" style={{ padding: '12px', border: '1px solid #ccc', fontFamily: 'inherit', fontSize: '14px', width: '100%', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '14px', marginBottom: '5px', textTransform: 'lowercase' }}>город</label>
                <div style={{ position: 'relative' }}>
                  <input name="city" required type="text" placeholder="Москва" value={city} onChange={(e) => setCity(e.target.value)} style={{ padding: '12px', border: '1px solid #ccc', fontFamily: 'inherit', fontSize: '14px', width: '100%', boxSizing: 'border-box' }} />
                  <span style={{ position: 'absolute', right: '12px', top: '12px', fontSize: '14px' }}>🔍</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '14px', marginBottom: '5px', textTransform: 'lowercase' }}>служба доставки</label>
                <input type="hidden" name="delivery" value={serviceLabel(deliveryService)} />
                <div ref={dropdownRef} style={{ position: 'relative', width: '100%', userSelect: 'none' }}>
                  <div onClick={() => setIsDropdownOpen(!isDropdownOpen)} style={{ padding: '12px', border: '1px solid #ccc', fontFamily: 'inherit', fontSize: '14px', width: '100%', boxSizing: 'border-box', backgroundColor: 'white', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{serviceLabel(deliveryService)}</span>
                    <span style={{ fontSize: '12px', transform: isDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease', lineHeight: 1 }}>▼</span>
                  </div>
                  {isDropdownOpen && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'white', border: '1px solid #000', zIndex: 10, marginTop: '-1px' }}>
                      {availableKeys.map((key, idx) => (
                        <div key={key} onClick={() => { setDeliveryService(key); setIsDropdownOpen(false); }} style={{ padding: '12px', fontSize: '14px', cursor: 'pointer', borderBottom: idx < availableKeys.length - 1 ? '1px solid #eee' : 'none' }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f5f5f5')} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}>
                          {serviceLabel(key)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <DeliveryAddressBlock
                serviceKey={deliveryService}
                city={city}
                address={address}
                setAddress={setAddress}
                setDeliveryCost={setDeliveryCost}
                priceFor={priceFor}
              />


              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '10px' }}>
                <input
                  type="checkbox"
                  id="consent"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  style={{ width: '16px', height: '16px', flexShrink: 0, marginTop: '2px', cursor: 'pointer', accentColor: '#000' }}
                />
                <label htmlFor="consent" style={{ fontSize: '13px', cursor: 'pointer', lineHeight: 1.4, fontWeight: 500 }}>
                  я согласен на{' '}
                  <Link href="/privacy" style={{ textDecoration: 'underline', color: 'inherit' }}>
                    обработку персональных данных
                  </Link>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', borderTop: '1px solid #000', paddingTop: '20px' }}>
                <div style={{ fontWeight: 800, fontSize: '18px', textTransform: 'lowercase' }}>
                  итог: {totalPrice() + deliveryCost} руб
                </div>
                <button type="submit" disabled={isLoading || !address || !consent || !emailValid || !phoneValid} style={{ background: 'transparent', border: 'none', fontWeight: 800, fontSize: '16px', cursor: (isLoading || !address || !consent || !emailValid || !phoneValid) ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: (isLoading || !address || !consent || !emailValid || !phoneValid) ? 0.5 : 1 }}>
                  {isLoading ? '[отправка...]' : '[заказать] 📦'}
                </button>
              </div>

            </div>
          </form>
        )}
      </div>
    </div>
  );
}

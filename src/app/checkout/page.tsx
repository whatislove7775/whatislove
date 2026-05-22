'use client';
import { useState, useEffect, useRef } from 'react';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useCartStore } from '@/store/cartStore';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

function DeliveryAddressBlock({ deliveryService, city, address, setAddress, deliveryCost, setDeliveryCost, getCdekPrice, getYandexPrice }: any) {
  const isCdek = deliveryService === 'СДЭК';
  const yPrice = !isCdek ? getYandexPrice(city) : null;
  const unavailable = !isCdek && yPrice === null;

  useEffect(() => {
    if (isCdek) return; // СДЭК цена ставится из виджета onChoose
    setDeliveryCost(unavailable ? 0 : yPrice);
  }, [city, deliveryService]);

  if (isCdek) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '14px', textTransform: 'lowercase' }}>пункт выдачи</label>
        <div style={{ position: 'relative' }}>
          <input type="text" value={address} readOnly required placeholder="выберите на карте ниже" style={{ padding: '12px', border: '1px solid #ccc', fontFamily: 'inherit', fontSize: '14px', width: '100%', boxSizing: 'border-box', backgroundColor: '#f5f5f5' }} />
          <span style={{ position: 'absolute', right: '12px', top: '12px', fontSize: '14px' }}>🔍</span>
        </div>
        {deliveryCost > 0 && <span style={{ fontSize: '12px', fontWeight: 700 }}>{deliveryCost} руб — доставка СДЭК</span>}
      </div>
    );
  }

  if (unavailable) {
    return (
      <div style={{ fontSize: '13px', fontWeight: 700, color: '#c00', padding: '10px 0' }}>
        Яндекс Доставка доступна только в Москве, Санкт-Петербурге и городах-миллионниках. Для других городов выберите СДЭК.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '14px', textTransform: 'lowercase' }}>адрес доставки (улица, дом, квартира)</label>
      <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required placeholder="ул. Ленина, д. 1, кв. 5" style={{ padding: '12px', border: '1px solid #ccc', fontFamily: 'inherit', fontSize: '14px', width: '100%', boxSizing: 'border-box' }} />
      <span style={{ fontSize: '12px', fontWeight: 700 }}>{yPrice} руб — доставка Яндекс</span>
    </div>
  );
}

export default function CheckoutPage() {
  const { items, updateQuantity, updateItemSize, totalPrice, clearCart } = useCartStore();
  const [address, setAddress] = useState('');
  const [deliveryService, setDeliveryService] = useState('СДЭК');
  const [deliveryCost, setDeliveryCost] = useState(0);
  const [productData, setProductData] = useState<Record<string, { imageUrl?: string; oldPrice?: number; sizes: number[] }>>({});

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
  }, [items.length]);

  const [isLoading, setIsLoading] = useState(false);
  const [consent, setConsent] = useState(false);
  const [city, setCity] = useState('');

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const deliveryOptions = ['СДЭК', 'Яндекс Доставка'];

  const MILLIONS = ['новосибирск', 'екатеринбург', 'казань', 'нижний новгород', 'челябинск', 'самара', 'уфа', 'ростов', 'краснодар', 'омск', 'воронеж', 'пермь', 'волгоград', 'красноярск', 'саратов', 'тюмень', 'тольятти', 'ижевск', 'барнаул', 'ульяновск', 'иркутск', 'хабаровск', 'ярославль', 'владивосток', 'махачкала', 'томск'];

  const getCdekPrice = (c: string): number => {
    const v = c.toLowerCase().trim();
    if (/москв/.test(v)) return 400;
    if (/петербург|питер|ленинград/.test(v)) return 450;
    if (MILLIONS.some(m => v.includes(m))) return 550;
    return 750;
  };

  const getYandexPrice = (c: string): number => {
    const v = c.toLowerCase().trim();
    if (/москв/.test(v)) return 450;
    if (/петербург|питер|ленинград/.test(v)) return 500;
    if (MILLIONS.some(m => v.includes(m))) return 600;
    return null as any; // Яндекс недоступен в малых городах
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
    const container = document.getElementById('cdek-map');
    if (!container || items.length === 0 || deliveryService !== 'СДЭК') return;

    const init = () => {
      if (container.innerHTML !== '') return;
      new (window as any).CDEKWidget({
        from: 'Москва',
        root: 'cdek-map',
        apiKey: 'c18d2701-3a00-462e-9e83-6e1547bab5a3',
        servicePath: '/api/cdek',
        defaultLocation: 'Москва',
        hideDeliveryOptions: { door: true },
        onChoose: (_type: any, tariff: any, addressInfo: any) => {
          const raw = addressInfo.address
            ? `${addressInfo.cityName || ''}, ${addressInfo.address}`.trim()
            : (addressInfo.name || 'Выбран ПВЗ');
          setAddress(raw.startsWith(',') ? raw.substring(1).trim() : raw);
          setDeliveryCost(tariff?.delivery_sum || getCdekPrice(city));
        },
      });
    };

    if ((window as any).CDEKWidget) {
      init();
    } else {
      const existing = document.querySelector('script[src="https://cdn.jsdelivr.net/npm/@cdek-it/widget@3"]');
      if (!existing) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@cdek-it/widget@3';
        script.onload = init;
        document.body.appendChild(script);
      } else {
        existing.addEventListener('load', init);
      }
    }
  }, [items.length, deliveryService]);

  useEffect(() => {
    setAddress('');
    setDeliveryCost(0);
  }, [deliveryService]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (items.length === 0) return;
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const orderData = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      tg: formData.get('tg'),
      city: formData.get('city'),
      delivery: formData.get('delivery'),
      address: address,
      deliveryCost: deliveryCost,
      items: items,
      total: totalPrice(),
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
          { name: 'ПРОДУКТЫ', href: '/products', icon: '📦' },
          { name: 'ЗАКАЗ', icon: '💳' },
        ]} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '450px', marginTop: '20px' }}>
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', fontWeight: 700, marginTop: '50px' }}>корзина пуста...</div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>

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
                <input name="email" required type="email" style={{ padding: '12px', border: '1px solid #ccc', fontFamily: 'inherit', fontSize: '14px', width: '100%', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '14px', marginBottom: '5px', textTransform: 'lowercase' }}>телефон</label>
                <input name="phone" required type="tel" placeholder="+7 (000) 000-00 00" style={{ padding: '12px', border: '1px solid #ccc', fontFamily: 'inherit', fontSize: '14px', width: '100%', boxSizing: 'border-box' }} />
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
                <input type="hidden" name="delivery" value={deliveryService} />
                <div ref={dropdownRef} style={{ position: 'relative', width: '100%', userSelect: 'none' }}>
                  <div onClick={() => setIsDropdownOpen(!isDropdownOpen)} style={{ padding: '12px', border: '1px solid #ccc', fontFamily: 'inherit', fontSize: '14px', width: '100%', boxSizing: 'border-box', backgroundColor: 'white', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{deliveryService}</span>
                    <span style={{ fontSize: '12px', transform: isDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease', lineHeight: 1 }}>▼</span>
                  </div>
                  {isDropdownOpen && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'white', border: '1px solid #000', zIndex: 10, marginTop: '-1px' }}>
                      {deliveryOptions.map((option, idx) => (
                        <div key={option} onClick={() => { setDeliveryService(option); setIsDropdownOpen(false); }} style={{ padding: '12px', fontSize: '14px', cursor: 'pointer', borderBottom: idx < deliveryOptions.length - 1 ? '1px solid #eee' : 'none' }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f5f5f5')} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}>
                          {option}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <DeliveryAddressBlock
                deliveryService={deliveryService}
                city={city}
                address={address}
                setAddress={setAddress}
                deliveryCost={deliveryCost}
                setDeliveryCost={setDeliveryCost}
                getCdekPrice={getCdekPrice}
                getYandexPrice={getYandexPrice}
              />

              {/* СДЭК: карта виджета */}
              <div id="cdek-map" style={{ width: '100%', height: '400px', backgroundColor: '#f9f9f9', display: deliveryService === 'СДЭК' ? 'block' : 'none' }} />

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
                <button type="submit" disabled={isLoading || !address || !consent} style={{ background: 'transparent', border: 'none', fontWeight: 800, fontSize: '16px', cursor: (isLoading || !address || !consent) ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: (isLoading || !address || !consent) ? 0.5 : 1 }}>
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

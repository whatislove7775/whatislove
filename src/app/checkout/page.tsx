'use client';
import { useState, useEffect, useRef } from 'react';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useCartStore } from '@/store/cartStore';
import Link from 'next/link';

export default function CheckoutPage() {
  const { items, updateQuantity, updateItemSize, totalPrice, clearCart } = useCartStore();
  const [address, setAddress] = useState('');
  const [deliveryService, setDeliveryService] = useState('СДЭК');
  const [deliveryCost, setDeliveryCost] = useState(0);
  
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const deliveryOptions = ['СДЭК', 'Яндекс Доставка', 'Ozon', 'Wildberries', '5post'];

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
    if (!container || items.length === 0) return;

    const init = () => {
      if (!(window as any)._cdekWidgetLoaded && container.innerHTML === '') {
        (window as any)._cdekWidgetLoaded = true;
        new (window as any).CDEKWidget({
          from: 'Москва',
          root: 'cdek-map',
          apiKey: 'c18d2701-3a00-462e-9e83-6e1547bab5a3', 
          servicePath: '/api/cdek',
          defaultLocation: 'Москва',
          hideDeliveryOptions: {
            door: true 
          },
          onChoose: (type: any, tariff: any, addressInfo: any) => {
            const finalAddress = addressInfo.address ? `${addressInfo.cityName || ''}, ${addressInfo.address}`.trim() : (addressInfo.name || 'Выбран ПВЗ');
            setAddress(finalAddress.startsWith(',') ? finalAddress.substring(1).trim() : finalAddress);
            
            if (tariff && tariff.delivery_sum) {
              setDeliveryCost(tariff.delivery_sum);
            } else {
              setDeliveryCost(350); 
            }
          }
        });
      }
    };

    if ((window as any).CDEKWidget) {
      init();
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@cdek-it/widget@3';
      script.onload = init;
      document.body.appendChild(script);
    }
  }, [items.length]);

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
      total: totalPrice()
    };

    try {
      const res = await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderData })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        alert(`Ошибка отправки: ${data.error}`);
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
      clearCart();
    } catch (error) {
      alert('Произошла критическая ошибка при отправке запроса.');
      setIsLoading(false);
    }
  };

  // ОБНОВЛЕННЫЙ ЭКРАН УСПЕХА
if (isSuccess) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        flex: 1, // Работает как пружина, занимает ровно доступное место
        width: '100%',
        textAlign: 'center' 
      }}>
        <h1 style={{ fontWeight: 800, textTransform: 'uppercase' }}>ЗАКАЗ УСПЕШНО ОФОРМЛЕН! &lt;3</h1>
        <p style={{ fontWeight: 500, marginTop: '20px' }}>Мы свяжемся с тобой в Telegram для подтверждения.</p>
        <Link href="/" style={{ 
          marginTop: '40px', 
          fontWeight: 700, 
          textDecoration: 'none', 
          color: '#000' 
        }}>
          [ вернуться в магазин ]
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center' }}>
      
      <div style={{ width: '100%' }}>
        <Breadcrumbs path={[
          { name: 'PRODUCT$', href: '/products', icon: '📦' },
          { name: 'ЗАКАЗ', icon: '💳' }
        ]} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '450px', marginTop: '20px' }}>
        
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', fontWeight: 700, marginTop: '50px' }}>корзина пуста...</div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
            
            {items.map((item, idx) => {
              const oldPrice = Math.round(item.price * 1.4); 

              return (
                <div key={`${item.id}-${item.size}-${idx}`} style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
                  <div style={{ width: '120px', height: '120px', backgroundColor: '#e5e5e5', border: '1px solid #000', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, transform: 'translate(-50%, -50%)', fontWeight: 300, fontSize: '18px', lineHeight: '0.5' }}>+</div>
                    <div style={{ position: 'absolute', top: 0, right: 0, transform: 'translate(50%, -50%)', fontWeight: 300, fontSize: '18px', lineHeight: '0.5' }}>+</div>
                    <div style={{ position: 'absolute', bottom: 0, left: 0, transform: 'translate(-50%, 50%)', fontWeight: 300, fontSize: '18px', lineHeight: '0.5' }}>+</div>
                    <div style={{ position: 'absolute', bottom: 0, right: 0, transform: 'translate(50%, 50%)', fontWeight: 300, fontSize: '18px', lineHeight: '0.5' }}>+</div>
                    <span style={{ fontWeight: 800, fontSize: '20px' }}>3&lt;</span>
                  </div>
                  
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
                      <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '13px' }}>
                        {oldPrice * item.quantity}₽
                      </span>
                      <span>{item.price * item.quantity}₽ со скидкой</span>
                    </div>

                    <div style={{ marginTop: '15px', lineHeight: '1.4' }}>
                      хирургическая сталь<br/>
                      размер:<br/>
                      <span style={{ fontWeight: 800, fontSize: '15px', letterSpacing: '0.5px' }}>
                        {[16, 17, 18, 19].map((s) => {
                          const isSelected = item.size === s;
                          return (
                            <span 
                              key={s} 
                              onClick={() => updateItemSize(item.id, item.size, s)}
                              style={{ color: isSelected ? 'red' : '#000', cursor: 'pointer', transition: 'color 0.2s ease' }}
                            >
                              {isSelected ? `[(${s})]` : `[${s}]`}
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
                  <input name="city" required type="text" placeholder="Москва" style={{ padding: '12px', border: '1px solid #ccc', fontFamily: 'inherit', fontSize: '14px', width: '100%', boxSizing: 'border-box' }} />
                  <span style={{ position: 'absolute', right: '12px', top: '12px', fontSize: '14px' }}>🔍</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '14px', marginBottom: '5px', textTransform: 'lowercase' }}>служба доставки</label>
                
                <input type="hidden" name="delivery" value={deliveryService} />
                
                <div ref={dropdownRef} style={{ position: 'relative', width: '100%', userSelect: 'none' }}>
                  <div 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    style={{ 
                      padding: '12px', 
                      border: '1px solid #ccc', 
                      fontFamily: 'inherit', 
                      fontSize: '14px', 
                      width: '100%', 
                      boxSizing: 'border-box', 
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span>{deliveryService}</span>
                    <span style={{ 
                      fontSize: '12px', 
                      transform: isDropdownOpen ? 'rotate(180deg)' : 'none', 
                      transition: 'transform 0.2s ease',
                      lineHeight: 1
                    }}>
                      ▼
                    </span>
                  </div>

                  {isDropdownOpen && (
                    <div style={{ 
                      position: 'absolute', 
                      top: '100%', 
                      left: 0, 
                      right: 0, 
                      backgroundColor: 'white', 
                      border: '1px solid #000', 
                      zIndex: 10,
                      marginTop: '-1px' 
                    }}>
                      {deliveryOptions.map((option) => (
                        <div
                          key={option}
                          onClick={() => {
                            setDeliveryService(option);
                            setIsDropdownOpen(false);
                          }}
                          style={{ 
                            padding: '12px', 
                            fontSize: '14px',
                            cursor: 'pointer', 
                            borderBottom: option !== '5post' ? '1px solid #eee' : 'none',
                            transition: 'background-color 0.1s'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '14px', marginBottom: '5px', textTransform: 'lowercase' }}>пункт выдачи</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)} 
                    readOnly={deliveryService === 'СДЭК'} 
                    required
                    placeholder={deliveryService === 'СДЭК' ? "выберите на карте ниже" : "введите адрес пункта выдачи текстом"} 
                    style={{ 
                      padding: '12px', 
                      border: '1px solid #ccc', 
                      fontFamily: 'inherit', 
                      fontSize: '14px', 
                      width: '100%', 
                      boxSizing: 'border-box', 
                      backgroundColor: deliveryService === 'СДЭК' ? '#f5f5f5' : '#fff' 
                    }} 
                  />
                  {deliveryService === 'СДЭК' && <span style={{ position: 'absolute', right: '12px', top: '12px', fontSize: '14px' }}>🔍</span>}
                </div>
                {deliveryCost > 0 && <span style={{ fontSize: '12px', marginTop: '5px', fontWeight: 700 }}>+ {deliveryCost}₽ за доставку {deliveryService}</span>}
              </div>

              <div 
                id="cdek-map" 
                style={{ 
                  width: '100%', 
                  height: '400px', 
                  backgroundColor: '#f9f9f9', 
                  display: deliveryService === 'СДЭК' ? 'block' : 'none' 
                }}
              ></div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', borderTop: '1px solid #000', paddingTop: '20px' }}>
                <div style={{ fontWeight: 800, fontSize: '18px', textTransform: 'lowercase' }}>
                  итог: {totalPrice() + deliveryCost}₽
                </div>
                
                <button 
                  type="submit" 
                  disabled={isLoading || !address}
                  style={{ background: 'transparent', border: 'none', fontWeight: 800, fontSize: '16px', cursor: (isLoading || !address) ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: (isLoading || !address) ? 0.5 : 1 }}
                >
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

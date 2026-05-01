'use client';
import Breadcrumbs from '@/components/Breadcrumbs';
import Link from 'next/link';

export default function InfoPage() {
  return (
    <div style={{ width: '100%', maxWidth: '1000px', padding: '20px' }}>
      <Breadcrumbs path={[
        { name: 'WH4T!SLOV3', href: '/', icon: '📁' },
        { name: 'PRODUCT$', href: '/products', icon: '📦' },
        { name: 'ИНФО', icon: '❓' }
      ]} />
      
      {/* Остальной контент ИНФО... */}

      {/* Основной блок с информацией */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', marginTop: '60px' }}>
        
        {/* Строка 1: Доставка */}
        <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
          <div style={{ width: '250px', fontWeight: 'bold', textAlign: 'right' }}>
            [СРОК ДОСТАВКИ]
          </div>
          <div style={{ flex: 1, maxWidth: '500px', lineHeight: '1.4' }}>
            Доставка осуществляется почтовой службой СДЭК,<br/>
            Почта Росии, Озон доставка. Отправка в течение 60 дней
          </div>
        </div>

        {/* Строка 2: Возврат */}
        <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
          <div style={{ width: '250px', fontWeight: 'bold', textAlign: 'right' }}>
            [УСЛОВИЯ ВОЗВРАТА]
          </div>
          <div style={{ flex: 1, maxWidth: '500px', lineHeight: '1.4' }}>
            Если с товаром действительно что-то не так и вы<br/>
            предоставите доказательства, мы пойдем вам<br/>
            навстречу
          </div>
        </div>

        {/* Строка 3: Контакты */}
        <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
          <div style={{ width: '250px', fontWeight: 'bold', textAlign: 'right' }}>
            [КОНТАКТЫ]
          </div>
          <div style={{ flex: 1, maxWidth: '500px', lineHeight: '1.4' }}>
            telegram t.me/babydonthurtmovich
          </div>
        </div>

      </div>
    </div>
  );
}

'use client';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function InfoPage() {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}>
      
      {/* Хлебные крошки сверху */}
      <div style={{ width: '100%', alignSelf: 'flex-start' }}>
        <Breadcrumbs path={[
          { name: 'WH4T!SLOV3', href: '/', icon: '📁' },
          { name: 'PRODUCT$', href: '/products', icon: '📦' },
          { name: 'ИНФО', icon: '❓' }
        ]} />
      </div>

      {/* Основной блок по центру (стягивает всё доступное место) */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        flex: 1, 
        width: '100%',
        paddingBottom: '5vh' // Немного приподнимаем над футером для визуального баланса
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Строка 1: Доставка */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            <div style={{ width: '200px', fontWeight: 800, textAlign: 'right' }}>
              [СРОК ДОСТАВКИ]
            </div>
            <div style={{ flex: 1, maxWidth: '450px', lineHeight: '1.4', fontWeight: 500 }}>
              Доставка осуществляется почтовой службой СДЭК,<br/>
              Почта России, Озон доставка. Отправка в течение 60 дней
            </div>
          </div>

          {/* Строка 2: Возврат */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            <div style={{ width: '200px', fontWeight: 800, textAlign: 'right' }}>
              [УСЛОВИЯ ВОЗВРАТА]
            </div>
            <div style={{ flex: 1, maxWidth: '450px', lineHeight: '1.4', fontWeight: 500 }}>
              Если с товаром действительно что-то не так и вы<br/>
              предоставите доказательства, мы пойдем вам<br/>
              навстречу
            </div>
          </div>

          {/* Строка 3: Контакты */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            <div style={{ width: '200px', fontWeight: 800, textAlign: 'right' }}>
              [КОНТАКТЫ]
            </div>
            <div style={{ flex: 1, maxWidth: '450px', lineHeight: '1.4', fontWeight: 500 }}>
              telegram t.me/babydonthurtmovich
            </div>
          </div>

        </div>
      </div>
      
    </div>
  );
}

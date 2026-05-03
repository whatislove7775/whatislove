'use client';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function InfoPage() {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}>
      
      <div style={{ width: '100%', alignSelf: 'flex-start' }}>
        <Breadcrumbs path={[
          { name: 'WH4T!SLOV3', href: '/', icon: '📁' },
          { name: 'PRODUCT$', href: '/products', icon: '📦' },
          { name: 'ИНФО', icon: '❓' }
        ]} />
      </div>

      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        flex: 1, 
        width: '100%',
        paddingBottom: '5vh' 
      }}>
        {/* Обертка на всю ширину контейнера */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%', marginTop: '40px' }}>
          
          {/* Строка 1: Доставка (Такая же сетка как в подвале: 260px + 40px gap) */}
          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', columnGap: '40px', alignItems: 'start' }}>
            <div style={{ fontWeight: 800, textAlign: 'right' }}>
              [СРОК ДОСТАВКИ]
            </div>
            <div style={{ fontWeight: 500, lineHeight: '1.4', maxWidth: '450px' }}>
              Доставка осуществляется почтовой службой СДЭК,<br/>
              Почта России, Озон доставка. Отправка в течение 60 дней
            </div>
          </div>

          {/* Строка 2: Возврат */}
          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', columnGap: '40px', alignItems: 'start' }}>
            <div style={{ fontWeight: 800, textAlign: 'right' }}>
              [УСЛОВИЯ ВОЗВРАТА]
            </div>
            <div style={{ fontWeight: 500, lineHeight: '1.4', maxWidth: '450px' }}>
              Если с товаром действительно что-то не так и вы<br/>
              предоставите доказательства, мы пойдем вам<br/>
              навстречу
            </div>
          </div>

          {/* Строка 3: Контакты */}
          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', columnGap: '40px', alignItems: 'start' }}>
            <div style={{ fontWeight: 800, textAlign: 'right' }}>
              [КОНТАКТЫ]
            </div>
            <div style={{ fontWeight: 500, lineHeight: '1.4', maxWidth: '450px' }}>
              telegram t.me/babydonthurtmovich
            </div>
          </div>

        </div>
      </div>
      
    </div>
  );
}

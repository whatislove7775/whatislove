import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata = {
  title: 'О студии | WH4T!SLOV3',
  description: 'Мы — группа энтузиастов, делающих красивые и практичные продукты и дизайны. Студия wh4tislove, Москва.',
};

export default function AboutPage() {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}>

      <div style={{ width: '100%', alignSelf: 'flex-start' }}>
        <Breadcrumbs path={[
          { name: 'WH4T!SLOV3', href: '/', icon: '📁' },
          { name: 'О СТУДИИ', icon: '⭐' },
        ]} />
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        flex: 1,
        width: '100%',
        paddingBottom: '5vh',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%', marginTop: '40px' }}>

          <div className="info-grid">
            <div style={{ fontWeight: 800, textAlign: 'right' }}>[ОБ ОСНОВАТЕЛЕ]</div>
            <div style={{ fontWeight: 500, lineHeight: '1.5', maxWidth: '500px' }}>
              Я — vlad m // арт. директор и владелец этой студии дизайна,<br />
              где мы делаем дизайн-приколюхи.
            </div>
          </div>

          <div className="info-grid">
            <div style={{ fontWeight: 800, textAlign: 'right' }}>[О СТУДИИ]</div>
            <div style={{ fontWeight: 500, lineHeight: '1.5', maxWidth: '500px' }}>
              Мы работаем не только на заказы / услуги, но также мы
              производим товары и сами их продаём на нашем сайте.<br /><br />
              Студия «wh4tislove» существует более 2-х лет, за это время
              мы научились делать: сайты, мерч, дорожные знаки,
              стикерпаки, металлические / пластмассовые изделия,
              анимации и много чего ещё.
            </div>
          </div>

          <div className="info-grid">
            <div style={{ fontWeight: 800, textAlign: 'right' }}>[ЛОКАЦИЯ]</div>
            <div style={{ fontWeight: 500, lineHeight: '1.5', maxWidth: '500px' }}>
              Москва, Россия<br />
              <span style={{ color: '#888', fontSize: '12px', letterSpacing: '0.5px' }}>
                55°45′7.99″N, 37°36′56.02″E
              </span>
            </div>
          </div>

          <div className="info-grid">
            <div style={{ fontWeight: 800, textAlign: 'right' }}>[О НАС]</div>
            <div style={{ fontWeight: 500, lineHeight: '1.5', maxWidth: '500px' }}>
              Мы — группа энтузиастов, делающих красивые<br />
              и практичные продукты / дизайны.
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

'use client';
import Breadcrumbs from '@/components/Breadcrumbs';
import Link from 'next/link';

// Данные кейсов. В поле id пиши тот же слаг, что будет в URL
const projects = [
  {
    id: 'asiya-site',
    title: 'сайт для Асии',
    desc: 'сделали дизайн, фронтенд, бэкенд и т.д.',
    year: '2025'
  },
  {
    id: 'creed-rings',
    title: 'кольца для Крида',
    desc: 'сделали дизайн, модели, произвели, упаковали',
    year: '2025'
  },
  {
    id: 'asiya-merch',
    title: 'мерч для Асии',
    desc: 'сделали дизайн принтов и дизайн бирок',
    year: '2024'
  },
  {
    id: 'pins-bans',
    title: 'значки PINS-BANS',
    desc: 'сделали дизайн, модели, произвели, упаковали',
    year: '2025'
  }
];

export default function PortfolioPage() {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'inherit' }}>
      
      {/* Хлебные крошки */}
      <div style={{ width: '100%', alignSelf: 'flex-start' }}>
        <Breadcrumbs path={[
          { name: 'WH4T!SLOV3', href: '/', icon: '📁' },
          { name: 'PORTFOLIO', icon: '📂' }
        ]} />
      </div>

      {/* Сетка кейсов: 2 колонки */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '60px 40px', 
        marginTop: '40px',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {projects.map((project) => (
          <Link 
            key={project.id} 
            href={`/portfolio/${project.id}`} 
            style={{ textDecoration: 'none', color: 'inherit', display: 'flex', gap: '20px', alignItems: 'flex-start' }}
          >
            {/* Левая часть: Фото с крестиками */}
            <div style={{ position: 'relative', width: '160px', padding: '10px', flexShrink: 0, boxSizing: 'border-box' }}>
              {/* Крестики по углам контейнера */}
              <div style={{ position: 'absolute', top: 0, left: 0, transform: 'translate(-50%, -50%)', fontWeight: 300, fontSize: '18px' }}>+</div>
              <div style={{ position: 'absolute', top: 0, right: 0, transform: 'translate(50%, -50%)', fontWeight: 300, fontSize: '18px' }}>+</div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, transform: 'translate(-50%, 50%)', fontWeight: 300, fontSize: '18px' }}>+</div>
              <div style={{ position: 'absolute', bottom: 0, right: 0, transform: 'translate(50%, 50%)', fontWeight: 300, fontSize: '18px' }}>+</div>
              
              {/* Серый квадрат фото */}
              <div style={{ width: '100%', aspectRatio: '1/1', backgroundColor: '#000' }}>
                 {/* Здесь будет img, пока просто заглушка */}
              </div>
            </div>

            {/* Правая часть: Описание */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', paddingTop: '10px' }}>
              <div style={{ fontWeight: 800, fontSize: '16px' }}>{project.title}</div>
              <div style={{ fontWeight: 500, lineHeight: '1.3', maxWidth: '200px' }}>
                {project.desc}
              </div>
              <div style={{ fontWeight: 800, marginTop: '10px' }}>
                [ {project.year} ]
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

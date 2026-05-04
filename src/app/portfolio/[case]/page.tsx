'use client';
import { useParams } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import Link from 'next/link';

// Данные строго по макету
const projectsData: any = {
  'asiya-site': {
    title: 'сайт для Асии',
    client: 'Асия',
    task: 'дизайн сайта, фронтенд, бэкенд',
    year: '2026',
    tags: '[ веб-дизайн, разработка ]',
    desc: 'полная разработка экосистемы для артиста: треки, концерты, магазин мерча и минималистичный интерфейс с акцентом на контент.......................................................................................................',
    credits: [
      { role: '[дизайн, дирекшен]', display: 't.me/Влад Марков (я)', url: 'https://t.me/babydonthurtmovich' },
      { role: '[фронтенд]', display: 't.me/Никита Оленёв', url: 'https://t.me/nekitocka' },
      { role: '[бэкенд]', display: 't.me/Илья Дахновский', url: 'https://t.me/to_id_hide' }
    ]
  },
  'creed-rings': {
    title: 'кольца для Крида',
    client: 'Егор Крид',
    task: 'дизайн, 3d, производство',
    year: '2025',
    tags: '[ предметный дизайн ]',
    desc: 'разработка и производство уникальных ювелирных изделий для артиста.......................................................................',
    credits: [
      { role: '[дизайн / 3d]', display: 't.me/Влад Марков', url: 'https://t.me/babydonthurtmovich' }
    ]
  }
};

export default function CasePage() {
  const params = useParams();
  const caseId = params.case as string;
  const project = projectsData[caseId] || projectsData['asiya-site'];

  // Строка с разреженными точками
  const InfoRow = ({ label, value, isValueBold = false }: any) => (
    <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%', marginBottom: '6px' }}>
      <span style={{ fontWeight: 800, whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ 
        flex: 1, 
        margin: '0 8px', 
        overflow: 'hidden', 
        whiteSpace: 'nowrap', 
        opacity: 0.8, 
        position: 'relative', 
        top: '-4px',
        letterSpacing: '2px' // Делает точки как в макете
      }}>
        ..........................................................................................................................................................................................
      </div>
      <span style={{ fontWeight: isValueBold ? 800 : 500, whiteSpace: 'nowrap' }}>{value}</span>
    </div>
  );

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'inherit' }}>
      
      {/* ШАПКА: Крошки слева, крестик закрытия справа */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <Breadcrumbs path={[
          { name: 'WH4T!SLOV3', href: '/', icon: '📁' },
          { name: 'PORTFOL1O', href: '/portfolio', icon: '📁' },
          { name: project.title.toUpperCase(), icon: '📄' }
        ]} />
        <Link href="/portfolio" style={{ textDecoration: 'none', color: 'inherit', fontWeight: 800, fontSize: '18px' }}>
          [ × ]
        </Link>
      </div>

      {/* ОСНОВНАЯ СЕТКА */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: '480px 1fr', // Жесткая ширина для фото, остаток для текста
        gap: '60px', 
        marginTop: '40px',
        alignItems: 'flex-start',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        
        {/* ЛЕВАЯ КОЛОНКА (Фото + Теги) */}
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          
          <div style={{ position: 'relative', width: '100%', aspectRatio: '16/10', marginTop: '10px' }}>
            {/* Крестики строго по углам фото */}
            <div style={{ position: 'absolute', top: 0, left: 0, transform: 'translate(-50%, -50%)', fontWeight: 300, fontSize: '20px' }}>+</div>
            <div style={{ position: 'absolute', top: 0, right: 0, transform: 'translate(50%, -50%)', fontWeight: 300, fontSize: '20px' }}>+</div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, transform: 'translate(-50%, 50%)', fontWeight: 300, fontSize: '20px' }}>+</div>
            <div style={{ position: 'absolute', bottom: 0, right: 0, transform: 'translate(50%, 50%)', fontWeight: 300, fontSize: '20px' }}>+</div>
            
            {/* Само фото */}
            <div style={{ width: '100%', height: '100%', backgroundColor: '#e5e5e5' }}></div>
          </div>
          
          {/* Теги под фото */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', fontWeight: 800, fontSize: '14px' }}>
            <span>{project.tags}</span>
            <span>[ {project.year} ]</span>
          </div>
        </div>

        {/* ПРАВАЯ КОЛОНКА (Текст) */}
        <div style={{ display: 'flex', flexDirection: 'column', fontSize: '14px' }}>
          
          <InfoRow label="название проекта" value={project.title} isValueBold={true} />
          <InfoRow label="клиент" value={project.client} />
          
          <div style={{ display: 'flex', alignItems: 'center', width: '100%', margin: '4px 0' }}>
            <div style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', opacity: 0.8, letterSpacing: '2px' }}>....................................................................................................</div>
            <span style={{ margin: '0 10px', fontWeight: 500 }}>сделано с любовью</span>
            <div style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', opacity: 0.8, letterSpacing: '2px' }}>....................................................................................................</div>
          </div>

          <InfoRow label="задача" value={project.task} />
          <InfoRow label="год" value={project.year} />

          {/* АВТОРЫ (Идеально ровная таблица) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '30px 0' }}>
            {project.credits.map((credit: any, index: number) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '80px', fontWeight: 500 }}>{index === 0 ? 'авторы:' : ''}</div>
                <div style={{ width: '180px', fontWeight: 800 }}>{credit.role}</div>
                <div>
                  <a 
                    href={credit.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{ 
                      color: '#3b00ff', // Фиолетово-синий как в макете
                      textDecoration: 'none', 
                      fontWeight: 800 
                    }}
                  >
                    {credit.display}
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* ОПИСАНИЕ (Текст слева, без дырок) */}
          <div style={{ 
            fontWeight: 500, 
            lineHeight: 1.4, 
            textAlign: 'left', // Строго по левому краю
            overflow: 'hidden' // Обрезает бесконечные точки, чтобы не ломать верстку
          }}>
            {project.desc}
          </div>

        </div>
      </div>
    </div>
  );
}

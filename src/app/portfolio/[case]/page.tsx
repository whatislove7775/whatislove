'use client';
import { useParams } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import Link from 'next/link';

const projectsData: any = {
  'asiya-site': {
    title: 'сайт для Асии',
    client: 'Асия',
    task: 'дизайн сайта, фронтенд, бэкенд',
    year: '2026',
    tags: '[ веб-дизайн, разработка ]',
    // Описание теперь без ручных точек, они добавляются автоматически в верстке
    desc: 'полная разработка экосистемы для артиста: треки, концерты, магазин мерча и минималистичный интерфейс с акцентом на контент',
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
    desc: 'разработка и производство уникальных ювелирных изделий для артиста',
    credits: [
      { role: '[дизайн / 3d]', display: 't.me/Влад Марков', url: 'https://t.me/babydonthurtmovich' }
    ]
  }
};

export default function CasePage() {
  const params = useParams();
  const caseId = params.case as string;
  const project = projectsData[caseId] || projectsData['asiya-site'];

  // Идеально ровная строка с точками БЕЗ пробелов
  const InfoRow = ({ label, value, isValueBold = false }: any) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'flex-end', width: '100%', marginBottom: '8px' }}>
      <span style={{ fontWeight: 800 }}>{label}</span>
      <div style={{ 
        overflow: 'hidden', 
        whiteSpace: 'nowrap', 
        opacity: 0.8, 
        position: 'relative', 
        top: '-4px',
        margin: '0 8px',
        letterSpacing: '2px' 
      }}>
        ..........................................................................................................................................................................................
      </div>
      <span style={{ fontWeight: isValueBold ? 800 : 500, textAlign: 'right' }}>{value}</span>
    </div>
  );

  return (
    <div style={{ 
      width: '100%', 
      maxWidth: '1000px', 
      margin: '0 auto', 
      display: 'flex', 
      flexDirection: 'column', 
      fontFamily: 'inherit',
      boxSizing: 'border-box',
      padding: '20px 20px 40px 20px' 
    }}>
      
      {/* НАВИГАЦИЯ (Строго как на остальных страницах: с Breadcrumbs, домиком и крестиком) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', fontWeight: 800, fontSize: '14px', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Link href="/portfolio" style={{ textDecoration: 'none', color: 'inherit' }}>[{'<'}]</Link>
          {/* Родной компонент Breadcrumbs со всеми ссылками */}
          <Breadcrumbs path={[
            { name: 'WH4T!SLOV3', href: '/', icon: '📁' },
            { name: 'PORTFOL1O', href: '/portfolio', icon: '📁' },
            { name: project.title.toUpperCase(), icon: '📄' }
          ]} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            [ 🏠 ]
          </Link>
          <Link href="/portfolio" style={{ textDecoration: 'none', color: 'inherit' }}>
            [ × ]
          </Link>
        </div>
      </div>

      {/* ОСНОВНАЯ СЕТКА */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: '400px 1fr', 
        gap: '60px', 
        alignItems: 'flex-start',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        
        {/* ЛЕВАЯ КОЛОНКА (Фото + Теги) */}
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          
          <div style={{ position: 'relative', width: '100%' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, transform: 'translate(-50%, -50%)', fontWeight: 300, fontSize: '20px', lineHeight: 1 }}>+</div>
            <div style={{ position: 'absolute', top: 0, right: 0, transform: 'translate(50%, -50%)', fontWeight: 300, fontSize: '20px', lineHeight: 1 }}>+</div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, transform: 'translate(-50%, 50%)', fontWeight: 300, fontSize: '20px', lineHeight: 1 }}>+</div>
            <div style={{ position: 'absolute', bottom: 0, right: 0, transform: 'translate(50%, 50%)', fontWeight: 300, fontSize: '20px', lineHeight: 1 }}>+</div>
            
            <div style={{ width: '100%', aspectRatio: '16/10', backgroundColor: '#e5e5e5' }}></div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', fontWeight: 800, fontSize: '13px' }}>
            <span>{project.tags}</span>
            <span>[ {project.year} ]</span>
          </div>
        </div>

        {/* ПРАВАЯ КОЛОНКА (Текст) */}
        <div style={{ display: 'flex', flexDirection: 'column', fontSize: '14px', width: '100%' }}>
          
          <InfoRow label="название проекта" value={project.title} isValueBold={true} />
          <InfoRow label="клиент" value={project.client} />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'flex-end', width: '100%', margin: '4px 0 10px 0' }}>
            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', opacity: 0.8, letterSpacing: '2px', position: 'relative', top: '-4px' }}>....................................................................................................</div>
            <span style={{ margin: '0 10px', fontWeight: 500 }}>сделано с любовью</span>
            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', opacity: 0.8, letterSpacing: '2px', position: 'relative', top: '-4px' }}>....................................................................................................</div>
          </div>

          <InfoRow label="задача" value={project.task} />
          <InfoRow label="год" value={project.year} />

          {/* АВТОРЫ (Выравнивание ссылок строго по правому краю блока) */}
          <div style={{ display: 'flex', marginTop: '30px', marginBottom: '30px' }}>
            <div style={{ width: '90px', fontWeight: 500 }}>авторы:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
              {project.credits.map((credit: any, index: number) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', width: '100%' }}>
                  <span style={{ fontWeight: 800 }}>{credit.role}</span>
                  <a 
                    href={credit.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{ 
                      color: '#3b00ff', 
                      textDecoration: 'none', 
                      fontWeight: 800 
                    }}
                  >
                    {credit.display}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* ОПИСАНИЕ С АВТОМАТИЧЕСКИМИ ТОЧКАМИ ДО КРАЯ */}
          <div style={{ 
            fontWeight: 500, 
            lineHeight: 1.5, 
            textAlign: 'justify', 
            width: '100%',
            overflow: 'hidden' // Обрезает длинный хвост точек по границе контейнера
          }}>
            <span>{project.desc}</span>
            <span style={{ 
              opacity: 0.8, 
              letterSpacing: '2px', 
              whiteSpace: 'nowrap', 
              marginLeft: '5px' 
            }}>
              ................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}

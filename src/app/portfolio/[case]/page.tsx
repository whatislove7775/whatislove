'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const projectsData: any = {
  'asiya-site': {
    title: 'сайт для Асии',
    client: 'Асия',
    task: 'дизайн сайта, фронтенд, бэкенд',
    year: '2026',
    tags: '[ веб-дизайн, разработка ]',
    // Описание с маленькой буквы
    desc: 'полная разработка экосистемы для артиста: треки, концерты, магазин мерча и минималистичный интерфейс с акцентом на контент',
    credits: [
      { role: '[дизайн, дирекшен]', display: 't.me/Влад Марков (я)', url: 'https://t.me/babydonthurtmovich' },
      { role: '[фронтенд]', display: 't.me/Никита Оленёв', url: 'https://t.me/nekitocka' },
      { role: '[бэкенд]', display: 't.me/Илья Дахновский', url: 'https://t.me/to_id_hide' }
    ]
  },
  // Остальные кейсы
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

  // Идеальная строка: текст слева и справа зафиксированы (max-content), а точки ужимаются (minmax(0, 1fr))
  const InfoRow = ({ label, value, isValueBold = false }: any) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'max-content minmax(0, 1fr) max-content', alignItems: 'flex-end', width: '100%', marginBottom: '8px' }}>
      <span style={{ fontWeight: 800, whiteSpace: 'nowrap' }}>{label}</span>
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
      <span style={{ fontWeight: isValueBold ? 800 : 500, whiteSpace: 'nowrap' }}>{value}</span>
    </div>
  );

  return (
    <div style={{ 
      width: '100%', 
      maxWidth: '1000px', 
      margin: '0 auto', 
      height: '100vh', 
      overflow: 'hidden', // Никакого скролла
      display: 'flex', 
      flexDirection: 'column', 
      fontFamily: 'inherit',
      boxSizing: 'border-box',
      padding: '40px 20px'
    }}>
      
      {/* НАВИГАЦИЯ (Написана вручную, чтобы не двоились кнопки из компонента Breadcrumbs) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', fontWeight: 800, fontSize: '14px', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link href="/portfolio" style={{ textDecoration: 'none', color: 'inherit', whiteSpace: 'nowrap' }}>
            [{"<"}]
          </Link>
          <span style={{ whiteSpace: 'nowrap' }}>
            📁 WH4T!SLOV3 / 📁 PORTFOL1O / 📄 {project.title.toUpperCase()}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit', marginRight: '4px' }}>
            [ 🏠 ]
          </Link>
          <Link href="/portfolio" style={{ textDecoration: 'none', color: 'inherit' }}>
            [×]
          </Link>
        </div>
      </div>

      {/* ОСНОВНАЯ СЕТКА (minmax(0, 1fr) спасает от растягивания за край экрана!) */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'minmax(350px, 450px) minmax(0, 1fr)', 
        gap: '60px', 
        alignItems: 'flex-start',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        
        {/* ЛЕВАЯ КОЛОНКА (Фото + Теги) */}
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          
          <div style={{ position: 'relative', width: '100%' }}>
            <div style={{ position: 'absolute', top: '-15px', left: '-15px', fontWeight: 300, fontSize: '20px', lineHeight: 1 }}>+</div>
            <div style={{ position: 'absolute', top: '-15px', right: '-15px', fontWeight: 300, fontSize: '20px', lineHeight: 1 }}>+</div>
            <div style={{ position: 'absolute', bottom: '-15px', left: '-15px', fontWeight: 300, fontSize: '20px', lineHeight: 1 }}>+</div>
            <div style={{ position: 'absolute', bottom: '-15px', right: '-15px', fontWeight: 300, fontSize: '20px', lineHeight: 1 }}>+</div>
            
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
          
          {/* Сделано с любовью */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) max-content minmax(0, 1fr)', alignItems: 'flex-end', width: '100%', margin: '4px 0 10px 0' }}>
            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', opacity: 0.8, letterSpacing: '2px', position: 'relative', top: '-4px' }}>....................................................................................................</div>
            <span style={{ margin: '0 15px', fontWeight: 500, whiteSpace: 'nowrap' }}>сделано с любовью</span>
            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', opacity: 0.8, letterSpacing: '2px', position: 'relative', top: '-4px' }}>....................................................................................................</div>
          </div>

          <InfoRow label="задача" value={project.task} />
          <InfoRow label="год" value={project.year} />

          {/* АВТОРЫ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '30px 0' }}>
            {project.credits.map((credit: any, index: number) => (
              <div key={index} style={{ display: 'grid', gridTemplateColumns: '90px max-content minmax(0, 1fr)', alignItems: 'baseline', width: '100%' }}>
                <div style={{ fontWeight: 500 }}>{index === 0 ? 'авторы:' : ''}</div>
                <div style={{ fontWeight: 800, whiteSpace: 'nowrap' }}>{credit.role}</div>
                
                {/* Ссылки жестко прижаты к правому краю */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', overflow: 'hidden' }}>
                  <a 
                    href={credit.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{ 
                      color: '#3b00ff', 
                      textDecoration: 'none', 
                      fontWeight: 800,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {credit.display}
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* ОПИСАНИЕ С АВТОМАТИЧЕСКИМИ ТОЧКАМИ */}
          <div style={{ 
            fontWeight: 500, 
            lineHeight: 1.5, 
            textAlign: 'left', // Строго по левому краю
            width: '100%',
            overflow: 'hidden' // Обрезает хвост точек
          }}>
            <span>{project.desc}</span>
            <span style={{ 
              opacity: 0.8, 
              letterSpacing: '2px', 
              wordBreak: 'break-all', 
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

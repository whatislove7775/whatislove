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

  // Выравнивание строго по базовой линии (baseline), никаких смещений top: -4px
  const InfoRow = ({ label, value, isValueBold = false }: any) => (
    <div style={{ display: 'flex', alignItems: 'baseline', width: '100%', marginBottom: '8px' }}>
      <span style={{ fontWeight: 800, whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ 
        flex: 1,
        overflow: 'hidden', 
        whiteSpace: 'nowrap', 
        opacity: 0.8, 
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
      // Убрали height: 100vh, чтобы подвал мог подняться наверх
      display: 'flex', 
      flexDirection: 'column', 
      fontFamily: 'inherit',
      boxSizing: 'border-box',
      padding: '40px 20px'
    }}>
      
      {/* НАВИГАЦИЯ */}
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
            [ × ]
          </Link>
        </div>
      </div>

      {/* ОСНОВНАЯ СЕТКА */}
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
          
          {/* Сделано с любовью (точки на базовой линии) */}
          <div style={{ display: 'flex', alignItems: 'baseline', width: '100%', margin: '4px 0 10px 0' }}>
            <div style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', opacity: 0.8, letterSpacing: '2px' }}>....................................................................................................</div>
            <span style={{ margin: '0 15px', fontWeight: 500, whiteSpace: 'nowrap' }}>сделано с любовью</span>
            <div style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', opacity: 0.8, letterSpacing: '2px' }}>....................................................................................................</div>
          </div>

          <InfoRow label="задача" value={project.task} />
          <InfoRow label="год" value={project.year} />

          {/* АВТОРЫ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '30px 0' }}>
            {project.credits.map((credit: any, index: number) => (
              <div key={index} style={{ display: 'grid', gridTemplateColumns: '90px max-content minmax(0, 1fr)', alignItems: 'baseline', width: '100%' }}>
                <div style={{ fontWeight: 500 }}>{index === 0 ? 'авторы:' : ''}</div>
                <div style={{ fontWeight: 800, whiteSpace: 'nowrap' }}>{credit.role}</div>
                
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

          {/* ОПИСАНИЕ С АВТОМАТИЧЕСКИМИ ТОЧКАМИ (Выравнивание по ширине) */}
          <div style={{ 
            fontWeight: 500, 
            lineHeight: 1.5, 
            textAlign: 'justify', // Текст растягивается от края до края
            width: '100%',
            maxHeight: '4.5em', // Максимум 3 строки, чтобы точки не плодились бесконечно вниз
            overflow: 'hidden'
          }}>
            <span>{project.desc}</span>
            <span style={{ 
              opacity: 0.8, 
              letterSpacing: '2px', 
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

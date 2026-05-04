'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';

// Данные строго по макету "портфолиока.jpg"
const projectsData: any = {
  'asiya-site': {
    title: 'сайт для Асии',
    client: 'Асия',
    task: 'дизайн сайта, фронтенд, бэкенд',
    year: '2026',
    tags: '[ веб-дизайн, разработка ]',
    desc: 'полная разработка экосистемы для артиста: треки, концерты, магазин мерча и минималистичный интерфейс с акцентом на контент.......................................................................',
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
    desc: 'разработка и производство уникальных ювелирных изделий для артиста......................................................................................................',
    credits: [
      { role: '[дизайн / 3d]', display: 't.me/Влад Марков', url: 'https://t.me/babydonthurtmovich' }
    ]
  }
};

export default function CasePage() {
  const params = useParams();
  const caseId = params.case as string;
  const project = projectsData[caseId] || projectsData['asiya-site'];

  // Идеально ровная строка с точками
  const InfoRow = ({ label, value, isValueBold = false }: any) => (
    <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%', marginBottom: '12px' }}>
      <span style={{ fontWeight: 800, whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ 
        flex: 1, 
        margin: '0 10px', 
        overflow: 'hidden', 
        whiteSpace: 'nowrap', 
        opacity: 0.8, 
        position: 'relative', 
        top: '-4px',
        letterSpacing: '2px' // Разреженные точки
      }}>
        ..........................................................................................................................................................................................
      </div>
      <span style={{ fontWeight: isValueBold ? 800 : 500, whiteSpace: 'nowrap' }}>{value}</span>
    </div>
  );

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      overflow: 'hidden', // ЖЕСТКО БЛОКИРУЕТ СКРОЛЛ
      display: 'flex', 
      flexDirection: 'column', 
      fontFamily: 'inherit',
      boxSizing: 'border-box',
      padding: '40px 60px' // ОТСТУПЫ ОТ КРАЕВ ЭКРАНА (крестики больше не режутся)
    }}>
      
      {/* НАВИГАЦИЯ (Шапка в точности как на макете) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', fontWeight: 800, fontSize: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link href="/portfolio" style={{ textDecoration: 'none', color: 'inherit' }}>[ {"<"} ]</Link>
          <span style={{ marginLeft: '10px' }}>📁 WH4T!SLOV3 / 📁 PORTFOL1O / 📄 {project.title.toUpperCase()}</span>
        </div>
        <Link href="/portfolio" style={{ textDecoration: 'none', color: 'inherit', fontSize: '18px' }}>
          [ × ]
        </Link>
      </div>

      {/* ОСНОВНАЯ СЕТКА */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: '450px 1fr', // 450px на фото, остаток на текст
        gap: '80px', // Увеличенный гап для воздуха, как в макете
        marginTop: '60px',
        alignItems: 'flex-start',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        
        {/* ЛЕВАЯ КОЛОНКА (Фото + Теги) */}
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          
          <div style={{ position: 'relative', width: '100%' }}>
            {/* Крестики вынесены за пределы фото с помощью отрицательных координат */}
            <div style={{ position: 'absolute', top: '-25px', left: '-25px', fontWeight: 300, fontSize: '24px', lineHeight: 1 }}>+</div>
            <div style={{ position: 'absolute', top: '-25px', right: '-25px', fontWeight: 300, fontSize: '24px', lineHeight: 1 }}>+</div>
            <div style={{ position: 'absolute', bottom: '-25px', left: '-25px', fontWeight: 300, fontSize: '24px', lineHeight: 1 }}>+</div>
            <div style={{ position: 'absolute', bottom: '-25px', right: '-25px', fontWeight: 300, fontSize: '24px', lineHeight: 1 }}>+</div>
            
            {/* Само фото (Пропорция как на макете) */}
            <div style={{ width: '100%', aspectRatio: '16/10', backgroundColor: '#e5e5e5' }}></div>
          </div>
          
          {/* Теги под фото */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', fontWeight: 800, fontSize: '14px' }}>
            <span>{project.tags}</span>
            <span>[ {project.year} ]</span>
          </div>
        </div>

        {/* ПРАВАЯ КОЛОНКА (Текст) */}
        <div style={{ display: 'flex', flexDirection: 'column', fontSize: '15px', maxWidth: '650px' }}>
          
          <InfoRow label="название проекта" value={project.title} isValueBold={true} />
          <InfoRow label="клиент" value={project.client} />
          
          {/* Центральный разделитель */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'flex-end', width: '100%', margin: '8px 0 16px 0' }}>
            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', opacity: 0.8, letterSpacing: '2px', position: 'relative', top: '-4px' }}>....................................................................................................</div>
            <span style={{ margin: '0 15px', fontWeight: 500 }}>сделано с любовью</span>
            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', opacity: 0.8, letterSpacing: '2px', position: 'relative', top: '-4px' }}>....................................................................................................</div>
          </div>

          <InfoRow label="задача" value={project.task} />
          <InfoRow label="год" value={project.year} />

          {/* АВТОРЫ */}
          <div style={{ display: 'flex', marginTop: '40px', marginBottom: '40px' }}>
            <div style={{ width: '100px', fontWeight: 500 }}>авторы:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
              {project.credits.map((credit: any, index: number) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 800 }}>{credit.role}</span>
                  <a 
                    href={credit.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{ 
                      color: '#3b00ff', // Фиолетово-синий
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

          {/* ОПИСАНИЕ С ТОЧКАМИ */}
          <div style={{ 
            fontWeight: 500, 
            lineHeight: 1.5, 
            textAlign: 'left', 
            width: '100%',
            overflow: 'hidden'
          }}>
            {project.desc}
          </div>

        </div>
      </div>
    </div>
  );
}

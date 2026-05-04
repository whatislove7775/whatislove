'use client';
import { useParams } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';

// УНИВЕРСАЛЬНАЯ СТРУКТУРА ДАННЫХ ДЛЯ МАСШТАБИРОВАНИЯ
const projectsData: any = {
  // КЕЙС 1: ASIYA SITE (Строго по техническому макету)
  'asiya-site': {
    title: 'сайт для Асии',
    breadcrumbs: [
      { name: 'ARCHIVE', href: '/portfolio', icon: '📁' },
      { name: 'PROJ.N0.05', icon: '📄' } // ID проекта из твоего макета
    ],
    hugeRotatedTitle: { top: 'ASIYA!', bottom: 'WE B' },
    hugeRotatedSubtitles: [
      { text: 'A_', rotate: -90, color: '#333', border: true },
      { text: 'WE', rotate: -90, color: '#e5e5e5' },
      { text: 'B', rotate: -90, color: '#e5e5e5' }
    ],
    techSpecs: [
      'TYPE: WEB ECOSYSTEM',
      'CLIENT: ASIYA',
      'STATUS: LIVE',
      'YEAR: 2026'
    ],
    softwareStack: ['Next.js', 'React', 'Node.js'],
    descriptionParagraphs: [
      'полная разработка экосистемы для артиста: треки, концерты, магазин мерча и минималистичный интерфейс с акцентом на контент.',
    ],
    mainVisual: {
      label: '[ HOME_PAGE_01 ]',
      subtitle: 'ASIYA (SITE)',
      pageId: 'PAGE_ID 05'
    },
    extraVisuals: [
      { label: '[ MOBILE_VIEW_02 ]', id: '+2', subtitle: 'MOBILE' },
      { label: '[ CMS_PANEL_03 ]', id: '+3', subtitle: 'BACKEND' }
    ],
    // Новые данные для команды (фиолетовые ссылки)
    team: [
      { role: '[дизайн, дирекшен]', display: 't.me/Влад Марков (я)', url: 'https://t.me/babydonthurtmovich' },
      { role: '[фронтенд]', display: 't.me/Никита Оленёв', url: 'https://t.me/nekitocka' },
      { role: '[бэкенд]', display: 't.me/Илья Дахновский', url: 'https://t.me/to_id_hide' }
    ]
  },

  // КЕЙС 2: EGOR CREED RINGS (Пример для масштабирования)
  'creed-rings': {
    title: 'кольца для Крида',
    breadcrumbs: [
      { name: 'ARCHIVE', href: '/portfolio', icon: '📁' },
      { name: 'PROJ.N0.21', icon: '📄' }
    ],
    hugeRotatedTitle: { top: 'WH4T!', bottom: ' SLO' },
    hugeRotatedSubtitles: [
      { text: 'RI', rotate: -90, color: '#e5e5e5' },
      { text: 'NG', rotate: -90, color: '#333', border: true },
      { text: 'CR', rotate: -90, color: '#333' }
    ],
    techSpecs: [
      'TYPE: RINGS DESIGN',
      'CLIENT: EGOR CREED',
      'STATUS: PRODUCTION',
      'YEAR: 2025'
    ],
    softwareStack: ['Rhino (Ver. 7)', '3ds Max (Ver. 2021)', 'Corona (Ver. 10)'],
    descriptionParagraphs: [
      'разработка и производство уникальных ювелирных изделий.',
      'полный цикл: от эскиза до отливки в металле.'
    ],
    mainVisual: {
      label: '[ VISUAL_DATA_01 ]',
      subtitle: 'CREED (RINGS)',
      pageId: 'PAGE_ID 23'
    },
    extraVisuals: [
      { label: '[ VISUAL_02 ]', id: '+2', subtitle: 'DETAIL' },
      { label: '[ VISUAL_03 ]', id: '+3', subtitle: 'PACKAGE' }
    ],
    team: [
      { role: '[дизайн / 3d]', display: 't.me/Влад Марков', url: 'https://t.me/babydonthurtmovich' },
      { role: '[менеджмент]', display: 't.me/Никита Оленёв', url: 'https://t.me/nekitocka' },
      { role: '[производство]', display: 't.me/Илья Дахновский', url: 'https://t.me/to_id_hide' }
    ]
  }
};

// Вспомогательный компонент для плейсхолдера с крестиками
const TechnicalVisual = ({ aspectRatio = '16/9', label = '', id = '' }: any) => (
  <div style={{ position: 'relative', width: '100%', aspectRatio: aspectRatio, padding: '10px', boxSizing: 'border-box', border: '1px solid #ccc' }}>
    <div style={{ position: 'absolute', top: 0, left: 0, transform: 'translate(-50%, -50%)', fontWeight: 300, fontSize: '20px' }}>+</div>
    <div style={{ position: 'absolute', top: 0, right: 0, transform: 'translate(50%, -50%)', fontWeight: 300, fontSize: '20px' }}>+</div>
    <div style={{ position: 'absolute', bottom: 0, left: 0, transform: 'translate(-50%, 50%)', fontWeight: 300, fontSize: '20px' }}>+</div>
    <div style={{ position: 'absolute', bottom: 0, right: 0, transform: 'translate(50%, 50%)', fontWeight: 300, fontSize: '20px' }}>+</div>
    
    <div style={{ width: '100%', height: '100%', border: '1px dotted #ccc', boxSizing: 'border-box', padding: '5px' }}>
      <div style={{ width: '100%', height: '100%', backgroundColor: '#e5e5e5', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
         <span style={{ fontWeight: 800, opacity: 0.1, fontSize: '20px', fontFamily: 'monospace' }}>{label}</span>
         {id && <div style={{ position: 'absolute', top: 0, left: 0, fontSize: '12px', padding: '5px', color: '#000', fontWeight: 800, fontFamily: 'monospace' }}>{id}</div>}
      </div>
    </div>
  </div>
);

export default function CasePage() {
  const params = useParams();
  const caseId = params.case as string;
  const project = projectsData[caseId] || projectsData['asiya-site'];

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      maxHeight: '100vh', 
      overflow: 'hidden', // Блокирует скролл
      display: 'flex', 
      flexDirection: 'column', 
      flex: 1, 
      fontFamily: 'inherit',
      color: '#000',
      textTransform: 'uppercase', 
      lineHeight: '1.2',
      boxSizing: 'border-box',
      padding: '40px 60px' // Отступы, чтобы ничего не резалось
    }}>
      
      {/* 1. ВЕРХНИЙ БЛОК: СЕТКА И ОГРОМНЫЙ ТЕКСТ */}
      <div style={{ position: 'relative', width: '100%', boxSizing: 'border-box' }}>
        
        {/* Хлебные крошки и Инфо */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', position: 'relative', zIndex: 10 }}>
          <Breadcrumbs path={project.breadcrumbs} />
          {/* Вертикальные повернутые подписи по бокам */}
          <div style={{ position: 'absolute', top: '100px', left: '-50px', transform: 'rotate(-90deg)', fontSize: '10px', fontWeight: 300, opacity: 0.5, letterSpacing: '3px', fontFamily: 'monospace' }}>D.E.S.I.G.N</div>
          <div style={{ position: 'absolute', top: '100px', right: '-50px', transform: 'rotate(-90deg)', fontSize: '10px', fontWeight: 300, opacity: 0.5, letterSpacing: '3px', fontFamily: 'monospace' }}>I.N.S.P.I.R.E</div>
        </div>

        {/* Плюсы по углам внешней границы страницы (компенсация паддинга) */}
        <div style={{ position: 'absolute', top: '-10px', left: '-15px', fontWeight: 300, fontSize: '24px' }}>+</div>
        <div style={{ position: 'absolute', top: '-10px', right: '-15px', fontWeight: 300, fontSize: '24px' }}>+</div>

        {/* ОГРОМНЫЙ ПОВЕРНУТЫЙ ТЕКСТ НА ФОНЕ */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          marginTop: '60px',
          fontWeight: 900,
          fontSize: '180px', // Огромный размер
          letterSpacing: '-15px',
          fontFamily: 'inherit',
          userSelect: 'none',
          position: 'relative',
          lineHeight: '0.8',
        }}>
          <div>{project.hugeRotatedTitle.top}</div>
          <div style={{ color: '#ccc', borderBottom: '10px solid #ccc', paddingBottom: '10px', marginBottom: '10px' }}>{project.hugeRotatedTitle.bottom}</div>
          
          {/* Размытый оверлей (Circle) ПРЯМО ПО ЦЕНТРУ ТЕКСТА */}
          <div style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -40%)',
            width: '250px', 
            height: '250px', 
            backgroundColor: '#000', 
            borderRadius: '50%', 
            filter: 'blur(50px)', // Жесткое размытие
            opacity: 0.8
          }}></div>
        </div>
      </div>

      {/* 2. ОСНОВНОЙ КОНТЕНТ (GRID 3 колонки) */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: '250px 1fr 200px', 
        gap: '40px',
        marginTop: '20px',
        alignItems: 'flex-start',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        
        {/* ЛЕВАЯ КОЛОНКА (Specs & Team) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', fontSize: '12px' }}>
          {/* Технический паспорт */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <div style={{ width: '60px', borderBottom: '1px solid #000', marginBottom: '10px' }}></div>
            {project.techSpecs.map((spec: string, i: number) => (
              <div key={i} style={{ fontWeight: 800, fontFamily: 'monospace' }}>{spec}</div>
            ))}
            <div style={{ borderBottom: '1px solid #000', marginTop: '10px' }}></div>
          </div>
          
          {/* КОМАНДА: Фиолетовые ссылки */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid #000', paddingTop: '10px' }}>
            {project.team.map((member: any, i: number) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '11px' }}>
                <span style={{ fontWeight: 800, fontFamily: 'monospace' }}>{member.role}</span>
                <a href={member.url} target="_blank" rel="noopener noreferrer" style={{ color: '#3b00ff', textDecoration: 'none', fontWeight: 800, fontFamily: 'monospace' }}>{member.display}</a>
              </div>
            ))}
          </div>

          {/* Стек софта (Левый низ) */}
          <div style={{ 
            fontWeight: 800, 
            letterSpacing: '1px', 
            borderBottom: '1px solid #000', 
            paddingBottom: '5px',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            fontSize: '11px',
            fontFamily: 'monospace',
            opacity: 0.8
          }}>
            {project.softwareStack.join(' | ')}
          </div>
        </div>

        {/* ЦЕНТРАЛЬНАЯ КОЛОНКА (Главный визуал) */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          
          {/*PAGE ID (Повернут вертикально) */}
          <div style={{ 
            writingMode: 'vertical-rl', 
            transform: 'rotate(180deg)', 
            fontSize: '12px', 
            fontWeight: 800, 
            letterSpacing: '2px',
            opacity: 0.7,
            fontFamily: 'monospace'
          }}>
            {project.mainVisual.pageId}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
            {/* ГЛАВНОЕ ФОТО В ТЕХНИЧЕСКОЙ РАМКЕ */}
            <TechnicalVisual aspectRatio="16/10" label={project.mainVisual.label} />
            
            {/* Подпись */}
            <div style={{ fontWeight: 800, fontSize: '13px', textAlign: 'center', letterSpacing: '2px' }}>
              {project.mainVisual.subtitle}
            </div>
          </div>
        </div>

        {/* ПРАВАЯ КОЛОНКА (Описание) */}
        <div style={{ 
            fontSize: '12px', 
            fontWeight: 500, 
            lineHeight: '1.5', 
            textAlign: 'justify', 
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            textTransform: 'lowercase',
            position: 'relative'
        }}>
          {/* Крестики по углам текстового блока */}
          <div style={{ position: 'absolute', top: 0, left: '-10px', fontWeight: 300 }}>+</div>
          <div style={{ position: 'absolute', top: 0, right: 0, fontWeight: 300 }}>+</div>
          <div style={{ position: 'absolute', bottom: 0, left: '-10px', fontWeight: 300 }}>+</div>
          
          {project.descriptionParagraphs.map((para: string, i: number) => (
              <p key={i} style={{ margin: 0 }}>{para}</p>
          ))}
        </div>
      </div>

      {/* 3. НИЖНИЙ БЛОК: СЕТКА ИЗОБРАЖЕНИЙ (Grid 2 колонки) */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: '40px', 
        marginTop: '60px', 
        marginBottom: '60px',
        boxSizing: 'border-box'
      }}>
        {project.extraVisuals.map((visual: any, i: number) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
               <TechnicalVisual aspectRatio="4/3" label={visual.label} id={visual.id} />
               <div style={{ fontWeight: 800, fontSize: '11px', textAlign: 'center', letterSpacing: '2px' }}>
                 {visual.subtitle}
               </div>
            </div>
        ))}
      </div>
    </div>
  );
}

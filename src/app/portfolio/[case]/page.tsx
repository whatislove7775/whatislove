'use client';
import { useParams } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';

// ДАННЫЕ ДЛЯ МАСШТАБИРОВАНИЯ (потом вынеси в API или файл данных)
const projectsData: any = {
  // КЕЙС 1: EGOR CREED RINGS
  'creed-rings': {
    hugeTitle: { top: 'WH4T!', bottom: 'SLO' }, // Текст для гигантского фона
    pageIdentifier: 'PAGE_ID 23', // "Номер страницы" в верстке
    projectNo: 'PROJ.N0.21', // В хлебные крошки
    technicalSpecs: [
      { key: 'TYPE:', value: 'RINGS DESIGN' },
      { key: 'CLIENT:', value: 'EGOR CREED' },
      { key: 'STATUS:', value: 'PRODUCTION' },
      { key: 'YEAR:', value: '2025' },
    ],
    mainVisualSubtitle: 'CREED (RINGS)', // Подпись под главным фото
    description: [
      'РАЗРАБОТКА И ПРОИЗВОДСТВО УНИКАЛЬНЫХ ЮВЕЛИРНЫХ ИЗДЕЛИЙ ДЛЯ ЕГОРА КРИДА.',
      'ПОЛНЫЙ ЦИКЛ: ОТ ЭСКИЗА И 3D-МОДЕЛИРОВАНИЯ ДО ОТЛИВКИ В МЕТАЛЛЕ, УПАКОВКИ И ЛОГИСТИКИ.',
      'МИНИМАЛИСТИЧНЫЙ ТЕХНИЧНЫЙ ДИЗАЙН.'
    ],
    softwareStack: ['Rhino (Ver. 7)', '3ds Max (Ver. 2021)', 'Corona (Ver. 10)'], // Технический стек
    // Сетка изображений: первый элемент - главный, остальные - в сетку снизу
    imageGrid: [
      { type: 'placeholder', label: '[ MAIN_VISUAL_01 ]' }, // Замени на src: '/img/...'
      { type: 'placeholder', label: '[ VISUAL_02 ]' },
      { type: 'placeholder', label: '[ VISUAL_03 ]' }
    ]
  },

  // КЕЙС 2: ASIYA SITE (Пример для масштабирования)
  'asiya-site': {
    hugeTitle: { top: 'ASIYA!', bottom: 'WEB' },
    pageIdentifier: 'PAGE_ID 05',
    projectNo: 'PROJ.N0.22',
    technicalSpecs: [
      { key: 'TYPE:', value: 'WEB ECOSYSTEM' },
      { key: 'CLIENT:', value: 'ASIYA' },
      { key: 'STATUS:', value: 'LIVE' },
      { key: 'YEAR:', value: '2025' },
    ],
    mainVisualSubtitle: 'ASIYA (SITE)',
    description: [
      'ПОЛНАЯ РАЗРАБОТКА ЭКОСИСТЕМЫ ДЛЯ АРТИСТА.',
      'FRONTEND, BACKEND, ИНТЕГРАЦИЯ СТРИМИНГОВ И МЕРЧ-МАГАЗИНА.'
    ],
    softwareStack: ['Next.js', 'TypeScript', 'Node.js'],
    imageGrid: [
      { type: 'placeholder', label: '[ HOME_PAGE_MOCKUP ]' },
      { type: 'placeholder', label: '[ MOBILE_VIEW_01 ]' },
      { type: 'placeholder', label: '[ CMS_PANEL_02 ]' }
    ]
  }
};

// Вспомогательный компонент для серого прямоугольника
const VisualPlaceholder = ({ label }: { label: string }) => (
  <div style={{ width: '100%', height: '100%', backgroundColor: '#d0d0d0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <span style={{ fontWeight: 800, opacity: 0.2, fontSize: '20px', fontFamily: 'monospace', color: '#000' }}>{label}</span>
  </div>
);

export default function CasePage() {
  const params = useParams();
  const caseId = params.case as string;
  // Берем данные по ID или дефолтные
  const project = projectsData[caseId] || projectsData['creed-rings'];

  return (
    <div style={{ 
      width: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      flex: 1, 
      fontFamily: 'inherit',
      color: '#000',
      boxSizing: 'border-box'
    }}>
      
      {/* 1. ВЕРХНИЙ БЛОК: ГИГАНТСКИЙ ТЕКСТ И КРЕСТЫ */}
      <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center', boxSizing: 'border-box', marginBottom: '40px' }}>
        {/* Хлебные крошки и Инфо (абсолютно спозиционированы) */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 10 }}>
          <Breadcrumbs path={[
            { name: 'ARCHIVE', href: '/portfolio', icon: '📁' },
            { name: project.projectNo, icon: '📄' }
          ]} />
        </div>

        {/* Кресты по углам внешней границы */}
        <div style={{ position: 'absolute', top: '15px', left: '15px', fontWeight: 300, fontSize: '24px', color: '#000' }}>+</div>
        <div style={{ position: 'absolute', top: '15px', right: '15px', fontWeight: 300, fontSize: '24px', color: '#000' }}>+</div>

        {/* Гигантский бэкграунд-текст */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          marginTop: '60px',
          fontFamily: 'Times New Roman, serif', // Serif как на макете
          fontWeight: 900,
          fontSize: '180px', // Кастомный огромный размер
          lineHeight: '0.8',
          letterSpacing: '-5px',
          color: '#e5e5e5', // Светло-серый
          userSelect: 'none',
          whiteSpace: 'nowrap'
        }}>
          <div>{project.hugeTitle.top}</div>
          <div style={{ color: '#666', borderBottom: '2px solid #666', paddingBottom: '10px', marginBottom: '10px' }}>{project.hugeTitle.bottom}</div>
        </div>

        {/* Центральный размытый оверлей (Heart/V shape) */}
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -40%)',
          width: '250px', 
          height: '250px', 
          backgroundColor: '#333', 
          borderRadius: '50%', 
          filter: 'blur(50px)', // Размытие
          opacity: 0.8
        }}></div>
      </div>

      {/* 2. ОСНОВНОЙ КОНТЕНТ (GRID 3 колонки) */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: '250px 1fr 200px', // Сетки под разные данные
        gap: '40px',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        
        {/* ЛЕВАЯ КОЛОНКА (Specs & Tech Metadata) */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
          
          {/* Технический паспорт */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textTransform: 'uppercase', fontSize: '14px' }}>
            <div style={{ width: '60px', borderBottom: '1px solid #000', marginBottom: '10px' }}></div>
            {project.technicalSpecs.map((spec: any, i: number) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '70px 1fr', gap: '5px' }}>
                <span style={{ fontWeight: 800 }}>{spec.key}</span>
                <span style={{ fontWeight: 500, opacity: 0.8 }}>{spec.value}</span>
              </div>
            ))}
            <div style={{ borderBottom: '1px solid #000', marginTop: '10px' }}></div>
          </div>

          {/* Нижний технический стек (Rhino | Max | Corona) */}
          <div style={{ 
            fontSize: '12px', 
            fontWeight: 800, 
            fontFamily: 'monospace', 
            opacity: 0.8, 
            borderTop: '1px solid #000', 
            paddingTop: '10px',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap'
          }}>
            {project.softwareStack.join(' | ')}
          </div>
        </div>

        {/* ЦЕНТРАЛЬНАЯ КОЛОНКА (Главный визуал) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          {/* Главное фото в рамке с padding */}
          <div style={{ position: 'relative', width: '100%', padding: '15px', boxSizing: 'border-box', border: '1px solid #ccc' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, transform: 'translate(-50%, -50%)', fontSize: '18px' }}>+</div>
            <div style={{ position: 'absolute', top: 0, right: 0, transform: 'translate(50%, -50%)', fontSize: '18px' }}>+</div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, transform: 'translate(-50%, 50%)', fontSize: '18px' }}>+</div>
            <div style={{ position: 'absolute', bottom: 0, right: 0, transform: 'translate(50%, 50%)', fontSize: '18px' }}>+</div>
            
            {/* ГЛАВНОЕ ФОТО (Плейсхолдер или Реальное) */}
            <div style={{ width: '100%', aspectRatio: '16/9', backgroundColor: '#e5e5e5', border: '1px solid #000' }}>
               <VisualPlaceholder label={project.imageGrid[0].label} />
            </div>
          </div>

          {/* Подписи: Субтитр и Номер страницы */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', textTransform: 'uppercase', fontWeight: 800, padding: '0 15px' }}>
             <div style={{ fontSize: '14px' }}>{project.mainVisualSubtitle}</div>
             {/* PAGE_ID Serif шрифт */}
             <div style={{ fontFamily: 'Times New Roman, serif', fontSize: '16px', borderBottom: '1.5px solid #000', paddingBottom: '2px' }}>
                {project.pageIdentifier}
             </div>
          </div>
        </div>

        {/* ПРАВАЯ КОЛОНКА (Описание) */}
        <div style={{ 
            fontSize: '13px', 
            fontWeight: 500, 
            lineHeight: '1.5', 
            textAlign: 'justify', 
            fontFamily: 'Arial, sans-serif', // Clean Sans-serif description
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            textTransform: 'lowercase' // По желанию как на макете
        }}>
          <div style={{ width: '40px', borderBottom: '1px solid #000', marginBottom: '5px' }}></div>
          {project.description.map((para: string, i: number) => (
              <p key={i} style={{ margin: 0 }}>{para}</p>
          ))}
        </div>
      </div>

      {/* 3. НИЖНИЙ БЛОК: СЕТКА ДОПОЛНИТЕЛЬНЫХ ИЗОБРАЖЕНИЙ */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: '40px', 
        marginTop: '60px', 
        marginBottom: '60px' 
      }}>
        {/* Берем все изображения начиная со второго */}
        {project.imageGrid.slice(1).map((img: any, i: number) => (
            <div key={i} style={{ position: 'relative', width: '100%', aspectRatio: '4/3', backgroundColor: '#e5e5e5', border: '1px solid #ccc' }}>
               <VisualPlaceholder label={img.label} />
               <div style={{ position: 'absolute', top: 0, left: 0, fontSize: '12px', padding: '5px', fontWeight: 300 }}>+{i+2}</div>
            </div>
        ))}
      </div>
    </div>
  );
}

'use client';
import { useParams } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';

const projectsData: any = {
  'asiya-site': {
    title: 'сайт для Асии',
    client: 'Асия',
    task: 'дизайн сайта, фронтенд, бэкенд',
    year: '2026',
    tags: '[ веб-дизайн, разработка ]',
    // Точки в конце добавлены прямо в текст, чтобы они обрезались как надо
    desc: 'полная разработка экосистемы для артиста: треки, концерты, магазин мерча и минималистичный интерфейс с акцентом на контент......................................................................................................................................',
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
    desc: 'разработка и производство уникальных ювелирных изделий для артиста.................................................................................................................................',
    credits: [
      { role: '[дизайн / 3d]', display: 't.me/Влад Марков', url: 'https://t.me/babydonthurtmovich' }
    ]
  }
};

export default function CasePage() {
  const params = useParams();
  const caseId = params.case as string;
  const project = projectsData[caseId] || projectsData['asiya-site'];

  // Идеально ровная строка с АВТОМАТИЧЕСКИМИ точками (как в карточке товара)
  const InfoRow = ({ label, value, isValueBold = false }: any) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'flex-end', width: '100%', marginBottom: '10px' }}>
      <span style={{ fontWeight: 800, whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ 
        margin: '0 10px', 
        overflow: 'hidden', 
        whiteSpace: 'nowrap', 
        opacity: 0.8, 
        position: 'relative', 
        top: '-4px',
        letterSpacing: '2px' // Разреженные точки как в макете
      }}>
        ..........................................................................................................................................................................................
      </div>
      <span style={{ fontWeight: isValueBold ? 800 : 500, whiteSpace: 'nowrap' }}>{value}</span>
    </div>
  );

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      maxHeight: '100vh', 
      overflow: 'hidden', // БЕЗ СКРОЛЛА
      display: 'flex', 
      flexDirection: 'column', 
      flex: 1, 
      fontFamily: 'inherit',
      boxSizing: 'border-box'
    }}>
      
      {/* НАВИГАЦИЯ */}
      <div style={{ width: '100%' }}>
        <Breadcrumbs path={[
          { name: 'WH4T!SLOV3', href: '/', icon: '📁' },
          { name: 'PORTFOL1O', href: '/portfolio', icon: '📂' },
          { name: project.title.toUpperCase(), icon: '📄' }
        ]} />
      </div>

      {/* ОСНОВНАЯ СЕТКА */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: '480px 1fr', // Жесткие 480px под фото, остаток под текст
        gap: '60px', 
        marginTop: '40px',
        alignItems: 'flex-start',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        
        {/* ЛЕВАЯ КОЛОНКА (Фото + Теги) */}
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          
          <div style={{ position: 'relative', width: '100%', aspectRatio: '16/10', marginTop: '10px' }}>
            {/* Крестики строго по углам */}
            <div style={{ position: 'absolute', top: 0, left: 0, transform: 'translate(-50%, -50%)', fontWeight: 300, fontSize: '20px', lineHeight: 1 }}>+</div>
            <div style={{ position: 'absolute', top: 0, right: 0, transform: 'translate(50%, -50%)', fontWeight: 300, fontSize: '20px', lineHeight: 1 }}>+</div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, transform: 'translate(-50%, 50%)', fontWeight: 300, fontSize: '20px', lineHeight: 1 }}>+</div>
            <div style={{ position: 'absolute', bottom: 0, right: 0, transform: 'translate(50%, 50%)', fontWeight: 300, fontSize: '20px', lineHeight: 1 }}>+</div>
            
            <div style={{ width: '100%', height: '100%', backgroundColor: '#e5e5e5' }}></div>
          </div>
          
          {/* Теги под фото */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', fontWeight: 800, fontSize: '14px' }}>
            <span>{project.tags}</span>
            <span>[ {project.year} ]</span>
          </div>
        </div>

        {/* ПРАВАЯ КОЛОНКА (Умный текст) */}
        <div style={{ display: 'flex', flexDirection: 'column', fontSize: '14px', maxWidth: '650px' }}>
          
          <InfoRow label="название проекта" value={project.title} isValueBold={true} />
          <InfoRow label="клиент" value={project.client} />
          
          {/* Центральный разделитель */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'flex-end', width: '100%', margin: '4px 0 12px 0' }}>
            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', opacity: 0.8, letterSpacing: '2px', position: 'relative', top: '-4px' }}>....................................................................................................</div>
            <span style={{ margin: '0 15px', fontWeight: 500 }}>сделано с любовью</span>
            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', opacity: 0.8, letterSpacing: '2px', position: 'relative', top: '-4px' }}>....................................................................................................</div>
          </div>

          <InfoRow label="задача" value={project.task} />
          <InfoRow label="год" value={project.year} />

          {/* КОМАНДА: Жесткая сетка для идеального выравнивания */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '40px 0' }}>
            {project.credits.map((credit: any, index: number) => (
              <div key={index} style={{ display: 'grid', gridTemplateColumns: '120px 220px 1fr', alignItems: 'center' }}>
                <div style={{ fontWeight: 500 }}>{index === 0 ? 'авторы:' : ''}</div>
                <div style={{ fontWeight: 800 }}>{credit.role}</div>
                <div>
                  <a 
                    href={credit.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{ 
                      color: '#3b00ff', // Тот самый цвет из макета
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

          {/* ОПИСАНИЕ С ТОЧКАМИ (Обрезается контейнером) */}
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

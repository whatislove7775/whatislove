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
    <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%', marginBottom: '8px' }}>
      <span style={{ fontWeight: 800, whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ 
        flex: 1,
        overflow: 'hidden', 
        whiteSpace: 'nowrap', 
        opacity: 0.8, 
        position: 'relative', 
        top: '-4px',
        margin: '0 8px',
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
      maxWidth: '1000px', // Выравнивает контент с подвалом
      margin: '0 auto', 
      height: '100vh', // Жесткая высота экрана
      overflow: 'hidden', // УБИВАЕТ ЛЮБОЙ СКРОЛЛ
      display: 'flex', 
      flexDirection: 'column', 
      fontFamily: 'inherit',
      boxSizing: 'border-box',
      padding: '40px 20px' // Компактные отступы
    }}>
      
      {/* НАВИГАЦИЯ (Строго по макету: [<], путь и [×]) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', fontWeight: 800, fontSize: '14px', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link href="/portfolio" style={{ textDecoration: 'none', color: 'inherit' }}>[{"<"}]</Link>
          <Breadcrumbs path={[
            { name: 'WH4T!SLOV3', href: '/', icon: '📁' },
            { name: 'PORTFOL1O', href: '/portfolio', icon: '📁' },
            { name: project.title.toUpperCase(), icon: '📄' }
          ]} />
        </div>
        <Link href="/portfolio" style={{ textDecoration: 'none', color: 'inherit', fontSize: '16px' }}>
          [×]
        </Link>
      </div>

      {/* ОСНОВНАЯ СЕТКА */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: '400px 1fr', // 400px жестко под фото, остаток под текст
        gap: '60px', 
        alignItems: 'flex-start',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        
        {/* ЛЕВАЯ КОЛОНКА (Фото + Теги) */}
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          
          <div style={{ position: 'relative', width: '100%' }}>
            {/* Крестики вынесены ровно по углам */}
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
          
          {/* Центральный разделитель */}
          <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%', margin: '4px 0 10px 0' }}>
            <div style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', opacity: 0.8, letterSpacing: '2px', position: 'relative', top: '-4px' }}>....................................................................................................</div>
            <span style={{ margin: '0 15px', fontWeight: 500, whiteSpace: 'nowrap' }}>сделано с любовью</span>
            <div style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', opacity: 0.8, letterSpacing: '2px', position: 'relative', top: '-4px' }}>....................................................................................................</div>
          </div>

          <InfoRow label="задача" value={project.task} />
          <InfoRow label="год" value={project.year} />

          {/* АВТОРЫ (Идеальная сетка, ссылки прибиты к правому краю) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '30px 0' }}>
            {project.credits.map((credit: any, index: number) => (
              <div key={index} style={{ display: 'grid', gridTemplateColumns: '70px auto 1fr', alignItems: 'baseline', gap: '20px' }}>
                <div style={{ fontWeight: 500 }}>{index === 0 ? 'авторы:' : ''}</div>
                <div style={{ fontWeight: 800 }}>{credit.role}</div>
                <div style={{ textAlign: 'right' }}>
                  <a 
                    href={credit.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{ 
                      color: '#3b00ff', // Фиолетовый
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

          {/* ОПИСАНИЕ (Текст слева + автоматические точки до конца блока) */}
          <div style={{ 
            fontWeight: 500, 
            lineHeight: 1.5, 
            textAlign: 'left', // СТРОГО СЛЕВА, без дырок в тексте
            width: '100%',
            maxHeight: '4.5em', // Ограничение на 3 строки
            overflow: 'hidden', // Обрезает лишние точки
            position: 'relative'
          }}>
            <span>{project.desc}</span>
            <span style={{ 
              opacity: 0.8, 
              letterSpacing: '2px', 
              wordBreak: 'break-all', // Позволяет точкам аккуратно переноситься и заполнять пустоту
              marginLeft: '5px' 
            }}>
              ........................................................................................................................................................................................................................................................................................................................................................................................................................
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}

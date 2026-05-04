'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';

const projectsData: any = {
  'asiya-site': {
    title: 'сайт для Асии',
    client: 'Асия',
    task: 'дизайн сайта, фронтенд, бэкенд',
    year: '2026',
    tags: '[ веб-дизайн, разработка ]',
    desc: 'Полная разработка экосистемы для артиста: треки, концерты, магазин мерча и минималистичный интерфейс с акцентом на контент.',
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
    desc: 'Разработка и производство уникальных ювелирных изделий для артиста. Полный цикл от эскиза до металла.',
    credits: [
      { role: '[дизайн / 3d]', display: 't.me/Влад Марков', url: 'https://t.me/babydonthurtmovich' }
    ]
  }
};

export default function CasePage() {
  const params = useParams();
  const caseId = params.case as string;
  const project = projectsData[caseId] || projectsData['asiya-site'];

  // Идеальная строка: текст слева, текст справа, а между ними гибкая пунктирная линия
  const InfoRow = ({ label, value, isValueBold = false }: any) => (
    <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%', marginBottom: '10px', fontSize: '14px' }}>
      <span style={{ fontWeight: 800 }}>{label}</span>
      <div style={{ 
        flexGrow: 1, 
        borderBottom: '2px dotted rgba(0,0,0,0.3)', 
        margin: '0 10px', 
        position: 'relative', 
        top: '-4px' 
      }}></div>
      <span style={{ fontWeight: isValueBold ? 800 : 500, textAlign: 'right' }}>{value}</span>
    </div>
  );

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      overflow: 'hidden', // Жестко убираем скролл
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', // Центрируем контент
      fontFamily: 'inherit',
      boxSizing: 'border-box',
      padding: '40px' 
    }}>
      
      {/* КОНТЕЙНЕР ДЛЯ КОНТЕНТА (Ограничиваем ширину для красоты) */}
      <div style={{ width: '100%', maxWidth: '1100px', display: 'flex', flexDirection: 'column', height: '100%' }}>
        
        {/* НАВИГАЦИЯ */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', fontWeight: 800, fontSize: '14px', marginBottom: '50px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Link href="/portfolio" style={{ textDecoration: 'none', color: 'inherit' }}>[{'<'}]</Link>
            <Breadcrumbs path={[
              { name: 'WH4T!SLOV3', href: '/', icon: '📁' },
              { name: 'PORTFOL1O', href: '/portfolio', icon: '📁' },
              { name: project.title.toUpperCase(), icon: '📄' }
            ]} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit', fontSize: '16px' }}>[ 🏠 ]</Link>
            <Link href="/portfolio" style={{ textDecoration: 'none', color: 'inherit', fontSize: '16px' }}>[ × ]</Link>
          </div>
        </div>

        {/* ОСНОВНАЯ СЕТКА */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'minmax(400px, 500px) 1fr', // Идеальная пропорция: левая колонка от 400 до 500px, правая занимает остаток
          gap: '80px', 
          width: '100%',
          flexGrow: 1
        }}>
          
          {/* ЛЕВАЯ КОЛОНКА (Фото) */}
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            
            <div style={{ position: 'relative', width: '100%', aspectRatio: '16/10' }}>
              {/* Крестики - выровнены ровно по углам */}
              <div style={{ position: 'absolute', top: '-12px', left: '-12px', fontWeight: 300, fontSize: '24px', lineHeight: 1 }}>+</div>
              <div style={{ position: 'absolute', top: '-12px', right: '-12px', fontWeight: 300, fontSize: '24px', lineHeight: 1 }}>+</div>
              <div style={{ position: 'absolute', bottom: '-12px', left: '-12px', fontWeight: 300, fontSize: '24px', lineHeight: 1 }}>+</div>
              <div style={{ position: 'absolute', bottom: '-12px', right: '-12px', fontWeight: 300, fontSize: '24px', lineHeight: 1 }}>+</div>
              
              <div style={{ width: '100%', height: '100%', backgroundColor: '#e5e5e5' }}></div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', fontWeight: 800, fontSize: '14px' }}>
              <span>{project.tags}</span>
              <span>[ {project.year} ]</span>
            </div>
          </div>

          {/* ПРАВАЯ КОЛОНКА (Инфо) */}
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            
            {/* Паспорт проекта */}
            <InfoRow label="название проекта" value={project.title} isValueBold={true} />
            <InfoRow label="клиент" value={project.client} />
            
            <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%', margin: '10px 0 15px 0' }}>
              <div style={{ flexGrow: 1, borderBottom: '2px dotted rgba(0,0,0,0.3)', position: 'relative', top: '-4px' }}></div>
              <span style={{ margin: '0 15px', fontWeight: 500, fontSize: '14px' }}>сделано с любовью</span>
              <div style={{ flexGrow: 1, borderBottom: '2px dotted rgba(0,0,0,0.3)', position: 'relative', top: '-4px' }}></div>
            </div>

            <InfoRow label="задача" value={project.task} />
            <InfoRow label="год" value={project.year} />

            {/* Команда */}
            <div style={{ display: 'flex', marginTop: '40px', marginBottom: '40px', fontSize: '14px' }}>
              <div style={{ width: '100px', fontWeight: 500 }}>авторы:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flexGrow: 1 }}>
                {project.credits.map((credit: any, index: number) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', width: '100%' }}>
                    <span style={{ fontWeight: 800 }}>{credit.role}</span>
                    <a 
                      href={credit.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={{ color: '#3b00ff', textDecoration: 'none', fontWeight: 800 }} // Твой фиолетовый
                    >
                      {credit.display}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Описание с автоматическими точками до конца контейнера */}
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              <div style={{ display: 'inline', fontWeight: 500, lineHeight: 1.6, fontSize: '14px', textAlign: 'left' }}>
                {project.desc}
                {/* CSS трюк: забиваем остаток строки точками */}
                <span style={{ 
                  display: 'inline-block', 
                  width: '100%', 
                  borderBottom: '2px dotted rgba(0,0,0,0.3)', 
                  marginBottom: '4px',
                  opacity: 0.5
                }}></span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

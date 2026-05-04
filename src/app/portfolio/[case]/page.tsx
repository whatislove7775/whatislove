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
    // Описание с точками в конце, как в макете
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

  // Идеально ровная строка с автоматическими точками (как в товарах)
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
      boxSizing: 'border-box',
      padding: '30px' // ВОТ ОН: Отступ от краев экрана, чтобы ничего не резалось
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
        
        {/* ЛЕВАЯ КОЛОНКА (Галерея 3+1) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: '20px' }}>
          
          {/* Главное фото в обертке с крестиками */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Паддинг 15px, чтобы крестики не резались боком контейнера */}
            <div style={{ position: 'relative', width: '100%', padding: '15px', boxSizing: 'border-box' }}>
              {/* Крестики - они НЕ равняются, они торчат наружу */}
              <div style={{ position: 'absolute', top: 0, left: 0, transform: 'translate(-50%, -50%)', fontWeight: 300, fontSize: '20px', lineHeight: 1 }}>+</div>
              <div style={{ position: 'absolute', top: 0, right: 0, transform: 'translate(50%, -50%)', fontWeight: 300, fontSize: '20px', lineHeight: 1 }}>+</div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, transform: 'translate(-50%, 50%)', fontWeight: 300, fontSize: '20px', lineHeight: 1 }}>+</div>
              <div style={{ position: 'absolute', bottom: 0, right: 0, transform: 'translate(50%, 50%)', fontWeight: 300, fontSize: '20px', lineHeight: 1 }}>+</div>
              
              {/* Сама СЕРАЯ ФОТО-КАРТОЧКА */}
              <div id="main-photo" style={{ width: '100%', aspectRatio: '1/1', backgroundColor: '#e5e5e5' }}></div>
            </div>
            {/* Подпись снизу, НЕ равняется, просто торчит */}
            <div style={{ textAlign: 'center', marginTop: '10px', fontWeight: 800, fontSize: '14px' }}>&lt;333*</div>
          </div>

          {/* МИНИАТЮРЫ - ВЫРАВНИВАЕМ ЖЕСТКО ПО ВЫСОТЕ ФОТО-КАРТОЧКИ */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            width: '80px',
            // Начинаем ровно по верхней границе серого фото (учитываем padding 15px)
            marginTop: '15px', 
            // Заканчиваем ровно по нижней границе серого фото (учитываем aspectRatio)
            height: '390px', // Высота как у серого фото
            justifyContent: 'space-between', // Плотная расстановка миниатюр
          }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ width: '100%', aspectRatio: '1/1', backgroundColor: '#e5e5e5' }}></div>
            ))}
          </div>
        </div>

        {/* ПРАВАЯ КОЛОНКА (Умный текст) */}
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            fontSize: '14px', 
            maxWidth: '650px', 
            marginTop: '15px', // Чтобы текст начинался по верхней границе фото
            height: '390px', // Высота как у серого фото
            justifyContent: 'space-between' // Тянем контент от верха до низа
        }}>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
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
          </div>

          {/* КОМАНДА + ОПИСАНИЕ (Тянем вниз) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* КОМАНДА: Жесткая сетка для идеального выравнивания */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
    </div>
  );
}

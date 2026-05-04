'use client';
import { useParams } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';

// Данные кейсов с командой
const projectsData: any = {
  'creed-rings': {
    title: 'кольца для Крида',
    year: '2025',
    desc: 'сделали дизайн, модели, произвели, упаковали',
    credits: [
      { role: 'дизайн / 3d', display: 't.me/Влад Марков', url: 'https://t.me/babydonthurtmovich' },
      { role: 'менеджмент', display: 't.me/Никита Оленёв', url: 'https://t.me/nekitocka' },
      { role: 'производство', display: 't.me/Илья Дахновский', url: 'https://t.me/to_id_hide' } // @ убран из ссылки для корректного перехода
    ]
  },
  'asiya-site': {
    title: 'сайт для Асии',
    year: '2025',
    desc: 'сделали дизайн, фронтенд, бэкенд и т.д.',
    credits: [
      { role: 'фуллстек', display: 't.me/Влад Марков', url: 'https://t.me/babydonthurtmovich' }
    ]
  },
  'asiya-merch': {
    title: 'мерч для Асии',
    year: '2024',
    desc: 'сделали дизайн принтов и дизайн бирок',
    credits: [
      { role: 'дизайн', display: 't.me/Влад Марков', url: 'https://t.me/babydonthurtmovich' }
    ]
  },
  'pins-bans': {
    title: 'значки PINS-BANS',
    year: '2025',
    desc: 'сделали дизайн, модели, произвели, упаковали',
    credits: [
      { role: 'дизайн / 3d', display: 't.me/Влад Марков', url: 'https://t.me/babydonthurtmovich' },
      { role: 'менеджмент', display: 't.me/Никита Оленёв', url: 'https://t.me/nekitocka' }
    ]
  }
};

export default function CasePage() {
  const params = useParams();
  const caseId = params.case as string;
  const project = projectsData[caseId] || projectsData['creed-rings'];

  const InfoRow = ({ label, value, isBold = false }: any) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'flex-end', width: '100%', marginBottom: '4px' }}>
      <span style={{ fontWeight: 800 }}>{label}</span>
      <div style={{ margin: '0 8px', overflow: 'hidden', whiteSpace: 'nowrap', opacity: 0.8, position: 'relative', top: '-1px' }}>
        ..........................................................................................................................................................................................
      </div>
      <span style={{ fontWeight: isBold ? 800 : 500, textAlign: 'right' }}>{value}</span>
    </div>
  );

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'inherit' }}>
      
      {/* НАВИГАЦИЯ */}
      <div style={{ width: '100%', alignSelf: 'flex-start' }}>
        <Breadcrumbs path={[
          { name: 'WH4T!SLOV3', href: '/', icon: '📁' },
          { name: 'PORTFOLIO', href: '/portfolio', icon: '📂' },
          { name: project.title.toUpperCase(), icon: '📄' }
        ]} />
      </div>

      {/* ОСНОВНОЙ КОНТЕЙНЕР (GRID как в товарах) */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: '480px 1fr', 
        gap: '60px', 
        marginTop: '30px',
        alignItems: 'stretch',
        paddingRight: '140px',
        boxSizing: 'border-box'
      }}>
        
        {/* ЛЕВАЯ КОЛОНКА: ГАЛЕРЕЯ КЕЙСА */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: '20px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <div style={{ position: 'relative', width: '100%', padding: '15px', boxSizing: 'border-box' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, transform: 'translate(-50%, -50%)', fontWeight: 300, fontSize: '20px' }}>+</div>
              <div style={{ position: 'absolute', top: 0, right: 0, transform: 'translate(50%, -50%)', fontWeight: 300, fontSize: '20px' }}>+</div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, transform: 'translate(-50%, 50%)', fontWeight: 300, fontSize: '20px' }}>+</div>
              <div style={{ position: 'absolute', bottom: 0, right: 0, transform: 'translate(50%, 50%)', fontWeight: 300, fontSize: '20px' }}>+</div>
              
              <div style={{ width: '100%', aspectRatio: '1/1', backgroundColor: '#e5e5e5' }}></div>
            </div>
            <div style={{ textAlign: 'center', marginTop: '10px', fontWeight: 800, fontSize: '14px', opacity: 0.5 }}>[ главная пикча ]</div>
          </div>

          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'space-between',
            width: '80px',
            marginTop: '15px',
            aspectRatio: '80 / 450',
            maxHeight: '390px'
          }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ width: '100%', aspectRatio: '1/1', backgroundColor: '#e5e5e5' }}></div>
            ))}
          </div>
        </div>

        {/* ПРАВАЯ КОЛОНКА: ИНФО */}
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            marginTop: '15px', 
            height: '390px', 
            justifyContent: 'space-between',
            fontSize: '14px'
        }}>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <InfoRow label="проект" value={project.title} isBold={true} />
            <InfoRow label="год" value={`[ ${project.year} ]`} isBold={true} />

            <div style={{ width: '100%', overflow: 'hidden', whiteSpace: 'nowrap', opacity: 0.8, margin: '15px 0 10px 0' }}>
              ..........................................................................................................................................................................................
            </div>

            <div style={{ fontWeight: 500, lineHeight: 1.4, textAlign: 'left' }}>
              {project.desc}
            </div>

            <div style={{ width: '100%', overflow: 'hidden', whiteSpace: 'nowrap', opacity: 0.8, margin: '15px 0 10px 0' }}>
              ..........................................................................................................................................................................................
            </div>

            {/* КОМАНДА С ФИОЛЕТОВЫМИ ССЫЛКАМИ */}
            <div style={{ fontWeight: 800, marginBottom: '8px' }}>команда:</div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {project.credits.map((credit: any, index: number) => (
                <div key={index} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'flex-end', width: '100%' }}>
                  <span style={{ fontWeight: 500 }}>{credit.role}</span>
                  <div style={{ margin: '0 8px', overflow: 'hidden', whiteSpace: 'nowrap', opacity: 0.8, position: 'relative', top: '-1px' }}>
                    ..........................................................................................................................................................................................
                  </div>
                  <a 
                    href={credit.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{ 
                      color: '#9333ea', // Фиолетовый цвет ссылок
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
        </div>
      </div>
    </div>
  );
}

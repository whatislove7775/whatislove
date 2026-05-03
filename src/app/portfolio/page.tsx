'use client';
import Breadcrumbs from '@/components/Breadcrumbs';

const cases = [
  { id: 1, title: 'JALAGONIA BRANDING', year: '2024', category: 'VISUAL ID' },
  { id: 2, title: 'SKY MAP INTERFACE', year: '2024', category: 'WEB/3D' },
  { id: 3, title: 'OPTIOFFICE SYSTEM', year: '2023', category: 'UI/UX' },
  { id: 4, title: 'CZ-75 3D MODEL', year: '2023', category: 'FABRICATION' },
];

export default function PortfolioPage() {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Breadcrumbs path={[
        { name: 'WH4T!SLOV3', href: '/', icon: '📁' },
        { name: 'PORTFOLIO', icon: '📂' }
      ]} />

      <h1 style={{ fontSize: '48px', fontWeight: 900, margin: '20px 0', letterSpacing: '-2px' }}>
        SELECTED_WORK$
      </h1>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: '60px', 
        marginTop: '20px',
        paddingRight: '60px' 
      }}>
        {cases.map((project) => (
          <div key={project.id} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {/* Карточка кейса */}
            <div style={{ 
              position: 'relative', 
              width: '100%', 
              aspectRatio: '16/9', 
              backgroundColor: '#e5e5e5',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}>
              {/* Крестики по углам (появляются при наведении или всегда) */}
              <div style={{ position: 'absolute', top: '-10px', left: '-10px', fontWeight: 300 }}>+</div>
              <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontWeight: 300 }}>+</div>
              <div style={{ position: 'absolute', bottom: '-10px', left: '-10px', fontWeight: 300 }}>+</div>
              <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', fontWeight: 300 }}>+</div>
            </div>

            {/* Описание кейса в стиле макета */}
            <div style={{ display: 'flex', flexDirection: 'column', fontSize: '14px', fontWeight: 500 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #000', paddingBottom: '5px' }}>
                <span style={{ fontWeight: 800 }}>{project.title}</span>
                <span>{project.year}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '5px' }}>
                <span style={{ opacity: 0.6 }}>CATEGORY:</span>
                <span style={{ fontWeight: 800 }}>[{project.category}]</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

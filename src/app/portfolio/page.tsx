'use client';
import Breadcrumbs from '@/components/Breadcrumbs';

const projects = [
  { name: 'ACEIA', description: 'visual identity', year: '2024' },
  { name: 'EGOR KREED', description: 'merch design', year: '2024' },
  { name: 'JALAGONIA', description: 'branding', year: '2023' },
  { name: 'OPTI OFFICE', description: 'ui/ux app', year: '2023' },
];

export default function PortfolioPage() {
  return (
    <div style={{ width: '100%', maxWidth: '1200px', padding: '20px' }}>
      <Breadcrumbs path={[{ name: 'PORTFOL1O', icon: '📁' }]} />
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '40px', marginTop: '20px' }}>
        {projects.map((proj, i) => (
          <div key={i} style={{ border: '1px solid #000', position: 'relative', paddingBottom: '100%', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '15px', left: '15px', zIndex: 2, fontWeight: 'bold' }}>
              {proj.name} / {proj.description}
            </div>
            <div style={{ position: 'absolute', bottom: '15px', right: '15px', zIndex: 2, fontWeight: 'bold' }}>
              {proj.year}
            </div>
            {/* Сюда потом вставишь изображения через тег <img> */}
            <div style={{ position: 'absolute', inset: 0, backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', color: '#ccc' }}>
              IMG
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

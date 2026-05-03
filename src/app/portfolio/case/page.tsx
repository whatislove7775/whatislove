'use client';
import { useParams } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';

// Имитация данных (потом можно вынести в отдельный файл или API)
const projectsData: any = {
  'asiya-site': {
    title: 'САЙТ ДЛЯ АСИИ',
    year: '2025',
    client: 'ASIYA',
    task: 'DESIGN, FRONTEND, BACKEND',
    desc: 'ПОЛНАЯ РАЗРАБОТКА ЭКОСИСТЕМЫ ДЛЯ АРТИСТА: ТРЕКИ, КОНЦЕРТЫ, МЕРЧ. МИНИМАЛИСТИЧНЫЙ ИНТЕРФЕЙС С АКЦЕНТОМ НА КОНТЕНТ.',
    tags: ['NEXT.JS', 'TYPESCRIPT', 'GSAP']
  },
  'creed-rings': {
    title: 'КОЛЬЦА ДЛЯ КРИДА',
    year: '2025',
    client: 'EGOR CREED',
    task: 'DESIGN, 3D MODELING, PRODUCTION',
    desc: 'РАЗРАБОТКА УНИКАЛЬНЫХ ЮВЕЛИРНЫХ ИЗДЕЛИЙ. ОТ ЭСКИЗА ДО ФИНАЛЬНОЙ УПАКОВКИ И ЛОГИСТИКИ.',
    tags: ['RHINO', 'BLENDER', 'PRODUCTION']
  }
};

export default function CasePage() {
  const params = useParams();
  const id = params.id as string;
  const project = projectsData[id] || projectsData['asiya-site'];

  const InfoRow = ({ label, value }: { label: string, value: string }) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'flex-end', width: '100%', marginBottom: '4px' }}>
      <span style={{ fontWeight: 800 }}>{label}</span>
      <div style={{ margin: '0 8px', overflow: 'hidden', whiteSpace: 'nowrap', opacity: 0.8 }}>
        ........................................................................................................................................................
      </div>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  );

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'inherit' }}>
      <Breadcrumbs path={[
        { name: 'WH4T!SLOV3', href: '/', icon: '📁' },
        { name: 'PORTFOLIO', href: '/portfolio', icon: '📂' },
        { name: project.title, icon: '📄' }
      ]} />

      <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
        
        {/* ТЕХНИЧЕСКИЙ ПАСПОРТ КЕЙСА */}
        <div style={{ maxWidth: '600px', width: '100%' }}>
          <InfoRow label="ПРОЕКТ" value={project.title} />
          <InfoRow label="КЛИЕНТ" value={project.client} />
          <InfoRow label="ЗАДАЧА" value={project.task} />
          <InfoRow label="ГОД" value={project.year} />
          <div style={{ width: '100%', overflow: 'hidden', whiteSpace: 'nowrap', opacity: 0.8, margin: '8px 0' }}>
            ........................................................................................................................................................
          </div>
          <div style={{ fontSize: '14px', lineHeight: '1.4', textAlign: 'justify' }}>
            {project.desc}
          </div>
        </div>

        {/* ГЛАВНЫЙ ВИЗУАЛ */}
        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', backgroundColor: '#e5e5e5', padding: '20px', boxSizing: 'border-box' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, transform: 'translate(-50%, -50%)', fontWeight: 300, fontSize: '24px' }}>+</div>
          <div style={{ position: 'absolute', top: 0, right: 0, transform: 'translate(50%, -50%)', fontWeight: 300, fontSize: '24px' }}>+</div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, transform: 'translate(-50%, 50%)', fontWeight: 300, fontSize: '24px' }}>+</div>
          <div style={{ position: 'absolute', bottom: 0, right: 0, transform: 'translate(50%, 50%)', fontWeight: 300, fontSize: '24px' }}>+</div>
          
          <div style={{ width: '100%', height: '100%', backgroundColor: '#d0d0d0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontWeight: 800, opacity: 0.2, fontSize: '24px' }}>[ MAIN_VISUAL_01 ]</span>
          </div>
        </div>

        {/* СЕТКА ДОПОЛНИТЕЛЬНЫХ ИЗОБРАЖЕНИЙ */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '60px' }}>
          {[2, 3].map(i => (
            <div key={i} style={{ position: 'relative', width: '100%', aspectRatio: '4/3', backgroundColor: '#e5e5e5' }}>
               <div style={{ position: 'absolute', top: 0, left: 0, fontWeight: 300, fontSize: '14px', padding: '5px' }}>+{i}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

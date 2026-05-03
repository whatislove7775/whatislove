'use client';
import { useParams } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';

// Те же данные
const projectsData: any = {
  'asiya-site': {
    title: 'сайт для Асии',
    year: '2025',
    client: 'ASIYA',
    task: 'DESIGN, FRONTEND, BACKEND',
    desc: 'ПОЛНАЯ РАЗРАБОТКА ЭКОСИСТЕМЫ ДЛЯ АРТИСТА: ТРЕКИ, КОНЦЕРТЫ, МЕРЧ. МИНИМАЛИСТИЧНЫЙ ИНТЕРФЕЙС С АКЦЕНТОМ НА КОНТЕНТ.',
  },
  'creed-rings': {
    title: 'кольца для Крида',
    year: '2025',
    client: 'EGOR CREED',
    task: 'DESIGN, 3D MODELING, PRODUCTION',
    desc: 'РАЗРАБОТКА УНИКАЛЬНЫХ ЮВЕЛИРНЫХ ИЗДЕЛИЙ. ОТ ЭСКИЗА ДО ФИНАЛЬНОЙ УПАКОВКИ И ЛОГИСТИКИ.',
  },
  'asiya-merch': {
    title: 'мерч для Асии',
    year: '2024',
    client: 'ASIYA',
    task: 'DESIGN, MERCH',
    desc: 'ДИЗАЙН ПРИНТОВ И БИРОК ДЛЯ НОВОЙ КОЛЛЕКЦИИ МЕРЧА.',
  },
  'pins-bans': {
    title: 'значки PINS-BANS',
    year: '2025',
    client: 'PINS-BANS',
    task: 'PRODUCTION',
    desc: 'СЕРИЯ ЛИМИТИРОВАННЫХ ПИНОВ С УНИКАЛЬНЫМ ДИЗАЙНОМ.',
  }
};

export default function CasePage() {
  const params = useParams();
  // Теперь берем case, потому что папка называется [case]
  const caseId = params.case as string; 
  const project = projectsData[caseId] || projectsData['asiya-site'];

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
          <InfoRow label="ПРОЕКТ" value={project.title.toUpperCase()} />
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

        {/* ГЛАВНЫЙ ВИЗУАЛ С КРЕСТИКАМИ */}
        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', backgroundColor: '#e5e5e5', padding: '20px', boxSizing: 'border-box' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, transform: 'translate(-50%, -50%)', fontWeight: 300, fontSize: '24px' }}>+</div>
          <div style={{ position: 'absolute', top: 0, right: 0, transform: 'translate(50%, -50%)', fontWeight: 300, fontSize: '24px' }}>+</div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, transform: 'translate(-50%, 50%)', fontWeight: 300, fontSize: '24px' }}>+</div>
          <div style={{ position: 'absolute', bottom: 0, right: 0, transform: 'translate(50%, 50%)', fontWeight: 300, fontSize: '24px' }}>+</div>
          
          <div style={{ width: '100%', height: '100%', backgroundColor: '#d0d0d0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontWeight: 800, opacity: 0.2, fontSize: '24px' }}>[ VISUAL_DATA_01 ]</span>
          </div>
        </div>
      </div>
    </div>
  );
}

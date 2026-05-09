'use client';
import { useEffect, useState } from 'react';
import Breadcrumbs from '@/components/Breadcrumbs';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function PortfolioPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCases() {
      // Запрашиваем кейсы из базы. Сортировка order('year', { ascending: false })
      // автоматически поднимет наверх самые новые проекты.
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .order('year', { ascending: false });

      if (!error && data) {
        setProjects(data);
      }
      setLoading(false);
    }
    
    fetchCases();
  }, []);

  if (loading) return <div style={{ padding: '20px', fontWeight: 800, fontFamily: 'inherit' }}>ЗАГРУЗКА ПОРТФОЛИО...</div>;

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'inherit' }}>
      
      {/* Хлебные крошки */}
      <div style={{ width: '100%', alignSelf: 'flex-start' }}>
        <Breadcrumbs path={[
          { name: 'WH4T!SLOV3', href: '/', icon: '📁' },
          { name: 'PORTFOLIO', icon: '📂' }
        ]} />
      </div>

      {/* Сетка кейсов: 2 колонки */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '60px 40px', 
        marginTop: '40px',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {projects.map((project) => (
          <Link 
            key={project.id} 
            href={`/portfolio/${project.slug}`} // Берем slug из базы для правильной ссылки
            style={{ textDecoration: 'none', color: 'inherit', display: 'flex', gap: '20px', alignItems: 'flex-start' }}
          >
            {/* Левая часть: Фото с крестиками */}
            <div style={{ position: 'relative', width: '160px', padding: '10px', flexShrink: 0, boxSizing: 'border-box' }}>
              {/* Крестики по углам контейнера */}
              <div style={{ position: 'absolute', top: 0, left: 0, transform: 'translate(-50%, -50%)', fontWeight: 300, fontSize: '18px' }}>+</div>
              <div style={{ position: 'absolute', top: 0, right: 0, transform: 'translate(50%, -50%)', fontWeight: 300, fontSize: '18px' }}>+</div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, transform: 'translate(-50%, 50%)', fontWeight: 300, fontSize: '18px' }}>+</div>
              <div style={{ position: 'absolute', bottom: 0, right: 0, transform: 'translate(50%, 50%)', fontWeight: 300, fontSize: '18px' }}>+</div>
              
              {/* Серый/черный квадрат фото */}
              <div style={{ width: '100%', aspectRatio: '1/1', backgroundColor: '#000', overflow: 'hidden' }}>
                 {/* Выводим картинку, если ссылка есть в базе */}
                 {project.image_url && (
                   <img src={project.image_url} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                 )}
              </div>
            </div>

            {/* Правая часть: Описание */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', paddingTop: '10px' }}>
              <div style={{ fontWeight: 800, fontSize: '16px' }}>{project.title}</div>
              <div style={{ fontWeight: 500, lineHeight: '1.3', maxWidth: '200px' }}>
                {project.desc}
              </div>
              <div style={{ fontWeight: 800, marginTop: '10px' }}>
                [ {project.year} ]
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

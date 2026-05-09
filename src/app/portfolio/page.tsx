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
      // Подтягиваем данные. Сортируем по году от новых к старым
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
            href={`/portfolio/${project.slug}`} 
            style={{ textDecoration: 'none', color: 'inherit', display: 'flex', gap: '20px', alignItems: 'flex-start' }}
          >
            {/* Левая часть: Фото с крестиками */}
            <div style={{ position: 'relative', width: '160px', padding: '10px', flexShrink: 0, boxSizing: 'border-box' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, transform: 'translate(-50%, -50%)', fontWeight: 300, fontSize: '18px' }}>+</div>
              <div style={{ position: 'absolute', top: 0, right: 0, transform: 'translate(50%, -50%)', fontWeight: 300, fontSize: '18px' }}>+</div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, transform: 'translate(-50%, 50%)', fontWeight: 300, fontSize: '18px' }}>+</div>
              <div style={{ position: 'absolute', bottom: 0, right: 0, transform: 'translate(50%, 50%)', fontWeight: 300, fontSize: '18px' }}>+</div>
              
              <div style={{ width: '100%', aspectRatio: '1/1', backgroundColor: '#000', overflow: 'hidden' }}>
                 {project.image_url && (
                   <img src={project.image_url} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                 )}
              </div>
            </div>

            {/* Правая часть: Описание */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', paddingTop: '10px' }}>
              <div style={{ fontWeight: 800, fontSize: '16px' }}>{project.title}</div>
              
              {/* Описание с жесткой обрезкой в 3 строки */}
              <div style={{ 
                fontWeight: 500, 
                lineHeight: '1.3', 
                maxWidth: '200px',
                display: '-webkit-box',
                WebkitLineClamp: 3, // Ровно 3 строки
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
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

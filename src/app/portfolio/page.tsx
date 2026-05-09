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
          <div 
            key={project.id} 
            style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}
          >
            {/* Левая часть: Фото с крестиками (ведет внутрь кейса) */}
            <Link 
              href={`/portfolio/${project.slug}`} 
              style={{ position: 'relative', width: '160px', padding: '10px', flexShrink: 0, boxSizing: 'border-box', display: 'block', color: 'inherit', textDecoration: 'none' }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, transform: 'translate(-50%, -50%)', fontWeight: 300, fontSize: '18px' }}>+</div>
              <div style={{ position: 'absolute', top: 0, right: 0, transform: 'translate(50%, -50%)', fontWeight: 300, fontSize: '18px' }}>+</div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, transform: 'translate(-50%, 50%)', fontWeight: 300, fontSize: '18px' }}>+</div>
              <div style={{ position: 'absolute', bottom: 0, right: 0, transform: 'translate(50%, 50%)', fontWeight: 300, fontSize: '18px' }}>+</div>
              
              <div style={{ width: '100%', aspectRatio: '1/1', backgroundColor: '#000', overflow: 'hidden' }}>
                 {project.image_url && (
                   <img src={project.image_url} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                 )}
              </div>
            </Link>

            {/* Правая часть: Описание */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', paddingTop: '10px' }}>
              
              {/* Название: Если есть project_link - делаем синим и внешней ссылкой */}
              <div style={{ fontWeight: 800, fontSize: '16px' }}>
                {project.project_link ? (
                  <a 
                    href={project.project_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      color: '#3b00ff', // Подсвечиваем синим
                      textDecoration: 'none'
                    }}
                  >
                    {project.title}
                  </a>
                ) : (
                  <Link href={`/portfolio/${project.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    {project.title}
                  </Link>
                )}
              </div>
              
              {/* Описание с жесткой обрезкой в 3 строки (ведет внутрь кейса) */}
              <Link href={`/portfolio/${project.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ 
                  fontWeight: 500, 
                  lineHeight: '1.3', 
                  maxWidth: '200px',
                  display: '-webkit-box',
                  WebkitLineClamp: 3, 
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {project.desc}
                </div>
              </Link>

              {/* Год (ведет внутрь кейса) */}
              <Link href={`/portfolio/${project.slug}`} style={{ fontWeight: 800, marginTop: '10px', textDecoration: 'none', color: 'inherit', display: 'inline-block' }}>
                [ {project.year} ]
              </Link>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

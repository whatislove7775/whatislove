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
          <div key={project.id} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            
            {/* Левая часть: Фото с крестиками (ведет на ВНУТРЕННЮЮ страницу кейса) */}
            <Link 
              href={`/portfolio/${project.slug}`} 
              style={{ position: 'relative', width: '160px', padding: '10px', flexShrink: 0, boxSizing: 'border-box', display: 'block', color: 'inherit' }}
            >
              {/* Крестики по углам контейнера */}
              <div style={{ position: 'absolute', top: 0, left: 0, transform: 'translate(-50%, -50%)', fontWeight: 300, fontSize: '18px' }}>+</div>
              <div style={{ position: 'absolute', top: 0, right: 0, transform: 'translate(50%, -50%)', fontWeight: 300, fontSize: '18px' }}>+</div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, transform: 'translate(-50%, 50%)', fontWeight: 300, fontSize: '18px' }}>+</div>
              <div style={{ position: 'absolute', bottom: 0, right: 0, transform: 'translate(50%, 50%)', fontWeight: 300, fontSize: '18px' }}>+</div>
              
              {/* Квадрат фото */}
              <div style={{ width: '100%', aspectRatio: '1/1', backgroundColor: '#000', overflow: 'hidden' }}>
                 {project.image_url && (
                   <img src={project.image_url} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                 )}
              </div>
            </Link>

            {/* Правая часть: Текст */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', paddingTop: '10px', flex: 1 }}>
              
              {/* Название проекта (если есть project_link - это внешняя ссылка) */}
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
                    {project.title} ↗
                  </a>
                ) : (
                  <Link href={`/portfolio/${project.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    {project.title}
                  </Link>
                )}
              </div>

              {/* Вывод авторов вместо описания */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontWeight: 500, maxWidth: '200px' }}>
                {project.credits && project.credits.map((credit: any, idx: number) => (
                  <span key={idx} style={{ opacity: 0.8 }}>
                    {credit.display}
                  </span>
                ))}
              </div>

              {/* Год (ссылка на внутреннюю страницу) */}
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

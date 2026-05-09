'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import { supabase } from '@/lib/supabase';

export default function CasePage() {
  const params = useParams();
  const caseId = params.case as string; // Берем caseId из URL
  
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCase() {
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('slug', caseId)
        .single();

      if (!error && data) {
        setProject(data);
      }
      setLoading(false);
    }

    if (caseId) {
      fetchCase();
    }
  }, [caseId]);

  // Выравнивание строго по базовой линии (baseline), точки в нижнем регистре
  // Добавлен строгий return для избежания Syntax Error в Vercel
  const InfoRow = ({ label, value, isValueBold = false }: any) => {
    return (
      <div style={{ display: 'flex', alignItems: 'baseline', width: '100%', marginBottom: '8px' }}>
        <span style={{ fontWeight: 800, whiteSpace: 'nowrap' }}>{label}</span>
        <div style={{ 
          flex: 1,
          overflow: 'hidden', 
          whiteSpace: 'nowrap', 
          opacity: 0.8, 
          margin: '0 8px',
          letterSpacing: '2px' 
        }}>
          ..........................................................................................................................................................................................
        </div>
        <span style={{ fontWeight: isValueBold ? 800 : 500, whiteSpace: 'nowrap' }}>{value}</span>
      </div>
    );
  };

  if (loading) return <div style={{ padding: '20px', fontWeight: 800, fontFamily: 'inherit' }}>ЗАГРУЗКА...</div>;
  if (!project) return <div style={{ padding: '20px', fontWeight: 800, fontFamily: 'inherit' }}>КЕЙС НЕ НАЙДЕН [404]</div>;

  const creditsList = project.credits || [];

  return (
    <div style={{ 
      width: '100%', 
      maxWidth: '1000px', 
      margin: '0 auto', 
      display: 'flex', 
      flexDirection: 'column', 
      fontFamily: 'inherit',
      boxSizing: 'border-box',
      // Верхний отступ уменьшен до 15px, чтобы поднять навигацию выше
      padding: '15px 20px 40px 20px',
      position: 'relative'
    }}>
      
      {/* НАВИГАЦИЯ */}
      {/* Обертка с zIndex: 100 гарантирует, что невидимые шапки не перекроют клики */}
      <div style={{ width: '100%', position: 'relative', zIndex: 100 }}>
        <Breadcrumbs path={[
          { name: 'WH4T!SLOV3', href: '/', icon: '📁' },
          { name: 'PORTFOL1O', href: '/portfolio', icon: '📂' },
          { name: project.title.toUpperCase(), icon: '📄' }
        ]} />
      </div>

      {/* ОСНОВНАЯ СЕТКА */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'minmax(350px, 450px) minmax(0, 1fr)', 
        gap: '60px', 
        alignItems: 'flex-start',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        
        {/* ЛЕВАЯ КОЛОНКА (Фото + Теги) */}
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          
          <div style={{ position: 'relative', width: '100%' }}>
            <div style={{ position: 'absolute', top: '-15px', left: '-15px', fontWeight: 300, fontSize: '20px', lineHeight: 1 }}>+</div>
            <div style={{ position: 'absolute', top: '-15px', right: '-15px', fontWeight: 300, fontSize: '20px', lineHeight: 1 }}>+</div>
            <div style={{ position: 'absolute', bottom: '-15px', left: '-15px', fontWeight: 300, fontSize: '20px', lineHeight: 1 }}>+</div>
            <div style={{ position: 'absolute', bottom: '-15px', right: '-15px', fontWeight: 300, fontSize: '20px', lineHeight: 1 }}>+</div>
            
            <div style={{ width: '100%', aspectRatio: '16/10', backgroundColor: '#e5e5e5', overflow: 'hidden' }}>
              {/* Подтягиваем картинку из базы */}
              {project.image_url && (
                <img src={project.image_url} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', fontWeight: 800, fontSize: '13px' }}>
            <span>{project.tags}</span>
            <span>[ {project.year} ]</span>
          </div>
        </div>

        {/* ПРАВАЯ КОЛОНКА (Текст) */}
        <div style={{ display: 'flex', flexDirection: 'column', fontSize: '14px', width: '100%' }}>
          
          <InfoRow label="название проекта" value={project.title} isValueBold={true} />
          <InfoRow label="клиент" value={project.client} />
          
          {/* Сделано с любовью */}
          <div style={{ display: 'flex', alignItems: 'baseline', width: '100%', margin: '4px 0 10px 0' }}>
            <div style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', opacity: 0.8, letterSpacing: '2px' }}>....................................................................................................</div>
            <span style={{ margin: '0 15px', fontWeight: 500, whiteSpace: 'nowrap' }}>сделано с любовью</span>
            <div style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', opacity: 0.8, letterSpacing: '2px' }}>....................................................................................................</div>
          </div>

          <InfoRow label="задача" value={project.task} />
          <InfoRow label="год" value={project.year} />

          {/* АВТОРЫ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '30px 0' }}>
            {creditsList.map((credit: any, index: number) => (
              <div key={index} style={{ display: 'grid', gridTemplateColumns: '90px max-content minmax(0, 1fr)', alignItems: 'baseline', width: '100%' }}>
                <div style={{ fontWeight: 500 }}>{index === 0 ? 'авторы:' : ''}</div>
                <div style={{ fontWeight: 800, whiteSpace: 'nowrap' }}>{credit.role}</div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', overflow: 'hidden' }}>
                  <a 
                    href={credit.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{ 
                      color: '#3b00ff', 
                      textDecoration: 'none', 
                      fontWeight: 800,
                      whiteSpace: 'nowrap',
                      position: 'relative',
                      zIndex: 100 // Делаем ссылки авторов тоже защищенными от перекрытия
                    }}
                  >
                    {credit.display}
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* ОПИСАНИЕ С АВТОМАТИЧЕСКИМИ ТОЧКАМИ */}
          <div style={{ 
            fontWeight: 500, 
            lineHeight: 1.5, 
            textAlign: 'justify', // Растягивает текст от края до края ссылок
            width: '100%',
            maxHeight: '4.5em', 
            overflow: 'hidden'
          }}>
            <span>{project.desc}</span>
            <span style={{ 
              opacity: 0.8, 
              letterSpacing: '2px', 
              marginLeft: '5px' 
            }}>
              ................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}

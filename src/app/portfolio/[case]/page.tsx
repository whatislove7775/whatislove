'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import { supabase } from '@/lib/supabase';
import { parseTextForLinks } from '@/lib/parseLinks';

export default function CasePage() {
  const params = useParams();
  const caseId = (params.slug || params.case) as string; 
  
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
      flex: 1,
      display: 'flex', 
      flexDirection: 'column', 
      fontFamily: 'inherit',
      boxSizing: 'border-box',
      padding: '0 40px' // Главный отступ, который держит левую и правую красную линию
    }}>
      
      {/* НАВИГАЦИЯ */}
      <div style={{ width: '100%', padding: '15px 0', position: 'relative', zIndex: 100 }}>
        <Breadcrumbs path={[
          { name: 'WH4T!SLOV3', href: '/', icon: '📁' },
          { name: 'PORTFOL1O', href: '/portfolio', icon: '📂' },
          { name: project.title.toUpperCase(), icon: '📄' }
        ]} />
      </div>

      {/* КОНТЕЙНЕР КОНТЕНТА: Относительно него позиционируется QR-код */}
      <div style={{
        position: 'relative',
        width: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        boxSizing: 'border-box',
        paddingBottom: '40px'
      }}>
        
        {/* QR-КОД: Прибит к правому верхнему углу сетки, ровно под [ x ] */}
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          right: 0, 
          width: '90px', // Оптимальная ширина под макет
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'flex-start',
          zIndex: 10
        }}>
          <a 
            href="https://t.me/whatislove_r" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              textDecoration: 'none',
              color: 'inherit',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            <img src="/qr-code.svg" alt="QR code" style={{ width: '100%', height: 'auto' }} />
            <span style={{
              fontWeight: 800,
              fontSize: '11px',
              marginTop: '8px',
              textAlign: 'left',
              whiteSpace: 'nowrap',
              lineHeight: '1.2',
              textTransform: 'lowercase' // СТРОЧНЫЕ БУКВЫ
            }}>
              заказать<br />дизайн
            </span>
          </a>
        </div>

        {/* СЕТКА: 2 КОЛОНКИ */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'minmax(350px, 450px) minmax(0, 1fr)', 
          gap: '60px', 
          alignItems: 'flex-start',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          
          {/* ЛЕВАЯ КОЛОНКА (Фото) */}
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            
            <div style={{ position: 'relative', width: '100%' }}>
              <div style={{ position: 'absolute', top: '-15px', left: '-15px', fontWeight: 300, fontSize: '20px', lineHeight: 1 }}>+</div>
              <div style={{ position: 'absolute', top: '-15px', right: '-15px', fontWeight: 300, fontSize: '20px', lineHeight: 1 }}>+</div>
              <div style={{ position: 'absolute', bottom: '-15px', left: '-15px', fontWeight: 300, fontSize: '20px', lineHeight: 1 }}>+</div>
              <div style={{ position: 'absolute', bottom: '-15px', right: '-15px', fontWeight: 300, fontSize: '20px', lineHeight: 1 }}>+</div>
              
              <div style={{ width: '100%', aspectRatio: '16/10', backgroundColor: '#e5e5e5', overflow: 'hidden' }}>
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
          <div style={{ 
            position: 'relative', 
            display: 'flex', 
            flexDirection: 'column', 
            fontSize: '14px', 
            width: '100%',
            boxSizing: 'border-box',
            paddingRight: '130px' // Отступ, чтобы текст не врезался в QR-код справа
          }}>
            
            {/* КОНТЕНТ ТЕКСТА */}
            <InfoRow label="название проекта" value={parseTextForLinks(project.title)} isValueBold={true} />
            <InfoRow label="клиент" value={project.client} />
            
            <div style={{ display: 'flex', alignItems: 'baseline', width: '100%', margin: '4px 0 10px 0' }}>
              <div style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', opacity: 0.8, letterSpacing: '2px' }}>....................................................................................................</div>
              <span style={{ margin: '0 15px', fontWeight: 500, whiteSpace: 'nowrap' }}>сделано с любовью</span>
              <div style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', opacity: 0.8, letterSpacing: '2px' }}>....................................................................................................</div>
            </div>

            <InfoRow label="задача" value={project.task} />
            <InfoRow label="год" value={project.year} />

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
                        zIndex: 100
                      }}
                    >
                      {credit.display}
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ 
              fontWeight: 500, 
              lineHeight: 1.5, 
              textAlign: 'justify', 
              width: '100%',
              overflow: 'hidden'
            }}>
              <span>{parseTextForLinks(project.desc)}</span>
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
    </div>
  );
}

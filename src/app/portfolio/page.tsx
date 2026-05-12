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
        .order('year', { ascending: false }) // Сначала сортируем по убыванию года
        .order('id', { ascending: false });  // Если год совпадает, более новые (по добавлению) ставим выше

      if (!error && data) {
        setProjects(data);
      }
      setLoading(false);
    }
    
    fetchCases();
  }, []);

  // Умная функция, которая находит ссылку внутри текста названия
  const renderTitle = (title: string, externalLink: string, slug: string) => {
    // Если внешней ссылки в базе нет, просто делаем всё название ссылкой на внутреннюю страницу
    if (!externalLink) {
      return (
        <Link href={`/portfolio/${slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          {title}
        </Link>
      );
    }

    // Регулярное выражение: ищет всё, что похоже на сайт (домены типа .com, .ru, .рф + возможный путь через /)
    const urlRegex = /([a-zA-Zа-яА-ЯёЁ0-9_-]+\.[a-zA-Zа-яА-ЯёЁ]{2,}(?:\/[^\s)]*)?)/gi;
    const parts = title.split(urlRegex);

    return (
      <>
        {parts.map((part, index) => {
          // Если кусок текста совпал с форматом сайта — делаем его синей внешней ссылкой
          if (part.match(urlRegex)) {
            return (
              <a 
                key={index} 
                href={externalLink} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#3b00ff', textDecoration: 'none' }}
              >
                {part}
              </a>
            );
          }
          // Иначе это обычный текст названия — делаем его ссылкой на внутренний кейс
          return (
            <Link key={index} href={`/portfolio/${slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              {part}
            </Link>
          );
        })}
      </>
    );
  };

  if (loading) {
    return (
      <div style={{ 
        width: '100%', 
        flex: 1,
        minHeight: '50vh', // Чтобы белый фон растягивался
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: '#fff',
        fontFamily: 'inherit',
        fontWeight: 800, 
        fontSize: '14px',
        letterSpacing: '1px'
      }}>
        ЗАГРУЗКА
      </div>
    );
  }

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
            {/* Левая часть: Фото с крестиками (увеличена ширина с 160px до 240px) */}
            <Link 
              href={`/portfolio/${project.slug}`} 
              style={{ position: 'relative', width: '240px', padding: '10px', flexShrink: 0, boxSizing: 'border-box', display: 'block', color: 'inherit', textDecoration: 'none' }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, transform: 'translate(-50%, -50%)', fontWeight: 300, fontSize: '18px' }}>+</div>
              <div style={{ position: 'absolute', top: 0, right: 0, transform: 'translate(50%, -50%)', fontWeight: 300, fontSize: '18px' }}>+</div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, transform: 'translate(-50%, 50%)', fontWeight: 300, fontSize: '18px' }}>+</div>
              <div style={{ position: 'absolute', bottom: 0, right: 0, transform: 'translate(50%, 50%)', fontWeight: 300, fontSize: '18px' }}>+</div>
              
              <div style={{ width: '100%', aspectRatio: '16/10', backgroundColor: '#000', overflow: 'hidden' }}>
                 {project.image_url && (
                   <img src={project.image_url} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                 )}
              </div>
            </Link>

            {/* Правая часть: Описание */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', paddingTop: '10px' }}>
              
              {/* Название с умным парсером */}
              <div style={{ fontWeight: 800, fontSize: '16px', whiteSpace: 'pre-wrap' }}>
                {renderTitle(project.title, project.project_link, project.slug)}
              </div>
              
              {/* Описание с жесткой обрезкой в 3 строки (увеличена ширина текста пропорционально) */}
              <Link href={`/portfolio/${project.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ 
                  fontWeight: 500, 
                  lineHeight: '1.3', 
                  maxWidth: '260px', // Увеличил с 200px до 260px
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

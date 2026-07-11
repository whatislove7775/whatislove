import { supabase } from '@/lib/supabase';
import Breadcrumbs from '@/components/Breadcrumbs';
import Link from 'next/link';
import SmartImage from '@/components/SmartImage';

export const revalidate = 60;

export const metadata = {
  title: 'Портфолио',
  description: 'Проекты дизайн-студии whatislove — веб-сайты, лендинги, брендинг.',
  openGraph: {
    title: 'Портфолио | WH4T!SLOV3',
    description: 'Проекты дизайн-студии whatislove — веб-сайты, лендинги, брендинг.',
  },
};

function renderTitle(title: string, externalLink: string, slug: string) {
  if (!externalLink) {
    return (
      <Link href={`/portfolio/${slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        {title}
      </Link>
    );
  }
  const urlRegex = /([a-zA-Zа-яА-ЯёЁ0-9_-]+\.[a-zA-Zа-яА-ЯёЁ]{2,}(?:\/[^\s)]*)?)/gi;
  const parts = title.split(urlRegex);
  return (
    <>
      {parts.map((part, index) => {
        if (part.match(urlRegex)) {
          return (
            <a key={index} href={externalLink} target="_blank" rel="noopener noreferrer" style={{ color: '#3b00ff', textDecoration: 'none' }}>
              {part}
            </a>
          );
        }
        return (
          <Link key={index} href={`/portfolio/${slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            {part}
          </Link>
        );
      })}
    </>
  );
}

export default async function PortfolioPage() {
  const [{ data: projects }, { data: orderRows }] = await Promise.all([
    supabase
      .from('cases')
      .select('id, slug, title, desc, year, image_url, project_link')
      .order('year', { ascending: false })
      .order('id', { ascending: false }),
    // Отдельный лёгкий запрос за ручным порядком сортировки — если колонка sort_order ещё
    // не добавлена в БД (миграция не выполнена), просто вернётся ошибка и сортировка не изменится.
    supabase.from('cases').select('id, sort_order'),
  ]);

  const orderMap = new Map((orderRows ?? []).map((r: any) => [r.id, r.sort_order]));
  const sortedProjects = [...(projects ?? [])].sort((a, b) => {
    const oa = orderMap.get(a.id), ob = orderMap.get(b.id);
    if (oa == null && ob == null) return 0;
    if (oa == null) return 1;
    if (ob == null) return -1;
    return oa - ob;
  });

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'inherit' }}>
      <div style={{ width: '100%', alignSelf: 'flex-start' }}>
        <Breadcrumbs path={[
          { name: 'WH4T!SLOV3', href: '/', icon: '📁' },
          { name: 'ПОРТФОЛИО', icon: '📂' },
        ]} />
      </div>

      <div className="portfolio-grid">
        {sortedProjects.map((project, index) => (
          <div key={project.id} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            <Link
              href={`/portfolio/${project.slug}`}
              style={{ position: 'relative', width: '240px', padding: '10px', flexShrink: 0, boxSizing: 'border-box', display: 'block', color: 'inherit', textDecoration: 'none' }}
              className="portfolio-card-image"
            >
              <div style={{ position: 'absolute', top: 0, left: 0, transform: 'translate(-50%, -50%)', fontWeight: 300, fontSize: '18px' }}>+</div>
              <div style={{ position: 'absolute', top: 0, right: 0, transform: 'translate(50%, -50%)', fontWeight: 300, fontSize: '18px' }}>+</div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, transform: 'translate(-50%, 50%)', fontWeight: 300, fontSize: '18px' }}>+</div>
              <div style={{ position: 'absolute', bottom: 0, right: 0, transform: 'translate(50%, 50%)', fontWeight: 300, fontSize: '18px' }}>+</div>

              <div style={{ position: 'relative', width: '100%', aspectRatio: '16/10', backgroundColor: '#000', overflow: 'hidden' }}>
                {project.image_url && (
                  <SmartImage
                    src={project.image_url}
                    alt={project.title}
                    fill
                    sizes="(max-width: 600px) 100vw, 240px"
                    style={{ objectFit: 'cover' }}
                    priority={index < 4}
                  />
                )}
              </div>
            </Link>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', paddingTop: '10px' }}>
              <div style={{ fontWeight: 800, fontSize: '16px', whiteSpace: 'pre-wrap' }}>
                {renderTitle(project.title, project.project_link, project.slug)}
              </div>
              <Link href={`/portfolio/${project.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{
                  fontWeight: 500,
                  lineHeight: '1.3',
                  maxWidth: '260px',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {project.desc}
                </div>
              </Link>
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

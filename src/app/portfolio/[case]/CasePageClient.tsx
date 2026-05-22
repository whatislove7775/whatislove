'use client';
import { useState, useEffect } from 'react';
import Breadcrumbs from '@/components/Breadcrumbs';
import { parseTextForLinks } from '@/lib/parseLinks';

function InfoRow({ label, value, isValueBold = false }: any) {
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
}

function formatTypography(text: string): string {
  if (!text) return '';
  let res = text.replace(/(^|\s)([а-яА-ЯёЁa-zA-Z]{1,2})\s+/g, '$1$2 ');
  return res.replace(/(^|\s)([а-яА-ЯёЁa-zA-Z]{1,2})\s+/g, '$1$2 ');
}

export default function CasePageClient({ project }: { project: any }) {
  const creditsList = project.credits || [];
  const images: string[] = project.images?.length
    ? project.images
    : project.image_url ? [project.image_url] : [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Preload all images so switching is instant
  useEffect(() => {
    images.forEach((src) => { const img = new Image(); img.src = src; });
  }, []);

  const prev = () => setCurrentIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setCurrentIndex((i) => (i + 1) % images.length);

  return (
    <div style={{
      width: '100%',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'inherit',
      boxSizing: 'border-box',
      padding: 0
    }}>

      {/* НАВИГАЦИЯ */}
      <div style={{ width: '100%', padding: '15px 0', position: 'relative', zIndex: 100 }}>
        <Breadcrumbs
          path={[
            { name: 'WH4T!SLOV3', href: '/', icon: '📁' },
            { name: 'ПОРТФОЛИО', href: '/portfolio', icon: '📂' },
            { name: project.title.toUpperCase(), icon: '📄' }
          ]}
          rightAddon={
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
                width: '110px',
              }}
            >
              <img src="/qr-code.svg" alt="QR code" style={{ width: '100%', height: 'auto' }} />
              <span style={{
                fontWeight: 800,
                fontSize: '13px',
                marginTop: '12px',
                textAlign: 'left',
                whiteSpace: 'nowrap',
                lineHeight: '1.2',
                textTransform: 'lowercase',
              }}>
                заказать<br />дизайн
              </span>
            </a>
          }
        />
      </div>

      <div style={{
        position: 'relative',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        paddingBottom: '40px'
      }}>

        {/* СЕТКА: 2 КОЛОНКИ */}
        <div className="case-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(450px, 580px) minmax(0, 1fr)',
          gap: '60px',
          alignItems: 'flex-start',
          width: '100%',
          boxSizing: 'border-box'
        }}>

          {/* ЛЕВАЯ КОЛОНКА (Фото) */}
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <div style={{ position: 'absolute', top: '-15px', left: '-15px', fontWeight: 300, fontSize: '20px', lineHeight: 1, zIndex: 1 }}>+</div>
              <div style={{ position: 'absolute', top: '-15px', right: '-15px', fontWeight: 300, fontSize: '20px', lineHeight: 1, zIndex: 1 }}>+</div>
              <div style={{ position: 'absolute', bottom: '-15px', left: '-15px', fontWeight: 300, fontSize: '20px', lineHeight: 1, zIndex: 1 }}>+</div>
              <div style={{ position: 'absolute', bottom: '-15px', right: '-15px', fontWeight: 300, fontSize: '20px', lineHeight: 1, zIndex: 1 }}>+</div>

              {/* Слайдер */}
              <div
                style={{ position: 'relative', width: '100%', aspectRatio: '16/10', backgroundColor: '#e5e5e5', overflow: 'hidden' }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                {images.length > 0 && (
                  <img
                    src={images[currentIndex]}
                    alt={project.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                )}

                {/* Стрелки и счётчик — только при hover и если картинок больше одной */}
                {images.length > 1 && isHovered && (
                  <>
                    <button
                      onClick={prev}
                      style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: '1.5px solid #fff', color: '#fff', fontFamily: 'inherit', fontWeight: 800, fontSize: '13px', padding: '4px 8px', cursor: 'pointer', lineHeight: 1, zIndex: 10 }}
                    >
                      [{'<'}]
                    </button>
                    <button
                      onClick={next}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: '1.5px solid #fff', color: '#fff', fontFamily: 'inherit', fontWeight: 800, fontSize: '13px', padding: '4px 8px', cursor: 'pointer', lineHeight: 1, zIndex: 10 }}
                    >
                      [{'>'}]
                    </button>
                    <div style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', background: 'transparent', border: '1.5px solid #fff', color: '#fff', fontFamily: 'inherit', fontWeight: 800, fontSize: '13px', padding: '3px 10px', lineHeight: 1, zIndex: 10, whiteSpace: 'nowrap' }}>
                      [ {currentIndex + 1}/{images.length} ]
                    </div>
                  </>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', fontWeight: 800, fontSize: '13px' }}>
              <span>{project.tags}</span>
              <span>[ {project.year} ]</span>
            </div>
          </div>

          {/* ПРАВАЯ КОЛОНКА (Текст) */}
          <div className="case-right-col" style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            fontSize: '14px',
            width: '100%',
            boxSizing: 'border-box',
            paddingRight: '100px',
            marginTop: '-4px'
          }}>

            <InfoRow label="название проекта" value={parseTextForLinks(project.title)} isValueBold={true} />
            <InfoRow label="клиент" value={project.client} />

            <div style={{ display: 'flex', alignItems: 'baseline', width: '100%', margin: '4px 0 10px 0' }}>
              <div style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', opacity: 0.8, letterSpacing: '2px' }}>....................................................................................................</div>
              <span style={{ margin: '0 15px', fontWeight: 500, whiteSpace: 'nowrap' }}>сделано с любовью</span>
              <div style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', opacity: 0.8, letterSpacing: '2px' }}>....................................................................................................</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', width: '100%', marginBottom: '8px' }}>
              <span style={{ fontWeight: 800, whiteSpace: 'nowrap', marginRight: '15px' }}>задача</span>
              <div style={{ flex: 1, fontWeight: 500, lineHeight: 1.5, textAlign: 'justify', overflow: 'hidden' }}>
                <span style={{ display: 'inline' }}>
                  {project.task ? parseTextForLinks(formatTypography(project.task)) : ''}
                </span>
                <span style={{ display: 'inline-block', width: 0, whiteSpace: 'nowrap', opacity: 0.8, letterSpacing: '2px', marginLeft: '5px' }}>
                  ................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................
                </span>
              </div>
            </div>

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
                      style={{ color: '#3b00ff', textDecoration: 'none', fontWeight: 800, whiteSpace: 'nowrap', position: 'relative', zIndex: 100 }}
                    >
                      {credit.display}
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ fontWeight: 500, lineHeight: 1.5, textAlign: 'justify', width: '100%', overflow: 'hidden' }}>
              <span style={{ display: 'inline' }}>{parseTextForLinks(formatTypography(project.desc))}</span>
              <span style={{ display: 'inline-block', width: 0, whiteSpace: 'nowrap', opacity: 0.8, letterSpacing: '2px', marginLeft: '5px' }}>
                ................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................
              </span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

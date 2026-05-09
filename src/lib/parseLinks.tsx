'use client';
import React from 'react';

// Мощное регулярное выражение для поиска URL (с протоколами, www и простыми доменами)
// eslint-disable-next-line no-useless-escape
const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9_-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/gi;

export const parseTextForLinks = (text: string | null | undefined): React.ReactNode => {
  if (!text) return null;

  // Разбиваем текст на части по регулярному выражению
  const parts = text.split(urlRegex);

  return (
    <>
      {parts.map((part, index) => {
        // Если кусок текста совпал с форматом URL
        if (part.match(urlRegex)) {
          let href = part;
          
          // Обработка www: добавляем https:// если пропущен
          if (href.startsWith('www.')) {
            href = `https://${href}`;
          }
          
          // Обработка простых доменов (t.me/asiya и т.д.): добавляем https:// если пропущены оба протокола
          else if (!href.startsWith('http://') && !href.startsWith('https://')) {
            href = `https://${href}`;
          }

          return (
            <a 
              key={index} 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                color: '#3b00ff', // Фирменный синий
                textDecoration: 'none'
              }}
            >
              {part}
            </a>
          );
        }
        // Обычный текст возвращаем как есть
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </>
  );
};

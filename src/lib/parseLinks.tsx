'use client';
import React from 'react';

// Улучшенная регулярка: понимает русские домены (асия.com, сайт.рф) и отсекает скобки в конце
// eslint-disable-next-line no-useless-escape
const urlRegex = /(https?:\/\/[^\s)]+|www\.[^\s)]+|[a-zA-Zа-яА-ЯёЁ0-9_-]+\.[a-zA-Zа-яА-ЯёЁ]{2,}(?:\/[^\s)]*)?)/gi;

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
          // Обработка простых доменов: добавляем https:// если пропущено
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
                color: '#3b00ff', 
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

import { ImageResponse } from 'next/og';

// Общие настройки для favicon.tsx каждого раздела — Next.js сам подставляет
// иконку раздела в <head> при переходе на его страницы (и на все вложенные,
// если у них нет своей). Эмодзи подобраны те же, что в хлебных крошках.
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export function renderRouteIcon(emoji: string) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fff',
          borderRadius: 6,
          fontSize: 22,
        }}
      >
        {emoji}
      </div>
    ),
    { ...size }
  );
}

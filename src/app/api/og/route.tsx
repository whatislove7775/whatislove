import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import { join } from 'path';

export const runtime = 'nodejs';

// Keycap rendered as layered divs — simulates the beveled SVG look in Satori
function Keycap({
  src, imgH, imgW, pw, ph, rotate,
}: {
  src: string; imgH: number; imgW: number;
  pw: number; ph: number; rotate: string;
}) {
  const BEVEL = 14;
  return (
    <div style={{ transform: rotate, display: 'flex' }}>
      {/* bevel shell */}
      <div style={{
        display: 'flex',
        background: '#a8a8a8',
        borderRadius: 24,
        padding: `${BEVEL}px ${BEVEL + 2}px ${BEVEL + 8}px ${BEVEL}px`,
      }}>
        {/* top face */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg,#f5f5f5 0%,#e3e3e3 60%,#d6d6d6 100%)',
          borderRadius: 14,
          padding: `${ph}px ${pw}px`,
        }}>
          {/* glyph PNG */}
          <img
            src={src}
            width={imgW}
            height={imgH}
            style={{ display: 'flex' }}
          />
        </div>
      </div>
    </div>
  );
}

export async function GET() {
  const mainBuf  = readFileSync(join(process.cwd(), 'public/keys/wh4tislove_src.png'));
  const heartBuf = readFileSync(join(process.cwd(), 'public/keys/heart_src.png'));
  const mainSrc  = `data:image/png;base64,${mainBuf.toString('base64')}`;
  const heartSrc = `data:image/png;base64,${heartBuf.toString('base64')}`;

  // aspect ratios from source PNGs
  const MAIN_AR  = 1627 / 222;   // wide key
  const HEART_AR = 311  / 216;   // square key

  const mainH  = 58;
  const heartH = 68;

  return new ImageResponse(
    (
      <div style={{
        width:           1200,
        height:          630,
        display:         'flex',
        flexDirection:   'column',
        alignItems:      'center',
        justifyContent:  'center',
        backgroundColor: '#ffffff',
        gap:             52,
      }}>
        {/* two keycaps */}
        <div style={{ display: 'flex', gap: 48, alignItems: 'flex-end' }}>
          <Keycap
            src={mainSrc}
            imgH={mainH}
            imgW={Math.round(mainH * MAIN_AR)}
            pw={52} ph={38}
            rotate="rotate(-4deg)"
          />
          <Keycap
            src={heartSrc}
            imgH={heartH}
            imgW={Math.round(heartH * HEART_AR)}
            pw={40} ph={38}
            rotate="rotate(8deg)"
          />
        </div>

        {/* nav links */}
        <div style={{
          display:       'flex',
          gap:           18,
          fontSize:      21,
          fontWeight:    700,
          color:         '#111111',
          letterSpacing: 2,
        }}>
          <span style={{ display: 'flex' }}>📦 ПРОДУКТЫ</span>
          <span style={{ display: 'flex', color: '#aaaaaa' }}>/</span>
          <span style={{ display: 'flex' }}>🗂 ПОРТФОЛИО</span>
          <span style={{ display: 'flex', color: '#aaaaaa' }}>/</span>
          <span style={{ display: 'flex' }}>🔗 ССЫЛКИ</span>
        </div>

        {/* lucky */}
        <div style={{ display: 'flex', fontSize: 14, color: '#999999', letterSpacing: 1 }}>
          мне не везёт!
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}

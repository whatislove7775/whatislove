'use client';

const INK = '#3a3a3a';   // цвет символов

const BL = 24, BR = 24, BT = 13, BB = 32;
const OR = 15, IR = 12;
const BIG_TW = 384, HEART_TW = 116, FACE_TH = 116;
const W_MAIN = BL + BIG_TW + BR;
const FACE_CY = BT + FACE_TH / 2;

// Стрелка Enter — тонкая, без скруглений, вплотную к тексту
function EnterGlyph({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} fill="none" stroke={INK}
       strokeWidth={6} strokeLinecap="butt" strokeLinejoin="miter">
      <path d="M46 -26 L46 3 L13 3" />
      <path d="M13 3 L26 -8 M13 3 L26 15" />
    </g>
  );
}

function Keycap({ id, tw, th, className, children }: {
  id: string; tw: number; th: number; className: string; children: React.ReactNode;
}) {
  const W = BL + tw + BR;
  const H = BT + th + BB;
  const ix0 = BL, iy0 = BT, ix1 = W - BR, iy1 = H - BB;

  const top    = `0,0 ${W},0 ${ix1},${iy0} ${ix0},${iy0}`;
  const right  = `${W},0 ${W},${H} ${ix1},${iy1} ${ix1},${iy0}`;
  const bottom = `${W},${H} 0,${H} ${ix0},${iy1} ${ix1},${iy1}`;
  const left   = `0,${H} 0,0 ${ix0},${iy0} ${ix0},${iy1}`;

  const clipId = `clip-${id}`, gId = `top-${id}`, fId = `face-${id}`, grainId = `grain-${id}`;

  return (
    <button type="button" className={`keycap ${className}`}>
      <svg viewBox={`0 0 ${W} ${H}`} className="keycap-svg" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id={clipId}><rect x={0} y={0} width={W} height={H} rx={OR} /></clipPath>
          <clipPath id={fId}><rect x={ix0} y={iy0} width={tw} height={th} rx={IR} /></clipPath>
          {/* диагональный linear-градиент — освещает углы */}
          <linearGradient id={gId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0"    stopColor="#f4f4f4" />
            <stop offset="0.5"  stopColor="#e9e9e9" />
            <stop offset="1"    stopColor="#dadada" />
          </linearGradient>
          <filter id={grainId} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2"
                          stitchTiles="stitch" seed={id === 'main' ? 4 : 11} />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>

        {/* Тело — фаски с диагональными градиентами */}
        <g clipPath={`url(#${clipId})`}>
          <polygon points={top}    fill="#f4f4f4" />
          <polygon points={left}   fill="#dcdcdc" />
          <polygon points={right}  fill="#c4c4c4" />
          <polygon points={bottom} fill="#a6a6a6" />
        </g>

        {/* Верхняя грань */}
        <g className="kc-cap">
          <rect x={ix0} y={iy0} width={tw} height={th} rx={IR} fill={`url(#${gId})`} />
          {/* текстура потёртости */}
          <g clipPath={`url(#${fId})`} opacity={0.09} style={{ mixBlendMode: 'multiply' }}>
            <rect x={ix0} y={iy0} width={tw} height={th} filter={`url(#${grainId})`} />
          </g>
          {children}
        </g>
      </svg>
    </button>
  );
}

export default function KeyboardLogo() {
  return (
    <div className="kb-logo" aria-label="wh4tislove">
      <Keycap id="main" tw={BIG_TW} th={FACE_TH} className="keycap-main">
        <text x={BL + 12} y={FACE_CY} dominantBaseline="central" textAnchor="start"
              fontWeight={500} fontSize={58} fill={INK} letterSpacing="-1">
          wh4tislove
        </text>
        <EnterGlyph x={W_MAIN - 96} y={FACE_CY} />
      </Keycap>

      <Keycap id="heart" tw={HEART_TW} th={FACE_TH} className="keycap-heart">
        <text x={BL + HEART_TW / 2} y={FACE_CY} dominantBaseline="central" textAnchor="middle"
              fontWeight={500} fontSize={60} fill={INK} letterSpacing="-1">
          &lt;3
        </text>
      </Keycap>
    </div>
  );
}

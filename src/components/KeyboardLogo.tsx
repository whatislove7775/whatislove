'use client';

const INK = '#575757';   // чуть серее

const BL = 30, BR = 30, BT = 18, BB = 44;
const OR = 18, IR = 14;
const BIG_TW = 460, HEART_TW = 120, FACE_TH = 120;
const W_MAIN = BL + BIG_TW + BR;
const FACE_CY = BT + FACE_TH / 2;

// Стрелка Enter — без скруглений, ближе к тексту
function EnterGlyph({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} fill="none" stroke={INK}
       strokeWidth={10} strokeLinecap="butt" strokeLinejoin="miter">
      <path d="M54 -30 L54 4 L14 4" />
      <path d="M14 4 L29 -10 M14 4 L29 18" />
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

  // Уникальные id фильтров и градиентов
  const gId    = `top-${id}`;
  const noiseId = `noise-${id}`;
  const clipId  = `clip-${id}`;
  const faceClipId = `fclip-${id}`;

  return (
    <button type="button" className={`keycap ${className}`}>
      <svg viewBox={`0 0 ${W} ${H}`} className="keycap-svg" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id={clipId}>
            <rect x={0} y={0} width={W} height={H} rx={OR} />
          </clipPath>
          <clipPath id={faceClipId}>
            <rect x={ix0} y={iy0} width={tw} height={th} rx={IR} />
          </clipPath>
          <linearGradient id={gId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0"   stopColor="#efefef" />
            <stop offset="0.5" stopColor="#e8e8e8" />
            <stop offset="1"   stopColor="#dedede" />
          </linearGradient>
          {/* тонкий шум для текстуры потёртости */}
          <filter id={noiseId} x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.72 0.58" numOctaves="4" seed={id === 'main' ? 3 : 7} result="noise" />
            <feColorMatrix type="saturate" values="0" in="noise" result="grey" />
            <feBlend in="SourceGraphic" in2="grey" mode="screen" result="blend" />
            <feComposite in="blend" in2="SourceGraphic" operator="in" />
          </filter>
        </defs>

        {/* Тело клавиши — фаски, скруглённый контур */}
        <g clipPath={`url(#${clipId})`}>
          <polygon points={top}    fill="#f4f4f4" />
          <polygon points={left}   fill="#d5d5d5" />
          <polygon points={right}  fill="#b8b8b8" />
          <polygon points={bottom} fill="#999999" />
        </g>

        {/* Верхняя грань */}
        <g className="kc-cap">
          <rect x={ix0} y={iy0} width={tw} height={th} rx={IR}
                fill={`url(#${gId})`} />
          {/* потёртость — очень слабый overlay */}
          <rect x={ix0} y={iy0} width={tw} height={th} rx={IR}
                fill="rgba(0,0,0,0.0)"
                filter={`url(#${noiseId})`}
                opacity={0.055} />
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
        <text x={BL + 14} y={FACE_CY} dominantBaseline="central" textAnchor="start"
              fontWeight={800} fontSize={60} fill={INK} letterSpacing="-1">
          wh4tislove
        </text>
        {/* стрелка сразу после надписи — примерно x=436 */}
        <EnterGlyph x={W_MAIN - 122} y={FACE_CY} />
      </Keycap>

      <Keycap id="heart" tw={HEART_TW} th={FACE_TH} className="keycap-heart">
        <text x={BL + HEART_TW / 2} y={FACE_CY} dominantBaseline="central" textAnchor="middle"
              fontWeight={800} fontSize={62} fill={INK} letterSpacing="-1">
          &lt;3
        </text>
      </Keycap>
    </div>
  );
}

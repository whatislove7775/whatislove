'use client';

const INK = '#454545';        // цвет всех символов на клавишах

// Размеры фасок (одинаковые для обеих клавиш — единая толщина)
const BL = 30;   // левая
const BR = 30;   // правая
const BT = 18;   // верхняя
const BB = 44;   // нижняя (самая толстая)
const OR = 18;   // радиус внешнего контура
const IR = 14;   // радиус верхней грани

// Символ Enter (⏎) — вектором, жирный, того же цвета
function EnterGlyph({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} fill="none" stroke={INK}
       strokeWidth={11} strokeLinecap="round" strokeLinejoin="round">
      <path d="M58 -32 L58 4 L16 4" />
      <path d="M16 4 L32 -10 M16 4 L32 18" />
    </g>
  );
}

function Keycap({
  id, tw, th, className, children,
}: {
  id: string; tw: number; th: number; className: string; children: React.ReactNode;
}) {
  const W = BL + tw + BR;
  const H = BT + th + BB;

  // Внешние (острые) и внутренние углы
  const ox0 = 0, oy0 = 0, ox1 = W, oy1 = H;
  const ix0 = BL, iy0 = BT, ix1 = W - BR, iy1 = H - BB;

  const top    = `${ox0},${oy0} ${ox1},${oy0} ${ix1},${iy0} ${ix0},${iy0}`;
  const right  = `${ox1},${oy0} ${ox1},${oy1} ${ix1},${iy1} ${ix1},${iy0}`;
  const bottom = `${ox1},${oy1} ${ox0},${oy1} ${ix0},${iy1} ${ix1},${iy1}`;
  const left   = `${ox0},${oy1} ${ox0},${oy0} ${ix0},${iy0} ${ix0},${iy1}`;

  return (
    <button type="button" className={`keycap ${className}`}>
      <svg viewBox={`-3 -3 ${W + 6} ${H + 6}`} className="keycap-svg" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id={`clip-${id}`}>
            <rect x={0} y={0} width={W} height={H} rx={OR} />
          </clipPath>
          <linearGradient id={`top-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ededed" />
            <stop offset="1" stopColor="#e1e1e1" />
          </linearGradient>
        </defs>

        {/* Фаски-стенки (обрезаны скруглённым внешним контуром) */}
        <g clipPath={`url(#clip-${id})`}>
          <polygon points={top}    fill="#f1f1f1" />
          <polygon points={left}   fill="#d5d5d5" />
          <polygon points={right}  fill="#bcbcbc" />
          <polygon points={bottom} fill="#9c9c9c" />
        </g>
        {/* Внешний контур */}
        <rect x={0} y={0} width={W} height={H} rx={OR} fill="none" stroke="#8c8c8c" strokeWidth={2} />

        {/* Верхняя печатная грань + символы */}
        <g className="kc-cap">
          <rect x={ix0} y={iy0} width={tw} height={th} rx={IR}
                fill={`url(#top-${id})`} stroke="#c8c8c8" strokeWidth={1.5} />
          {children}
        </g>
      </svg>
    </button>
  );
}

const BIG_TW = 460, HEART_TW = 120, FACE_TH = 120;
const W_MAIN = BL + BIG_TW + BR;
const FACE_CY = BT + FACE_TH / 2;

export default function KeyboardLogo() {
  return (
    <div className="kb-logo" aria-label="wh4tislove">
      {/* Большая клавиша */}
      <Keycap id="main" tw={BIG_TW} th={FACE_TH} className="keycap-main">
        <text x={BL + 16} y={FACE_CY} dominantBaseline="central" textAnchor="start"
              fontWeight={800} fontSize={60} fill={INK} letterSpacing="-1">
          wh4tislove
        </text>
        <EnterGlyph x={W_MAIN - 116} y={FACE_CY} />
      </Keycap>

      {/* Клавиша «&lt;3» */}
      <Keycap id="heart" tw={HEART_TW} th={FACE_TH} className="keycap-heart">
        <text x={BL + HEART_TW / 2} y={FACE_CY} dominantBaseline="central" textAnchor="middle"
              fontWeight={800} fontSize={62} fill={INK} letterSpacing="-1">
          &lt;3
        </text>
      </Keycap>
    </div>
  );
}

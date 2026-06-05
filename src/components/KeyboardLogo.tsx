'use client';

const INK = '#2f2f2f';        // цвет всех символов на клавишах
const OUT = '#8d8d8d';        // обводка
const CAP_STROKE = '#bdbdbd'; // обводка верхней грани

// Символ Enter (⏎) — рисуем вектором, чтобы был жирным и одинаковым везде
function EnterGlyph({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill="none" stroke={INK}
       strokeWidth={11} strokeLinecap="round" strokeLinejoin="round">
      {/* вертикальный «хвост» справа + горизонталь влево */}
      <path d="M58 -34 L58 2 L14 2" />
      {/* стрелка влево */}
      <path d="M14 2 L30 -12 M14 2 L30 16" />
    </g>
  );
}

// Одна клавиша: верхняя грань + «юбка» (смещённая копия) = объём в 2D
function Keycap({
  id, tw, th, vx, vy, vbW, vbH, className, children,
}: {
  id: string; tw: number; th: number; vx: number; vy: number;
  vbW: number; vbH: number; className: string; children: React.ReactNode;
}) {
  const r = 22;
  return (
    <button type="button" className={`keycap ${className}`}>
      <svg viewBox={`-16 -6 ${vbW} ${vbH}`} className="keycap-svg" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={`wall-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#c2c2c2" />
            <stop offset="0.55" stopColor="#a6a6a6" />
            <stop offset="1" stopColor="#8f8f8f" />
          </linearGradient>
          <linearGradient id={`top-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f7f7f7" />
            <stop offset="0.5" stopColor="#ededed" />
            <stop offset="1" stopColor="#e0e0e0" />
          </linearGradient>
        </defs>

        {/* «Юбка» — нижняя грань, смещённая вниз-влево (объём) */}
        <g className="kc-base">
          <rect x={vx} y={vy} width={tw} height={th} rx={r}
                fill={`url(#wall-${id})`} stroke={OUT} strokeWidth={2} />
        </g>

        {/* Верхняя печатная грань + символы — она «проваливается» при нажатии */}
        <g className="kc-cap">
          <rect x={0} y={0} width={tw} height={th} rx={r}
                fill={`url(#top-${id})`} stroke={CAP_STROKE} strokeWidth={2} />
          {/* лёгкий блик сверху */}
          <rect x={5} y={5} width={tw - 10} height={th * 0.4} rx={r - 6}
                fill="#ffffff" opacity={0.35} />
          {children}
        </g>
      </svg>
    </button>
  );
}

export default function KeyboardLogo() {
  return (
    <div className="kb-logo" aria-label="wh4tislove">
      {/* Большая клавиша */}
      <Keycap id="main" tw={520} th={150} vx={-14} vy={46} vbW={540} vbH={208} className="keycap-main">
        <text x={44} y={75} dominantBaseline="central" textAnchor="start"
              fontWeight={800} fontSize={66} fill={INK} letterSpacing="-1">
          wh4tislove
        </text>
        <EnterGlyph x={418} y={75} s={1} />
      </Keycap>

      {/* Клавиша «&lt;3» */}
      <Keycap id="heart" tw={150} th={150} vx={-14} vy={46} vbW={168} vbH={208} className="keycap-heart">
        <text x={75} y={75} dominantBaseline="central" textAnchor="middle"
              fontWeight={800} fontSize={64} fill={INK} letterSpacing="-1">
          &lt;3
        </text>
      </Keycap>
    </div>
  );
}

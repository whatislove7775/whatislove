'use client';

// фаски
const BL = 24, BR = 24, BT = 13, BB = 32;
const OR = 15, IR = 12;

// натуральные пропорции присланных PNG
const MAIN_AR = 1627 / 222;   // wh4tislove + стрелка
const HEART_AR = 311 / 216;   // <3

// вытянутые грани
const BIG_TW = 470, BIG_TH = 112;
const HEART_TW = 128, HEART_TH = 112;

function Keycap({ id, tw, th, className, img }: {
  id: string; tw: number; th: number; className: string;
  img: { src: string; ar: number; h: number };
}) {
  const W = BL + tw + BR;
  const H = BT + th + BB;
  const ix0 = BL, iy0 = BT, ix1 = W - BR, iy1 = H - BB;

  const top    = `0,0 ${W},0 ${ix1},${iy0} ${ix0},${iy0}`;
  const right  = `${W},0 ${W},${H} ${ix1},${iy1} ${ix1},${iy0}`;
  const bottom = `${W},${H} 0,${H} ${ix0},${iy1} ${ix1},${iy1}`;
  const left   = `0,${H} 0,0 ${ix0},${iy0} ${ix0},${iy1}`;

  const clipId = `clip-${id}`, gId = `top-${id}`, fId = `face-${id}`, grainId = `grain-${id}`;

  // размещение глифа по центру грани
  const imgH = img.h, imgW = img.h * img.ar;
  const imgX = ix0 + (tw - imgW) / 2;
  const imgY = iy0 + (th - imgH) / 2;

  return (
    <button type="button" className={`keycap ${className}`}>
      <svg viewBox={`0 0 ${W} ${H}`} className="keycap-svg" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id={clipId}><rect x={0} y={0} width={W} height={H} rx={OR} /></clipPath>
          <clipPath id={fId}><rect x={ix0} y={iy0} width={tw} height={th} rx={IR} /></clipPath>
          <linearGradient id={gId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0"   stopColor="#f4f4f4" />
            <stop offset="0.5" stopColor="#e9e9e9" />
            <stop offset="1"   stopColor="#dadada" />
          </linearGradient>
          <filter id={grainId} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2"
                          stitchTiles="stitch" seed={id === 'main' ? 4 : 11} />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>

        {/* Тело — фаски */}
        <g clipPath={`url(#${clipId})`}>
          <polygon points={top}    fill="#f4f4f4" />
          <polygon points={left}   fill="#dcdcdc" />
          <polygon points={right}  fill="#c4c4c4" />
          <polygon points={bottom} fill="#a6a6a6" />
        </g>

        {/* Верхняя грань */}
        <g className="kc-cap">
          <rect x={ix0} y={iy0} width={tw} height={th} rx={IR} fill={`url(#${gId})`} />
          <g clipPath={`url(#${fId})`} opacity={0.09} style={{ mixBlendMode: 'multiply' }}>
            <rect x={ix0} y={iy0} width={tw} height={th} filter={`url(#${grainId})`} />
          </g>
          {/* присланный глиф */}
          <image href={img.src} x={imgX} y={imgY} width={imgW} height={imgH}
                 preserveAspectRatio="xMidYMid meet" />
        </g>
      </svg>
    </button>
  );
}

export default function KeyboardLogo() {
  return (
    <div className="kb-logo" aria-label="wh4tislove">
      <Keycap id="main" tw={BIG_TW} th={BIG_TH} className="keycap-main"
              img={{ src: '/keys/wh4tislove_src.png', ar: MAIN_AR, h: 50 }} />
      <Keycap id="heart" tw={HEART_TW} th={HEART_TH} className="keycap-heart"
              img={{ src: '/keys/heart_src.png', ar: HEART_AR, h: 66 }} />
    </div>
  );
}

'use client';

// фаски
const BL = 24, BR = 24, BT = 13, BB = 32;
const OR = 15, IR = 12;

export interface KeycapImg { src: string; ar: number; h: number }

/**
 * Одна клавиша клавиатуры (плоская 2D-векторная отрисовка с объёмом).
 * tw/th — размеры верхней грани; img — глиф (PNG) по центру.
 */
export default function Keycap({
  id, tw, th, img, className = '', press = true,
}: {
  id: string; tw: number; th: number; img: KeycapImg; className?: string; press?: boolean;
}) {
  const W = BL + tw + BR;
  const H = BT + th + BB;
  const ix0 = BL, iy0 = BT, ix1 = W - BR, iy1 = H - BB;

  const top    = `0,0 ${W},0 ${ix1},${iy0} ${ix0},${iy0}`;
  const right  = `${W},0 ${W},${H} ${ix1},${iy1} ${ix1},${iy0}`;
  const bottom = `${W},${H} 0,${H} ${ix0},${iy1} ${ix1},${iy1}`;
  const left   = `0,${H} 0,0 ${ix0},${iy0} ${ix0},${iy1}`;

  const clipId = `clip-${id}`, gId = `top-${id}`, fId = `face-${id}`, grainId = `grain-${id}`;

  const imgH = img.h, imgW = img.h * img.ar;
  const imgX = ix0 + (tw - imgW) / 2;
  const imgY = iy0 + (th - imgH) / 2;

  return (
    <button type="button" className={`keycap ${className} ${press ? '' : 'keycap-static'}`}>
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
                          stitchTiles="stitch" seed={id.length * 3 + 1} />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>

        <g clipPath={`url(#${clipId})`}>
          <polygon points={top}    fill="#f4f4f4" />
          <polygon points={left}   fill="#dcdcdc" />
          <polygon points={right}  fill="#c4c4c4" />
          <polygon points={bottom} fill="#a6a6a6" />
        </g>

        <g className="kc-cap">
          <rect x={ix0} y={iy0} width={tw} height={th} rx={IR} fill={`url(#${gId})`} />
          <g clipPath={`url(#${fId})`} opacity={0.09} style={{ mixBlendMode: 'multiply' }}>
            <rect x={ix0} y={iy0} width={tw} height={th} filter={`url(#${grainId})`} />
          </g>
          <image href={img.src} x={imgX} y={imgY} width={imgW} height={imgH}
                 preserveAspectRatio="xMidYMid meet" />
        </g>
      </svg>
    </button>
  );
}

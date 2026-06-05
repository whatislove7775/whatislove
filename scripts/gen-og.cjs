// One-off generator: renders the keycap OG card to public/og-default.png
const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

const pub = path.join(process.cwd(), 'public');
const mainB64 = fs.readFileSync(path.join(pub, 'keys/wh4tislove_src.png')).toString('base64');
const heartB64 = fs.readFileSync(path.join(pub, 'keys/heart_src.png')).toString('base64');

const MAIN_AR = 1627 / 222;
const HEART_AR = 311 / 216;

// Keycap drawing — same bevel technique as the React Keycap component
function keycap({ x, y, tw, th, rotate, glyphB64, glyphAR, glyphH, id }) {
  const BL = 24, BR = 24, BT = 13, BB = 32, OR = 15, IR = 12;
  const W = BL + tw + BR;
  const H = BT + th + BB;
  const ix0 = BL, iy0 = BT, ix1 = W - BR, iy1 = H - BB;

  const top    = `0,0 ${W},0 ${ix1},${iy0} ${ix0},${iy0}`;
  const right  = `${W},0 ${W},${H} ${ix1},${iy1} ${ix1},${iy0}`;
  const bottom = `${W},${H} 0,${H} ${ix0},${iy1} ${ix1},${iy1}`;
  const left   = `0,${H} 0,0 ${ix0},${iy0} ${ix0},${iy1}`;

  const gw = glyphH * glyphAR;
  const gx = ix0 + (tw - gw) / 2;
  const gy = iy0 + (th - glyphH) / 2;
  const cx = W / 2, cy = H / 2;

  return `
  <g transform="translate(${x},${y}) rotate(${rotate} ${cx} ${cy})">
    <defs>
      <clipPath id="clip-${id}"><rect x="0" y="0" width="${W}" height="${H}" rx="${OR}"/></clipPath>
      <linearGradient id="grad-${id}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#f4f4f4"/>
        <stop offset="0.5" stop-color="#e9e9e9"/>
        <stop offset="1" stop-color="#dadada"/>
      </linearGradient>
    </defs>
    <g clip-path="url(#clip-${id})">
      <polygon points="${top}"    fill="#f4f4f4"/>
      <polygon points="${left}"   fill="#dcdcdc"/>
      <polygon points="${right}"  fill="#c4c4c4"/>
      <polygon points="${bottom}" fill="#a6a6a6"/>
    </g>
    <rect x="${ix0}" y="${iy0}" width="${tw}" height="${th}" rx="${IR}" fill="url(#grad-${id})"/>
    <image href="data:image/png;base64,${glyphB64}" x="${gx}" y="${gy}" width="${gw}" height="${glyphH}" preserveAspectRatio="xMidYMid meet"/>
  </g>`;
}

const mainTh = 110, heartTh = 110;
const mainTw = 470, heartTw = 128;

// Layout: keycaps centered, nav text below
const mainKey = keycap({
  x: 250, y: 215, tw: mainTw, th: mainTh, rotate: -4,
  glyphB64: mainB64, glyphAR: MAIN_AR, glyphH: 48, id: 'main',
});
const heartKey = keycap({
  x: 800, y: 205, tw: heartTw, th: heartTh, rotate: 8,
  glyphB64: heartB64, glyphAR: HEART_AR, glyphH: 60, id: 'heart',
});

const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#ffffff"/>
  <text x="600" y="52" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="500" fill="#111" text-anchor="middle" letter-spacing="0.5">wh4tislove ©</text>
  ${mainKey}
  ${heartKey}
  <text x="600" y="500" font-family="Inter, Arial, sans-serif" font-size="26" font-weight="700" fill="#111" text-anchor="middle" letter-spacing="1.5">ПРОДУКТЫ&#160;&#160;/&#160;&#160;ПОРТФОЛИО&#160;&#160;/&#160;&#160;ССЫЛКИ</text>
  <text x="600" y="545" font-family="Inter, Arial, sans-serif" font-size="16" font-weight="500" fill="#999" text-anchor="middle" letter-spacing="1">мне не везёт!</text>
</svg>`;

const resvg = new Resvg(svg, {
  background: '#ffffff',
  fitTo: { mode: 'width', value: 1200 },
  font: { loadSystemFonts: true },
});
const png = resvg.render().asPng();
fs.writeFileSync(path.join(pub, 'og-default.png'), png);
console.log('Wrote public/og-default.png', png.length, 'bytes');

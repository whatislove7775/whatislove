/**
 * faceRenderer.ts v3 — realistic full-body avatar renderer
 *
 * Draws from all 468+ MediaPipe landmark positions directly:
 *   - Eyes from 16-point contours + iris center (landmark 468/473)
 *   - Eyebrows from 10-point positions
 *   - Lips from 20-point outer + 20-point inner contours
 *   - Nose from actual bridge/alar/tip landmarks
 *   - Neck, shoulders, shirt from proportional face geometry
 *   - 25+ expression parameters for micro-movements
 */

export type FaceLandmarks = Array<{ x: number; y: number; z: number }>;
export type PoseLandmarks = Array<{ x: number; y: number; z: number; visibility?: number }>;

export interface AvatarConfig {
  id:          number;
  name:        string;
  skin:        string;
  skinDark:    string;
  skinLight:   string;
  hair:        string;
  hairStyle:   "short" | "long" | "curly" | "ponytail" | "bald";
  eyeColor:    string;
  browColor:   string;
  lipColor:    string;
  shirtColor?: string;
  hasGlasses?: boolean;
  hasBeard?:   boolean;
}

export const AVATARS: AvatarConfig[] = [
  {
    id: 1, name: "Аватар 1",
    skin: "#FDDBB4", skinDark: "#D4996A", skinLight: "#FFF0D8",
    hair: "#2C1A0E", hairStyle: "short",
    eyeColor: "#3A7BD5", browColor: "#2C1A0E", lipColor: "#C97B6F",
    shirtColor: "#1E2E4A",
  },
  {
    id: 2, name: "Аватар 2",
    skin: "#8C5523", skinDark: "#5C3010", skinLight: "#B07040",
    hair: "#0D0400", hairStyle: "curly",
    eyeColor: "#6B3A1F", browColor: "#0D0400", lipColor: "#7B3F2F",
    shirtColor: "#1A1A2E",
  },
  {
    id: 3, name: "Аватар 3",
    skin: "#F5C499", skinDark: "#C98850", skinLight: "#FDE4C4",
    hair: "#8B2A02", hairStyle: "long",
    eyeColor: "#2E7D32", browColor: "#6A1E00", lipColor: "#C97060",
    shirtColor: "#2D3A2E",
  },
  {
    id: 4, name: "Аватар 4",
    skin: "#FAEBD7", skinDark: "#CCA882", skinLight: "#FFFAF5",
    hair: "#8A8A8A", hairStyle: "short",
    eyeColor: "#5D4037", browColor: "#6A6A6A", lipColor: "#B87A6A",
    shirtColor: "#2A2A2A",
    hasGlasses: true,
  },
  {
    id: 5, name: "Аватар 5",
    skin: "#C07840", skinDark: "#8A5020", skinLight: "#E09A60",
    hair: "#1E1008", hairStyle: "short",
    eyeColor: "#8D6E63", browColor: "#1E1008", lipColor: "#9A5540",
    shirtColor: "#3A2215",
    hasBeard: true,
  },
  {
    id: 6, name: "Аватар 6",
    skin: "#FFDAB9", skinDark: "#D4A882", skinLight: "#FFF0E0",
    hair: "#0A0A0A", hairStyle: "ponytail",
    eyeColor: "#1C2B3A", browColor: "#0A0A0A", lipColor: "#C87870",
    shirtColor: "#1E1E3A",
  },
];

// ─── Landmark index groups ────────────────────────────────────────────

// Face oval (36 points, clockwise from forehead top)
const OVAL = [10,338,297,332,284,251,389,356,454,323,361,288,397,365,379,378,400,377,152,148,176,149,150,136,172,58,132,93,234,127,162,21,54,103,67,109];

// Eyes — 16 points each (person's own L/R)
const L_EYE_C = [362,398,384,385,386,387,388,466,263,249,390,373,374,380,381,382];
const R_EYE_C = [33,246,161,160,159,158,157,173,133,155,154,153,145,144,163,7];
// Upper/lower splits for lash and lid drawing
const L_EYE_UPPER = [362,398,384,385,386,387,388,466,263];
const L_EYE_LOWER = [263,249,390,373,374,380,381,382,362];
const R_EYE_UPPER = [33,246,161,160,159,158,157,173,133];
const R_EYE_LOWER = [133,155,154,153,145,144,163,7,33];

// Eyebrows — 10 points each
const L_BROW = [276,283,282,295,285,300,293,334,296,336];
const R_BROW = [46,53,52,65,55,70,63,105,66,107];

// Lips — outer upper/lower (meeting at corners 61 and 291)
const LIPS_U_OUT = [61,185,40,39,37,0,267,269,270,409,291];
const LIPS_L_OUT = [291,375,321,405,314,17,84,181,91,146,61];
// Lips — inner upper/lower (meeting at corners 78 and 308)
const LIPS_U_IN  = [78,191,80,81,82,13,312,311,310,415,308];
const LIPS_L_IN  = [308,324,318,402,317,14,87,178,88,95,78];

// Iris centers (landmarks 468–477, available with refineLandmarks=true)
const L_IRIS_C = 473;
const R_IRIS_C = 468;

// Nose
const NOSE_BRIDGE = [168,6,197,195,5,4];  // glabella → tip
const NOSE_TIP    = 4;
const NOSE_BOT    = 2;
const L_NOSTRIL   = 98;
const R_NOSTRIL   = 327;
const L_ALAR      = 64;
const R_ALAR      = 294;

// Face key single landmarks
const LM_FOREHEAD = 10;
const LM_CHIN     = 152;
const LM_L_EAR    = 234;
const LM_R_EAR    = 454;
const LM_L_JAW    = 172;   // lower jaw left
const LM_R_JAW    = 397;   // lower jaw right
const LM_L_CHEEK  = 50;
const LM_R_CHEEK  = 280;

// Expression key points
const LM_MOUTH_L  = 61;
const LM_MOUTH_R  = 291;
const LM_MOUTH_TI = 13;    // inner upper lip center
const LM_MOUTH_BI = 14;    // inner lower lip center
const LM_L_EYE_T  = 386;
const LM_L_EYE_B  = 374;
const LM_L_EYE_L  = 263;
const LM_L_EYE_R  = 362;
const LM_R_EYE_T  = 159;
const LM_R_EYE_B  = 145;
const LM_R_EYE_L  = 33;
const LM_R_EYE_R  = 133;
const LM_L_BROW_I = 336;
const LM_R_BROW_I = 107;
const LM_L_BROW_O = 276;
const LM_R_BROW_O = 46;
const LM_L_BROW_M = 296;
const LM_R_BROW_M = 66;

// ─── Helpers ──────────────────────────────────────────────────────────

function pt(lm: FaceLandmarks, i: number, w: number, h: number) {
  const p = lm[i];
  if (!p) return { x: 0, y: 0, z: 0 };
  return { x: p.x * w, y: p.y * h, z: p.z ?? 0 };
}

function lmPath(ctx: CanvasRenderingContext2D, lm: FaceLandmarks, indices: number[], w: number, h: number, close = true) {
  ctx.beginPath();
  indices.forEach((i, idx) => {
    const p = pt(lm, i, w, h);
    idx === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
  });
  if (close) ctx.closePath();
}

function hexRGBA(hex: string, a: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function hexBrighten(hex: string, amt: number): string {
  const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + amt);
  const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + amt);
  const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + amt);
  return `rgb(${r},${g},${b})`;
}

// Centroid of a set of landmark indices
function centroid(lm: FaceLandmarks, indices: number[], w: number, h: number) {
  let sx = 0, sy = 0;
  indices.forEach(i => { const p = pt(lm, i, w, h); sx += p.x; sy += p.y; });
  return { x: sx / indices.length, y: sy / indices.length };
}

// ─── Expression extraction ────────────────────────────────────────────

export interface Expressions {
  cx: number; cy: number; fw: number; fh: number;
  roll: number; yaw: number; pitch: number;
  lEyeOpen: number; rEyeOpen: number;
  lEyeWide: number; rEyeWide: number;
  lBrowRaise: number; rBrowRaise: number;
  lBrowFurrow: number; rBrowFurrow: number;
  browKnit: number;
  jawOpen: number;
  mouthSmileL: number; mouthSmileR: number;
  mouthPucker: number; mouthStretch: number;
  lCheekRaise: number; rCheekRaise: number;
  noseTipZ: number;
  // Raw face positions for hair/body
  foreheadY: number; chinY: number; chinX: number;
  lEarX: number; rEarX: number;
  lJawX: number; lJawY: number;
  rJawX: number; rJawY: number;
}

export function extractExpressions(lm: FaceLandmarks, w: number, h: number): Expressions {
  const forehead = pt(lm, LM_FOREHEAD, w, h);
  const chin     = pt(lm, LM_CHIN,     w, h);
  const lEar     = pt(lm, LM_L_EAR,   w, h);
  const rEar     = pt(lm, LM_R_EAR,   w, h);
  const lJaw     = pt(lm, LM_L_JAW,   w, h);
  const rJaw     = pt(lm, LM_R_JAW,   w, h);

  const cx = (lEar.x + rEar.x) / 2;
  const cy = (forehead.y + chin.y) / 2;
  const fw = rEar.x - lEar.x;
  const fh = Math.abs(chin.y - forehead.y);

  // Head roll (tilt)
  const leOut = pt(lm, LM_L_EYE_L, w, h);
  const reOut = pt(lm, LM_R_EYE_L, w, h);
  const roll  = Math.atan2(leOut.y - reOut.y, leOut.x - reOut.x);

  // Head yaw (left/right turn) — nose displacement from face centre
  const noseTip = pt(lm, NOSE_TIP, w, h);
  const yaw = fw > 0 ? Math.max(-1, Math.min(1, (noseTip.x - cx) / (fw * 0.38))) : 0;

  // Head pitch (up/down) — nose tip y vs. eye–chin midpoint
  const eyeMidY = (leOut.y + reOut.y) / 2;
  const pitch = fh > 0 ? Math.max(-1, Math.min(1, (noseTip.y - eyeMidY) / (fh * 0.28) - 0.65)) : 0;

  // Left eye openness
  const leT = pt(lm, LM_L_EYE_T, w, h); const leB = pt(lm, LM_L_EYE_B, w, h);
  const leL = pt(lm, LM_L_EYE_L, w, h); const leR = pt(lm, LM_L_EYE_R, w, h);
  const leW = Math.abs(leL.x - leR.x);
  const leH = Math.abs(leB.y - leT.y);
  const lEyeRaw = leW > 0 ? leH / (leW * 0.38) : 1;
  const lEyeOpen = Math.max(0, Math.min(1.2, lEyeRaw));
  const lEyeWide = lEyeOpen > 1 ? lEyeOpen : 1;

  // Right eye openness
  const reT = pt(lm, LM_R_EYE_T, w, h); const reB = pt(lm, LM_R_EYE_B, w, h);
  const reL = pt(lm, LM_R_EYE_L, w, h); const reR = pt(lm, LM_R_EYE_R, w, h);
  const reW = Math.abs(reL.x - reR.x);
  const reH = Math.abs(reB.y - reT.y);
  const rEyeRaw = reW > 0 ? reH / (reW * 0.38) : 1;
  const rEyeOpen = Math.max(0, Math.min(1.2, rEyeRaw));
  const rEyeWide = rEyeOpen > 1 ? rEyeOpen : 1;

  // Eyebrows
  const lBrowPts = [LM_L_BROW_I, LM_L_BROW_M, LM_L_BROW_O];
  const rBrowPts = [LM_R_BROW_I, LM_R_BROW_M, LM_R_BROW_O];
  const lBrowY = lBrowPts.reduce((s, i) => s + pt(lm, i, w, h).y, 0) / 3;
  const rBrowY = rBrowPts.reduce((s, i) => s + pt(lm, i, w, h).y, 0) / 3;
  const lEyeCY = (leT.y + leB.y) / 2;
  const rEyeCY = (reT.y + reB.y) / 2;
  const normH  = fh * 0.08;
  const lBrowRaise  = normH > 0 ? Math.min(1.5, Math.max(-0.6, (lEyeCY - lBrowY) / normH - 1)) : 0;
  const rBrowRaise  = normH > 0 ? Math.min(1.5, Math.max(-0.6, (rEyeCY - rBrowY) / normH - 1)) : 0;
  const lBrowFurrow = Math.max(0, -lBrowRaise * 0.8);
  const rBrowFurrow = Math.max(0, -rBrowRaise * 0.8);

  // Inner brow knit distance
  const lBrowInX = pt(lm, LM_L_BROW_I, w, h).x;
  const rBrowInX = pt(lm, LM_R_BROW_I, w, h).x;
  const browKnit = fw > 0 ? Math.max(0, 1 - Math.abs(lBrowInX - rBrowInX) / (fw * 0.3)) : 0;

  // Mouth
  const mL = pt(lm, LM_MOUTH_L,  w, h);
  const mR = pt(lm, LM_MOUTH_R,  w, h);
  const mT = pt(lm, LM_MOUTH_TI, w, h);
  const mB = pt(lm, LM_MOUTH_BI, w, h);
  const mW = Math.abs(mR.x - mL.x);
  const mH = Math.abs(mB.y - mT.y);
  const jawOpen = mW > 0 ? Math.max(0, Math.min(1, mH / (mW * 0.42))) : 0;

  // Smile: corners up relative to mid-lip y
  const midLipY = (mT.y + mB.y) / 2;
  const mouthSmileL = fh > 0 ? Math.min(1, Math.max(-1, (midLipY - mL.y) / (fh * 0.038))) : 0;
  const mouthSmileR = fh > 0 ? Math.min(1, Math.max(-1, (midLipY - mR.y) / (fh * 0.038))) : 0;

  // Pucker vs. stretch
  const neutralW = fw * 0.38;
  const mouthPucker  = mW < neutralW ? Math.min(1, (neutralW - mW) / (neutralW * 0.3)) : 0;
  const mouthStretch = mW > neutralW * 1.1 ? Math.min(1, (mW - neutralW * 1.1) / (neutralW * 0.25)) : 0;

  // Cheek raise (correlated with smile)
  const lCheekRaise = Math.max(0, mouthSmileL * 0.75);
  const rCheekRaise = Math.max(0, mouthSmileR * 0.75);

  return {
    cx, cy, fw, fh, roll, yaw, pitch,
    lEyeOpen: Math.min(1, lEyeOpen), rEyeOpen: Math.min(1, rEyeOpen),
    lEyeWide, rEyeWide,
    lBrowRaise, rBrowRaise, lBrowFurrow, rBrowFurrow, browKnit,
    jawOpen, mouthSmileL, mouthSmileR, mouthPucker, mouthStretch,
    lCheekRaise, rCheekRaise,
    noseTipZ: noseTip.z,
    foreheadY: forehead.y, chinY: chin.y, chinX: chin.x,
    lEarX: lEar.x, rEarX: rEar.x,
    lJawX: lJaw.x, lJawY: lJaw.y,
    rJawX: rJaw.x, rJawY: rJaw.y,
  };
}

// ─── Body: neck, shoulders, shirt ────────────────────────────────────

function drawBody(ctx: CanvasRenderingContext2D, expr: Expressions, w: number, h: number, av: AvatarConfig) {
  const { chinX, chinY, lJawX, lJawY, rJawX, rJawY, fw, fh } = expr;
  const shirt = av.shirtColor ?? "#1E2E4A";

  // Neck proportions
  const neckW  = fw * 0.28;
  const neckH  = fh * 0.36;
  const neckBotY = chinY + neckH;

  // Shoulder proportions
  const shoulderW = fw * 2.15;
  const shoulderH = fh * 0.20;
  const shoulderY = neckBotY;

  ctx.save();

  // ── Shirt / upper body ──
  const shirtR = parseInt(shirt.slice(1, 3), 16);
  const shirtG = parseInt(shirt.slice(3, 5), 16);
  const shirtB = parseInt(shirt.slice(5, 7), 16);
  const shirtLight = `rgb(${Math.min(255,shirtR+38)},${Math.min(255,shirtG+38)},${Math.min(255,shirtB+38)})`;
  const shirtDark  = `rgb(${Math.max(0,shirtR-38)},${Math.max(0,shirtG-38)},${Math.max(0,shirtB-38)})`;

  const shirtGrad = ctx.createLinearGradient(chinX - shoulderW * 0.5, shoulderY, chinX + shoulderW * 0.5, shoulderY + fh * 0.5);
  shirtGrad.addColorStop(0,   shirtLight);
  shirtGrad.addColorStop(0.4, shirt);
  shirtGrad.addColorStop(1,   shirtDark);
  ctx.fillStyle = shirtGrad;

  ctx.beginPath();
  ctx.moveTo(chinX - neckW * 0.55, neckBotY);
  // Left shoulder curve
  ctx.bezierCurveTo(
    chinX - fw * 0.62, neckBotY + shoulderH * 0.15,
    chinX - fw * 1.0,  neckBotY + shoulderH * 0.6,
    chinX - shoulderW * 0.5, shoulderY + shoulderH
  );
  ctx.lineTo(chinX - shoulderW * 0.44, h + 20);
  ctx.lineTo(chinX + shoulderW * 0.44, h + 20);
  // Right shoulder curve
  ctx.lineTo(chinX + shoulderW * 0.5, shoulderY + shoulderH);
  ctx.bezierCurveTo(
    chinX + fw * 1.0,  neckBotY + shoulderH * 0.6,
    chinX + fw * 0.62, neckBotY + shoulderH * 0.15,
    chinX + neckW * 0.55, neckBotY
  );
  ctx.closePath();
  ctx.fill();

  // Shirt shadow fold lines
  ctx.strokeStyle = hexRGBA(shirtDark, 0.35);
  ctx.lineWidth = fw * 0.007;
  ctx.beginPath();
  ctx.moveTo(chinX - fw * 0.22, shoulderY + shoulderH * 0.3);
  ctx.bezierCurveTo(chinX - fw * 0.12, shoulderY + shoulderH * 0.6, chinX - fw * 0.08, shoulderY + fh * 0.35, chinX - fw * 0.05, shoulderY + fh * 0.45);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(chinX + fw * 0.22, shoulderY + shoulderH * 0.3);
  ctx.bezierCurveTo(chinX + fw * 0.12, shoulderY + shoulderH * 0.6, chinX + fw * 0.08, shoulderY + fh * 0.35, chinX + fw * 0.05, shoulderY + fh * 0.45);
  ctx.stroke();

  // ── Neck (skin) ──
  const neckGrad = ctx.createLinearGradient(chinX - neckW, chinY, chinX + neckW, chinY);
  neckGrad.addColorStop(0,    av.skinDark);
  neckGrad.addColorStop(0.28, av.skin);
  neckGrad.addColorStop(0.52, av.skinLight);
  neckGrad.addColorStop(0.72, av.skin);
  neckGrad.addColorStop(1,    av.skinDark);

  ctx.fillStyle = neckGrad;
  ctx.beginPath();
  // Top of neck blends from jaw
  ctx.moveTo(lJawX + (chinX - lJawX) * 0.55, lJawY);
  ctx.bezierCurveTo(
    lJawX + (chinX - lJawX) * 0.3, lJawY + neckH * 0.35,
    chinX - neckW * 0.62, neckBotY - neckH * 0.08,
    chinX - neckW * 0.55, neckBotY
  );
  ctx.lineTo(chinX + neckW * 0.55, neckBotY);
  ctx.bezierCurveTo(
    chinX + neckW * 0.62, neckBotY - neckH * 0.08,
    rJawX - (rJawX - chinX) * 0.3, lJawY + neckH * 0.35,
    rJawX - (rJawX - chinX) * 0.55, rJawY
  );
  ctx.closePath();
  ctx.fill();

  // Neck center shadow groove
  ctx.strokeStyle = hexRGBA(av.skinDark, 0.28);
  ctx.lineWidth = fw * 0.008;
  ctx.beginPath();
  ctx.moveTo(chinX - fw * 0.02, chinY + neckH * 0.18);
  ctx.quadraticCurveTo(chinX, chinY + neckH * 0.55, chinX - fw * 0.01, neckBotY - neckH * 0.08);
  ctx.stroke();

  // V-neck collar cutout (skin shows)
  ctx.fillStyle = hexRGBA(av.skin, 0.6);
  ctx.beginPath();
  ctx.moveTo(chinX - neckW * 0.55, neckBotY);
  ctx.lineTo(chinX, neckBotY + fh * 0.1);
  ctx.lineTo(chinX + neckW * 0.55, neckBotY);
  ctx.lineTo(chinX + neckW * 0.3, neckBotY + fh * 0.055);
  ctx.lineTo(chinX, neckBotY + fh * 0.072);
  ctx.lineTo(chinX - neckW * 0.3, neckBotY + fh * 0.055);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

// ─── Hair ─────────────────────────────────────────────────────────────

function drawHair(
  ctx: CanvasRenderingContext2D,
  lm: FaceLandmarks, w: number, h: number,
  av: AvatarConfig,
  expr: Expressions,
  front: boolean,
) {
  const { cx, cy, fw, fh } = expr;
  const top = pt(lm, LM_FOREHEAD, w, h);
  const lEar = pt(lm, LM_L_EAR, w, h);
  const rEar = pt(lm, LM_R_EAR, w, h);
  const topY = top.y - fh * 0.04; // hair starts slightly above forehead

  const hc = av.hair;
  const x = (dx: number) => cx + dx * fw / 200;
  const y = (dy: number) => topY + dy * fh / 240;

  ctx.save();
  ctx.fillStyle = hc;
  ctx.strokeStyle = hexRGBA(hc, 0.55);

  switch (av.hairStyle) {
    case "short": {
      if (!front) {
        // Hair cap
        ctx.beginPath();
        ctx.moveTo(lEar.x + fw * 0.04, top.y - fh * 0.06);
        ctx.bezierCurveTo(cx - fw * 0.42, top.y - fh * 0.36, cx, top.y - fh * 0.42, cx, top.y - fh * 0.42);
        ctx.bezierCurveTo(cx, top.y - fh * 0.42, cx + fw * 0.42, top.y - fh * 0.36, rEar.x - fw * 0.04, top.y - fh * 0.06);
        ctx.lineTo(rEar.x + fw * 0.02, top.y + fh * 0.06);
        ctx.lineTo(lEar.x - fw * 0.02, top.y + fh * 0.06);
        ctx.closePath();
        ctx.fill();
        // Sideburns
        ctx.beginPath(); ctx.ellipse(lEar.x + fw * 0.03, top.y + fh * 0.12, fw * 0.07, fh * 0.1, 0.15, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(rEar.x - fw * 0.03, top.y + fh * 0.12, fw * 0.07, fh * 0.1, -0.15, 0, Math.PI * 2); ctx.fill();
      }
      break;
    }
    case "curly": {
      if (!front) {
        ctx.beginPath();
        ctx.ellipse(cx, top.y - fh * 0.22, fw * 0.52, fh * 0.3, 0, Math.PI, 0);
        ctx.fill();
        for (let i = -70; i <= 70; i += 16) {
          ctx.beginPath(); ctx.arc(x(i), y(-90), fw * 0.046, 0, Math.PI * 2); ctx.fill();
        }
        ctx.beginPath(); ctx.arc(lEar.x, top.y + fh * 0.08, fw * 0.05, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(rEar.x, top.y + fh * 0.08, fw * 0.05, 0, Math.PI * 2); ctx.fill();
      }
      break;
    }
    case "long": {
      if (!front) {
        ctx.beginPath();
        ctx.moveTo(lEar.x + fw * 0.02, top.y - fh * 0.04);
        ctx.bezierCurveTo(cx - fw * 0.38, top.y - fh * 0.38, cx, top.y - fh * 0.42, cx, top.y - fh * 0.42);
        ctx.bezierCurveTo(cx, top.y - fh * 0.42, cx + fw * 0.38, top.y - fh * 0.38, rEar.x - fw * 0.02, top.y - fh * 0.04);
        ctx.lineTo(rEar.x - fw * 0.02, top.y + fh * 0.06);
        ctx.lineTo(lEar.x + fw * 0.02, top.y + fh * 0.06);
        ctx.closePath();
        ctx.fill();
        // Long side panels
        ctx.beginPath();
        ctx.moveTo(lEar.x - fw * 0.04, top.y - fh * 0.06);
        ctx.bezierCurveTo(lEar.x - fw * 0.14, expr.cy, lEar.x - fw * 0.18, expr.cy + fh * 0.5, lEar.x - fw * 0.1, expr.cy + fh * 0.7);
        ctx.lineTo(lEar.x + fw * 0.05, expr.cy + fh * 0.7);
        ctx.bezierCurveTo(lEar.x + fw * 0.0, expr.cy + fh * 0.4, lEar.x + fw * 0.04, expr.cy, lEar.x + fw * 0.04, top.y + fh * 0.04);
        ctx.closePath(); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(rEar.x + fw * 0.04, top.y - fh * 0.06);
        ctx.bezierCurveTo(rEar.x + fw * 0.14, expr.cy, rEar.x + fw * 0.18, expr.cy + fh * 0.5, rEar.x + fw * 0.1, expr.cy + fh * 0.7);
        ctx.lineTo(rEar.x - fw * 0.05, expr.cy + fh * 0.7);
        ctx.bezierCurveTo(rEar.x - fw * 0.0, expr.cy + fh * 0.4, rEar.x - fw * 0.04, expr.cy, rEar.x - fw * 0.04, top.y + fh * 0.04);
        ctx.closePath(); ctx.fill();
      } else {
        ctx.globalAlpha = 0.72;
        ctx.lineWidth = fw * 0.015;
        ctx.lineCap = "round";
        [[x(-28), y(-75), x(-34), y(-50)], [x(28), y(-75), x(36), y(-50)], [x(-8), y(-77), x(-10), y(-55)]].forEach(([sx, sy, ex, ey]) => {
          ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo((sx + ex) / 2 + fw * 0.015, (sy + ey) / 2, ex, ey); ctx.stroke();
        });
        ctx.globalAlpha = 1;
      }
      break;
    }
    case "ponytail": {
      if (!front) {
        ctx.beginPath();
        ctx.moveTo(lEar.x + fw * 0.02, top.y - fh * 0.04);
        ctx.bezierCurveTo(cx - fw * 0.38, top.y - fh * 0.38, cx, top.y - fh * 0.42, cx, top.y - fh * 0.42);
        ctx.bezierCurveTo(cx, top.y - fh * 0.42, cx + fw * 0.38, top.y - fh * 0.38, rEar.x - fw * 0.02, top.y - fh * 0.04);
        ctx.lineTo(rEar.x, top.y + fh * 0.04); ctx.lineTo(lEar.x, top.y + fh * 0.04); ctx.closePath(); ctx.fill();
        // Ponytail
        ctx.beginPath();
        ctx.moveTo(cx - fw * 0.06, top.y - fh * 0.38);
        ctx.bezierCurveTo(cx - fw * 0.12, top.y - fh * 0.1, cx + fw * 0.2, expr.cy + fh * 0.1, cx + fw * 0.55, expr.cy + fh * 0.3);
        ctx.lineTo(cx + fw * 0.46, expr.cy + fh * 0.38);
        ctx.bezierCurveTo(cx + fw * 0.12, expr.cy + fh * 0.18, cx - fw * 0.08, top.y - fh * 0.02, cx + fw * 0.04, top.y - fh * 0.32);
        ctx.closePath(); ctx.fill();
      }
      break;
    }
    case "bald": default: break;
  }
  ctx.restore();
}

// ─── Face skin ────────────────────────────────────────────────────────

function drawFaceSkin(
  ctx: CanvasRenderingContext2D,
  lm: FaceLandmarks, w: number, h: number,
  av: AvatarConfig,
  expr: Expressions,
) {
  const { cx, cy, fw, fh } = expr;

  ctx.save();
  // Clip to face oval
  lmPath(ctx, lm, OVAL, w, h);
  ctx.clip();

  // Radial skin gradient (lighter temple-forehead area, darker at jaw)
  const skinGrad = ctx.createRadialGradient(cx - fw * 0.08, cy - fh * 0.1, 0, cx, cy, fw * 0.72);
  skinGrad.addColorStop(0,    av.skinLight);
  skinGrad.addColorStop(0.45, av.skin);
  skinGrad.addColorStop(0.85, hexRGBA(av.skinDark, 0.6));
  skinGrad.addColorStop(1,    av.skinDark);
  lmPath(ctx, lm, OVAL, w, h);
  ctx.fillStyle = skinGrad;
  ctx.fill();

  // Cheek blush / subtle warmth highlight
  const blushL = ctx.createRadialGradient(cx - fw * 0.3, cy + fh * 0.06, 0, cx - fw * 0.3, cy + fh * 0.06, fw * 0.22);
  blushL.addColorStop(0, hexRGBA(av.lipColor, 0.08));
  blushL.addColorStop(1, "transparent");
  ctx.fillStyle = blushL; ctx.fillRect(cx - fw, cy - fh * 0.1, fw * 2, fh * 0.5);

  const blushR = ctx.createRadialGradient(cx + fw * 0.3, cy + fh * 0.06, 0, cx + fw * 0.3, cy + fh * 0.06, fw * 0.22);
  blushR.addColorStop(0, hexRGBA(av.lipColor, 0.08));
  blushR.addColorStop(1, "transparent");
  ctx.fillStyle = blushR; ctx.fillRect(cx - fw, cy - fh * 0.1, fw * 2, fh * 0.5);

  // Jaw shadow
  const jawGrad = ctx.createLinearGradient(cx, cy + fh * 0.18, cx, cy + fh * 0.56);
  jawGrad.addColorStop(0, "rgba(0,0,0,0)");
  jawGrad.addColorStop(1, "rgba(0,0,0,0.1)");
  lmPath(ctx, lm, OVAL, w, h);
  ctx.fillStyle = jawGrad; ctx.fill();

  // Nose bridge highlight (subtle)
  const noseTip = pt(lm, NOSE_TIP, w, h);
  const noseTop = pt(lm, NOSE_BRIDGE[0], w, h);
  const bridgeGrad = ctx.createLinearGradient(noseTop.x, noseTop.y, noseTip.x, noseTip.y);
  bridgeGrad.addColorStop(0, "rgba(255,255,255,0)");
  bridgeGrad.addColorStop(0.5, hexRGBA(av.skinLight, 0.22));
  bridgeGrad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.strokeStyle = bridgeGrad;
  ctx.lineWidth = fw * 0.026;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(noseTop.x, noseTop.y);
  ctx.lineTo(noseTip.x, noseTip.y);
  ctx.stroke();

  ctx.restore();
}

// ─── Eyebrow ──────────────────────────────────────────────────────────

function drawEyebrow(
  ctx: CanvasRenderingContext2D,
  lm: FaceLandmarks, w: number, h: number,
  side: "left" | "right",
  av: AvatarConfig,
  browRaise: number,
  browFurrow: number,
) {
  const indices = side === "left" ? L_BROW : R_BROW;
  const pts = indices.map(i => {
    const p = pt(lm, i, w, h);
    // Apply raise offset (move brow up/down by raise amount)
    const fw = (pt(lm, LM_R_EAR, w, h).x - pt(lm, LM_L_EAR, w, h).x);
    const fh = Math.abs(pt(lm, LM_CHIN, w, h).y - pt(lm, LM_FOREHEAD, w, h).y);
    return { x: p.x, y: p.y - browRaise * fh * 0.06, z: p.z };
  });

  if (pts.length < 2) return;

  // Compute brow thickness from inter-point spacing
  const spanX = Math.abs(pts[pts.length - 1].x - pts[0].x);
  const lineW = Math.max(2, spanX * 0.12);

  ctx.save();
  ctx.strokeStyle = av.browColor;
  ctx.lineWidth = lineW;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Draw brow as a tapered stroke
  ctx.beginPath();
  pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.stroke();

  // Inner furrow shadow when furrowed
  if (browFurrow > 0.15) {
    ctx.strokeStyle = hexRGBA(av.browColor, browFurrow * 0.6);
    ctx.lineWidth = lineW * 0.5;
    // Inner crease line below inner corner
    const inner = pts[pts.length - 1]; // inner brow corner
    ctx.beginPath();
    ctx.moveTo(inner.x + (side === "left" ? -spanX * 0.08 : spanX * 0.08), inner.y + lineW * 0.8);
    ctx.lineTo(inner.x + (side === "left" ? -spanX * 0.02 : spanX * 0.02), inner.y + lineW * 1.4);
    ctx.stroke();
  }

  ctx.restore();
}

// ─── Eye ──────────────────────────────────────────────────────────────

function drawEye(
  ctx: CanvasRenderingContext2D,
  lm: FaceLandmarks, w: number, h: number,
  side: "left" | "right",
  av: AvatarConfig,
  openness: number,
) {
  const contour = (side === "left" ? L_EYE_C : R_EYE_C).map(i => pt(lm, i, w, h));
  const upper   = (side === "left" ? L_EYE_UPPER : R_EYE_UPPER).map(i => pt(lm, i, w, h));
  const lower   = (side === "left" ? L_EYE_LOWER : R_EYE_LOWER).map(i => pt(lm, i, w, h));

  if (contour.length < 4) return;

  // Compute eye bounds from actual contour
  const xs = contour.map(p => p.x); const ys = contour.map(p => p.y);
  const minX = Math.min(...xs); const maxX = Math.max(...xs);
  const minY = Math.min(...ys); const maxY = Math.max(...ys);
  const eyeW = maxX - minX; const eyeH = maxY - minY;
  const eyeCX = (minX + maxX) / 2; const eyeCY = (minY + maxY) / 2;

  // Iris center: use refinedLandmark if available (index >= 468)
  const irisCIdx = side === "left" ? L_IRIS_C : R_IRIS_C;
  const hasIris = lm.length > irisCIdx && lm[irisCIdx] != null;
  const irisCenter = hasIris ? pt(lm, irisCIdx, w, h) : { x: eyeCX, y: eyeCY };

  const irisR = Math.min(eyeW * 0.42, eyeH * 0.78);

  ctx.save();

  // Clip to eye contour
  ctx.beginPath();
  contour.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.closePath();
  ctx.clip();

  // Sclera (white with slight warm tint)
  ctx.fillStyle = "#FAFAF3";
  ctx.beginPath();
  contour.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.closePath();
  ctx.fill();

  // Sclera shadow at corners
  const scleraL = ctx.createRadialGradient(minX + eyeW * 0.05, eyeCY, 0, minX + eyeW * 0.05, eyeCY, eyeW * 0.28);
  scleraL.addColorStop(0, hexRGBA(av.skinDark, 0.18)); scleraL.addColorStop(1, "transparent");
  ctx.fillStyle = scleraL; ctx.fill();
  const scleraR = ctx.createRadialGradient(maxX - eyeW * 0.05, eyeCY, 0, maxX - eyeW * 0.05, eyeCY, eyeW * 0.28);
  scleraR.addColorStop(0, hexRGBA(av.skinDark, 0.18)); scleraR.addColorStop(1, "transparent");
  ctx.fillStyle = scleraR; ctx.fill();

  if (openness > 0.08) {
    // Iris gradient (depth illusion)
    const irisGrad = ctx.createRadialGradient(
      irisCenter.x - irisR * 0.22, irisCenter.y - irisR * 0.22, 0,
      irisCenter.x, irisCenter.y, irisR
    );
    irisGrad.addColorStop(0,   hexRGBA(av.eyeColor, 0.88));
    irisGrad.addColorStop(0.55, av.eyeColor);
    irisGrad.addColorStop(0.82, hexBrighten(av.eyeColor, -30));
    irisGrad.addColorStop(1,   hexRGBA("#000000", 0.55));
    ctx.fillStyle = irisGrad;
    ctx.beginPath();
    ctx.arc(irisCenter.x, irisCenter.y, irisR, 0, Math.PI * 2);
    ctx.fill();

    // Iris texture ring
    ctx.strokeStyle = hexRGBA(av.eyeColor, 0.3);
    ctx.lineWidth = irisR * 0.12;
    ctx.beginPath();
    ctx.arc(irisCenter.x, irisCenter.y, irisR * 0.7, 0, Math.PI * 2);
    ctx.stroke();

    // Pupil
    ctx.fillStyle = "#090909";
    ctx.beginPath();
    ctx.arc(irisCenter.x, irisCenter.y, irisR * 0.44, 0, Math.PI * 2);
    ctx.fill();

    // Catchlight (primary)
    ctx.fillStyle = "rgba(255,255,255,0.72)";
    ctx.beginPath();
    ctx.arc(irisCenter.x - irisR * 0.3, irisCenter.y - irisR * 0.3, irisR * 0.2, 0, Math.PI * 2);
    ctx.fill();
    // Catchlight (secondary, smaller)
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.beginPath();
    ctx.arc(irisCenter.x + irisR * 0.26, irisCenter.y - irisR * 0.18, irisR * 0.1, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();

  // ── Eyelids (drawn outside clip) ──
  ctx.save();

  // Upper lid coverage based on openness
  const lidCover = (1 - openness) * eyeH * 0.92 + eyeH * 0.02;
  ctx.fillStyle = av.skin;
  ctx.beginPath();
  upper.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.lineTo(maxX + eyeW * 0.05, minY - lidCover);
  ctx.lineTo(minX - eyeW * 0.05, minY - lidCover);
  ctx.closePath();
  ctx.fill();

  // Eyelid crease shadow
  const creaseGrad = ctx.createLinearGradient(eyeCX, minY - eyeH * 0.15, eyeCX, minY + eyeH * 0.2);
  creaseGrad.addColorStop(0, hexRGBA(av.skinDark, 0.4));
  creaseGrad.addColorStop(1, "transparent");
  ctx.fillStyle = creaseGrad;
  ctx.beginPath();
  upper.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.lineTo(maxX + eyeW * 0.02, minY - eyeH * 0.25);
  ctx.lineTo(minX - eyeW * 0.02, minY - eyeH * 0.25);
  ctx.closePath();
  ctx.fill();

  // Lower lid skin shadow
  ctx.strokeStyle = hexRGBA(av.skinDark, 0.22);
  ctx.lineWidth = eyeH * 0.28;
  ctx.lineCap = "round";
  ctx.beginPath();
  lower.slice(1, -1).forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.stroke();

  // Upper eyelashes
  if (openness > 0.15) {
    ctx.strokeStyle = "#111111";
    ctx.lineWidth = Math.max(1, eyeH * 0.14);
    ctx.lineCap = "round";
    const lashLen = eyeH * 0.55 * openness;
    for (let i = 1; i < upper.length - 1; i++) {
      const prev = upper[i - 1]; const cur = upper[i]; const next = upper[i + 1];
      // Normal pointing up-ish
      const tx = (next.x - prev.x) / 2; const ty = (next.y - prev.y) / 2;
      const nx = -ty; const ny = tx;
      const len = Math.hypot(nx, ny) || 1;
      const lx = nx / len * lashLen; const ly = ny / len * lashLen;
      const curlX = lx * 0.12; const curlY = -Math.abs(lashLen) * 0.18;
      ctx.beginPath();
      ctx.moveTo(cur.x, cur.y);
      ctx.quadraticCurveTo(cur.x + lx * 0.6 + curlX, cur.y + ly * 0.6 + curlY, cur.x + lx, cur.y + ly);
      ctx.stroke();
    }
    // Lower lashes (shorter)
    ctx.lineWidth = Math.max(0.8, eyeH * 0.08);
    const lLashLen = lashLen * 0.35;
    for (let i = 1; i < lower.length - 1; i += 2) {
      const prev = lower[i - 1]; const cur = lower[i]; const next = lower[i + 1] ?? lower[i];
      const tx = (next.x - prev.x) / 2; const ty = (next.y - prev.y) / 2;
      const nx = ty; const ny = -tx;
      const len = Math.hypot(nx, ny) || 1;
      const lx = nx / len * lLashLen; const ly = ny / len * lLashLen;
      ctx.beginPath(); ctx.moveTo(cur.x, cur.y); ctx.lineTo(cur.x + lx, cur.y + ly); ctx.stroke();
    }
  }

  // Eyelid rim (thin dark line along upper contour)
  ctx.strokeStyle = hexRGBA("#111111", 0.7);
  ctx.lineWidth = Math.max(0.8, eyeH * 0.1);
  ctx.lineCap = "round";
  ctx.beginPath();
  upper.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.stroke();

  ctx.restore();
}

// ─── Nose ─────────────────────────────────────────────────────────────

function drawNose(ctx: CanvasRenderingContext2D, lm: FaceLandmarks, w: number, h: number, av: AvatarConfig) {
  const bridge = NOSE_BRIDGE.map(i => pt(lm, i, w, h));
  const tip    = pt(lm, NOSE_TIP,   w, h);
  const bot    = pt(lm, NOSE_BOT,   w, h);
  const lNos   = pt(lm, L_NOSTRIL,  w, h);
  const rNos   = pt(lm, R_NOSTRIL,  w, h);
  const lAlar  = pt(lm, L_ALAR,     w, h);
  const rAlar  = pt(lm, R_ALAR,     w, h);

  const noseW = Math.abs(rNos.x - lNos.x);

  ctx.save();

  // Nose bridge shadow (subtle line down the sides)
  ctx.strokeStyle = hexRGBA(av.skinDark, 0.32);
  ctx.lineWidth = Math.max(1, noseW * 0.06);
  ctx.lineCap = "round";

  if (bridge.length >= 3) {
    // Left bridge shadow
    ctx.beginPath();
    ctx.moveTo(bridge[0].x - noseW * 0.05, bridge[0].y);
    ctx.bezierCurveTo(bridge[0].x - noseW * 0.08, bridge[2].y, tip.x - noseW * 0.22, tip.y - noseW * 0.18, lAlar.x, lAlar.y);
    ctx.stroke();
    // Right bridge shadow
    ctx.beginPath();
    ctx.moveTo(bridge[0].x + noseW * 0.05, bridge[0].y);
    ctx.bezierCurveTo(bridge[0].x + noseW * 0.08, bridge[2].y, tip.x + noseW * 0.22, tip.y - noseW * 0.18, rAlar.x, rAlar.y);
    ctx.stroke();
  }

  // Nose tip highlight
  const tipHL = ctx.createRadialGradient(tip.x - noseW * 0.04, tip.y - noseW * 0.06, 0, tip.x, tip.y, noseW * 0.28);
  tipHL.addColorStop(0, hexRGBA(av.skinLight, 0.45));
  tipHL.addColorStop(1, "transparent");
  ctx.fillStyle = tipHL;
  ctx.beginPath(); ctx.arc(tip.x, tip.y, noseW * 0.28, 0, Math.PI * 2); ctx.fill();

  // Nostril arcs
  ctx.strokeStyle = hexRGBA(av.skinDark, 0.52);
  ctx.lineWidth = Math.max(1, noseW * 0.05);
  // Left nostril
  const lNosR = noseW * 0.18;
  ctx.beginPath(); ctx.arc(lNos.x, lNos.y, lNosR, 0.2, Math.PI - 0.2); ctx.stroke();
  // Right nostril
  const rNosR = noseW * 0.18;
  ctx.beginPath(); ctx.arc(rNos.x, rNos.y, rNosR, 0.2, Math.PI - 0.2); ctx.stroke();

  // Nose base line
  ctx.beginPath();
  ctx.moveTo(lAlar.x, lAlar.y);
  ctx.bezierCurveTo(lNos.x, bot.y, rNos.x, bot.y, rAlar.x, rAlar.y);
  ctx.stroke();

  ctx.restore();
}

// ─── Mouth / Lips ─────────────────────────────────────────────────────

function drawMouth(ctx: CanvasRenderingContext2D, lm: FaceLandmarks, w: number, h: number, av: AvatarConfig, expr: Expressions) {
  const { jawOpen, mouthSmileL, mouthSmileR, mouthPucker } = expr;

  const outerTop = LIPS_U_OUT.map(i => pt(lm, i, w, h));
  const outerBot = LIPS_L_OUT.slice(1).map(i => pt(lm, i, w, h));
  const innerTop = LIPS_U_IN.map(i => pt(lm, i, w, h));
  const innerBot = LIPS_L_IN.slice(1).map(i => pt(lm, i, w, h));

  const cornerL = pt(lm, LM_MOUTH_L, w, h);
  const cornerR = pt(lm, LM_MOUTH_R, w, h);
  const mouthW  = Math.abs(cornerR.x - cornerL.x);
  const lipThick = mouthW * 0.1;

  ctx.save();

  // Dark mouth cavity (if open)
  if (jawOpen > 0.04) {
    ctx.beginPath();
    innerTop.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    innerBot.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    const cavityGrad = ctx.createLinearGradient(cornerL.x, innerTop[5]?.y ?? 0, cornerL.x, innerBot[4]?.y ?? 1);
    cavityGrad.addColorStop(0,   "#1A0800");
    cavityGrad.addColorStop(0.3, "#200A00");
    cavityGrad.addColorStop(1,   "#0A0400");
    ctx.fillStyle = cavityGrad;
    ctx.fill();

    // Teeth (visible when more open)
    if (jawOpen > 0.22) {
      const teethOpacity = Math.min(1, (jawOpen - 0.22) / 0.25);
      ctx.fillStyle = hexRGBA("#EDE8E0", teethOpacity * 0.9);
      ctx.beginPath();
      // Upper teeth: bounded by inner upper lip
      const ut0 = innerTop[0]; const ut6 = innerTop[5] ?? innerTop[innerTop.length - 1];
      const ub = innerBot[4] ?? innerBot[innerBot.length - 1];
      ctx.rect(
        ut0.x + mouthW * 0.04, ut0.y + lipThick * 0.4,
        mouthW * 0.82, Math.min(ub.y - ut0.y, mouthW * 0.22) * teethOpacity
      );
      ctx.fill();
    }
  }

  // Outer lip fill (combines upper + lower outer into closed shape)
  ctx.beginPath();
  outerTop.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  outerBot.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.closePath();

  // Upper lip gradient
  const ulTopY = Math.min(...outerTop.map(p => p.y));
  const ulBotY = Math.max(...outerTop.map(p => p.y));
  const ulGrad = ctx.createLinearGradient(0, ulTopY, 0, ulBotY + lipThick * 0.5);
  ulGrad.addColorStop(0, av.lipColor);
  ulGrad.addColorStop(0.55, hexBrighten(av.lipColor, -18));
  ulGrad.addColorStop(1, hexRGBA(av.skinDark, 0.7));
  ctx.fillStyle = ulGrad;
  ctx.fill();

  // Lower lip (separate, slightly lighter and poutier)
  ctx.beginPath();
  const llTopY = Math.min(...outerBot.map(p => p.y));
  const llBotY = Math.max(...outerBot.map(p => p.y));
  ctx.moveTo(cornerL.x, cornerL.y);
  outerBot.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.closePath();
  const llGrad = ctx.createLinearGradient(0, llTopY, 0, llBotY);
  llGrad.addColorStop(0, hexBrighten(av.lipColor, 12));
  llGrad.addColorStop(0.6, av.lipColor);
  llGrad.addColorStop(1, hexRGBA(av.skinDark, 0.8));
  ctx.fillStyle = llGrad;
  ctx.fill();

  // Lower lip highlight
  const llCX = (cornerL.x + cornerR.x) / 2;
  const llCY = (llTopY + llBotY) * 0.55;
  const hlGrad = ctx.createRadialGradient(llCX, llCY - lipThick * 0.4, 0, llCX, llCY, mouthW * 0.35);
  hlGrad.addColorStop(0, hexRGBA("#FFFFFF", 0.22));
  hlGrad.addColorStop(1, "transparent");
  ctx.fillStyle = hlGrad;
  ctx.beginPath();
  ctx.moveTo(cornerL.x, cornerL.y);
  outerBot.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.closePath();
  ctx.fill();

  // Lip line (philtrum dip of upper lip)
  ctx.strokeStyle = hexRGBA(av.lipColor, 0.55);
  ctx.lineWidth = Math.max(0.8, lipThick * 0.3);
  ctx.lineCap = "round";
  ctx.beginPath();
  outerTop.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.stroke();

  // Mouth corners shadow (smile dimples)
  const smileFactor = (mouthSmileL + mouthSmileR) * 0.5;
  if (smileFactor > 0.1) {
    ctx.fillStyle = hexRGBA(av.skinDark, smileFactor * 0.4);
    ctx.beginPath(); ctx.arc(cornerL.x, cornerL.y, mouthW * 0.04, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cornerR.x, cornerR.y, mouthW * 0.04, 0, Math.PI * 2); ctx.fill();
  }

  ctx.restore();
}

// ─── Glasses ──────────────────────────────────────────────────────────

function drawGlasses(ctx: CanvasRenderingContext2D, lm: FaceLandmarks, w: number, h: number) {
  const leOut = pt(lm, LM_L_EYE_L, w, h); const leIn = pt(lm, LM_L_EYE_R, w, h);
  const reOut = pt(lm, LM_R_EYE_L, w, h); const reIn = pt(lm, LM_R_EYE_R, w, h);
  const lEye  = centroid(lm, L_EYE_C, w, h);
  const rEye  = centroid(lm, R_EYE_C, w, h);
  const lEyeW = Math.abs(leOut.x - leIn.x);
  const rEyeW = Math.abs(reOut.x - reIn.x);
  const lEyeH = Math.abs(pt(lm, LM_L_EYE_T, w, h).y - pt(lm, LM_L_EYE_B, w, h).y);
  const rEyeH = Math.abs(pt(lm, LM_R_EYE_T, w, h).y - pt(lm, LM_R_EYE_B, w, h).y);

  ctx.save();
  ctx.strokeStyle = "#2A2A2A";
  ctx.lineWidth = Math.max(1.5, lEyeW * 0.06);
  ctx.lineJoin = "round";

  // Left lens
  ctx.beginPath(); ctx.ellipse(lEye.x, lEye.y, lEyeW * 0.62, Math.max(lEyeH, lEyeW * 0.38), 0, 0, Math.PI * 2);
  ctx.strokeStyle = "#2A2A2A"; ctx.stroke();
  ctx.fillStyle = "rgba(120,160,200,0.06)"; ctx.fill();

  // Right lens
  ctx.beginPath(); ctx.ellipse(rEye.x, rEye.y, rEyeW * 0.62, Math.max(rEyeH, rEyeW * 0.38), 0, 0, Math.PI * 2);
  ctx.stroke(); ctx.fill();

  // Bridge
  ctx.beginPath(); ctx.moveTo(leIn.x - lEyeW * 0.06, lEye.y); ctx.lineTo(reIn.x + rEyeW * 0.06, rEye.y); ctx.stroke();

  // Temples
  ctx.beginPath(); ctx.moveTo(leOut.x - lEyeW * 0.62, lEye.y); ctx.lineTo(leOut.x - lEyeW * 0.9, lEye.y + lEyeH * 0.6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(reOut.x + rEyeW * 0.62, rEye.y); ctx.lineTo(reOut.x + rEyeW * 0.9, rEye.y + rEyeH * 0.6); ctx.stroke();

  ctx.restore();
}

// ─── Beard ────────────────────────────────────────────────────────────

function drawBeard(ctx: CanvasRenderingContext2D, lm: FaceLandmarks, w: number, h: number, av: AvatarConfig, expr: Expressions) {
  const { cx, cy, fw, fh, chinX, chinY } = expr;
  ctx.save();

  // Clip to lower face (below nose)
  const noseBot = pt(lm, NOSE_BOT, w, h);
  ctx.beginPath();
  ctx.rect(cx - fw * 0.7, noseBot.y, fw * 1.4, fh * 0.7);
  lmPath(ctx, lm, OVAL, w, h, true);
  ctx.clip();

  ctx.fillStyle = hexRGBA(av.hair, 0.42);
  // Chin coverage
  ctx.beginPath(); ctx.ellipse(chinX, chinY - fh * 0.04, fw * 0.22, fh * 0.16, 0, 0, Math.PI * 2); ctx.fill();
  // Jaw stubble L/R
  ctx.beginPath(); ctx.ellipse(cx - fw * 0.24, cy + fh * 0.3, fw * 0.12, fh * 0.12, 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + fw * 0.24, cy + fh * 0.3, fw * 0.12, fh * 0.12, -0.3, 0, Math.PI * 2); ctx.fill();

  // Moustache
  ctx.fillStyle = hexRGBA(av.hair, 0.55);
  ctx.beginPath(); ctx.ellipse(cx - fw * 0.075, noseBot.y + fh * 0.04, fw * 0.11, fh * 0.04, -0.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + fw * 0.075, noseBot.y + fh * 0.04, fw * 0.11, fh * 0.04,  0.2, 0, Math.PI * 2); ctx.fill();

  ctx.restore();
}

// ─── Main render ──────────────────────────────────────────────────────

export interface DrawAvatarOptions {
  drawBackground?: boolean;
  poseLm?: PoseLandmarks;
}

export function drawAvatarFace(
  ctx: CanvasRenderingContext2D,
  lm: FaceLandmarks,
  w: number, h: number,
  av: AvatarConfig,
  opts: DrawAvatarOptions = {},
) {
  if (lm.length < 400) return;

  const expr = extractExpressions(lm, w, h);

  // Optional: studio-style gradient background
  if (opts.drawBackground) {
    const bg = ctx.createRadialGradient(w * 0.5, h * 0.38, 0, w * 0.5, h * 0.5, w * 0.72);
    bg.addColorStop(0, "#1A1F2E");
    bg.addColorStop(0.6, "#0F1320");
    bg.addColorStop(1, "#080B14");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    // Subtle key light spot
    const light = ctx.createRadialGradient(w * 0.38, h * 0.22, 0, w * 0.38, h * 0.22, w * 0.55);
    light.addColorStop(0, "rgba(77,140,255,0.07)");
    light.addColorStop(1, "transparent");
    ctx.fillStyle = light;
    ctx.fillRect(0, 0, w, h);
  }

  // Apply head roll transform around face centre
  ctx.save();
  ctx.translate(expr.cx, expr.cy);
  ctx.rotate(expr.roll);
  ctx.translate(-expr.cx, -expr.cy);

  // 1. Body (neck, shoulders, shirt)
  drawBody(ctx, expr, w, h, av);

  // 2. Hair (back layer)
  drawHair(ctx, lm, w, h, av, expr, false);

  // 3. Face skin
  drawFaceSkin(ctx, lm, w, h, av, expr);

  // 4. Beard (behind other features)
  if (av.hasBeard) drawBeard(ctx, lm, w, h, av, expr);

  // 5. Eyebrows
  drawEyebrow(ctx, lm, w, h, "left",  av, expr.lBrowRaise, expr.lBrowFurrow);
  drawEyebrow(ctx, lm, w, h, "right", av, expr.rBrowRaise, expr.rBrowFurrow);

  // 6. Eyes
  drawEye(ctx, lm, w, h, "left",  av, expr.lEyeOpen);
  drawEye(ctx, lm, w, h, "right", av, expr.rEyeOpen);

  // 7. Nose
  drawNose(ctx, lm, w, h, av);

  // 8. Mouth
  drawMouth(ctx, lm, w, h, av, expr);

  // 9. Hair (front strands)
  drawHair(ctx, lm, w, h, av, expr, true);

  // 10. Glasses
  if (av.hasGlasses) drawGlasses(ctx, lm, w, h);

  // 11. Face oval subtle edge (blends avatar into background)
  ctx.save();
  lmPath(ctx, lm, OVAL, w, h);
  ctx.strokeStyle = hexRGBA(av.skinDark, 0.18);
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();

  ctx.restore(); // restore roll transform
}

// Legacy compat
export function getExprParams(lm: FaceLandmarks, w: number, h: number) {
  return extractExpressions(lm, w, h);
}
export function drawChromeMask(ctx: CanvasRenderingContext2D, lm: FaceLandmarks, w: number, h: number) {
  drawAvatarFace(ctx, lm, w, h, AVATARS[0]);
}

/**
 * faceRenderer.ts
 * ─────────────────────────────────────────────────────────────────
 * Renders one of 6 stylised human avatar faces over the detected
 * face region, driven by MediaPipe FaceMesh landmarks.
 *
 * Drawing pipeline per frame:
 *   1. Real video already drawn by caller
 *   2. Hair (back layer, behind face oval)
 *   3. Face oval (skin gradient)
 *   4. Eyebrows  (animated y-offset)
 *   5. Eyes      (animated open/close)
 *   6. Nose
 *   7. Mouth     (animated open/close)
 *   8. Hair front strands (partially over face)
 *   9. Optional accessories: glasses, beard, freckles
 */

export type FaceLandmarks = Array<{ x: number; y: number; z: number }>;

// ─── Avatar definitions ───────────────────────────────────────────
export interface AvatarConfig {
  id:          number;
  name:        string;
  skin:        string;   // base skin hex
  skinDark:    string;   // shadow / contour
  skinLight:   string;   // highlight
  hair:        string;
  hairStyle:   "short" | "long" | "curly" | "ponytail" | "bald";
  eyeColor:    string;
  browColor:   string;
  lipColor:    string;
  hasGlasses?: boolean;
  hasBeard?:   boolean;
}

export const AVATARS: AvatarConfig[] = [
  {
    id: 1, name: "Аватар 1",
    skin: "#FDDBB4", skinDark: "#D4996A", skinLight: "#FFF0D8",
    hair: "#2C1A0E", hairStyle: "short",
    eyeColor: "#3A7BD5", browColor: "#2C1A0E", lipColor: "#C97B6F",
  },
  {
    id: 2, name: "Аватар 2",
    skin: "#8C5523", skinDark: "#5C3010", skinLight: "#B07040",
    hair: "#0D0400", hairStyle: "curly",
    eyeColor: "#6B3A1F", browColor: "#0D0400", lipColor: "#7B3F2F",
  },
  {
    id: 3, name: "Аватар 3",
    skin: "#F5C499", skinDark: "#C98850", skinLight: "#FDE4C4",
    hair: "#8B2A02", hairStyle: "long",
    eyeColor: "#2E7D32", browColor: "#6A1E00", lipColor: "#C97060",
  },
  {
    id: 4, name: "Аватар 4",
    skin: "#FAEBD7", skinDark: "#CCA882", skinLight: "#FFFAF5",
    hair: "#8A8A8A", hairStyle: "short",
    eyeColor: "#5D4037", browColor: "#6A6A6A", lipColor: "#B87A6A",
    hasGlasses: true,
  },
  {
    id: 5, name: "Аватар 5",
    skin: "#C07840", skinDark: "#8A5020", skinLight: "#E09A60",
    hair: "#1E1008", hairStyle: "short",
    eyeColor: "#8D6E63", browColor: "#1E1008", lipColor: "#9A5540",
    hasBeard: true,
  },
  {
    id: 6, name: "Аватар 6",
    skin: "#FFDAB9", skinDark: "#D4A882", skinLight: "#FFF0E0",
    hair: "#0A0A0A", hairStyle: "ponytail",
    eyeColor: "#1C2B3A", browColor: "#0A0A0A", lipColor: "#C87870",
  },
];

// ─── MediaPipe landmark indices ───────────────────────────────────
const LM = {
  FACE_TOP: 10, FACE_BOT: 152, FACE_L: 234, FACE_R: 454,
  L_EYE_T: 386, L_EYE_B: 374, L_EYE_L: 263, L_EYE_R: 362,
  R_EYE_T: 159, R_EYE_B: 145, R_EYE_L: 33,  R_EYE_R: 133,
  L_BROW_L: 300, L_BROW_M: 296, L_BROW_R: 336,
  R_BROW_L: 107, R_BROW_M: 66,  R_BROW_R: 70,
  MOUTH_L: 61, MOUTH_R: 291, MOUTH_T: 13, MOUTH_B: 14,
  NOSE_TIP: 4,
  // Face oval contour (36 points)
  OVAL: [10,338,297,332,284,251,389,356,454,323,361,288,397,365,379,378,
         400,377,152,148,176,149,150,136,172,58,132,93,234,127,162,21,54,103,67,109],
};

// ─── Expression extraction ────────────────────────────────────────
interface ExprParams {
  cx: number; cy: number;
  fw: number; fh: number;   // face pixel width/height
  roll: number;
  lEyeOpen: number; rEyeOpen: number;   // 0–1
  mouthOpen: number;                    // 0–1
  lBrow: number; rBrow: number;         // 0=neutral, 1=raised, -1=furrowed
}

function pt(lm: FaceLandmarks, i: number, w: number, h: number) {
  return { x: lm[i].x * w, y: lm[i].y * h };
}

export function getExprParams(lm: FaceLandmarks, w: number, h: number): ExprParams {
  const top = pt(lm, LM.FACE_TOP, w, h);
  const bot = pt(lm, LM.FACE_BOT, w, h);
  const lft = pt(lm, LM.FACE_L,   w, h);
  const rgt = pt(lm, LM.FACE_R,   w, h);

  const cx = (lft.x + rgt.x) / 2;
  const cy = (top.y + bot.y) / 2;
  const fw = rgt.x - lft.x;
  const fh = bot.y - top.y;

  // Head roll: angle of eye line
  const leOut = pt(lm, LM.L_EYE_L, w, h);
  const reOut = pt(lm, LM.R_EYE_L, w, h);
  const roll  = Math.atan2(leOut.y - reOut.y, leOut.x - reOut.x);

  // Left eye openness
  const leTop = pt(lm, LM.L_EYE_T, w, h);
  const leBot = pt(lm, LM.L_EYE_B, w, h);
  const leW   = Math.abs(leOut.x - pt(lm, LM.L_EYE_R, w, h).x);
  const lEyeOpen = leW > 0 ? Math.min(1, Math.abs(leBot.y - leTop.y) / (leW * 0.38)) : 1;

  // Right eye openness
  const reTop = pt(lm, LM.R_EYE_T, w, h);
  const reBot = pt(lm, LM.R_EYE_B, w, h);
  const reW   = Math.abs(reOut.x - pt(lm, LM.R_EYE_R, w, h).x);
  const rEyeOpen = reW > 0 ? Math.min(1, Math.abs(reBot.y - reTop.y) / (reW * 0.38)) : 1;

  // Mouth openness
  const mT  = pt(lm, LM.MOUTH_T, w, h);
  const mB  = pt(lm, LM.MOUTH_B, w, h);
  const mL  = pt(lm, LM.MOUTH_L, w, h);
  const mR  = pt(lm, LM.MOUTH_R, w, h);
  const mW  = Math.abs(mR.x - mL.x);
  const mouthOpen = mW > 0 ? Math.min(1, Math.abs(mB.y - mT.y) / (mW * 0.45)) : 0;

  // Eyebrow raise (relative to eye-brow gap normalised by face height)
  const lBrowY = (pt(lm, LM.L_BROW_L, w, h).y + pt(lm, LM.L_BROW_M, w, h).y + pt(lm, LM.L_BROW_R, w, h).y) / 3;
  const rBrowY = (pt(lm, LM.R_BROW_L, w, h).y + pt(lm, LM.R_BROW_M, w, h).y + pt(lm, LM.R_BROW_R, w, h).y) / 3;
  const lEyeY  = (leTop.y + leBot.y) / 2;
  const rEyeY  = (reTop.y + reBot.y) / 2;
  const normH  = fh * 0.08;
  const lBrow  = normH > 0 ? Math.min(1, Math.max(-0.5, (lEyeY - lBrowY) / normH - 1)) : 0;
  const rBrow  = normH > 0 ? Math.min(1, Math.max(-0.5, (rEyeY - rBrowY) / normH - 1)) : 0;

  return { cx, cy, fw, fh, roll, lEyeOpen, rEyeOpen, mouthOpen, lBrow, rBrow };
}

// ─── Face oval path (for clipping & tracing) ─────────────────────
function faceOvalPath(ctx: CanvasRenderingContext2D, lm: FaceLandmarks, w: number, h: number) {
  const pts = LM.OVAL.map(i => pt(lm, i, w, h));
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.closePath();
}

// ─── Drawing helpers in local avatar space ────────────────────────
// Local space: 0,0 = face centre, ±100 H, ±120 V

function localX(x: number, fw: number) { return x * fw / 200; }
function localY(y: number, fh: number) { return y * fh / 240; }
function lx(x: number, fw: number) { return localX(x, fw); }
function ly(y: number, fh: number) { return localY(y, fh); }

function hexAlpha(hex: string, a: number) {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

// ─── Draw hair ────────────────────────────────────────────────────
function drawHair(
  ctx: CanvasRenderingContext2D,
  av: AvatarConfig,
  cx: number, cy: number,
  fw: number, fh: number,
  front: boolean,       // true = front strands (after face), false = back mass
) {
  const s = av.hair;
  ctx.save();
  ctx.fillStyle = s;
  ctx.strokeStyle = hexAlpha(s, 0.6);
  ctx.lineWidth = lx(4, fw);

  const x = (dx: number) => cx + lx(dx, fw);
  const y = (dy: number) => cy + ly(dy, fh);

  switch (av.hairStyle) {
    case "short": {
      if (!front) {
        // Top cap
        ctx.beginPath();
        ctx.ellipse(cx, cy + ly(-68, fh), lx(66, fw), ly(38, fh), 0, Math.PI, 0);
        ctx.fill();
        // Sides
        ctx.fillRect(x(-66), y(-68), lx(14, fw), ly(40, fh));
        ctx.fillRect(x(52),  y(-68), lx(14, fw), ly(40, fh));
      }
      break;
    }
    case "curly": {
      if (!front) {
        // Base
        ctx.beginPath();
        ctx.ellipse(cx, cy + ly(-62, fh), lx(72, fw), ly(52, fh), 0, Math.PI, 0);
        ctx.fill();
        // Curly bumps
        for (let i = -70; i <= 70; i += 18) {
          ctx.beginPath();
          ctx.arc(x(i), y(-90), lx(10, fw), 0, Math.PI * 2);
          ctx.fill();
        }
        // Sideburns
        ctx.beginPath();
        ctx.arc(x(-64), y(-30), lx(10, fw), 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x(64), y(-30), lx(10, fw), 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case "long": {
      if (!front) {
        // Top
        ctx.beginPath();
        ctx.ellipse(cx, cy + ly(-68, fh), lx(66, fw), ly(38, fh), 0, Math.PI, 0);
        ctx.fill();
        // Long sides flowing down
        ctx.beginPath();
        ctx.moveTo(x(-66), y(-60));
        ctx.bezierCurveTo(x(-80), y(0), x(-85), y(60), x(-70), y(110));
        ctx.lineTo(x(-56), y(110));
        ctx.bezierCurveTo(x(-70), y(60), x(-66), y(0), x(-54), y(-55));
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x(66), y(-60));
        ctx.bezierCurveTo(x(80), y(0), x(85), y(60), x(70), y(110));
        ctx.lineTo(x(56), y(110));
        ctx.bezierCurveTo(x(70), y(60), x(66), y(0), x(54), y(-55));
        ctx.closePath();
        ctx.fill();
      } else {
        // Front strands (wispy)
        ctx.globalAlpha = 0.7;
        ctx.lineWidth = lx(3, fw);
        [[x(-30), y(-75), x(-35), y(-50)] as const,
         [x( 30), y(-75), x( 38), y(-50)] as const,
         [x(-10), y(-75), x(-12), y(-55)] as const].forEach(([sx, sy, ex, ey]) => {
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.quadraticCurveTo((sx + ex) / 2 + lx(5, fw), (sy + ey) / 2, ex, ey);
          ctx.stroke();
        });
        ctx.globalAlpha = 1;
      }
      break;
    }
    case "ponytail": {
      if (!front) {
        ctx.beginPath();
        ctx.ellipse(cx, cy + ly(-68, fh), lx(66, fw), ly(38, fh), 0, Math.PI, 0);
        ctx.fill();
        // Sides
        ctx.fillRect(x(-66), y(-68), lx(14, fw), ly(30, fh));
        ctx.fillRect(x(52),  y(-68), lx(14, fw), ly(30, fh));
        // Ponytail at back (partially visible)
        ctx.beginPath();
        ctx.moveTo(x(-12), y(-70));
        ctx.bezierCurveTo(x(-20), y(-20), x(30), y(30), x(80), y(60));
        ctx.lineTo(x(72), y(72));
        ctx.bezierCurveTo(x(22), y(42), x(-28), y(-14), x(0), y(-65));
        ctx.closePath();
        ctx.fill();
      }
      break;
    }
    case "bald":
    default:
      break;
  }
  ctx.restore();
}

// ─── Draw eyebrow ─────────────────────────────────────────────────
function drawEyebrow(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  fw: number, fh: number,
  side: "left" | "right",
  color: string,
  raise: number,   // 0=neutral, 1=raised
) {
  const sign = side === "left" ? -1 : 1;
  const bx   = cx + lx(sign * 29, fw);
  const by   = cy + ly(-42 - raise * 8, fh);
  const hw   = lx(19, fw);
  const h    = ly(4.5, fh);
  const arch = ly(sign * 2.5, fh);  // slight arch toward centre

  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = h * 2;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(bx - hw, by + (side === "left" ? arch : -arch));
  ctx.quadraticCurveTo(bx, by - h, bx + hw, by + (side === "left" ? -arch : arch));
  ctx.stroke();
  ctx.restore();
}

// ─── Draw eye ─────────────────────────────────────────────────────
function drawEye(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  fw: number, fh: number,
  side: "left" | "right",
  av: AvatarConfig,
  openness: number,  // 0=closed, 1=open
) {
  const sign = side === "left" ? -1 : 1;
  const ex   = cx + lx(sign * 29, fw);
  const ey   = cy + ly(-20, fh);
  const hw   = lx(17, fw);
  const hh   = ly(9, fh) * Math.max(0.05, openness);

  ctx.save();

  // Clip to eye area (so iris/pupil don't overflow)
  ctx.beginPath();
  ctx.ellipse(ex, ey, hw, Math.max(ly(1,fh), hh * 1.05), 0, 0, Math.PI * 2);
  ctx.clip();

  // White sclera
  ctx.fillStyle = "#FAFAF5";
  ctx.beginPath();
  ctx.ellipse(ex, ey, hw, Math.max(ly(1,fh), hh * 1.05), 0, 0, Math.PI * 2);
  ctx.fill();

  if (openness > 0.12) {
    // Iris
    const irisR = Math.min(hw * 0.72, hh * 1.1);
    const irisGrad = ctx.createRadialGradient(ex - irisR * 0.2, ey - irisR * 0.2, 0, ex, ey, irisR);
    irisGrad.addColorStop(0,    hexAlpha(av.eyeColor, 0.9));
    irisGrad.addColorStop(0.7,  av.eyeColor);
    irisGrad.addColorStop(1,    hexAlpha("#000000", 0.4));
    ctx.fillStyle = irisGrad;
    ctx.beginPath();
    ctx.arc(ex, ey, irisR, 0, Math.PI * 2);
    ctx.fill();

    // Pupil
    ctx.fillStyle = "#0A0A0A";
    ctx.beginPath();
    ctx.arc(ex, ey, irisR * 0.42, 0, Math.PI * 2);
    ctx.fill();

    // Catchlight
    ctx.fillStyle = "rgba(255,255,255,0.65)";
    ctx.beginPath();
    ctx.arc(ex - irisR * 0.28, ey - irisR * 0.28, irisR * 0.22, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();

  // Eyelids (drawn outside clip)
  ctx.save();
  ctx.fillStyle = av.skin;

  // Upper lid — covers top portion based on openness
  const lidCoverage = ly(9, fh) * (1 - openness) + ly(1, fh);
  ctx.beginPath();
  ctx.ellipse(ex, ey - hh * 0.5, hw * 1.02, ly(9, fh), 0, 0, Math.PI * 2);
  ctx.rect(ex - hw * 1.1, ey - ly(20, fh), hw * 2.2, ly(20, fh) - hh + lidCoverage);
  ctx.fill();

  // Eyelid crease line
  ctx.strokeStyle = hexAlpha(av.skinDark, 0.5);
  ctx.lineWidth   = ly(1.5, fh);
  ctx.beginPath();
  ctx.moveTo(ex - hw, ey);
  ctx.quadraticCurveTo(ex, ey - hh * 1.1, ex + hw, ey);
  ctx.stroke();

  // Lower lid shadow
  ctx.strokeStyle = hexAlpha(av.skinDark, 0.25);
  ctx.lineWidth   = ly(1.5, fh);
  ctx.beginPath();
  ctx.moveTo(ex - hw * 0.9, ey + hh * 0.3);
  ctx.quadraticCurveTo(ex, ey + hh * 0.85, ex + hw * 0.9, ey + hh * 0.3);
  ctx.stroke();

  // Eyelashes (upper)
  if (openness > 0.2) {
    ctx.strokeStyle = "#1A1A1A";
    ctx.lineWidth   = ly(1.8, fh);
    ctx.lineCap     = "round";
    for (let i = -3; i <= 3; i++) {
      const lashX = ex + lx(i * 5, fw);
      const lashY = ey - hh * 0.9;
      ctx.beginPath();
      ctx.moveTo(lashX, lashY);
      ctx.lineTo(lashX + lx(i * 1.5, fw), lashY - ly(5, fh));
      ctx.stroke();
    }
  }

  ctx.restore();
}

// ─── Draw nose ────────────────────────────────────────────────────
function drawNose(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  fw: number, fh: number,
  av: AvatarConfig,
) {
  ctx.save();
  ctx.strokeStyle = hexAlpha(av.skinDark, 0.45);
  ctx.lineWidth   = ly(2, fh);
  ctx.lineCap     = "round";
  ctx.lineJoin    = "round";

  // Bridge
  ctx.beginPath();
  ctx.moveTo(cx + lx(-5, fw), cy + ly(-15, fh));
  ctx.quadraticCurveTo(cx + lx(-6, fw), cy + ly(8, fh), cx + lx(-10, fw), cy + ly(16, fh));
  ctx.stroke();

  // Nostrils hint
  ctx.beginPath();
  ctx.arc(cx + lx(-11, fw), cy + ly(16, fh), lx(4, fw), 0.3, Math.PI - 0.3);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx + lx(11, fw), cy + ly(16, fh), lx(4, fw), 0.3, Math.PI - 0.3);
  ctx.stroke();
  // Tip line
  ctx.beginPath();
  ctx.moveTo(cx + lx(-10, fw), cy + ly(16, fh));
  ctx.lineTo(cx + lx(10, fw), cy + ly(16, fh));
  ctx.stroke();

  ctx.restore();
}

// ─── Draw mouth ───────────────────────────────────────────────────
function drawMouth(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  fw: number, fh: number,
  av: AvatarConfig,
  mouthOpen: number,
) {
  ctx.save();

  const mw  = lx(22, fw);
  const my  = cy + ly(32, fh);
  const lip = ly(5, fh);
  const gap = ly(12, fh) * mouthOpen;

  // Dark inside (if open)
  if (mouthOpen > 0.06) {
    ctx.fillStyle = "#1A0800";
    ctx.beginPath();
    ctx.moveTo(cx - mw, my);
    ctx.quadraticCurveTo(cx, my + gap, cx + mw, my);
    ctx.quadraticCurveTo(cx, my - lip * 0.3, cx - mw, my);
    ctx.fill();

    // Teeth hint
    if (mouthOpen > 0.25) {
      ctx.fillStyle = "#F0EDE8";
      ctx.beginPath();
      ctx.rect(cx - mw * 0.65, my - gap * 0.05, mw * 1.3, gap * 0.55);
      ctx.fill();
    }
  }

  // Lower lip
  const lipGrad = ctx.createLinearGradient(cx, my, cx, my + lip * 1.5);
  lipGrad.addColorStop(0, av.lipColor);
  lipGrad.addColorStop(1, hexAlpha(av.skinDark, 0.7));
  ctx.fillStyle = lipGrad;
  ctx.beginPath();
  ctx.moveTo(cx - mw, my + gap * 0.5);
  ctx.bezierCurveTo(cx - mw * 0.5, my + lip + gap * 0.5, cx + mw * 0.5, my + lip + gap * 0.5, cx + mw, my + gap * 0.5);
  ctx.bezierCurveTo(cx + mw * 0.5, my + lip * 0.2 + gap * 0.5, cx - mw * 0.5, my + lip * 0.2 + gap * 0.5, cx - mw, my + gap * 0.5);
  ctx.fill();

  // Upper lip (M-shape)
  const ulGrad = ctx.createLinearGradient(cx, my - lip, cx, my);
  ulGrad.addColorStop(0, av.lipColor);
  ulGrad.addColorStop(1, hexAlpha(av.lipColor, 0.75));
  ctx.fillStyle = ulGrad;
  ctx.beginPath();
  ctx.moveTo(cx - mw, my);
  ctx.bezierCurveTo(cx - mw * 0.5, my - lip * 0.6, cx - mw * 0.25, my - lip, cx, my - lip * 0.5);
  ctx.bezierCurveTo(cx + mw * 0.25, my - lip, cx + mw * 0.5, my - lip * 0.6, cx + mw, my);
  ctx.lineTo(cx + mw * 0.6, my - lip * 0.1);
  ctx.bezierCurveTo(cx + mw * 0.2, my - lip * 0.4, cx - mw * 0.2, my - lip * 0.4, cx - mw * 0.6, my - lip * 0.1);
  ctx.closePath();
  ctx.fill();

  // Lip line highlight
  ctx.strokeStyle = hexAlpha("#ffffff", 0.15);
  ctx.lineWidth   = ly(1, fh);
  ctx.beginPath();
  ctx.moveTo(cx - mw * 0.4, my + gap * 0.5 + lip * 0.3);
  ctx.quadraticCurveTo(cx, my + gap * 0.5 + lip * 0.65, cx + mw * 0.4, my + gap * 0.5 + lip * 0.3);
  ctx.stroke();

  ctx.restore();
}

// ─── Optional accessories ─────────────────────────────────────────
function drawGlasses(ctx: CanvasRenderingContext2D, cx: number, cy: number, fw: number, fh: number) {
  ctx.save();
  ctx.strokeStyle = "#2C2C2C";
  ctx.lineWidth   = ly(2.5, fh);
  ctx.lineJoin    = "round";

  const ey = cy + ly(-20, fh);
  const rL = lx(20, fw), rH = ly(10, fh);

  // Left lens
  ctx.beginPath();
  ctx.ellipse(cx + lx(-29, fw), ey, rL, rH, 0, 0, Math.PI * 2);
  ctx.strokeStyle = "#2C2C2C";
  ctx.stroke();
  ctx.fillStyle = "rgba(120,160,200,0.08)";
  ctx.fill();

  // Right lens
  ctx.beginPath();
  ctx.ellipse(cx + lx(29, fw), ey, rL, rH, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fill();

  // Bridge
  ctx.beginPath();
  ctx.moveTo(cx + lx(-9, fw), ey);
  ctx.lineTo(cx + lx(9, fw),  ey);
  ctx.stroke();

  // Temples
  ctx.beginPath();
  ctx.moveTo(cx + lx(-49, fw), ey);
  ctx.lineTo(cx + lx(-60, fw), ey + ly(8, fh));
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + lx(49, fw), ey);
  ctx.lineTo(cx + lx(60, fw), ey + ly(8, fh));
  ctx.stroke();

  ctx.restore();
}

function drawBeard(ctx: CanvasRenderingContext2D, cx: number, cy: number, fw: number, fh: number, av: AvatarConfig) {
  ctx.save();
  const stubble = hexAlpha(av.hair, 0.35);
  ctx.fillStyle = stubble;

  // Chin area stubble
  ctx.beginPath();
  ctx.ellipse(cx, cy + ly(52, fh), lx(30, fw), ly(18, fh), 0, 0, Math.PI * 2);
  ctx.fill();

  // Jaw stubble
  ctx.beginPath();
  ctx.ellipse(cx + lx(-32, fw), cy + ly(38, fh), lx(16, fw), ly(14, fh), 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + lx(32, fw), cy + ly(38, fh), lx(16, fw), ly(14, fh), -0.3, 0, Math.PI * 2);
  ctx.fill();

  // Moustache
  ctx.fillStyle = hexAlpha(av.hair, 0.5);
  ctx.beginPath();
  ctx.ellipse(cx + lx(-10, fw), cy + ly(25, fh), lx(14, fw), ly(5, fh), -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + lx(10, fw), cy + ly(25, fh), lx(14, fw), ly(5, fh), 0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ─── Face oval fill ───────────────────────────────────────────────
function drawFaceOval(
  ctx: CanvasRenderingContext2D,
  lm: FaceLandmarks,
  w: number, h: number,
  av: AvatarConfig,
  cx: number, cy: number,
  fw: number, fh: number,
) {
  ctx.save();

  // Clip to face oval
  ctx.beginPath();
  faceOvalPath(ctx, lm, w, h);
  ctx.clip();

  // Skin gradient (subtle lighting: lighter in centre-top, darker at jaw)
  const skinGrad = ctx.createRadialGradient(cx - fw * 0.1, cy - fh * 0.1, 0, cx, cy, fw * 0.75);
  skinGrad.addColorStop(0,   av.skinLight);
  skinGrad.addColorStop(0.5, av.skin);
  skinGrad.addColorStop(1,   av.skinDark);
  ctx.fillStyle = skinGrad;
  ctx.beginPath();
  faceOvalPath(ctx, lm, w, h);
  ctx.fill();

  // Subtle jaw shadow
  const shadowGrad = ctx.createLinearGradient(cx, cy + fh * 0.2, cx, cy + fh * 0.6);
  shadowGrad.addColorStop(0, "rgba(0,0,0,0)");
  shadowGrad.addColorStop(1, "rgba(0,0,0,0.08)");
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  faceOvalPath(ctx, lm, w, h);
  ctx.fill();

  ctx.restore();
}

// ─── Main render function ─────────────────────────────────────────
export function drawAvatarFace(
  ctx: CanvasRenderingContext2D,
  lm: FaceLandmarks,
  w: number, h: number,
  av: AvatarConfig,
) {
  if (lm.length < 468) return;

  const expr = getExprParams(lm, w, h);
  const { cx, cy, fw, fh, roll: _roll } = expr;

  // 1. Hair behind face
  drawHair(ctx, av, cx, cy, fw, fh, false);

  // 2. Face skin fill (clipped to oval)
  drawFaceOval(ctx, lm, w, h, av, cx, cy, fw, fh);

  // 3. Beard (behind other features)
  if (av.hasBeard) drawBeard(ctx, cx, cy, fw, fh, av);

  // 4. Eyebrows
  drawEyebrow(ctx, cx, cy, fw, fh, "left",  av.browColor, expr.lBrow);
  drawEyebrow(ctx, cx, cy, fw, fh, "right", av.browColor, expr.rBrow);

  // 5. Eyes
  drawEye(ctx, cx, cy, fw, fh, "left",  av, expr.lEyeOpen);
  drawEye(ctx, cx, cy, fw, fh, "right", av, expr.rEyeOpen);

  // 6. Nose
  drawNose(ctx, cx, cy, fw, fh, av);

  // 7. Mouth
  drawMouth(ctx, cx, cy, fw, fh, av, expr.mouthOpen);

  // 8. Hair front strands
  drawHair(ctx, av, cx, cy, fw, fh, true);

  // 9. Glasses
  if (av.hasGlasses) drawGlasses(ctx, cx, cy, fw, fh);

  // 10. Subtle outline to blend into background
  ctx.save();
  ctx.beginPath();
  faceOvalPath(ctx, lm, w, h);
  ctx.strokeStyle = hexAlpha(av.skinDark, 0.2);
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

// Legacy export (for backward compatibility)
export function drawChromeMask(ctx: CanvasRenderingContext2D, lm: FaceLandmarks, w: number, h: number) {
  drawAvatarFace(ctx, lm, w, h, AVATARS[0]);
}

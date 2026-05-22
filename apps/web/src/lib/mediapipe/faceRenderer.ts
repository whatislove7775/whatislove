export type FaceLandmarks = Array<{ x: number; y: number; z: number }>;

// MediaPipe face oval contour (468-point model)
const FACE_OVAL = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
  397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136,
  172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109,
];

// Eye contours (used as holes in the mask via evenodd fill)
const LEFT_EYE = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398];
const RIGHT_EYE = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];

function tracePath(
  ctx: CanvasRenderingContext2D,
  landmarks: FaceLandmarks,
  indices: number[],
  w: number,
  h: number,
) {
  ctx.moveTo(landmarks[indices[0]].x * w, landmarks[indices[0]].y * h);
  for (let i = 1; i < indices.length; i++) {
    ctx.lineTo(landmarks[indices[i]].x * w, landmarks[indices[i]].y * h);
  }
  ctx.closePath();
}

/**
 * Draws a semi-transparent chrome mask over the detected face.
 * Uses 2D canvas only — no WebGL, no context conflict.
 * Eye areas are transparent (evenodd fill rule) so expressions show through.
 */
export function drawChromeMask(
  ctx: CanvasRenderingContext2D,
  landmarks: FaceLandmarks,
  w: number,
  h: number,
) {
  if (landmarks.length < 468) return;

  ctx.save();

  // --- Chrome fill: face oval minus eye holes ---
  const faceGrad = ctx.createLinearGradient(w * 0.2, 0, w * 0.8, h);
  faceGrad.addColorStop(0,   "rgba(170, 190, 210, 0.80)");
  faceGrad.addColorStop(0.4, "rgba(210, 228, 245, 0.88)");
  faceGrad.addColorStop(1,   "rgba(155, 175, 200, 0.80)");

  ctx.beginPath();
  tracePath(ctx, landmarks, FACE_OVAL,  w, h);
  tracePath(ctx, landmarks, LEFT_EYE,  w, h);
  tracePath(ctx, landmarks, RIGHT_EYE, w, h);
  ctx.fillStyle = faceGrad;
  ctx.fill("evenodd"); // eye sub-paths punch holes in the face oval

  // --- Specular highlight: bright streak across forehead ---
  const shine = ctx.createRadialGradient(w * 0.5, h * 0.25, 0, w * 0.5, h * 0.42, w * 0.32);
  shine.addColorStop(0,   "rgba(255,255,255,0.22)");
  shine.addColorStop(0.5, "rgba(255,255,255,0.06)");
  shine.addColorStop(1,   "rgba(255,255,255,0)");

  ctx.beginPath();
  tracePath(ctx, landmarks, FACE_OVAL, w, h);
  ctx.fillStyle = shine;
  ctx.fill();

  // --- Edge outline: thin chrome border ---
  ctx.beginPath();
  tracePath(ctx, landmarks, FACE_OVAL, w, h);
  ctx.strokeStyle = "rgba(200,220,240,0.55)";
  ctx.lineWidth   = 1.5;
  ctx.stroke();

  ctx.restore();
}

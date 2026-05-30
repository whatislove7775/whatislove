/**
 * AvatarScene3D — Three.js 3D avatar renderer.
 *
 * Renders a fully procedural, realistic-stylised human avatar:
 *   • PBR skin material with subsurface-scattering approximation
 *   • Canvas iris texture with depth/catchlight
 *   • Three-point studio lighting + rim glow
 *   • Head pose from MediaPipe 3D landmarks (yaw/pitch/roll)
 *   • Blink, gaze, brow raise/furrow, jaw open, smile — all live
 *
 * Call update(lm) each time new landmarks arrive; the RAF loop
 * reads from an internal ref at 60 fps independently.
 */

import * as THREE from "three";
import type { AvatarDNA } from "./AvatarDNA";
import { extractExpressions, type FaceLandmarks } from "@/lib/mediapipe/faceRenderer";

// ── Colour helpers ─────────────────────────────────────────────────────────

function hslColor(h: number, s: number, l: number): THREE.Color {
  return new THREE.Color().setHSL(h / 360, s / 100, l / 100);
}

function lighten(c: THREE.Color, amt: number): THREE.Color {
  const hsl = { h: 0, s: 0, l: 0 };
  c.getHSL(hsl);
  return new THREE.Color().setHSL(hsl.h, hsl.s, Math.min(1, hsl.l + amt));
}

function darken(c: THREE.Color, amt: number): THREE.Color {
  const hsl = { h: 0, s: 0, l: 0 };
  c.getHSL(hsl);
  return new THREE.Color().setHSL(hsl.h, hsl.s, Math.max(0, hsl.l - amt));
}

// ── Canvas texture builders ────────────────────────────────────────────────

function makeIrisTexture(eyeColor: THREE.Color): THREE.CanvasTexture {
  const sz = 512;
  const cv = document.createElement("canvas");
  cv.width = cv.height = sz;
  const ctx = cv.getContext("2d")!;
  const cx = sz >> 1;

  // Dark limbal ring
  ctx.fillStyle = "#0a0a0a";
  ctx.beginPath(); ctx.arc(cx, cx, cx, 0, Math.PI * 2); ctx.fill();

  // Iris base gradient
  const ec = eyeColor.clone();
  const ecDark = darken(ec.clone(), 0.18);
  const ecLight = lighten(ec.clone(), 0.15);
  const ig = ctx.createRadialGradient(cx * 0.72, cx * 0.72, 0, cx, cx, cx * 0.9);
  ig.addColorStop(0,    ecLight.getStyle());
  ig.addColorStop(0.45, ec.getStyle());
  ig.addColorStop(0.78, ecDark.getStyle());
  ig.addColorStop(0.92, "#111");
  ig.addColorStop(1,    "#000");
  ctx.fillStyle = ig;
  ctx.beginPath(); ctx.arc(cx, cx, cx * 0.9, 0, Math.PI * 2); ctx.fill();

  // Iris fibers
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    ctx.save();
    ctx.globalAlpha = 0.12 + Math.random() * 0.14;
    ctx.strokeStyle = Math.random() > 0.5 ? ecLight.getStyle() : "#ffffff";
    ctx.lineWidth = 0.6 + Math.random() * 0.8;
    const r0 = cx * (0.18 + Math.random() * 0.1);
    const r1 = cx * (0.72 + Math.random() * 0.16);
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r0, cx + Math.sin(a) * r0);
    ctx.lineTo(cx + Math.cos(a + 0.15) * r1, cx + Math.sin(a + 0.15) * r1);
    ctx.stroke();
    ctx.restore();
  }

  // Pupil
  const pg = ctx.createRadialGradient(cx, cx, 0, cx, cx, cx * 0.36);
  pg.addColorStop(0, "#000000");
  pg.addColorStop(0.75, "#050505");
  pg.addColorStop(1, "rgba(0,0,0,0.6)");
  ctx.fillStyle = pg;
  ctx.beginPath(); ctx.arc(cx, cx, cx * 0.39, 0, Math.PI * 2); ctx.fill();

  // Primary catchlight
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.beginPath(); ctx.arc(cx * 0.62, cx * 0.62, cx * 0.16, 0, Math.PI * 2); ctx.fill();
  // Secondary catchlight
  ctx.fillStyle = "rgba(255,255,255,0.42)";
  ctx.beginPath(); ctx.arc(cx * 1.3, cx * 0.72, cx * 0.08, 0, Math.PI * 2); ctx.fill();

  return new THREE.CanvasTexture(cv);
}

// ── Head geometry ──────────────────────────────────────────────────────────

function makeHeadGeo(faceWidth: number, jawWidth: number): THREE.BufferGeometry {
  const geo = new THREE.SphereGeometry(1, 72, 52);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    // Vertical elongation (head taller than wide)
    y *= 1.14;
    // Face pushed forward, back flattened
    const fZ = Math.max(0, z);
    z += fZ * fZ * 0.22;
    if (z < 0) z *= 0.84;
    // Width per DNA
    x *= faceWidth;
    // Crown narrowing
    if (y > 0.52) x *= 1 - (y - 0.52) * 0.18;
    // Jaw narrowing
    if (y < -0.38) {
      const t = (-y - 0.38) / 0.62;
      x *= 1 - t * (1 - jawWidth * 0.78);
      z *= 1 - t * 0.08;
    }
    pos.setXYZ(i, x, y, z);
  }
  geo.computeVertexNormals();
  return geo;
}

// ── Scene ──────────────────────────────────────────────────────────────────

export class AvatarScene3D {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private animId = 0;

  // Avatar groups
  private headGroup = new THREE.Group();
  private eyeGroupL = new THREE.Group();
  private eyeGroupR = new THREE.Group();
  private irisL!: THREE.Mesh;
  private irisR!: THREE.Mesh;
  private lidUpL!: THREE.Mesh;
  private lidUpR!: THREE.Mesh;
  private lidLoL!: THREE.Mesh;
  private lidLoR!: THREE.Mesh;
  private browL!: THREE.Mesh;
  private browR!: THREE.Mesh;
  private upperLip!: THREE.Mesh;
  private lowerLip!: THREE.Mesh;
  private jawGroup = new THREE.Group();
  private hairGroup = new THREE.Group();
  private neckMesh!: THREE.Mesh;
  private shoulderMesh!: THREE.Mesh;
  private bodyMesh!: THREE.Mesh;

  // Base y-positions for brow/lid animation
  private browBaseY = { L: 0, R: 0 };
  private lidUpBaseY = { L: 0, R: 0 };

  private dna: AvatarDNA;
  private latestLm: FaceLandmarks | null = null;
  private lmSource: { current: FaceLandmarks | null } | null = null;

  constructor(canvas: HTMLCanvasElement, dna: AvatarDNA) {
    this.dna = dna;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(canvas.width, canvas.height, false);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.18;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.camera = new THREE.PerspectiveCamera(36, canvas.width / canvas.height, 0.1, 30);
    this.camera.position.set(0, 0.06, 4.5);

    this.buildScene();
    this.buildAvatar();
  }

  // ── Scene ────────────────────────────────────────────────────────────────

  private buildScene() {
    // Soft dark background
    this.scene.background = new THREE.Color("#0c1122");

    // Key light — warm, front-left (main illumination + shadow)
    const key = new THREE.DirectionalLight(0xffe4c0, 2.6);
    key.position.set(-2.0, 2.8, 3.5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 12;
    key.shadow.camera.left = key.shadow.camera.bottom = -3;
    key.shadow.camera.right = key.shadow.camera.top = 3;
    key.shadow.bias = -0.002;
    this.scene.add(key);

    // Fill light — cool blue, right (prevents harsh shadows)
    const fill = new THREE.DirectionalLight(0xb0ccff, 0.72);
    fill.position.set(2.8, 0.6, 1.8);
    this.scene.add(fill);

    // Rim light — icy white, behind (creates edge glow / separation)
    const rim = new THREE.DirectionalLight(0xd8e8ff, 1.25);
    rim.position.set(0.4, 2.0, -4.0);
    this.scene.add(rim);

    // Bounce — warm from below (simulates light bouncing off surface below)
    const bounce = new THREE.DirectionalLight(0xffe0b0, 0.26);
    bounce.position.set(0, -2.5, 1.5);
    this.scene.add(bounce);

    // Ambient — very low, dark blue-ish sky
    this.scene.add(new THREE.AmbientLight(0x2a3550, 0.6));
  }

  // ── Avatar construction ───────────────────────────────────────────────────

  private buildAvatar() {
    const d = this.dna;

    const skinColor  = hslColor(d.skinH, d.skinS, d.skinL);
    const skinDark   = darken(skinColor.clone(), 0.14);
    const skinLight  = lighten(skinColor.clone(), 0.12);
    const eyeColor   = hslColor(d.eyeH, d.eyeS, d.eyeL);
    const hairColor  = hslColor(d.hairH, d.hairS, d.hairL);
    const lipColor   = hslColor(d.skinH - 4, Math.min(100, d.skinS + 22), d.skinL - 22);
    const shirtColor = hslColor(d.shirtH, d.shirtS, d.shirtL);

    // ── Skin material (PBR + SSS approx via emissive warmth) ──
    const skinMat = new THREE.MeshPhysicalMaterial({
      color:              skinColor,
      roughness:          0.67,
      metalness:          0,
      clearcoat:          0.12,
      clearcoatRoughness: 0.75,
      // Emissive SSS: sub-surface warmth (reddish/orange inner glow)
      emissive:    new THREE.Color(skinColor.r * 0.28, skinColor.g * 0.08, skinColor.b * 0.05),
    });

    const skinDarkMat = new THREE.MeshPhysicalMaterial({
      color: skinDark, roughness: 0.72, metalness: 0,
    });

    // ── Head mesh ──
    const headGeo = makeHeadGeo(d.faceWidth, d.jawWidth);
    const head = new THREE.Mesh(headGeo, skinMat.clone());
    head.castShadow = head.receiveShadow = true;
    this.headGroup.add(head);

    // ── Eyes ──
    const irisTex   = makeIrisTexture(eyeColor);
    const scleraMat = new THREE.MeshPhysicalMaterial({
      color: 0xfafaf0, roughness: 0.05, metalness: 0,
      clearcoat: 1.0, clearcoatRoughness: 0.04,
    });
    const irisMat = new THREE.MeshPhysicalMaterial({
      map: irisTex, roughness: 0.08, metalness: 0,
      clearcoat: 1.0, clearcoatRoughness: 0.02,
    });
    const eyeLidMat = new THREE.MeshPhysicalMaterial({
      color: skinColor, roughness: 0.64, metalness: 0,
      emissive: skinMat.emissive.clone(),
    });

    const es = d.eyeScale;
    const eyeR = 0.118 * es;
    const eyeGeo = new THREE.SphereGeometry(eyeR, 28, 20);
    const irisGeo = new THREE.CircleGeometry(eyeR * 0.84, 36);

    // Eye positions: slightly inset into head surface
    const eyeXL = -0.32 * d.faceWidth;
    const eyeXR =  0.32 * d.faceWidth;
    const eyeY  =  0.135;
    const eyeZ  =  0.865;

    // Left eye
    const eballL = new THREE.Mesh(eyeGeo, scleraMat.clone());
    this.irisL = new THREE.Mesh(irisGeo, irisMat.clone());
    this.irisL.position.z = eyeR * 0.98;
    eballL.add(this.irisL);
    this.eyeGroupL.add(eballL);
    this.eyeGroupL.position.set(eyeXL, eyeY, eyeZ);
    this.headGroup.add(this.eyeGroupL);

    // Right eye
    const eballR = new THREE.Mesh(eyeGeo.clone(), scleraMat.clone());
    this.irisR = new THREE.Mesh(irisGeo.clone(), irisMat.clone());
    this.irisR.position.z = eyeR * 0.98;
    eballR.add(this.irisR);
    this.eyeGroupR.add(eballR);
    this.eyeGroupR.position.set(eyeXR, eyeY, eyeZ);
    this.headGroup.add(this.eyeGroupR);

    // Eyelids (upper + lower, clamp-shaped thin box)
    const lidW = eyeR * 2.3;
    const lidH = eyeR * 0.28;
    const lidGeoBox = new THREE.BoxGeometry(lidW, lidH, eyeR * 0.55);
    const lidY = eyeY + eyeR;
    const lidLoY = eyeY - eyeR;
    const lidZ = eyeZ + eyeR * 0.55;

    this.lidUpL = new THREE.Mesh(lidGeoBox, eyeLidMat.clone());
    this.lidUpL.position.set(eyeXL, lidY, lidZ);
    this.lidUpL.scale.y = 0.08;
    this.lidUpBaseY.L = lidY;
    this.headGroup.add(this.lidUpL);

    this.lidUpR = new THREE.Mesh(lidGeoBox.clone(), eyeLidMat.clone());
    this.lidUpR.position.set(eyeXR, lidY, lidZ);
    this.lidUpR.scale.y = 0.08;
    this.lidUpBaseY.R = lidY;
    this.headGroup.add(this.lidUpR);

    this.lidLoL = new THREE.Mesh(lidGeoBox.clone(), eyeLidMat.clone());
    this.lidLoL.position.set(eyeXL, lidLoY, lidZ);
    this.lidLoL.scale.y = 0.08;
    this.headGroup.add(this.lidLoL);

    this.lidLoR = new THREE.Mesh(lidGeoBox.clone(), eyeLidMat.clone());
    this.lidLoR.position.set(eyeXR, lidLoY, lidZ);
    this.lidLoR.scale.y = 0.08;
    this.headGroup.add(this.lidLoR);

    // ── Eyebrows ──
    const browMat = new THREE.MeshStandardMaterial({
      color: hairColor, roughness: 0.9, metalness: 0,
    });
    // Capsule geometry for eyebrow (aligned horizontally)
    const browGeo = new THREE.CapsuleGeometry(0.016, 0.2, 4, 10);
    browGeo.rotateZ(Math.PI / 2);
    const browY = eyeY + eyeR * 1.68;
    const browZ = eyeZ + 0.06;

    this.browL = new THREE.Mesh(browGeo, browMat.clone());
    this.browL.position.set(eyeXL, browY, browZ);
    this.browL.rotation.z = 0.11;
    this.browBaseY.L = browY;
    this.headGroup.add(this.browL);

    this.browR = new THREE.Mesh(browGeo.clone(), browMat.clone());
    this.browR.position.set(eyeXR, browY, browZ);
    this.browR.rotation.z = -0.11;
    this.browBaseY.R = browY;
    this.headGroup.add(this.browR);

    // ── Nose ──
    const noseY  = -0.055;
    const noseGeo = new THREE.SphereGeometry(0.075, 14, 10);
    const nose = new THREE.Mesh(noseGeo, skinDarkMat.clone());
    nose.position.set(0, noseY, 1.0);
    nose.scale.set(1.0, 0.62, 0.72);
    this.headGroup.add(nose);

    // Nose bridge
    const bridgeGeo = new THREE.CapsuleGeometry(0.02, 0.24, 4, 8);
    const bridge = new THREE.Mesh(bridgeGeo, skinDarkMat.clone());
    bridge.position.set(0, noseY + 0.16, 0.975);
    this.headGroup.add(bridge);

    // Nostrils
    const nosGeo = new THREE.SphereGeometry(0.038, 10, 8);
    for (const sx of [-1, 1]) {
      const n = new THREE.Mesh(nosGeo.clone(), skinDarkMat.clone());
      n.position.set(sx * 0.09, noseY - 0.04, 0.975);
      n.scale.set(0.8, 0.72, 0.78);
      this.headGroup.add(n);
    }

    // ── Lips ──
    const lipMat = new THREE.MeshPhysicalMaterial({
      color: lipColor, roughness: 0.52, metalness: 0,
      clearcoat: 0.35, clearcoatRoughness: 0.5,
    });
    const lf = d.lipFull;
    const mouthY = -0.27;
    const mouthZ = 1.0;

    // Upper lip (Cupid's bow shape via CapsuleGeometry)
    const ulGeo = new THREE.CapsuleGeometry(0.024 * lf, 0.22, 5, 12);
    ulGeo.rotateZ(Math.PI / 2);
    this.upperLip = new THREE.Mesh(ulGeo, lipMat.clone());
    this.upperLip.position.set(0, mouthY, mouthZ);
    this.headGroup.add(this.upperLip);

    // Lower lip (slightly fuller)
    const llGeo = new THREE.CapsuleGeometry(0.03 * lf, 0.2, 5, 12);
    llGeo.rotateZ(Math.PI / 2);
    this.lowerLip = new THREE.Mesh(llGeo, lipMat.clone());
    this.lowerLip.position.set(0, mouthY - 0.06, mouthZ + 0.01);
    this.jawGroup.position.set(0, mouthY, 0);
    this.jawGroup.add(this.lowerLip);
    this.lowerLip.position.y = -0.06;
    this.lowerLip.position.z = mouthZ + 0.01;
    this.headGroup.add(this.jawGroup);

    // ── Hair ──
    this.buildHair(hairColor, d.faceWidth);

    // ── Neck ──
    const neckMat = skinMat.clone();
    const neckGeo = new THREE.CylinderGeometry(0.28, 0.34, 0.55, 22);
    this.neckMesh = new THREE.Mesh(neckGeo, neckMat);
    this.neckMesh.position.set(0, -1.52, 0);
    this.neckMesh.castShadow = true;

    // ── Shirt / shoulders ──
    const shirtMat = new THREE.MeshStandardMaterial({
      color: shirtColor, roughness: 0.88, metalness: 0.04,
    });

    const shGeo = new THREE.CapsuleGeometry(0.42, 1.68, 6, 14);
    shGeo.rotateZ(Math.PI / 2);
    this.shoulderMesh = new THREE.Mesh(shGeo, shirtMat.clone());
    this.shoulderMesh.position.set(0, -2.05, 0.0);
    this.shoulderMesh.scale.set(1, 0.48, 0.58);
    this.shoulderMesh.castShadow = true;

    const bodyGeo = new THREE.CapsuleGeometry(0.75, 0.45, 6, 18);
    this.bodyMesh = new THREE.Mesh(bodyGeo, shirtMat.clone());
    this.bodyMesh.position.set(0, -2.58, -0.1);
    this.bodyMesh.scale.set(1, 1, 0.55);
    this.bodyMesh.castShadow = true;

    // ── Assemble ──
    this.scene.add(this.headGroup);
    this.scene.add(this.neckMesh);
    this.scene.add(this.shoulderMesh);
    this.scene.add(this.bodyMesh);

    // Position head: slightly above centre so neck/shoulders visible below
    this.headGroup.position.y = -0.05;
  }

  private buildHair(hairColor: THREE.Color, fw: number) {
    const mat = new THREE.MeshStandardMaterial({
      color: hairColor, roughness: 0.86, metalness: 0.06,
    });

    switch (this.dna.hairStyle) {
      case "short": {
        // Tight cap over the upper hemisphere
        const cap = new THREE.Mesh(
          new THREE.SphereGeometry(1.042, 36, 28, 0, Math.PI * 2, 0, Math.PI * 0.51),
          mat.clone(),
        );
        cap.scale.set(fw * 1.015, 1.015, 0.995);
        this.hairGroup.add(cap);
        // Sideburns
        for (const sx of [-1, 1]) {
          const sb = new THREE.Mesh(
            new THREE.CapsuleGeometry(0.11, 0.28, 4, 8),
            mat.clone(),
          );
          sb.position.set(sx * 0.97 * fw, 0.08, 0.22);
          sb.rotation.z = sx * -0.22;
          this.hairGroup.add(sb);
        }
        break;
      }
      case "long": {
        const cap = new THREE.Mesh(
          new THREE.SphereGeometry(1.04, 36, 28, 0, Math.PI * 2, 0, Math.PI * 0.52),
          mat.clone(),
        );
        cap.scale.set(fw * 1.01, 1.01, 0.995);
        this.hairGroup.add(cap);
        // Side panels
        for (const sx of [-1, 1]) {
          const pts: THREE.Vector3[] = [
            new THREE.Vector3(0, 0.22, 0),
            new THREE.Vector3(sx * 0.05, -0.15, 0.05),
            new THREE.Vector3(sx * 0.04, -0.65, -0.1),
            new THREE.Vector3(sx * 0.02, -1.2, -0.2),
            new THREE.Vector3(0, -1.75, -0.3),
          ];
          const curve = new THREE.CatmullRomCurve3(pts);
          const tubeGeo = new THREE.TubeGeometry(curve, 14, 0.13, 8, false);
          const panel = new THREE.Mesh(tubeGeo, mat.clone());
          panel.position.set(sx * 0.94 * fw, 0.22, 0.28);
          this.hairGroup.add(panel);
        }
        break;
      }
      case "curly": {
        const cap = new THREE.Mesh(
          new THREE.SphereGeometry(1.07, 36, 28, 0, Math.PI * 2, 0, Math.PI * 0.5),
          mat.clone(),
        );
        cap.scale.set(fw * 1.02, 1.08, 1.02);
        this.hairGroup.add(cap);
        const bGeo = new THREE.SphereGeometry(0.15, 10, 8);
        for (let i = 0; i < 20; i++) {
          const a = (i / 20) * Math.PI * 2;
          const jitter = (Math.sin(i * 17.3) * 0.5 + 0.5) * 0.18;
          const b = new THREE.Mesh(bGeo.clone(), mat.clone());
          b.position.set(
            Math.cos(a) * 0.98 * fw,
            1.08 + Math.sin(i * 2.3) * 0.1 + jitter,
            Math.sin(a) * 0.72,
          );
          b.scale.setScalar(0.85 + jitter);
          this.hairGroup.add(b);
        }
        break;
      }
      case "undercut": {
        const cap = new THREE.Mesh(
          new THREE.SphereGeometry(1.032, 36, 28, 0, Math.PI * 2, 0, Math.PI * 0.47),
          mat.clone(),
        );
        cap.scale.set(fw * 1.005, 1.055, 0.985);
        cap.position.y = 0.06;
        this.hairGroup.add(cap);
        // Voluminous top swept forward
        const topGeo = new THREE.SphereGeometry(0.65, 18, 14);
        const top = new THREE.Mesh(topGeo, mat.clone());
        top.position.set(0, 1.12, 0.22);
        top.scale.set(fw * 0.92, 0.42, 0.62);
        this.hairGroup.add(top);
        break;
      }
    }

    this.headGroup.add(this.hairGroup);
  }

  // ── Animation ─────────────────────────────────────────────────────────────

  setLandmarksSource(ref: { current: FaceLandmarks | null }) {
    this.lmSource = ref;
  }

  update(lm: FaceLandmarks) {
    this.latestLm = lm;
  }

  private applyLandmarks(lm: FaceLandmarks) {
    // Use normalised coords (0-1) so extractExpressions works
    const expr = extractExpressions(lm, 1, 1);

    // ── Head rotation (smooth lerp) ──
    const tY = -expr.yaw * 0.55;
    const tX = expr.pitch * 0.38;
    const tZ = -expr.roll;
    const k = 0.16;
    this.headGroup.rotation.y += (tY - this.headGroup.rotation.y) * k;
    this.headGroup.rotation.x += (tX - this.headGroup.rotation.x) * k;
    this.headGroup.rotation.z += (tZ - this.headGroup.rotation.z) * k;
    // Neck/shoulders follow a fraction
    this.neckMesh.rotation.y = this.headGroup.rotation.y * 0.28;
    this.shoulderMesh.rotation.y = this.headGroup.rotation.y * 0.08;

    // ── Blink ──
    const es = this.dna.eyeScale;
    const blL = 1 - expr.lEyeOpen;
    const blR = 1 - expr.rEyeOpen;
    const eyeR = 0.118 * es;
    this.lidUpL.scale.y = 0.08 + blL * 16;
    this.lidUpL.position.y = this.lidUpBaseY.L - blL * eyeR * 0.9;
    this.lidUpR.scale.y = 0.08 + blR * 16;
    this.lidUpR.position.y = this.lidUpBaseY.R - blR * eyeR * 0.9;
    this.lidLoL.scale.y = 0.08 + blL * 5;
    this.lidLoR.scale.y = 0.08 + blR * 5;

    // ── Eyebrows ──
    const fw = this.dna.faceWidth;
    this.browL.position.y = this.browBaseY.L + expr.lBrowRaise * 0.09;
    this.browR.position.y = this.browBaseY.R + expr.rBrowRaise * 0.09;
    this.browL.rotation.z = 0.11 + expr.lBrowFurrow * 0.28;
    this.browR.rotation.z = -0.11 - expr.rBrowFurrow * 0.28;
    // Knit
    this.browL.position.x = -0.32 * fw + expr.browKnit * 0.045;
    this.browR.position.x =  0.32 * fw - expr.browKnit * 0.045;

    // ── Jaw / mouth open ──
    this.jawGroup.rotation.x = expr.jawOpen * 0.3;

    // ── Smile ──
    const smile = (expr.mouthSmileL + expr.mouthSmileR) * 0.5;
    this.upperLip.scale.x = 1 + smile * 0.14;
    this.lowerLip.scale.x = 1 + smile * 0.16;
    this.upperLip.position.y = -0.27 + smile * 0.025;

    // ── Gaze direction (iris landmarks 468/473, only with refineLandmarks) ──
    if (lm.length > 473) {
      const li = lm[473]; const ri = lm[468];
      // Left eye centre from contour
      const lEx = (lm[362].x + lm[263].x) * 0.5;
      const lEy = (lm[386].y + lm[374].y) * 0.5;
      const lEw = Math.abs(lm[263].x - lm[362].x);
      // Right eye centre
      const rEx = (lm[33].x + lm[133].x) * 0.5;
      const rEy = (lm[159].y + lm[145].y) * 0.5;
      const rEw = Math.abs(lm[133].x - lm[33].x);
      if (lEw > 0.001 && rEw > 0.001) {
        const gxL = (li.x - lEx) / lEw * 2;
        const gyL = (li.y - lEy) / lEw * 2;
        const gxR = (ri.x - rEx) / rEw * 2;
        const gyR = (ri.y - rEy) / rEw * 2;
        this.irisL.position.x = gxL * 0.055;
        this.irisL.position.y = -gyL * 0.04;
        this.irisR.position.x = gxR * 0.055;
        this.irisR.position.y = -gyR * 0.04;
      }
    }
  }

  // ── Render loop ───────────────────────────────────────────────────────────

  private loop = () => {
    this.animId = requestAnimationFrame(this.loop);
    // Read from external ref (if set) or internal store
    const lm = this.lmSource?.current ?? this.latestLm;
    if (lm && lm.length >= 400) this.applyLandmarks(lm);
    this.renderer.render(this.scene, this.camera);
  };

  start() { this.loop(); }

  resize(w: number, h: number) {
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  }

  dispose() {
    cancelAnimationFrame(this.animId);
    this.scene.traverse(obj => {
      if (!(obj instanceof THREE.Mesh)) return;
      obj.geometry.dispose();
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      mats.forEach((m: THREE.Material) => {
        if ((m as any).map) (m as any).map.dispose();
        m.dispose();
      });
    });
    this.renderer.dispose();
  }
}

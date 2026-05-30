/**
 * AvatarScene3D — renders either a Ready Player Me glTF avatar (CDN) or a
 * built-in Memoji-style procedural face (offline fallback), both driven in
 * real time by MediaPipe FaceLandmarker ARKit blendshapes.
 *
 * Pipeline:
 *   MediaPipe FaceLandmarker → applyResult() → targetInfluences map
 *   animate() → lerp morphTargets (RPM) OR transform-rig (Memoji) each frame
 *   renderer.domElement.captureStream(30) → WebRTC video out
 */

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { AvatarSpec } from "./rpmConfig";
import type { AvatarPreset } from "./presets";

export interface FaceResult {
  faceBlendshapes?: { categories: { score: number; categoryName: string }[] }[];
  facialTransformationMatrixes?: { data: number[] }[];
}

// ── Portrait camera — avatar is 1.0 unit tall, feet at y=0.
// Head spans roughly y=0.80..1.00. Camera at z=0.65, y=0.86, FOV=26°
// → visible height ≈ 0.30 units → good Memoji portrait framing.
const CAM_POS    = new THREE.Vector3(0, 0.86, 0.65);
const CAM_TARGET = new THREE.Vector3(0, 0.83, 0);
const CAM_FOV    = 26;

const hsl = (h: number, s: number, l: number) =>
  new THREE.Color().setHSL(h / 360, s / 100, l / 100);

// ── Memoji rig — named Object3Ds driven by blendshapes ───────────────────────
interface MemojiRig {
  eyeGroupLeft:  THREE.Object3D;
  eyeGroupRight: THREE.Object3D;
  lidLeft:       THREE.Object3D;
  lidRight:      THREE.Object3D;
  browLeft:      THREE.Object3D;
  browRight:     THREE.Object3D;
  mouthGroup:    THREE.Object3D;
  lowerLip:      THREE.Object3D;
  cornerLeft:    THREE.Object3D;
  cornerRight:   THREE.Object3D;
  headMesh:      THREE.Object3D;
  // base Y positions for reset
  browLeftBaseY:  number;
  browRightBaseY: number;
  mouthBaseY:     number;
}

export class AvatarScene3D {
  private renderer: THREE.WebGLRenderer;
  private scene:    THREE.Scene;
  private camera:   THREE.PerspectiveCamera;
  private clock    = new THREE.Clock();

  private avatarRoot:  THREE.Object3D | null = null;
  private headBone:    THREE.Object3D | null = null;
  private morphMeshes: THREE.Mesh[]          = [];
  private memojiRig:   MemojiRig | null      = null;

  private targetInfluences  = new Map<string, number>();
  private smoothedInfluences = new Map<string, number>(); // for Memoji rig
  private headQuat           = new THREE.Quaternion();
  private targetHeadQuat     = new THREE.Quaternion();

  private raf       = 0;
  private disposed  = false;
  private loadToken = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({
      canvas, antialias: true, alpha: false, preserveDrawingBuffer: true,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(canvas.width, canvas.height, false);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping      = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x12141f); // deep blue-charcoal

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    this.camera = new THREE.PerspectiveCamera(CAM_FOV, canvas.width / canvas.height, 0.01, 50);
    this.camera.position.copy(CAM_POS);
    this.camera.lookAt(CAM_TARGET);

    // Studio three-point lighting
    const key  = new THREE.DirectionalLight(0xfff4e0, 2.4);  key.position.set( 0.6, 1.4, 1.2);
    const fill = new THREE.DirectionalLight(0xb0c8ff, 1.0); fill.position.set(-1.2, 0.8, 0.8);
    const rim  = new THREE.DirectionalLight(0xe0ecff, 1.4);  rim.position.set( 0,   1.6,-1.4);
    this.scene.add(key, fill, rim, new THREE.AmbientLight(0x3a4060, 0.6));
  }

  // ── Avatar loading ──────────────────────────────────────────────────────────

  async loadAvatar(spec: AvatarSpec): Promise<void> {
    const token = ++this.loadToken;
    this.memojiRig = null;
    this.morphMeshes = [];

    let root: THREE.Object3D;
    let isMemoji = false;

    try {
      const gltf = await new GLTFLoader().loadAsync(spec.url);
      if (this.disposed || token !== this.loadToken) return;
      root = gltf.scene;
      root.traverse(o => { o.frustumCulled = false; });
      this.applyPreset(root, spec.preset);
    } catch (err) {
      console.warn("[AvatarScene3D] RPM load failed, using Memoji fallback:", err);
      if (this.disposed || token !== this.loadToken) return;
      const { mesh, rig } = this.buildMemoji(spec.preset);
      root = mesh;
      this.memojiRig = rig;
      isMemoji = true;
    }

    // Hide hands for full-body RPM avatars
    root.getObjectByName("LeftHand")?.scale.set(0, 0, 0);
    root.getObjectByName("RightHand")?.scale.set(0, 0, 0);

    // ── Normalise to 1.0 unit tall, feet at y=0 ──────────────────────────
    if (this.avatarRoot) this.scene.remove(this.avatarRoot);
    this.scene.add(root);
    // Render pass → SkinnedMesh world matrices updated
    this.renderer.render(this.scene, this.camera);

    const box  = new THREE.Box3().setFromObject(root);
    const size = new THREE.Vector3(); box.getSize(size);

    if (size.y > 0.001) {
      const s = 1.0 / size.y;
      root.scale.multiplyScalar(s);
      // Second render → flush SkinnedMesh at new scale
      this.renderer.render(this.scene, this.camera);
      const b2 = new THREE.Box3().setFromObject(root);
      root.position.set(
        root.position.x - (b2.min.x + b2.max.x) / 2,
        root.position.y - b2.min.y,
        root.position.z - (b2.min.z + b2.max.z) / 2,
      );
    }

    // Swap previous model
    if (this.avatarRoot && this.avatarRoot !== root) {
      this.scene.remove(this.avatarRoot);
      this.disposeObject(this.avatarRoot);
    }
    this.avatarRoot = root;

    if (!isMemoji) {
      // Collect RPM morph meshes + head bone
      this.headBone = root.getObjectByName("Head") ?? root.getObjectByName("head") ?? null;
      root.traverse(o => {
        const m = o as THREE.Mesh;
        if (m.isMesh && m.morphTargetDictionary && m.morphTargetInfluences) {
          this.morphMeshes.push(m);
        }
      });
    } else {
      // For Memoji the "head bone" is the sphere named "HeadMesh"
      this.headBone = root.getObjectByName("HeadMesh") ?? null;
    }

    // Recalibrate rig positions after normalisation
    if (this.memojiRig) {
      const scale = root.scale.x; // uniform scale applied during normalisation
      // Recompute world-space base positions from rig
      const browLW = new THREE.Vector3(); this.memojiRig.browLeft.getWorldPosition(browLW);
      const browRW = new THREE.Vector3(); this.memojiRig.browRight.getWorldPosition(browRW);
      const mouthW = new THREE.Vector3(); this.memojiRig.mouthGroup.getWorldPosition(mouthW);
      this.memojiRig.browLeftBaseY  = browLW.y;
      this.memojiRig.browRightBaseY = browRW.y;
      this.memojiRig.mouthBaseY     = mouthW.y;
    }

    // Reset portrait camera
    this.camera.fov    = CAM_FOV;
    this.camera.aspect = this.renderer.domElement.width / this.renderer.domElement.height;
    this.camera.position.copy(CAM_POS);
    this.camera.lookAt(CAM_TARGET);
    this.camera.updateProjectionMatrix();

    this.smoothedInfluences.clear();
  }

  // ── Material tinting (RPM glTF only) ────────────────────────────────────────

  private applyPreset(root: THREE.Object3D, p: AvatarPreset) {
    root.traverse(o => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const mats = Array.isArray(m.material) ? m.material : [m.material];
      for (const raw of mats) {
        const mat = raw as THREE.MeshStandardMaterial;
        if (!mat?.color) continue;
        const n = (mat.name || m.name || "").toLowerCase();

        if (/hair|beard|brow/.test(n)) {
          // Hair: strong recolour for a clear identity
          mat.color.lerp(hsl(p.hairH, p.hairS, p.hairL), 0.85);
          mat.needsUpdate = true;
        } else if (/outfit|shirt|jacket|top|cloth|bottom|pants|shoe|sleeve/.test(n)) {
          // Outfit: strong recolour
          mat.color.lerp(hsl(p.shirtH, p.shirtS, p.shirtL), 0.78);
          mat.needsUpdate = true;
        } else if (/iris/.test(n) || (/eye/.test(n) && !/brow|lash/.test(n))) {
          // Iris: tint toward preset eye colour
          mat.color.lerp(hsl(p.eyeH, p.eyeS, p.eyeL), 0.55);
          mat.needsUpdate = true;
        } else if ((/skin|head|body|face/.test(n)) && !/eye|teeth|tongue|hair/.test(n)) {
          // Skin: gentle tint — presets read as different people while the
          // RPM PBR skin texture/shading stays dominant and realistic.
          mat.color.lerp(hsl(p.skinH, p.skinS, p.skinL), 0.28);
          mat.needsUpdate = true;
        }
        // teeth, lashes, tongue → untouched
      }
    });
  }

  // ── Face tracking input ─────────────────────────────────────────────────────

  applyResult(result: FaceResult | null | undefined) {
    if (!result) return;

    const cats = result.faceBlendshapes?.[0]?.categories;
    if (cats) {
      for (const { score, categoryName } of cats) {
        // Mirror L↔R so the avatar mimics a reflection
        let name = categoryName;
        if      (name.includes("Left"))  name = name.replace("Left",  "Right");
        else if (name.includes("Right")) name = name.replace("Right", "Left");
        this.targetInfluences.set(name, score);
      }
    }

    const mtx = result.facialTransformationMatrixes?.[0]?.data;
    if (mtx && mtx.length >= 16) {
      const m4 = new THREE.Matrix4().fromArray(mtx);
      const q  = new THREE.Quaternion();
      m4.decompose(new THREE.Vector3(), q, new THREE.Vector3());
      q.y *= -1; q.z *= -1; // mirror
      this.targetHeadQuat.copy(q);
    }
  }

  // ── Render loop ─────────────────────────────────────────────────────────────

  private lastFrameMs = 0;
  private static readonly FRAME_INTERVAL = 1000 / 30; // cap render at 30 fps

  private animate = () => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.animate);

    // Cap to 30 fps — captureStream samples at 24, so 60 fps rendering just
    // wastes GPU and steals cycles from the video encoder (→ call latency).
    const nowMs = performance.now();
    if (nowMs - this.lastFrameMs < AvatarScene3D.FRAME_INTERVAL) return;
    this.lastFrameMs = nowMs;

    const dt = this.clock.getDelta();
    const k  = 1 - Math.exp(-dt * 18); // smooth follow

    // Head bone rotation (works for both RPM and Memoji)
    if (this.headBone) {
      this.headQuat.slerp(this.targetHeadQuat, k);
      this.headBone.quaternion.copy(this.headQuat);
    }

    if (this.memojiRig) {
      // ── Smooth influences for Memoji rig ──────────────────
      for (const [name, target] of Array.from(this.targetInfluences)) {
        const cur = this.smoothedInfluences.get(name) ?? 0;
        this.smoothedInfluences.set(name, cur + (target - cur) * k);
      }
      this.driveMemojiRig();
    } else {
      // ── Drive RPM morphTargets ─────────────────────────────
      for (const mesh of this.morphMeshes) {
        const dict = mesh.morphTargetDictionary!;
        const infl = mesh.morphTargetInfluences!;
        for (const [name, idx] of Object.entries(dict)) {
          const target = this.targetInfluences.get(name) ?? 0;
          infl[idx] += (target - infl[idx]) * k;
        }
      }
    }

    this.renderer.render(this.scene, this.camera);
  };

  private get s(){ return this.smoothedInfluences; }

  private driveMemojiRig() {
    const rig = this.memojiRig!;
    const get = (n: string) => this.s.get(n) ?? 0;
    const scale = this.avatarRoot?.scale.x ?? 1;

    // ── Eyes: blink (scale Y), wide ──────────────────────────
    const blinkL = get("eyeBlinkLeft");
    const blinkR = get("eyeBlinkRight");
    const wideL  = get("eyeWideLeft");
    const wideR  = get("eyeWideRight");
    const squintL = get("eyeSquintLeft");
    const squintR = get("eyeSquintRight");

    rig.eyeGroupLeft.scale.y  = Math.max(0.05, 1 + wideL * 0.25 - blinkL - squintL * 0.35);
    rig.eyeGroupRight.scale.y = Math.max(0.05, 1 + wideR * 0.25 - blinkR - squintR * 0.35);

    // Lid position (goes down on blink, up on wide)
    rig.lidLeft.position.y  =  0.012 * blinkL - 0.006 * wideL;
    rig.lidRight.position.y =  0.012 * blinkR - 0.006 * wideR;

    // ── Brows: down / up ──────────────────────────────────────
    const browDeltaL = (get("browOuterUpLeft") + get("browInnerUp") * 0.5) * 0.016 * scale
                     - get("browDownLeft") * 0.014 * scale;
    const browDeltaR = (get("browOuterUpRight") + get("browInnerUp") * 0.5) * 0.016 * scale
                     - get("browDownRight") * 0.014 * scale;

    rig.browLeft.position.y  = rig.browLeftBaseY  + browDeltaL;
    rig.browRight.position.y = rig.browRightBaseY + browDeltaR;

    // Brow inner-up tilts inward ends up
    rig.browLeft.rotation.z  =  0.15 + get("browInnerUp") * 0.20 - get("browDownLeft") * 0.15;
    rig.browRight.rotation.z = -0.15 - get("browInnerUp") * 0.20 + get("browDownRight") * 0.15;

    // ── Mouth / jaw ───────────────────────────────────────────
    const jawOpen   = get("jawOpen");
    const smileL    = get("mouthSmileLeft");
    const smileR    = get("mouthSmileRight");
    const frownL    = get("mouthFrownLeft");
    const frownR    = get("mouthFrownRight");
    const pucker    = get("mouthPucker");
    const funnel    = get("mouthFunnel");

    // Jaw open: move mouth group down
    rig.mouthGroup.position.y = rig.mouthBaseY - jawOpen * 0.018 * scale;

    // Lower lip drops further on jawOpen
    rig.lowerLip.position.y = -0.007 * scale - jawOpen * 0.010 * scale;
    rig.lowerLip.scale.x    = 1 + jawOpen * 0.25 + funnel * 0.3;

    // Upper lip on pucker/funnel
    const upperLip = rig.mouthGroup.getObjectByName("UpperLip");
    if (upperLip) upperLip.scale.x = 1 - pucker * 0.35 + funnel * 0.2;

    // Corners: smile moves up, frown moves down
    rig.cornerLeft.position.y  = (smileL - frownL) * 0.014 * scale;
    rig.cornerRight.position.y = (smileR - frownR) * 0.014 * scale;

    // Corner horizontal pull on smile
    rig.cornerLeft.position.x  = -0.028 * scale - smileL * 0.008 * scale;
    rig.cornerRight.position.x =  0.028 * scale + smileR * 0.008 * scale;

    // ── Cheek puff: scale head mesh slightly ─────────────────
    const puff = get("cheekPuff");
    if (rig.headMesh) {
      rig.headMesh.scale.x = 0.94 + puff * 0.08;
      rig.headMesh.scale.z = 0.90 + puff * 0.08;
    }
  }

  start() {
    if (!this.raf) { this.clock.start(); this.animate(); }
  }

  captureStream(fps = 30): MediaStream {
    return (this.renderer.domElement as HTMLCanvasElement).captureStream(fps);
  }

  get domElement(): HTMLCanvasElement {
    return this.renderer.domElement as HTMLCanvasElement;
  }

  resize(w: number, h: number) {
    if (w <= 0 || h <= 0) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.position.copy(CAM_POS);
    this.camera.lookAt(CAM_TARGET);
    this.camera.updateProjectionMatrix();
  }

  // ── Memoji procedural face ──────────────────────────────────────────────────
  // Apple Memoji proportions: large expressive eyes (~38% face width each),
  // small delicate nose, defined lips, thick arched brows.
  // Built to 1.0 unit total height so normalisation leaves it unchanged.
  // Head centre at y≈0.87 — matches the portrait camera target (y=0.83).

  private buildMemoji(p: AvatarPreset): { mesh: THREE.Group; rig: MemojiRig } {
    const g = new THREE.Group();
    g.name = "MemojiRoot";

    // ── Materials ────────────────────────────────────────────
    const skinMat = new THREE.MeshStandardMaterial({
      color: hsl(p.skinH, p.skinS, p.skinL),
      roughness: 0.42, metalness: 0,
    });
    const hairMat = new THREE.MeshStandardMaterial({
      color: hsl(p.hairH, p.hairS, p.hairL),
      roughness: 0.78,
    });
    const shirtMat = new THREE.MeshStandardMaterial({
      color: hsl(p.shirtH, p.shirtS, p.shirtL),
      roughness: 0.72,
    });
    const scleraMat = new THREE.MeshStandardMaterial({
      color: 0xf8faff, roughness: 0.05, metalness: 0,
    });
    const irisMat = new THREE.MeshStandardMaterial({
      color: hsl(p.eyeH, p.eyeS, Math.min(p.eyeL + 10, 65)),
      roughness: 0.04, metalness: 0.08,
    });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x060606 });
    const lipMat = new THREE.MeshStandardMaterial({
      color: hsl(p.skinH, Math.min(p.skinS * 0.6, 40), p.skinL * 0.68),
      roughness: 0.32,
    });
    const lidMat = new THREE.MeshStandardMaterial({
      color: hsl(p.skinH, p.skinS * 0.85, p.skinL * 0.86),
      roughness: 0.45,
    });
    const invisMat = new THREE.MeshBasicMaterial({ visible: false });

    // ── Invisible anchor keeps bounding box at y=0..1 ────────
    const anchor = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.64, 3), invisMat);
    anchor.position.set(0, 0.32, 0);
    g.add(anchor);

    // ── Shirt / body ─────────────────────────────────────────
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.185, 0.22, 0.115, 40), shirtMat);
    torso.position.set(0, 0.607, 0);
    g.add(torso);

    const shoulders = new THREE.Mesh(new THREE.CylinderGeometry(0.265, 0.235, 0.068, 48), shirtMat);
    shoulders.position.set(0, 0.661, 0);
    g.add(shoulders);

    // Collar / shirt neckline
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.018, 12, 40), shirtMat);
    collar.rotation.x = Math.PI / 2;
    collar.position.set(0, 0.695, 0);
    g.add(collar);

    // ── Neck ─────────────────────────────────────────────────
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.062, 0.125, 28), skinMat);
    neck.position.set(0, 0.733, 0);
    g.add(neck);

    // ── Head ─────────────────────────────────────────────────
    // Apple Memoji heads are wide and round, slightly flatter in depth.
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.118, 96, 72), skinMat);
    head.name = "HeadMesh";
    head.scale.set(0.975, 0.985, 0.900);
    head.position.set(0, 0.872, 0);
    g.add(head);

    // Slight jaw/chin definition — a slightly flattened sub-sphere at the bottom
    const chin = new THREE.Mesh(new THREE.SphereGeometry(0.072, 40, 28, 0, Math.PI * 2, Math.PI * 0.55, Math.PI * 0.50), skinMat);
    chin.scale.set(0.88, 1.0, 0.82);
    chin.position.set(0, 0.772, 0.018);
    g.add(chin);

    // ── Ears ─────────────────────────────────────────────────
    for (const sx of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.036, 28, 20), skinMat);
      ear.scale.set(0.44, 0.66, 0.48);
      ear.position.set(sx * 0.114, 0.872, 0.008);
      g.add(ear);
    }

    // ── Hair ─────────────────────────────────────────────────
    // Top cap
    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(0.124, 72, 40, 0, Math.PI * 2, 0, Math.PI * 0.535),
      hairMat,
    );
    cap.scale.set(0.985, 1.085, 0.94);
    cap.position.set(0, 0.870, -0.010);
    g.add(cap);

    // Side volumes — give the impression of styled hair
    for (const sx of [-1, 1]) {
      const side = new THREE.Mesh(new THREE.SphereGeometry(0.062, 32, 24), hairMat);
      side.scale.set(0.58, 0.82, 0.52);
      side.position.set(sx * 0.118, 0.920, -0.024);
      g.add(side);
    }

    // ── Eyes (large — Apple Memoji style) ────────────────────
    // Each eye is ≈38% of half-face-width. Eyes are flat ovals, not spheres.
    const eyeGroupLeft  = this.makeEye(+1, p, scleraMat, irisMat, pupilMat, lidMat, g);
    const eyeGroupRight = this.makeEye(-1, p, scleraMat, irisMat, pupilMat, lidMat, g);

    // lid refs (inside each eye group, named "Lid")
    const lidLeft  = eyeGroupLeft.getObjectByName("Lid")  as THREE.Object3D;
    const lidRight = eyeGroupRight.getObjectByName("Lid") as THREE.Object3D;

    // ── Eyebrows ─────────────────────────────────────────────
    const browY = 0.928;
    const browLeft  = this.makeBrow( 1, hairMat, browY, g);
    const browRight = this.makeBrow(-1, hairMat, browY, g);
    browLeft.name  = "BrowLeft";
    browRight.name = "BrowRight";

    // ── Nose — subtle, Apple-style (just nostrils + tiny tip) ──
    // Nose tip
    const noseTip = new THREE.Mesh(new THREE.SphereGeometry(0.012, 20, 14), skinMat);
    noseTip.scale.set(1.15, 0.68, 1.3);
    noseTip.position.set(0, 0.858, 0.114);
    g.add(noseTip);
    // Nostrils
    for (const nx of [-1, 1]) {
      const ns = new THREE.Mesh(new THREE.SphereGeometry(0.010, 16, 12), skinMat);
      ns.scale.set(0.85, 0.52, 1.05);
      ns.position.set(nx * 0.015, 0.852, 0.115);
      g.add(ns);
    }

    // ── Mouth ────────────────────────────────────────────────
    const mouthGroup = new THREE.Group();
    mouthGroup.name = "MouthGroup";
    mouthGroup.position.set(0, 0.843, 0.105);
    g.add(mouthGroup);

    const upperLip = new THREE.Mesh(new THREE.SphereGeometry(0.025, 40, 22), lipMat);
    upperLip.name = "UpperLip";
    upperLip.scale.set(1.88, 0.52, 0.88);
    upperLip.position.set(0, 0.007, 0);
    mouthGroup.add(upperLip);

    // Cupid's bow dip (centre of upper lip slightly recessed)
    const cupid = new THREE.Mesh(new THREE.SphereGeometry(0.010, 16, 12), lipMat);
    cupid.scale.set(0.6, 0.45, 0.7);
    cupid.position.set(0, 0.014, -0.002);
    mouthGroup.add(cupid);

    const lowerLip = new THREE.Mesh(new THREE.SphereGeometry(0.028, 40, 22), lipMat);
    lowerLip.name = "LowerLip";
    lowerLip.scale.set(1.78, 0.58, 0.92);
    lowerLip.position.set(0, -0.007, 0);
    mouthGroup.add(lowerLip);

    const cornerLeft = new THREE.Mesh(new THREE.SphereGeometry(0.013, 18, 14), lipMat);
    cornerLeft.name = "CornerLeft";
    cornerLeft.scale.set(0.68, 0.60, 0.68);
    cornerLeft.position.set(-0.034, 0, 0);
    mouthGroup.add(cornerLeft);

    const cornerRight = new THREE.Mesh(new THREE.SphereGeometry(0.013, 18, 14), lipMat);
    cornerRight.name = "CornerRight";
    cornerRight.scale.set(0.68, 0.60, 0.68);
    cornerRight.position.set( 0.034, 0, 0);
    mouthGroup.add(cornerRight);

    const rig: MemojiRig = {
      eyeGroupLeft, eyeGroupRight,
      lidLeft, lidRight,
      browLeft, browRight,
      mouthGroup, lowerLip, cornerLeft, cornerRight,
      headMesh: head,
      browLeftBaseY:  browLeft.position.y,
      browRightBaseY: browRight.position.y,
      mouthBaseY:     mouthGroup.position.y,
    };

    return { mesh: g, rig };
  }

  private makeEye(
    sx: number, // +1 = avatar-left, -1 = avatar-right
    p: AvatarPreset,
    scleraMat: THREE.Material, irisMat: THREE.Material,
    pupilMat: THREE.Material, lidMat: THREE.Material,
    parent: THREE.Group,
  ): THREE.Group {
    const label = sx > 0 ? "Left" : "Right";
    const grp = new THREE.Group();
    grp.name = `EyeGroup${label}`;
    // Camera-left = avatar-right: negate sx so it mirrors correctly
    grp.position.set(-sx * 0.054, 0.897, 0.099);
    parent.add(grp);

    // ── Sclera: wide flat oval (Apple Memoji style) ───────────
    const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.040, 48, 36), scleraMat);
    sclera.scale.set(1.0, 1.08, 0.52);   // wide × tall × flat
    grp.add(sclera);

    // ── Iris ─────────────────────────────────────────────────
    const iris = new THREE.Mesh(new THREE.CircleGeometry(0.026, 48), irisMat);
    iris.position.z = 0.021;
    grp.add(iris);

    // Iris rim (slightly darker edge)
    const irisRimMat = new THREE.MeshBasicMaterial({
      color: hsl(p.eyeH, Math.max(p.eyeS - 10, 10), Math.max(p.eyeL - 18, 8)),
    });
    const irisRim = new THREE.Mesh(new THREE.RingGeometry(0.023, 0.026, 48), irisRimMat);
    irisRim.position.z = 0.0215;
    grp.add(irisRim);

    // ── Pupil ─────────────────────────────────────────────────
    const pupil = new THREE.Mesh(new THREE.CircleGeometry(0.014, 40), pupilMat);
    pupil.position.z = 0.0220;
    grp.add(pupil);

    // ── Catchlight (two specular dots for realism) ────────────
    const hlMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const hl1 = new THREE.Mesh(new THREE.CircleGeometry(0.0055, 16), hlMat);
    hl1.position.set(0.009, 0.010, 0.0225);
    grp.add(hl1);
    const hl2 = new THREE.Mesh(new THREE.CircleGeometry(0.0028, 12), hlMat);
    hl2.position.set(-0.011, -0.007, 0.0225);
    grp.add(hl2);

    // ── Upper eyelid cap (covers top of sclera, skin-coloured) ─
    const lidGeo = new THREE.SphereGeometry(0.042, 48, 20, 0, Math.PI * 2, 0, Math.PI * 0.48);
    const lid = new THREE.Mesh(lidGeo, lidMat);
    lid.name = "Lid";
    lid.rotation.x = Math.PI;          // flip so hemisphere faces downward
    lid.scale.set(0.97, 0.78, 0.56);
    lid.position.set(0, 0.002, 0.008);
    grp.add(lid);

    // ── Lower lid hint ────────────────────────────────────────
    const lLidGeo = new THREE.SphereGeometry(0.042, 48, 10, 0, Math.PI * 2, Math.PI * 0.52, Math.PI * 0.12);
    const lLid = new THREE.Mesh(lLidGeo, lidMat);
    lLid.scale.set(0.97, 0.55, 0.52);
    lLid.position.set(0, 0, 0.007);
    grp.add(lLid);

    return grp;
  }

  private makeBrow(sx: number, mat: THREE.Material, worldY: number, parent: THREE.Group): THREE.Group {
    const grp = new THREE.Group();
    // Camera-left = avatar-right
    grp.position.set(-sx * 0.054, worldY, 0.093);
    grp.rotation.z = sx * 0.16;   // natural arch tilt
    parent.add(grp);

    // Four blobs: inner, inner-mid, outer-mid, outer
    const segs: [number, number, number][] = [
      [-0.026,  0.000, 0.86],
      [-0.010,  0.005, 1.00],
      [ 0.007,  0.005, 1.00],
      [ 0.022, -0.002, 0.80],
    ];
    for (const [bx, by, sy] of segs) {
      const blob = new THREE.Mesh(new THREE.SphereGeometry(0.012, 20, 14), mat);
      blob.scale.set(1.0, sy * 0.70, 0.62);
      blob.position.set(bx, by, 0);
      grp.add(blob);
    }

    return grp;
  }

  // ── Cleanup helpers ─────────────────────────────────────────────────────────

  private disposeObject(obj: THREE.Object3D) {
    obj.traverse(o => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        m.geometry?.dispose();
        const mats = Array.isArray(m.material) ? m.material : [m.material];
        mats.forEach(mat => mat?.dispose());
      }
    });
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    if (this.avatarRoot) this.disposeObject(this.avatarRoot);
    this.scene.environment?.dispose();
    this.renderer.dispose();
  }
}

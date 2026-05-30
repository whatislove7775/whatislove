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
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { AvatarSpec } from "./rpmConfig";
import type { AvatarPreset } from "./presets";

export interface FaceResult {
  faceBlendshapes?: { categories: { score: number; categoryName: string }[] }[];
  facialTransformationMatrixes?: { data: number[] }[];
}

// ── Portrait camera ──────────────────────────────────────────────────────────
// Avatar is 1.0 unit tall, feet at y=0. Head spans ~y=0.75..1.0.
// Camera at z=0.62, y=0.87, FOV=24° → face fills ~80% of frame height.
const CAM_POS    = new THREE.Vector3(0, 0.87, 0.62);
const CAM_TARGET = new THREE.Vector3(0, 0.84, 0);
const CAM_FOV    = 24;

const hsl = (h: number, s: number, l: number) =>
  new THREE.Color().setHSL(h / 360, s / 100, l / 100);

// ── Memoji rig ───────────────────────────────────────────────────────────────
// All face features are parented to `headGroup` so head-tracking quaternion
// moves eyes / brows / mouth together — exactly like Apple Memoji / FaceTime.
interface MemojiRig {
  headGroup:     THREE.Object3D; // whole face rotates with head tracking
  eyeGroupLeft:  THREE.Object3D;
  eyeGroupRight: THREE.Object3D;
  lidLeft:       THREE.Object3D;
  lidRight:      THREE.Object3D;
  browLeft:      THREE.Object3D;
  browRight:     THREE.Object3D;
  mouthGroup:    THREE.Object3D;
  jawGroup:      THREE.Object3D; // lower jaw — moves down on jawOpen
  lowerLip:      THREE.Object3D;
  cornerLeft:    THREE.Object3D;
  cornerRight:   THREE.Object3D;
  headMesh:      THREE.Mesh;
  browLeftBaseY:  number;        // local-space base Y (headGroup coords)
  browRightBaseY: number;
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

  private targetInfluences   = new Map<string, number>();
  private smoothedInfluences = new Map<string, number>();
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
    this.renderer.toneMappingExposure = 1.15;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x12141f);

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    this.camera = new THREE.PerspectiveCamera(CAM_FOV, canvas.width / canvas.height, 0.01, 50);
    this.camera.position.copy(CAM_POS);
    this.camera.lookAt(CAM_TARGET);

    // Studio three-point lighting
    const key  = new THREE.DirectionalLight(0xfff4e0, 2.6);  key.position.set( 0.6, 1.4, 1.2);
    const fill = new THREE.DirectionalLight(0xb0c8ff, 1.1); fill.position.set(-1.2, 0.8, 0.8);
    const rim  = new THREE.DirectionalLight(0xe0ecff, 1.5);  rim.position.set( 0,   1.6,-1.4);
    this.scene.add(key, fill, rim, new THREE.AmbientLight(0x3a4060, 0.7));
  }

  // ── Avatar loading ──────────────────────────────────────────────────────────

  async loadAvatar(spec: AvatarSpec): Promise<void> {
    const token = ++this.loadToken;
    this.memojiRig  = null;
    this.morphMeshes = [];

    // facecap.glb uses Draco mesh compression — GLTFLoader throws without DRACOLoader.
    // Decoder WASM is loaded from Google's CDN (reliable, proper CORS headers,
    // works under COEP:credentialless).
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/");

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    // Try each URL in order; first success wins.
    let gltfScene: THREE.Object3D | null = null;
    const urls: string[] = (spec as any).urls ?? [(spec as any).url];
    for (const url of urls) {
      try {
        console.info("[AvatarScene3D] loading from", url);
        const gltf = await loader.loadAsync(url);
        if (this.disposed || token !== this.loadToken) { dracoLoader.dispose(); return; }
        gltfScene = gltf.scene;
        gltfScene.traverse(o => { o.frustumCulled = false; });
        console.info("[AvatarScene3D] loaded OK:", url);
        break;
      } catch (err) {
        console.warn("[AvatarScene3D] failed:", url, (err as Error).message ?? err);
      }
    }
    dracoLoader.dispose();
    if (this.disposed || token !== this.loadToken) return;

    if (gltfScene) {
      this.loadGltfHead(gltfScene, spec.preset);
    } else {
      console.warn("[AvatarScene3D] all URLs failed — using procedural fallback");
      this.loadProceduralMemoji(spec.preset);
    }

    this.smoothedInfluences.clear();
  }

  // ── Rigged glTF head (primary path — facecap.glb / RPM) ─────────────────────
  // The model is wrapped in a pivot centred on the head so head-tracking
  // rotation pivots correctly, and the camera is framed dynamically on the
  // head's bounding box (works for head-only or full-body meshes alike).

  private loadGltfHead(gltfScene: THREE.Object3D, preset: AvatarPreset) {
    gltfScene.getObjectByName("LeftHand")?.scale.set(0, 0, 0);
    gltfScene.getObjectByName("RightHand")?.scale.set(0, 0, 0);

    // Tint skin/hair/eyes per preset where the material names allow it
    this.applyPreset(gltfScene, preset);

    // Pivot so head rotation pivots around the head centre
    const pivot = new THREE.Group();
    pivot.name = "HeadPivot";
    pivot.add(gltfScene);

    // Measure, recentre on origin, scale head to ~0.5 units tall
    this.scene.add(pivot);
    this.renderer.render(this.scene, this.camera);
    const box  = new THREE.Box3().setFromObject(gltfScene);
    const size = new THREE.Vector3(); box.getSize(size);
    const ctr  = new THREE.Vector3(); box.getCenter(ctr);
    gltfScene.position.sub(ctr);                       // head centre → pivot origin
    if (size.y > 0.001) pivot.scale.setScalar(0.5 / size.y);

    this.swapRoot(pivot);

    // The head pivot rotates for head tracking
    this.headBone = pivot;

    // Collect morph-target meshes (the head)
    gltfScene.traverse(o => {
      const m = o as THREE.Mesh;
      if (m.isMesh && m.morphTargetDictionary && m.morphTargetInfluences) {
        this.morphMeshes.push(m);
      }
    });

    this.frameCameraOnHead();
  }

  // ── Procedural Memoji (fallback only — when no glb loads) ───────────────────

  private loadProceduralMemoji(preset: AvatarPreset) {
    const { mesh, rig } = this.buildMemoji(preset);
    const root = mesh;

    // Normalise to 1.0 unit tall, feet at y=0
    this.scene.add(root);
    this.renderer.render(this.scene, this.camera);
    const box  = new THREE.Box3().setFromObject(root);
    const size = new THREE.Vector3(); box.getSize(size);
    if (size.y > 0.001) {
      root.scale.multiplyScalar(1.0 / size.y);
      this.renderer.render(this.scene, this.camera);
      const b2 = new THREE.Box3().setFromObject(root);
      root.position.set(
        root.position.x - (b2.min.x + b2.max.x) / 2,
        root.position.y - b2.min.y,
        root.position.z - (b2.min.z + b2.max.z) / 2,
      );
    }

    this.swapRoot(root);
    this.memojiRig = rig;
    this.headBone  = root.getObjectByName("HeadGroup") ?? null;

    // Fixed portrait camera for the procedural body
    this.camera.fov    = CAM_FOV;
    this.camera.aspect = this.renderer.domElement.width / this.renderer.domElement.height;
    this.camera.position.copy(CAM_POS);
    this.camera.lookAt(CAM_TARGET);
    this.camera.updateProjectionMatrix();
  }

  /** Frame the camera tightly on the current avatar's bounding box (head). */
  private frameCameraOnHead() {
    if (!this.avatarRoot) return;
    this.renderer.render(this.scene, this.camera);
    const box = new THREE.Box3().setFromObject(this.avatarRoot);
    const size = new THREE.Vector3(); box.getSize(size);
    const ctr  = new THREE.Vector3(); box.getCenter(ctr);

    this.camera.fov    = CAM_FOV;
    this.camera.aspect = this.renderer.domElement.width / this.renderer.domElement.height;
    // distance to fit the head height in the vertical FOV, with a little margin
    const halfH = Math.max(size.y, size.x / this.camera.aspect) / 2;
    const dist  = (halfH / Math.tan((CAM_FOV * Math.PI / 180) / 2)) * 1.15;
    this.camera.position.set(ctr.x, ctr.y + size.y * 0.04, ctr.z + dist);
    this.camera.lookAt(ctr.x, ctr.y, ctr.z);
    this.camera.updateProjectionMatrix();
  }

  /** Remove the previous avatar and install the new root. */
  private swapRoot(root: THREE.Object3D) {
    if (this.avatarRoot && this.avatarRoot !== root) {
      this.scene.remove(this.avatarRoot);
      this.disposeObject(this.avatarRoot);
    }
    if (!root.parent) this.scene.add(root);
    this.avatarRoot = root;
  }

  // ── Material tinting (RPM glTF) ─────────────────────────────────────────────

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
          mat.color.lerp(hsl(p.hairH, p.hairS, p.hairL), 0.85); mat.needsUpdate = true;
        } else if (/outfit|shirt|jacket|top|cloth|bottom|pants|shoe|sleeve/.test(n)) {
          mat.color.lerp(hsl(p.shirtH, p.shirtS, p.shirtL), 0.78); mat.needsUpdate = true;
        } else if (/iris/.test(n) || (/eye/.test(n) && !/brow|lash/.test(n))) {
          mat.color.lerp(hsl(p.eyeH, p.eyeS, p.eyeL), 0.55); mat.needsUpdate = true;
        } else if (/skin|head|body|face/.test(n) && !/eye|teeth|tongue|hair/.test(n)) {
          mat.color.lerp(hsl(p.skinH, p.skinS, p.skinL), 0.28); mat.needsUpdate = true;
        }
      }
    });
  }

  // ── Face tracking input ─────────────────────────────────────────────────────

  applyResult(result: FaceResult | null | undefined) {
    if (!result) return;

    const cats = result.faceBlendshapes?.[0]?.categories;
    if (cats) {
      for (const { score, categoryName } of cats) {
        // Mirror L↔R: camera is a reflection, avatar must mimic it
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
  private static readonly FRAME_INTERVAL = 1000 / 30;

  private animate = () => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.animate);

    const nowMs = performance.now();
    if (nowMs - this.lastFrameMs < AvatarScene3D.FRAME_INTERVAL) return;
    this.lastFrameMs = nowMs;

    const dt = this.clock.getDelta();
    const k  = 1 - Math.exp(-dt * 18);

    // Head tracking — rotates the whole HeadGroup (Memoji) or Head bone (RPM)
    if (this.headBone) {
      this.headQuat.slerp(this.targetHeadQuat, k);
      this.headBone.quaternion.copy(this.headQuat);
    }

    if (this.memojiRig) {
      for (const [name, target] of Array.from(this.targetInfluences)) {
        const cur = this.smoothedInfluences.get(name) ?? 0;
        this.smoothedInfluences.set(name, cur + (target - cur) * k);
      }
      this.driveMemojiRig();
    } else {
      for (const mesh of this.morphMeshes) {
        const dict = mesh.morphTargetDictionary!;
        const infl = mesh.morphTargetInfluences!;
        for (const [name, idx] of Object.entries(dict)) {
          // Model may use facecap's `_L`/`_R` naming; MediaPipe emits
          // `Left`/`Right`. Convert the dict key to the MediaPipe key.
          const mpName = name.replace(/_L$/, "Left").replace(/_R$/, "Right");
          const target = this.targetInfluences.get(mpName)
                      ?? this.targetInfluences.get(name) ?? 0;
          infl[idx] += (target - infl[idx]) * k;
        }
      }
    }

    this.renderer.render(this.scene, this.camera);
  };

  private get s() { return this.smoothedInfluences; }

  private driveMemojiRig() {
    const rig = this.memojiRig!;
    const get = (n: string) => this.s.get(n) ?? 0;

    // ── Eyes: blink / wide / squint ────────────────────────────────────────
    const blinkL  = get("eyeBlinkLeft");
    const blinkR  = get("eyeBlinkRight");
    const wideL   = get("eyeWideLeft");
    const wideR   = get("eyeWideRight");
    const squintL = get("eyeSquintLeft");
    const squintR = get("eyeSquintRight");

    // scaleY: 1.0 = open, 0 = closed. blinkL drives the close, wideL pushes open.
    rig.eyeGroupLeft.scale.y  = Math.max(0.04, 1 + wideL * 0.30 - blinkL * 1.08 - squintL * 0.38);
    rig.eyeGroupRight.scale.y = Math.max(0.04, 1 + wideR * 0.30 - blinkR * 1.08 - squintR * 0.38);

    // Lid slides down over iris on blink, retracts on wide
    rig.lidLeft.position.y  = 0.015 * blinkL - 0.007 * wideL;
    rig.lidRight.position.y = 0.015 * blinkR - 0.007 * wideR;

    // ── Eyebrows ────────────────────────────────────────────────────────────
    // All positions in headGroup-local coords
    const bdL = (get("browOuterUpLeft")  + get("browInnerUp") * 0.5) * 0.018 - get("browDownLeft")  * 0.016;
    const bdR = (get("browOuterUpRight") + get("browInnerUp") * 0.5) * 0.018 - get("browDownRight") * 0.016;

    rig.browLeft.position.y  = rig.browLeftBaseY  + bdL;
    rig.browRight.position.y = rig.browRightBaseY + bdR;

    // Inner-up tilts the inner brow end upward (worried look)
    rig.browLeft.rotation.z  =  0.15 + get("browInnerUp") * 0.22 - get("browDownLeft")  * 0.16;
    rig.browRight.rotation.z = -0.15 - get("browInnerUp") * 0.22 + get("browDownRight") * 0.16;

    // ── Jaw / mouth ─────────────────────────────────────────────────────────
    const jawOpen = get("jawOpen");
    const smileL  = get("mouthSmileLeft");
    const smileR  = get("mouthSmileRight");
    const frownL  = get("mouthFrownLeft");
    const frownR  = get("mouthFrownRight");
    const pucker  = get("mouthPucker");
    const funnel  = get("mouthFunnel");

    // JawGroup drops down — lower lip + lower teeth follow
    rig.jawGroup.position.y = -jawOpen * 0.022;

    // Lower lip shifts further on open, widens on funnel
    rig.lowerLip.position.y = -0.007 - jawOpen * 0.008;
    rig.lowerLip.scale.x    = 1 + jawOpen * 0.25 + funnel * 0.30;

    // Upper lip: pucker narrows, funnel widens
    const upperLip = rig.mouthGroup.getObjectByName("UpperLip");
    if (upperLip) upperLip.scale.x = 1 - pucker * 0.35 + funnel * 0.20;

    // Corners: smile up, frown down, smile pulls outward
    rig.cornerLeft.position.y  = (smileL - frownL) * 0.016;
    rig.cornerRight.position.y = (smileR - frownR) * 0.016;
    rig.cornerLeft.position.x  = -0.034 - smileL * 0.009;
    rig.cornerRight.position.x =  0.034 + smileR * 0.009;

    // ── Cheek puff ──────────────────────────────────────────────────────────
    const puff = get("cheekPuff");
    rig.headMesh.scale.x = 0.975 + puff * 0.08;
    rig.headMesh.scale.z = 0.900 + puff * 0.08;
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
    if (this.memojiRig) {
      // Fixed portrait camera for the procedural body
      this.camera.position.copy(CAM_POS);
      this.camera.lookAt(CAM_TARGET);
      this.camera.updateProjectionMatrix();
    } else {
      // Re-frame the rigged head for the new aspect
      this.frameCameraOnHead();
    }
  }

  // ── Procedural Memoji face ──────────────────────────────────────────────────
  //
  // Design principles (Apple Memoji reference):
  //  • HeadGroup origin = head centre (root y=0.872). All features are parented
  //    here so head-tracking quaternion animates the whole face as one unit.
  //  • Large expressive eyes (~40% face width), flat-oval sclera, iris dome,
  //    dual catchlights, arched eyelashes.
  //  • Arched 4-segment brows with inner-up tilt.
  //  • Mouth has cavity + teeth (upper fixed, lower in JawGroup that drops).
  //  • Built to ~1.0 unit total height so the normalisation pass is a no-op.

  private buildMemoji(p: AvatarPreset): { mesh: THREE.Group; rig: MemojiRig } {
    const g = new THREE.Group();
    g.name = "MemojiRoot";

    // ── Materials ────────────────────────────────────────────────────────────
    const skinMat  = new THREE.MeshStandardMaterial({ color: hsl(p.skinH,  p.skinS,  p.skinL),  roughness: 0.36, metalness: 0 });
    const hairMat  = new THREE.MeshStandardMaterial({ color: hsl(p.hairH,  p.hairS,  p.hairL),  roughness: 0.78 });
    const shirtMat = new THREE.MeshStandardMaterial({ color: hsl(p.shirtH, p.shirtS, p.shirtL), roughness: 0.72 });
    const scleraMat = new THREE.MeshStandardMaterial({ color: 0xf8faff, roughness: 0.04, metalness: 0 });
    const irisMat  = new THREE.MeshStandardMaterial({ color: hsl(p.eyeH, p.eyeS, Math.min(p.eyeL + 10, 65)), roughness: 0.04, metalness: 0.10 });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x060606 });
    const lipMat   = new THREE.MeshStandardMaterial({ color: hsl(p.skinH, Math.min(p.skinS * 0.6, 40), p.skinL * 0.66), roughness: 0.26 });
    const lidMat   = new THREE.MeshStandardMaterial({ color: hsl(p.skinH, p.skinS * 0.85, p.skinL * 0.86), roughness: 0.45 });
    const lashMat  = new THREE.MeshBasicMaterial({ color: 0x0a0a0a });
    const teethMat = new THREE.MeshStandardMaterial({ color: 0xf2ede5, roughness: 0.26 });
    const cavityMat = new THREE.MeshBasicMaterial({ color: 0x160406 });
    const invisMat  = new THREE.MeshBasicMaterial({ visible: false });

    // ── Invisible anchor — keeps total bounding box y ∈ [0, 1] ──────────────
    const anchor = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.64, 3), invisMat);
    anchor.position.set(0, 0.32, 0);
    g.add(anchor);

    // ── Shirt ────────────────────────────────────────────────────────────────
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.185, 0.22, 0.115, 40), shirtMat);
    torso.position.set(0, 0.607, 0);
    g.add(torso);
    const shoulders = new THREE.Mesh(new THREE.CylinderGeometry(0.265, 0.235, 0.068, 48), shirtMat);
    shoulders.position.set(0, 0.661, 0);
    g.add(shoulders);
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.018, 12, 40), shirtMat);
    collar.rotation.x = Math.PI / 2;
    collar.position.set(0, 0.695, 0);
    g.add(collar);

    // ── Neck ─────────────────────────────────────────────────────────────────
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.062, 0.125, 28), skinMat);
    neck.position.set(0, 0.733, 0);
    g.add(neck);

    // ── HeadGroup — all face features live here ──────────────────────────────
    // Origin = head centre at root y=0.872.
    // Head tracking quaternion is applied to this group each frame.
    const headGroup = new THREE.Group();
    headGroup.name = "HeadGroup";
    headGroup.position.set(0, 0.872, 0);
    g.add(headGroup);

    // Head sphere (headGroup-local coords; origin = head centre)
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.120, 96, 72), skinMat);
    head.name = "HeadMesh";
    head.scale.set(0.975, 0.985, 0.900);
    headGroup.add(head);

    // Chin / jaw definition
    const chin = new THREE.Mesh(
      new THREE.SphereGeometry(0.072, 40, 28, 0, Math.PI * 2, Math.PI * 0.55, Math.PI * 0.50),
      skinMat,
    );
    chin.scale.set(0.88, 1.0, 0.82);
    chin.position.set(0, -0.100, 0.018);
    headGroup.add(chin);

    // Ears
    for (const sx of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.036, 28, 20), skinMat);
      ear.scale.set(0.44, 0.66, 0.48);
      ear.position.set(sx * 0.116, 0, 0.008);
      headGroup.add(ear);
    }

    // Hair cap
    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(0.126, 72, 40, 0, Math.PI * 2, 0, Math.PI * 0.535),
      hairMat,
    );
    cap.scale.set(0.985, 1.085, 0.94);
    cap.position.set(0, -0.002, -0.010);
    headGroup.add(cap);

    // Hair side volumes
    for (const sx of [-1, 1]) {
      const side = new THREE.Mesh(new THREE.SphereGeometry(0.062, 32, 24), hairMat);
      side.scale.set(0.58, 0.82, 0.52);
      side.position.set(sx * 0.120, 0.048, -0.024);
      headGroup.add(side);
    }

    // ── Eyes (large — Apple Memoji proportions) ───────────────────────────────
    const eyeGroupLeft  = this.makeEye(+1, p, scleraMat, irisMat, pupilMat, lidMat, lashMat, headGroup);
    const eyeGroupRight = this.makeEye(-1, p, scleraMat, irisMat, pupilMat, lidMat, lashMat, headGroup);
    const lidLeft  = eyeGroupLeft.getObjectByName("Lid")  as THREE.Object3D;
    const lidRight = eyeGroupRight.getObjectByName("Lid") as THREE.Object3D;

    // ── Eyebrows ──────────────────────────────────────────────────────────────
    const browLeft  = this.makeBrow( 1, hairMat, 0.056, headGroup);
    const browRight = this.makeBrow(-1, hairMat, 0.056, headGroup);
    browLeft.name  = "BrowLeft";
    browRight.name = "BrowRight";

    // ── Nose — minimal (Apple-style: just tip + nostril hints) ───────────────
    const noseTip = new THREE.Mesh(new THREE.SphereGeometry(0.013, 20, 14), skinMat);
    noseTip.scale.set(1.15, 0.65, 1.3);
    noseTip.position.set(0, -0.014, 0.116);
    headGroup.add(noseTip);
    for (const nx of [-1, 1]) {
      const ns = new THREE.Mesh(new THREE.SphereGeometry(0.010, 16, 12), skinMat);
      ns.scale.set(0.85, 0.52, 1.05);
      ns.position.set(nx * 0.015, -0.020, 0.116);
      headGroup.add(ns);
    }

    // ── Mouth ─────────────────────────────────────────────────────────────────
    const mouthGroup = new THREE.Group();
    mouthGroup.name = "MouthGroup";
    mouthGroup.position.set(0, -0.029, 0.105); // headGroup-local
    headGroup.add(mouthGroup);

    // Dark mouth cavity — visible when jaw opens
    const cavity = new THREE.Mesh(new THREE.SphereGeometry(0.032, 28, 18), cavityMat);
    cavity.scale.set(1.05, 0.55, 0.80);
    cavity.position.set(0, 0, -0.007);
    mouthGroup.add(cavity);

    // Upper teeth (stay with upper lip)
    const teethTop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.028, 0.028, 0.010, 24, 1, false, Math.PI * 0.15, Math.PI * 0.70),
      teethMat,
    );
    teethTop.rotation.x = Math.PI / 2;
    teethTop.position.set(0, 0.006, -0.002);
    mouthGroup.add(teethTop);

    // Upper lip
    const upperLip = new THREE.Mesh(new THREE.SphereGeometry(0.025, 40, 22), lipMat);
    upperLip.name = "UpperLip";
    upperLip.scale.set(1.88, 0.52, 0.88);
    upperLip.position.set(0, 0.007, 0);
    mouthGroup.add(upperLip);

    // Cupid's bow dip
    const cupid = new THREE.Mesh(new THREE.SphereGeometry(0.010, 16, 12), lipMat);
    cupid.scale.set(0.6, 0.45, 0.7);
    cupid.position.set(0, 0.013, -0.002);
    mouthGroup.add(cupid);

    // ── JawGroup — lower jaw drops on jawOpen ─────────────────────────────────
    const jawGroup = new THREE.Group();
    jawGroup.name = "JawGroup";
    mouthGroup.add(jawGroup);

    // Lower teeth (in jawGroup)
    const teethBot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.026, 0.026, 0.009, 24, 1, false, Math.PI * 0.20, Math.PI * 0.60),
      teethMat,
    );
    teethBot.rotation.x = Math.PI / 2;
    teethBot.position.set(0, -0.006, -0.002);
    jawGroup.add(teethBot);

    const lowerLip = new THREE.Mesh(new THREE.SphereGeometry(0.028, 40, 22), lipMat);
    lowerLip.name = "LowerLip";
    lowerLip.scale.set(1.78, 0.58, 0.92);
    lowerLip.position.set(0, -0.007, 0);
    jawGroup.add(lowerLip);

    const cornerLeft = new THREE.Mesh(new THREE.SphereGeometry(0.013, 18, 14), lipMat);
    cornerLeft.name = "CornerLeft";
    cornerLeft.scale.set(0.68, 0.60, 0.68);
    cornerLeft.position.set(-0.034, 0, 0);
    jawGroup.add(cornerLeft);

    const cornerRight = new THREE.Mesh(new THREE.SphereGeometry(0.013, 18, 14), lipMat);
    cornerRight.name = "CornerRight";
    cornerRight.scale.set(0.68, 0.60, 0.68);
    cornerRight.position.set( 0.034, 0, 0);
    jawGroup.add(cornerRight);

    const rig: MemojiRig = {
      headGroup,
      eyeGroupLeft, eyeGroupRight,
      lidLeft, lidRight,
      browLeft, browRight,
      mouthGroup, jawGroup, lowerLip, cornerLeft, cornerRight,
      headMesh: head,
      browLeftBaseY:  browLeft.position.y,  // headGroup-local Y
      browRightBaseY: browRight.position.y,
    };

    return { mesh: g, rig };
  }

  // ── Eye construction ─────────────────────────────────────────────────────────
  // Positions are in headGroup-local coords (origin = head centre at root y=0.872).
  // Eyes sit at y=+0.025 (slightly above equator), x=±0.054, z=+0.099.
  //
  // Layers (front to back): catchlights → pupil → iris rim → iris dome → sclera
  // Lid sweeps down over the iris on blink. Lash arc sits above the lid.

  private makeEye(
    sx: number, // +1 = avatar-left (viewer's right)
    p: AvatarPreset,
    scleraMat: THREE.Material, irisMat: THREE.Material,
    pupilMat: THREE.Material,  lidMat: THREE.Material,
    lashMat: THREE.Material,
    parent: THREE.Object3D,
  ): THREE.Group {
    const label = sx > 0 ? "Left" : "Right";
    const grp = new THREE.Group();
    grp.name = `EyeGroup${label}`;
    // Camera is a mirror: negate sx so avatar-left appears on viewer's right
    grp.position.set(-sx * 0.054, 0.025, 0.099);
    parent.add(grp);

    // Sclera — wide flat oval (Apple Memoji: ~40% of face width per eye)
    const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.041, 48, 36), scleraMat);
    sclera.scale.set(1.0, 1.08, 0.52);
    grp.add(sclera);

    // Iris dome — slight 3-D depth, looks glassy
    const irisDome = new THREE.Mesh(
      new THREE.SphereGeometry(0.026, 48, 24, 0, Math.PI * 2, 0, Math.PI * 0.42),
      irisMat,
    );
    irisDome.rotation.x = Math.PI; // dome faces +z
    irisDome.position.z = 0.019;
    grp.add(irisDome);

    // Limbal ring (slightly darker edge of iris)
    const irisRimMat = new THREE.MeshBasicMaterial({
      color: hsl(p.eyeH, Math.max(p.eyeS - 8, 10), Math.max(p.eyeL - 22, 6)),
    });
    const irisRim = new THREE.Mesh(new THREE.RingGeometry(0.023, 0.026, 48), irisRimMat);
    irisRim.position.z = 0.0195;
    grp.add(irisRim);

    // Pupil
    const pupil = new THREE.Mesh(new THREE.CircleGeometry(0.014, 40), pupilMat);
    pupil.position.z = 0.0200;
    grp.add(pupil);

    // Catchlights — two dots for glass-like shine (key to the Memoji look)
    const hlMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const hl1 = new THREE.Mesh(new THREE.CircleGeometry(0.0056, 16), hlMat);
    hl1.position.set( 0.008,  0.009, 0.0206);
    grp.add(hl1);
    const hl2 = new THREE.Mesh(new THREE.CircleGeometry(0.0028, 12), hlMat);
    hl2.position.set(-0.010, -0.006, 0.0206);
    grp.add(hl2);

    // Upper eyelid (skin-coloured hemisphere, sweeps over iris on blink)
    const lidGeo = new THREE.SphereGeometry(0.043, 48, 20, 0, Math.PI * 2, 0, Math.PI * 0.47);
    const lid = new THREE.Mesh(lidGeo, lidMat);
    lid.name = "Lid";
    lid.rotation.x = Math.PI; // hemisphere opens downward
    lid.scale.set(0.97, 0.76, 0.54);
    lid.position.set(0, 0.002, 0.009);
    grp.add(lid);

    // Lower lid hint
    const lLidGeo = new THREE.SphereGeometry(0.043, 48, 10, 0, Math.PI * 2, Math.PI * 0.52, Math.PI * 0.11);
    const lLid = new THREE.Mesh(lLidGeo, lidMat);
    lLid.scale.set(0.97, 0.54, 0.50);
    lLid.position.set(0, 0, 0.008);
    grp.add(lLid);

    // Eyelashes — thick arc above the eye (signature Apple Memoji feature)
    const lashGeo = new THREE.TorusGeometry(0.038, 0.0050, 6, 44, Math.PI);
    const lash = new THREE.Mesh(lashGeo, lashMat);
    lash.rotation.z = Math.PI; // arc opens downward over the eye
    lash.scale.set(0.96, 0.82, 0.36);
    lash.position.set(0, 0.006, 0.016);
    grp.add(lash);

    return grp;
  }

  // ── Eyebrow construction ────────────────────────────────────────────────────
  // 4-segment arched brow in headGroup-local coords.

  private makeBrow(
    sx: number,              // +1 = avatar-left
    mat: THREE.Material,
    localY: number,          // headGroup-local Y position
    parent: THREE.Object3D,
  ): THREE.Group {
    const grp = new THREE.Group();
    grp.position.set(-sx * 0.054, localY, 0.093);
    grp.rotation.z = sx * 0.16;
    parent.add(grp);

    // Four overlapping blobs forming a smooth arch
    const segs: [number, number, number][] = [
      [-0.026,  0.000, 0.84],
      [-0.010,  0.005, 1.00],
      [ 0.007,  0.005, 1.00],
      [ 0.022, -0.002, 0.78],
    ];
    for (const [bx, by, sy] of segs) {
      const blob = new THREE.Mesh(new THREE.SphereGeometry(0.013, 20, 14), mat);
      blob.scale.set(1.0, sy * 0.68, 0.60);
      blob.position.set(bx, by, 0);
      grp.add(blob);
    }

    return grp;
  }

  // ── Cleanup ─────────────────────────────────────────────────────────────────

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

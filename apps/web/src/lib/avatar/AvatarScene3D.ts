/**
 * AvatarScene3D — renders a Ready Player Me glTF avatar driven in real time
 * by MediaPipe FaceLandmarker output (52 ARKit blendshapes + a 4×4 facial
 * transformation matrix for head pose).
 *
 * Blendshape names from MediaPipe map 1:1 to ARKit morph targets in the RPM
 * model (loaded with ?morphTargets=ARKit) — the same technique FaceTime Memoji
 * uses.  Everything runs on the user's device; the rendered canvas is captured
 * via captureStream() and sent as regular WebRTC video, so the real face never
 * leaves the device.
 *
 * NORMALISATION: after loading, every avatar is scaled & translated so it is
 * exactly 1.0 unit tall with feet at y=0.  This eliminates the fragility of
 * guessing world-space positions from SkinnedMesh bounding boxes (which vary
 * unpredictably with RPM export settings).  The portrait camera then uses fixed
 * constants tuned for a 1.0-unit-tall avatar.
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

// ── Portrait camera constants (avatar normalised to 1.0 unit tall, feet y=0) ──
// RPM full-body: head spans roughly y=0.80..1.00 (top 20%).
// At z=0.65 with FOV=26° → ~0.30 units visible height → head + small neck/shoulder.
const CAM_POS    = new THREE.Vector3(0, 0.86, 0.65);
const CAM_TARGET = new THREE.Vector3(0, 0.83, 0);
const CAM_FOV    = 26;

const hsl = (h: number, s: number, l: number) =>
  new THREE.Color().setHSL(h / 360, s / 100, l / 100);

export class AvatarScene3D {
  private renderer: THREE.WebGLRenderer;
  private scene:    THREE.Scene;
  private camera:   THREE.PerspectiveCamera;
  private clock    = new THREE.Clock();

  private avatarRoot:  THREE.Object3D | null = null;
  private headBone:    THREE.Object3D | null = null;
  private morphMeshes: THREE.Mesh[]          = [];

  private targetInfluences = new Map<string, number>();
  private headQuat         = new THREE.Quaternion();
  private targetHeadQuat   = new THREE.Quaternion();

  private raf       = 0;
  private disposed  = false;
  private loadToken = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({
      canvas, antialias: true, alpha: true, preserveDrawingBuffer: true,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(canvas.width, canvas.height, false);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping      = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    this.scene = new THREE.Scene();
    // Deep charcoal backdrop — gives Memoji-style depth without full transparency.
    this.scene.background = new THREE.Color(0x1a1a2e);

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    this.camera = new THREE.PerspectiveCamera(CAM_FOV, canvas.width / canvas.height, 0.01, 50);
    this.camera.position.copy(CAM_POS);
    this.camera.lookAt(CAM_TARGET);

    // Studio three-point lighting
    const key  = new THREE.DirectionalLight(0xfff2e0, 2.2);  key.position.set( 0.6, 1.4, 1.2);
    const fill = new THREE.DirectionalLight(0xbcd4ff, 0.9); fill.position.set(-1.2, 0.8, 0.8);
    const rim  = new THREE.DirectionalLight(0xe0e8ff, 1.3);  rim.position.set( 0,   1.6,-1.4);
    this.scene.add(key, fill, rim, new THREE.AmbientLight(0x3a4060, 0.55));
  }

  // ── Avatar loading ──────────────────────────────────────────────────────────

  async loadAvatar(spec: AvatarSpec): Promise<void> {
    const token = ++this.loadToken;

    let root: THREE.Object3D;
    try {
      const gltf = await new GLTFLoader().loadAsync(spec.url);
      if (this.disposed || token !== this.loadToken) return;
      root = gltf.scene;
      root.traverse(o => { o.frustumCulled = false; });
      this.applyPreset(root, spec.preset);
    } catch (err) {
      console.warn("[AvatarScene3D] RPM load failed, using fallback:", err);
      if (this.disposed || token !== this.loadToken) return;
      root = this.buildFallback(spec.preset);
    }

    // Hide hands (full-body RPM) so the portrait closeup stays clean.
    root.getObjectByName("LeftHand")?.scale.set(0, 0, 0);
    root.getObjectByName("RightHand")?.scale.set(0, 0, 0);

    // ── Normalise to 1.0 unit tall, feet at y=0 ──────────────────────────
    // Must do a render pass first so Three.js updates SkinnedMesh world matrices.
    if (this.avatarRoot) this.scene.remove(this.avatarRoot);
    this.scene.add(root);
    this.renderer.render(this.scene, this.camera);

    const box  = new THREE.Box3().setFromObject(root);
    const size = new THREE.Vector3(); box.getSize(size);

    if (size.y > 0.001) {
      const s = 1.0 / size.y;   // scale so height === 1.0
      root.scale.multiplyScalar(s);
      // Second render pass → updates SkinnedMesh bone matrices at new scale.
      this.renderer.render(this.scene, this.camera);
      const b2 = new THREE.Box3().setFromObject(root);
      root.position.set(
        root.position.x - (b2.min.x + b2.max.x) / 2,  // centre X
        root.position.y - b2.min.y,                     // feet at y=0
        root.position.z - (b2.min.z + b2.max.z) / 2,  // centre Z
      );
    }

    // Swap previous model
    if (this.avatarRoot && this.avatarRoot !== root) {
      this.scene.remove(this.avatarRoot);
      this.disposeObject(this.avatarRoot);
    }
    this.avatarRoot = root;

    // Collect morph-target meshes + head bone (search by common RPM names).
    this.morphMeshes = [];
    this.headBone    = root.getObjectByName("Head") ?? root.getObjectByName("head") ?? null;
    root.traverse(o => {
      const m = o as THREE.Mesh;
      if (m.isMesh && m.morphTargetDictionary && m.morphTargetInfluences) {
        this.morphMeshes.push(m);
      }
    });

    // Reset portrait camera (in case aspect changed via resize since construction).
    this.camera.fov    = CAM_FOV;
    this.camera.aspect = this.renderer.domElement.width / this.renderer.domElement.height;
    this.camera.position.copy(CAM_POS);
    this.camera.lookAt(CAM_TARGET);
    this.camera.updateProjectionMatrix();
  }

  // ── Material tinting ────────────────────────────────────────────────────────
  // Only hair and outfit are recoloured — skin and eyes look best as-is.

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
          mat.color.lerp(hsl(p.hairH, p.hairS, p.hairL), 0.8);
          mat.needsUpdate = true;
        } else if (/outfit|shirt|jacket|top|cloth|bottom|pants|shoe|sleeve/.test(n)) {
          mat.color.lerp(hsl(p.shirtH, p.shirtS, p.shirtL), 0.7);
          mat.needsUpdate = true;
        }
        // skin, eyes, teeth, lashes → untouched (RPM PBR looks authentic)
      }
    });
  }

  // ── Face tracking input ─────────────────────────────────────────────────────

  applyResult(result: FaceResult | null | undefined) {
    if (!result) return;

    const cats = result.faceBlendshapes?.[0]?.categories;
    if (cats) {
      for (const { score, categoryName } of cats) {
        // Mirror L↔R so the avatar mimics a reflection (not a puppet).
        let name = categoryName;
        if      (name.includes("Left"))  name = name.replace("Left",  "Right");
        else if (name.includes("Right")) name = name.replace("Right", "Left");
        this.targetInfluences.set(name, score);
      }
    }

    const mtx = result.facialTransformationMatrixes?.[0]?.data;
    if (mtx && mtx.length >= 16) {
      const m4 = new THREE.Matrix4().fromArray(mtx);
      const t  = new THREE.Vector3();
      const q  = new THREE.Quaternion();
      const s  = new THREE.Vector3();
      m4.decompose(t, q, s);
      q.y *= -1; q.z *= -1;          // mirror head rotation
      this.targetHeadQuat.copy(q);
    }
  }

  // ── Render loop ─────────────────────────────────────────────────────────────

  private animate = () => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.animate);

    const dt = this.clock.getDelta();
    const k  = 1 - Math.exp(-dt * 20); // critically-damped smoothing

    // Drive morph targets
    for (const mesh of this.morphMeshes) {
      const dict = mesh.morphTargetDictionary!;
      const infl = mesh.morphTargetInfluences!;
      for (const [name, idx] of Object.entries(dict)) {
        const target = this.targetInfluences.get(name) ?? 0;
        infl[idx] += (target - infl[idx]) * k;
      }
    }

    // Drive head bone rotation
    if (this.headBone) {
      this.headQuat.slerp(this.targetHeadQuat, k);
      this.headBone.quaternion.copy(this.headQuat);
    }

    this.renderer.render(this.scene, this.camera);
  };

  start() {
    if (!this.raf) { this.clock.start(); this.animate(); }
  }

  /** Returns the rendered avatar as a MediaStream for WebRTC. */
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

  // ── Procedural fallback head ────────────────────────────────────────────────
  // Shown only if the RPM CDN is unreachable.  Built at 1.0-unit scale already
  // so no normalisation step is needed.

  private buildFallback(p: AvatarPreset): THREE.Object3D {
    const g = new THREE.Group();
    g.name  = "AvatarRoot";

    const skin = new THREE.MeshStandardMaterial({
      color: hsl(p.skinH, p.skinS, p.skinL), roughness: 0.55, metalness: 0,
    });

    // Head (radius 0.13, centre y=0.87, total height ~1.0 from 0 to 1.0)
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 64, 48), skin);
    head.scale.set(0.96, 1.0, 0.94);
    head.position.set(0, 0.87, 0);
    head.name = "Head";

    // Eyes — whites
    const sclera = new THREE.MeshStandardMaterial({ color: 0xf8f8f8, roughness: 0.08 });
    const iris   = new THREE.MeshStandardMaterial({ color: hsl(p.eyeH, p.eyeS, p.eyeL), roughness: 0.08 });
    const pupil  = new THREE.MeshBasicMaterial({ color: 0x050505 });
    for (const sx of [-1, 1]) {
      const ew = new THREE.Mesh(new THREE.SphereGeometry(0.028, 32, 24), sclera);
      ew.position.set(sx * 0.052, 0.886, 0.112);
      const ir = new THREE.Mesh(new THREE.CircleGeometry(0.016, 32), iris);
      ir.position.set(sx * 0.052, 0.886, 0.140);
      const pu = new THREE.Mesh(new THREE.CircleGeometry(0.008, 32), pupil);
      pu.position.set(sx * 0.052, 0.886, 0.141);
      g.add(ew, ir, pu);
    }

    // Nose
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.018, 24, 16), skin);
    nose.scale.set(1, 0.62, 1.2);
    nose.position.set(0, 0.848, 0.126);

    // Lips
    const lipMat = new THREE.MeshStandardMaterial({
      color: hsl(p.skinH, p.skinS * 0.75, p.skinL * 0.68), roughness: 0.4,
    });
    const lips = new THREE.Mesh(new THREE.SphereGeometry(0.038, 32, 16), lipMat);
    lips.scale.set(1, 0.34, 0.65);
    lips.position.set(0, 0.824, 0.122);

    // Neck
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.064, 0.11, 24), skin);
    neck.position.set(0, 0.732, 0);

    // Shoulders / shirt
    const shirtMat = new THREE.MeshStandardMaterial({
      color: hsl(p.shirtH, p.shirtS, p.shirtL), roughness: 0.72,
    });
    const shoulders = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.26, 0.055, 48), shirtMat);
    shoulders.position.set(0, 0.670, 0);

    // Hair cap
    const hairMat = new THREE.MeshStandardMaterial({
      color: hsl(p.hairH, p.hairS, p.hairL), roughness: 0.82,
    });
    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(0.135, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2),
      hairMat,
    );
    cap.position.set(0, 0.868, -0.006);
    cap.scale.set(0.98, 1.04, 0.98);

    g.add(head, nose, lips, neck, shoulders, cap);
    return g;
  }

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

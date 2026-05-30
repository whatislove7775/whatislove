/**
 * AvatarScene3D — renders a Ready Player Me glTF avatar driven in real time
 * by MediaPipe FaceLandmarker output (52 ARKit blendshapes + a 4×4 facial
 * transformation matrix for head pose).
 *
 * The blendshape category names emitted by MediaPipe map 1:1 to the ARKit
 * morph targets baked into the RPM model (loaded with ?morphTargets=ARKit),
 * so driving the face is a direct name lookup — the same technique Apple's
 * Memoji / FaceTime uses.
 *
 * Everything runs on the user's device. The rendered <canvas> is captured
 * via captureStream() and sent over WebRTC as ordinary video, so the remote
 * peer needs no avatar code and the user's real face never leaves the device.
 */

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { AvatarSpec } from "./rpmConfig";
import type { AvatarDNA } from "./AvatarDNA";

/** Minimal shape of a MediaPipe FaceLandmarker VIDEO result we consume. */
export interface FaceResult {
  faceBlendshapes?: { categories: { score: number; categoryName: string }[] }[];
  facialTransformationMatrixes?: { data: number[] }[];
}

const hsl = (h: number, s: number, l: number) =>
  new THREE.Color().setHSL(h / 360, s / 100, l / 100);

export class AvatarScene3D {
  private renderer: THREE.WebGLRenderer;
  private scene:    THREE.Scene;
  private camera:   THREE.PerspectiveCamera;
  private clock = new THREE.Clock();

  private avatarRoot: THREE.Object3D | null = null;
  private headBone:   THREE.Object3D | null = null;
  private morphMeshes: THREE.Mesh[] = [];

  // Smoothed blendshape state (target ← detection, current → lerps toward target)
  private targetInfluences = new Map<string, number>();
  private headQuat = new THREE.Quaternion();
  private targetHeadQuat = new THREE.Quaternion();

  private raf = 0;
  private disposed = false;
  private loadToken = 0;
  private onReady?: () => void;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({
      canvas, antialias: true, alpha: true, preserveDrawingBuffer: true,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(canvas.width, canvas.height, false);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    this.scene = new THREE.Scene();
    this.scene.background = null; // transparent; CSS provides the backdrop

    // Image-based lighting for realistic PBR skin/hair (RPM uses MeshStandard).
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    this.camera = new THREE.PerspectiveCamera(28, canvas.width / canvas.height, 0.01, 100);
    this.camera.position.set(0, 1.55, 0.72);

    // Three-point lighting on top of the IBL.
    const key = new THREE.DirectionalLight(0xfff2e0, 2.2);
    key.position.set(0.6, 2.2, 1.4);
    const fill = new THREE.DirectionalLight(0xbcd4ff, 0.9);
    fill.position.set(-1.4, 1.2, 0.8);
    const rim = new THREE.DirectionalLight(0xe8f0ff, 1.4);
    rim.position.set(0, 1.8, -1.6);
    this.scene.add(key, fill, rim, new THREE.AmbientLight(0x404a5c, 0.5));
  }

  /** Notify once a model (or fallback) is in the scene and rendering. */
  setOnReady(cb: () => void) { this.onReady = cb; }

  /** Load & swap the avatar for a given seed-derived spec. Safe to call repeatedly. */
  async loadAvatar(spec: AvatarSpec): Promise<void> {
    const token = ++this.loadToken;
    let root: THREE.Object3D;
    try {
      const gltf = await new GLTFLoader().loadAsync(spec.url);
      if (this.disposed || token !== this.loadToken) return;
      root = gltf.scene;
      root.traverse(o => { o.frustumCulled = false; });
      this.applyDNA(root, spec.dna);
    } catch (err) {
      console.warn("[AvatarScene3D] RPM load failed, using fallback head:", err);
      if (this.disposed || token !== this.loadToken) return;
      root = this.buildFallbackHead(spec.dna);
    }

    // Swap out previous avatar
    if (this.avatarRoot) {
      this.scene.remove(this.avatarRoot);
      this.disposeObject(this.avatarRoot);
    }
    this.avatarRoot = root;
    this.scene.add(root);

    // Collect morph-target meshes and locate head bone
    this.morphMeshes = [];
    this.headBone = root.getObjectByName("Head") ?? null;
    root.traverse(o => {
      const m = o as THREE.Mesh;
      if (m.isMesh && m.morphTargetDictionary && m.morphTargetInfluences) {
        this.morphMeshes.push(m);
      }
    });
    // RPM full-body: hide hands so closeup framing stays clean
    root.getObjectByName("LeftHand")?.scale.set(0, 0, 0);
    root.getObjectByName("RightHand")?.scale.set(0, 0, 0);

    this.frameHead(root);
    this.onReady?.();
  }

  /** Point the camera at the avatar's head for a flattering portrait closeup. */
  private frameHead(root: THREE.Object3D) {
    // Force one render pass so skinned mesh world matrices are computed.
    this.renderer.render(this.scene, this.camera);

    // Use bounding box — bones may not have world matrices yet before first render.
    const box = new THREE.Box3().setFromObject(root);
    const size = new THREE.Vector3();
    box.getSize(size);

    let targetY: number;
    if (size.y > 0.8) {
      // Full-body avatar (~1.8 m): head occupies top ~12% of height.
      targetY = box.max.y - size.y * 0.10;
    } else if (size.y > 0.05) {
      // Bust / head-only model: use bbox center.
      targetY = (box.min.y + box.max.y) / 2;
    } else {
      // Degenerate (scale issue) — try the Head bone directly.
      const head = root.getObjectByName("Head");
      if (head) {
        const wp = new THREE.Vector3();
        head.getWorldPosition(wp);
        targetY = wp.y > 0.1 ? wp.y : 1.60;
      } else {
        targetY = 1.60;
      }
    }

    const targetX = (box.min.x + box.max.x) / 2;
    const targetZ = (box.min.z + box.max.z) / 2;

    this.camera.fov = 22;
    // Distance scaled to show roughly a head + slight shoulders.
    const portraitDist = size.y > 0.8 ? size.y * 0.26 : Math.max(0.38, size.y * 0.8);
    this.camera.position.set(targetX, targetY + 0.04, targetZ + portraitDist);
    this.camera.lookAt(targetX, targetY - 0.05, targetZ);
    this.camera.updateProjectionMatrix();
  }

  /** Recolour RPM materials deterministically for per-user uniqueness.
   *  Only hair and outfit are tinted — skin and eyes are left as-is because
   *  RPM bakes beautiful PBR materials and any tint looks wrong on them. */
  private applyDNA(root: THREE.Object3D, dna: AvatarDNA) {
    root.traverse(o => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const mats = Array.isArray(m.material) ? m.material : [m.material];
      for (const raw of mats) {
        const mat = raw as THREE.MeshStandardMaterial;
        if (!mat?.color) continue;
        const name = (mat.name || m.name || "").toLowerCase();
        if (/hair|beard|eyebrow/.test(name)) {
          mat.color.lerp(hsl(dna.hairH, dna.hairS, dna.hairL), 0.75);
          mat.needsUpdate = true;
        } else if (/outfit|shirt|jacket|top|sleeve|cloth|bottom|pants|shoe/.test(name)) {
          mat.color.lerp(hsl(dna.shirtH, dna.shirtS, dna.shirtL), 0.65);
          mat.needsUpdate = true;
        }
        // skin, eyes, teeth, eyelashes: untouched — RPM materials look realistic as-is
      }
    });
  }

  /** Update target state from a MediaPipe FaceLandmarker VIDEO result (mirrored). */
  applyResult(result: FaceResult | null | undefined) {
    if (!result) return;

    const cats = result.faceBlendshapes?.[0]?.categories;
    if (cats) {
      for (const { score, categoryName } of cats) {
        // Mirror: swap Left/Right so the avatar moves like a reflection.
        let name = categoryName;
        if (name.includes("Left")) name = name.replace("Left", "Right");
        else if (name.includes("Right")) name = name.replace("Right", "Left");
        this.targetInfluences.set(name, score);
      }
    }

    const mtx = result.facialTransformationMatrixes?.[0]?.data;
    if (mtx && mtx.length >= 16) {
      const m4 = new THREE.Matrix4().fromArray(mtx);
      const t = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3();
      m4.decompose(t, q, s);
      // Mirror the head pose to match the flipped blendshapes.
      q.y *= -1; q.z *= -1;
      this.targetHeadQuat.copy(q);
    }
  }

  /** Per-frame smoothing applied to meshes + head bone. */
  private animate = () => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.animate);

    const dt = this.clock.getDelta();
    const k = 1 - Math.exp(-dt * 18); // exponential smoothing toward target

    for (const mesh of this.morphMeshes) {
      const dict = mesh.morphTargetDictionary!;
      const infl = mesh.morphTargetInfluences!;
      for (const [name, idx] of Object.entries(dict)) {
        const target = this.targetInfluences.get(name) ?? 0;
        infl[idx] += (target - infl[idx]) * k;
      }
    }

    if (this.headBone) {
      this.headQuat.slerp(this.targetHeadQuat, k);
      this.headBone.quaternion.copy(this.headQuat);
    }

    this.renderer.render(this.scene, this.camera);
  };

  start() {
    if (!this.raf) { this.clock.start(); this.animate(); }
  }

  /** Capture the rendered avatar as a MediaStream for WebRTC. */
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
    this.camera.updateProjectionMatrix();
  }

  /** A simple stylised head used only if the RPM model can't be fetched. */
  private buildFallbackHead(dna: AvatarDNA): THREE.Object3D {
    const group = new THREE.Group();
    group.name = "AvatarRoot";
    const skin = new THREE.MeshStandardMaterial({
      color: hsl(dna.skinH, dna.skinS, dna.skinL), roughness: 0.62, metalness: 0.0,
    });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 48, 48), skin);
    head.scale.set(1, 1.18, 1.02);
    head.position.set(0, 1.55, 0);
    head.name = "Head";
    const eyeMat = new THREE.MeshStandardMaterial({ color: hsl(dna.eyeH, dna.eyeS, dna.eyeL), roughness: 0.2 });
    for (const sx of [-1, 1]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.018, 24, 24), eyeMat);
      eye.position.set(sx * 0.042, 1.57, 0.105);
      group.add(eye);
    }
    group.add(head);
    return group;
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

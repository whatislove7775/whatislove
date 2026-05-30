/**
 * rpmConfig — avatar mesh sourcing.
 *
 * The avatar is a riggged glTF (.glb) head with the 52 ARKit blendshapes that
 * MediaPipe FaceLandmarker outputs, so facial tracking drives the mesh in real
 * time (eyes, brows, jaw, lips, cheeks — the full FaceTime-style range).
 *
 * STRATEGY — bundle the model with the app:
 *   The .glb is committed to apps/web/public/models and served from OUR OWN
 *   origin.  This is critical: external CDNs (models.readyplayer.me) are
 *   unreliable — when the fetch fails the renderer falls back to a crude
 *   procedural face.  A same-origin model always loads, has no CORS/COEP
 *   issues, and is cached by the browser after the first request.
 *
 *   The bundled model is three.js's `facecap.glb` — a head scan rigged with
 *   the canonical 52 ARKit blendshapes (named browDown_L / eyeBlink_L / …).
 *   AvatarScene3D maps MediaPipe's `browDownLeft` → `browDown_L` at runtime.
 */

import type { AvatarPreset } from "./presets";

/**
 * Avatar mesh candidates, tried in order by AvatarScene3D.loadAvatar.
 * The browser (not the Docker container) fetches these URLs, so external
 * CDNs work fine from a user's browser even when the build container has
 * no outbound internet access.
 *
 * URL list:
 *  1. Same-origin /models/facecap.glb  — fastest, no CORS, works if Docker
 *     image was built with the file in public/.
 *  2. GitHub raw (r165 tag)            — reliable CDN, COEP:credentialless
 *     allows cross-origin fetches without CORP headers.
 *  3. jsDelivr npm mirror              — alternative CDN fallback.
 */
export const AVATAR_URLS: string[] = [
  "/models/facecap.glb",
  "https://raw.githubusercontent.com/mrdoob/three.js/r165/examples/models/gltf/facecap.glb",
  "https://cdn.jsdelivr.net/npm/three@0.165.0/examples/models/gltf/facecap.glb",
];

/** All AvatarScene3D needs: ordered URL list and the coloring preset. */
export interface AvatarSpec {
  presetId: number;
  urls:     string[];  // try in order until one succeeds
  preset:   AvatarPreset;
}

export function specForPreset(preset: AvatarPreset): AvatarSpec {
  return {
    presetId: preset.id,
    urls:     AVATAR_URLS,
    preset,
  };
}

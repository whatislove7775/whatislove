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

/** Same-origin bundled head mesh with 52 ARKit blendshapes. */
const LOCAL_AVATAR_URL = "/models/facecap.glb";

export function rpmUrlForPreset(_presetId: number): string {
  return LOCAL_AVATAR_URL;
}

/** All AvatarScene3D needs: the CDN URL and the coloring preset. */
export interface AvatarSpec {
  presetId: number;
  url:      string;
  preset:   AvatarPreset;
}

export function specForPreset(preset: AvatarPreset): AvatarSpec {
  return {
    presetId: preset.id,
    url:      rpmUrlForPreset(preset.id),
    preset,
  };
}

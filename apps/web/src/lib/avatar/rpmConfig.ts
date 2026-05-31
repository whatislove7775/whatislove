/**
 * rpmConfig — avatar mesh sourcing.
 *
 * Avatars are rigged Ready Player Me (RPM) glTF heads carrying the 52 ARKit
 * blendshapes that MediaPipe FaceLandmarker outputs, plus modelled hair
 * (Wolf3D_Hair) and named Wolf3D_* materials that AvatarScene3D recolors per
 * preset. Facial tracking drives the mesh in real time.
 *
 * STRATEGY — bundle the models with the app:
 *   The .glb files are committed to apps/web/public/models and served from OUR
 *   OWN origin. A same-origin model always loads, has no CORS/COEP issues, and
 *   is cached by the browser after the first request — unlike external CDNs
 *   (models.readyplayer.me) which the user's network may block.
 *
 *   Two gendered avatars:
 *     - avatar-male.glb   — bearded RPM male  (Wolf3D rig, ARKit, short hair)
 *     - avatar-female.glb — RPM female        (Wolf3D rig, ARKit, long hair)
 *
 *   facecap.glb is kept as a last-resort fallback (head scan, no hair).
 */

import type { AvatarPreset } from "./presets";

/** Same-origin gendered avatar models, each tried in order until one loads. */
export const MALE_URLS: string[] = [
  "/models/avatar-male.glb",
  "/models/avatar-female.glb",
];

export const FEMALE_URLS: string[] = [
  "/models/avatar-female.glb",
  "/models/avatar-male.glb",
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
    urls:     preset.gender === "male" ? MALE_URLS : FEMALE_URLS,
    preset,
  };
}

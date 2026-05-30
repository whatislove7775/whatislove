/**
 * rpmConfig — Ready Player Me avatar sourcing.
 *
 * RPM avatars are full-body glTF (.glb) models with ?morphTargets=ARKit
 * which exposes 52 ARKit blendshapes matching MediaPipe FaceLandmarker output
 * 1:1, so facial tracking drives the avatar with zero manual remapping.
 *
 * The .glb is fetched by the USER'S BROWSER at runtime — all compute stays
 * on the client device, the server is never involved.
 *
 * Add more avatars by creating them at https://readyplayer.me and appending
 * the 24-char hex ID from the model URL to RPM_AVATAR_POOL.
 */

import type { AvatarPreset } from "./presets";

/** RPM avatar IDs (full-body, A-pose, publicly accessible). */
export const RPM_AVATAR_POOL: string[] = [
  "6460691aa35b2e5b7106734d", // female, neutral — verified working
  "6374040fa9e94a8cb3fbe8f9", // male, dark skin
  "638df693d72bffc6fa17943c", // female, light skin
  "63de3a00d9e6ac54d7464585", // male, medium skin
  "64d61e519a6b4a9ba831e098", // female, warm skin
  "6400e8b7bb45fec53fa5e28a", // male, light skin
];

/** Only ARKit morphs needed; skip webp/lod to maximise CDN cache hits. */
const RPM_QUERY = "morphTargets=ARKit";

export function rpmUrlForPreset(presetId: number): string {
  const id = RPM_AVATAR_POOL[presetId % RPM_AVATAR_POOL.length];
  return `https://models.readyplayer.me/${id}.glb?${RPM_QUERY}`;
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

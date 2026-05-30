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
 * STRATEGY: we use ONE verified, publicly-accessible base mesh for every
 * preset and recolour skin / hair / outfit / eyes per preset (see presets.ts +
 * AvatarScene3D.applyPreset).  This guarantees every preset renders a real,
 * beautiful human avatar — there are no broken CDN IDs that 404 into the
 * procedural fallback.  The base .glb is fetched once and served from browser
 * cache for all subsequent presets, so switching avatars is instant.
 *
 * To add genuinely different face meshes later, create avatars at
 * https://readyplayer.me and put their 24-char IDs in RPM_AVATAR_POOL.
 */

import type { AvatarPreset } from "./presets";

/** Verified public RPM base mesh (full-body, A-pose, ARKit morphs). */
const RPM_BASE_ID = "6460691aa35b2e5b7106734d";

export const RPM_AVATAR_POOL: string[] = [RPM_BASE_ID];

/**
 * RPM render-API query params (https://docs.readyplayer.me/.../avatar-rest-api):
 *  - morphTargets=ARKit  → 52 ARKit blendshapes for expression
 *  - textureAtlas=1024   → single 1024 atlas, fewer GPU texture binds (faster)
 *  - meshLod=1           → mid LOD, lighter mesh for real-time + low latency
 *  - useHands=false      → drop hand bones we don't render
 */
const RPM_QUERY = "morphTargets=ARKit&textureAtlas=1024&meshLod=1&useHands=false";

export function rpmUrlForPreset(_presetId: number): string {
  return `https://models.readyplayer.me/${RPM_BASE_ID}.glb?${RPM_QUERY}`;
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

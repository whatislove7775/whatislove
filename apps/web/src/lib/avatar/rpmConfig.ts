/**
 * rpmConfig — Ready Player Me avatar sourcing.
 *
 * RPM avatars are full-body glTF (.glb) models hosted on the RPM CDN.
 * Loading with `?morphTargets=ARKit` exposes the 52 ARKit blendshapes
 * whose names map 1:1 to MediaPipe FaceLandmarker blendshape categories
 * (jawOpen, eyeBlinkLeft, mouthSmileRight, …) — so face tracking drives
 * the avatar with zero manual remapping.
 *
 * The .glb is fetched by the USER'S BROWSER at runtime (never by our
 * server) — this keeps all rendering compute on the client device.
 *
 * Uniqueness per user is achieved two ways:
 *   1. a base mesh is picked deterministically from RPM_AVATAR_POOL by seed
 *   2. AvatarDNA recolours skin / hair / outfit / eyes deterministically
 * so even a single base mesh yields visually distinct avatars per room.
 *
 * To add more variety, create avatars at https://readyplayer.me, copy the
 * .glb id from the model URL, and append it to RPM_AVATAR_POOL below.
 */

import { generateDNA, type AvatarDNA } from "./AvatarDNA";

/** RPM avatar ids (full-body, A-pose). Extend freely with your own. */
export const RPM_AVATAR_POOL: string[] = [
  "6460691aa35b2e5b7106734d",
];

/** Query params: ARKit morphs for expression, webp textures + LOD for speed. */
const RPM_QUERY = "morphTargets=ARKit&textureFormat=webp&lod=1";

function hashStr(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Deterministically resolve a full RPM .glb URL for a given seed. */
export function rpmUrlForSeed(seed: string): string {
  const id = RPM_AVATAR_POOL[hashStr(seed) % RPM_AVATAR_POOL.length];
  return `https://models.readyplayer.me/${id}.glb?${RPM_QUERY}`;
}

/** Bundle of everything needed to build one avatar from a seed. */
export interface AvatarSpec {
  seed: string;
  url:  string;
  dna:  AvatarDNA;
}

export function specForSeed(seed: string): AvatarSpec {
  return { seed, url: rpmUrlForSeed(seed), dna: generateDNA(seed) };
}

/**
 * Avatar preset system — 6 fixed visual identities.
 *
 * Each preset is in its own file so it can be edited, extended, or swapped
 * independently without touching the rest of the system.  The preset DNA
 * values are FIXED (not seed-derived), so preset 0 is always "Аврора"
 * regardless of which room the user is in.
 */

export interface AvatarPreset {
  id: number;
  name: string;
  // HSL components (H: 0-360, S: 0-100, L: 0-100)
  skinH: number;  skinS: number;  skinL: number;
  hairH: number;  hairS: number;  hairL: number;
  shirtH: number; shirtS: number; shirtL: number;
  eyeH: number;   eyeS: number;  eyeL: number;
}

import p0 from "./presets/preset-0";
import p1 from "./presets/preset-1";
import p2 from "./presets/preset-2";
import p3 from "./presets/preset-3";
import p4 from "./presets/preset-4";
import p5 from "./presets/preset-5";

export const AVATAR_PRESETS: AvatarPreset[] = [p0, p1, p2, p3, p4, p5];

/** Swatch colours for the picker UI — derived directly from preset DNA. */
export function presetSwatch(p: AvatarPreset) {
  return {
    skin:  `hsl(${p.skinH} ${p.skinS}% ${p.skinL}%)`,
    hair:  `hsl(${p.hairH} ${p.hairS}% ${p.hairL}%)`,
    shirt: `hsl(${p.shirtH} ${p.shirtS}% ${p.shirtL}%)`,
  };
}

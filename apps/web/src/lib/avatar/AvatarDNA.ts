/**
 * AvatarDNA — deterministic procedural avatar generation.
 * A seed string (e.g. roomId + avatarIndex) deterministically
 * produces a unique, beautiful, diverse avatar configuration.
 */

export interface AvatarDNA {
  seed:      string;
  skinH:     number; skinS: number; skinL: number;
  eyeH:      number; eyeS:  number; eyeL:  number;
  hairH:     number; hairS: number; hairL: number;
  hairStyle: "short" | "long" | "curly" | "undercut";
  eyeScale:  number;   // 0.88 – 1.22
  faceWidth: number;   // 0.93 – 1.07
  jawWidth:  number;   // 0.88 – 1.12
  lipFull:   number;   // 0.82 – 1.28
  shirtH:    number; shirtS: number; shirtL: number;
}

function xorshift(seed: number) {
  let s = seed | 1;
  return {
    next: () => {
      s ^= s << 13; s ^= s >> 17; s ^= s << 5;
      return (s >>> 0) / 4294967296;
    },
    int: (n: number) => {
      s ^= s << 13; s ^= s >> 17; s ^= s << 5;
      return (s >>> 0) % n;
    },
  };
}

function hashStr(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

// Diverse skin tones across all human ranges
const SKIN = [
  [23, 88, 87], [22, 75, 81], [21, 68, 74], [20, 62, 67],
  [18, 57, 55], [16, 52, 44], [14, 46, 33], [12, 40, 22],
];

// Eye colours — blue, green, hazel, amber, dark brown, grey-green
const EYES = [
  [212, 68, 42], [135, 48, 34], [28, 62, 31], [178, 52, 36],
  [265, 35, 44], [38, 78, 38], [195, 22, 52], [20, 45, 28],
];

// Hair colours — from jet black to platinum
const HAIR = [
  [22, 18, 8], [24, 48, 16], [26, 55, 26], [27, 60, 38],
  [32, 68, 55], [15, 72, 36], [0, 0, 70], [36, 50, 62],
];

const SHIRT = [
  [220, 42, 18], [0, 0, 14], [210, 38, 28], [145, 38, 16],
  [270, 32, 22], [25, 55, 22], [340, 40, 22], [180, 35, 20],
];

const STYLES: AvatarDNA["hairStyle"][] = ["short", "long", "curly", "undercut"];

export function generateDNA(seed: string): AvatarDNA {
  const r = xorshift(hashStr(seed));
  const s = SKIN[r.int(SKIN.length)];
  const e = EYES[r.int(EYES.length)];
  const h = HAIR[r.int(HAIR.length)];
  const sh = SHIRT[r.int(SHIRT.length)];
  return {
    seed,
    skinH: s[0], skinS: s[1], skinL: s[2],
    eyeH:  e[0], eyeS:  e[1], eyeL:  e[2],
    hairH: h[0], hairS: h[1], hairL: h[2],
    hairStyle: STYLES[r.int(4)],
    eyeScale:  0.88 + r.next() * 0.34,
    faceWidth: 0.93 + r.next() * 0.14,
    jawWidth:  0.88 + r.next() * 0.24,
    lipFull:   0.82 + r.next() * 0.46,
    shirtH: sh[0], shirtS: sh[1], shirtL: sh[2],
  };
}

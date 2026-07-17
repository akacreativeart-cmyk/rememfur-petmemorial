// Shared constellation library — one source of truth for the landing "Their Sky" band
// and the memorial page's TheirSky card. Coordinates are on a 0-100 viewBox.

export type Star = [number, number, number]; // [x, y, radius]
export type LinePair = [number, number]; // indexes into stars

export type Season = "spring" | "summer" | "autumn" | "winter";

export interface Constellation {
  name: string;
  stars: Star[];
  lines: LinePair[];
  prose: string[];
}

export const CONSTELLATIONS: Record<Season, Constellation> = {
  winter: {
    name: "Canis Major",
    stars: [
      [30, 30, 2.6],
      [14, 38, 1.2],
      [46, 16, 1.2],
      [52, 56, 1.6],
      [38, 78, 1.4],
      [72, 72, 1],
      [20, 72, 1],
    ],
    lines: [
      [0, 1],
      [0, 2],
      [0, 3],
      [3, 4],
      [3, 5],
      [4, 6],
    ],
    prose: [
      "On that night, Sirius burned so bright it cast a shadow — the Great Dog stood high and patient, marking the hours until dawn.",
      "The longest nights of the year, and still the brightest star refused to leave the dark alone.",
      "Winter kept the sky clear that night. Canis Major watched over the whole cold world, and over them.",
    ],
  },
  spring: {
    name: "Leo",
    stars: [
      [26, 32, 2.2],
      [40, 22, 1.4],
      [54, 26, 1.2],
      [62, 40, 1.5],
      [48, 52, 1.3],
      [30, 50, 1.2],
      [70, 60, 1.1],
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 0],
      [3, 6],
    ],
    prose: [
      "That spring evening, Leo lay across the sky like something warm asleep in the sun — the way they used to.",
      "The blossom was falling and the Lion was rising. Everything was becoming something else that night.",
      "Spring turns the sky gently. Leo held the west, and they slipped quietly into all that light.",
    ],
  },
  summer: {
    name: "Cygnus",
    stars: [
      [50, 14, 2.4],
      [50, 40, 1.6],
      [50, 66, 1.4],
      [28, 42, 1.3],
      [72, 42, 1.3],
      [38, 78, 1.1],
      [62, 78, 1.1],
    ],
    lines: [
      [0, 1],
      [1, 2],
      [3, 1],
      [1, 4],
      [2, 5],
      [2, 6],
    ],
    prose: [
      "The Swan flew straight down the Milky Way that summer night — wings wide, carrying something home.",
      "Short nights, warm air, and Cygnus overhead with its wings spread. A good night to be let go gently.",
      "Summer skies keep no secrets. The Swan crossed the whole heaven while you sat with them.",
    ],
  },
  autumn: {
    name: "Pegasus",
    stars: [
      [30, 28, 1.8],
      [64, 28, 1.8],
      [64, 62, 1.7],
      [30, 62, 1.7],
      [16, 18, 1.3],
      [80, 18, 1.2],
      [22, 80, 1.1],
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [0, 4],
      [1, 5],
      [3, 6],
    ],
    prose: [
      "Pegasus stood square and steady that autumn night — four bright corners holding the sky still for them.",
      "The leaves were going and so were they. The winged horse simply waited, the way the sky always does.",
      "Autumn nights turn cold and clear. Pegasus took the whole eastern sky, and they were not alone in it.",
    ],
  },
};

export function seasonOf(month: number): Season {
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
}

export function getConstellation(date: Date): Constellation {
  const m = date.getUTCMonth() + 1;
  return CONSTELLATIONS[seasonOf(m)];
}

// Deterministic hash for a string seed, so a given memorial always gets the same line.
function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function getProse(c: Constellation, seed?: string): string {
  if (!c.prose.length) return "";
  if (seed) return c.prose[hashSeed(seed) % c.prose.length];
  return c.prose[Math.floor(Math.random() * c.prose.length)];
}

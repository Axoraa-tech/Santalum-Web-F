/** Seeded PRNG (mulberry32) so every mock is the same on every load. Never Math.random. */
export function rng(seed: number) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    /** Integer in [min, max], inclusive. */
    int: (min: number, max: number) => min + Math.floor(next() * (max - min + 1)),
    pick: <T>(arr: readonly T[]): T => arr[Math.floor(next() * arr.length)],
    chance: (p: number) => next() < p,
    /** Pick by weight. */
    weighted: <T>(items: readonly (readonly [T, number])[]): T => {
      const total = items.reduce((s, [, w]) => s + w, 0);
      let r = next() * total;
      for (const [v, w] of items) {
        r -= w;
        if (r <= 0) return v;
      }
      return items[items.length - 1][0];
    },
  };
}

export type Rng = ReturnType<typeof rng>;

/** FNV-1a, for seeding from strings. */
export function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

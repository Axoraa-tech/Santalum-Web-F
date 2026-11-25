/**
 * Class names for design 04. This project compiles every .css file through Tailwind as global CSS
 * (CSS modules are not hashed here), so the stylesheets use prefixed class names instead:
 * c4c- (chrome), c4- (rooms), c4r- (register and forms), c4s- (shop), c4m- (membership desk),
 * c4t- (shipping register), c4f- (footer), c4v- (visitors' book: reviews and questions). `s.frame` reads as "c4-frame".
 */
function prefixed(pre: string): Record<string, string> {
  return new Proxy({} as Record<string, string>, {
    get: (_, k) => (typeof k === "string" ? `${pre}${k}` : undefined),
  });
}

export const c = prefixed("c4c-");
export const s = prefixed("c4-");
export const r = prefixed("c4r-");
export const sh = prefixed("c4s-");
export const m = prefixed("c4m-");
export const t = prefixed("c4t-");
export const f = prefixed("c4f-");
export const v = prefixed("c4v-");

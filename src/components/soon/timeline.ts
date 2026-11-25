/** One cycle of the coming-soon film (seconds). Shared by the scene and the story. */
export const DRAW0 = 1.1; // the light lands; threading begins
export const DRAW = 5.0; // threading 108 beads
export const TIE0 = DRAW0 + DRAW + 0.5; // the ends meet; the knot is tied
export const TIE = 1.8;
export const REST0 = TIE0 + TIE; // the full view; the mala can be drawn
export const RET0 = REST0 + 8; // the beads return to the light
export const RET = 3.4;
export const LOOP = RET0 + RET + 0.8; // ...and it begins again

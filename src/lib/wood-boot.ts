export type Wood = "red" | "white";

export const WOOD_KEY = "santalum-wood";

/** Runs inline before first paint (see app/maison/layout.tsx) so the right wood shows with no flash. */
export const WOOD_BOOT_SCRIPT = `try{document.documentElement.dataset.wood=localStorage.getItem("${WOOD_KEY}")==="white"?"white":"red"}catch(e){document.documentElement.dataset.wood="red"}`;

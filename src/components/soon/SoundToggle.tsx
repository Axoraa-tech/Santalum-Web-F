"use client";

import { useEffect, useState } from "react";
import { onSound, setSound } from "./bowl";

const MUTED_KEY = "santalum:muted";

/**
 * Sound starts with the visitor's first touch, click or key press (browsers
 * forbid sound before that), unless they muted it on an earlier visit.
 * The button mutes and unmutes.
 */
export function SoundToggle() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const off = onSound(setOn);
    let muted = false;
    try {
      muted = localStorage.getItem(MUTED_KEY) === "1";
    } catch {}
    if (muted) return off;
    const first = (e: Event) => {
      if ((e.target as HTMLElement | null)?.closest?.("[data-sound-toggle]")) return;
      setSound(true);
      remove();
    };
    const remove = () => {
      window.removeEventListener("pointerdown", first);
      window.removeEventListener("keydown", first);
    };
    window.addEventListener("pointerdown", first);
    window.addEventListener("keydown", first);
    return () => {
      off();
      remove();
    };
  }, []);

  return (
    <button
      type="button"
      data-sound-toggle
      aria-pressed={on}
      aria-label={on ? "Mute sound" : "Play sound"}
      onClick={() => {
        const next = !on;
        setSound(next);
        try {
          localStorage.setItem(MUTED_KEY, next ? "0" : "1");
        } catch {}
      }}
      className="group flex items-center gap-3 text-[10px] tracking-[0.36em] text-walnut/80 uppercase transition-colors hover:text-night md:text-[11px]"
    >
      <span className="flex h-3 items-end gap-[3px]" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`w-[2px] rounded-full bg-current ${on ? "sound-bar" : ""}`}
            style={{ height: on ? undefined : 3, animationDelay: `${i * 0.18}s` }}
          />
        ))}
      </span>
      {on ? "Sound on" : "Sound off"}
    </button>
  );
}

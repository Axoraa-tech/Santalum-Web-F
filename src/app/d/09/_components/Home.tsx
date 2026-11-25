"use client";

import { useMotionValue, type MotionValue } from "motion/react";
import { useEffect } from "react";
import { Afternoon } from "./chapters/Afternoon";
import { Dawn } from "./chapters/Dawn";
import { Dusk } from "./chapters/Dusk";
import { Evening } from "./chapters/Evening";
import { Golden } from "./chapters/Golden";
import { Morning } from "./chapters/Morning";
import { Noon } from "./chapters/Noon";
import { CHAPTERS, DAY_END, T } from "./data";
import { Sky } from "./Sky";
import { Sundial } from "./Sundial";
import s from "../styles";

/**
 * Maps scroll position onto the clock. Each chapter's top is pinned to its start time and the
 * bottom of the page to 19:40, so the dial reads the chapter's hour the moment its scene arrives.
 */
function useDayClock(minutes: MotionValue<number>) {
  useEffect(() => {
    let ys: number[] = [];
    const update = () => {
      const y = window.scrollY;
      if (ys.length < 2) return;
      if (y <= ys[0]) return minutes.set(T[0]);
      for (let i = 1; i < ys.length; i++) {
        if (y <= ys[i]) {
          const k = (y - ys[i - 1]) / Math.max(1, ys[i] - ys[i - 1]);
          return minutes.set(T[i - 1] + (T[i] - T[i - 1]) * k);
        }
      }
      minutes.set(DAY_END);
    };
    const measure = () => {
      const next = [0];
      for (let i = 1; i < CHAPTERS.length; i++) {
        const el = document.getElementById(`ch-${CHAPTERS[i].key}`);
        const top = el ? el.getBoundingClientRect().top + window.scrollY : next[i - 1] + 1;
        next.push(Math.max(next[i - 1] + 1, top));
      }
      const end = document.documentElement.scrollHeight - window.innerHeight;
      next.push(Math.max(next[next.length - 1] + 1, end));
      ys = next;
      update();
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", measure);
    };
  }, [minutes]);
}

/** The home page: one day of rituals. */
export function DayHome() {
  const minutes = useMotionValue(CHAPTERS[0].min);
  useDayClock(minutes);
  return (
    <>
      <Sky minutes={minutes} />
      <Sundial minutes={minutes} mode="scroll" />
      <div className={s.swap}>
        <Dawn />
        <Morning />
        <Noon />
        <Afternoon />
        <Golden />
        <Dusk />
        <Evening />
      </div>
    </>
  );
}

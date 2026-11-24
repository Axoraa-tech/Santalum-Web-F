"use client";

import { motion, useMotionValue, useScroll, useTransform, type MotionValue } from "motion/react";
import { createContext, use, useRef, type CSSProperties, type ReactNode } from "react";
import { Photo } from "@/components/Photo";
import type { Tone } from "@/lib/catalog";
import type { PhotoRef } from "@/lib/photos";
import s from "../styles";
import { WIDE, useMedia } from "./store";

type Ctx = { p: MotionValue<number>; pin: MotionValue<number>; amp: number };
const SceneContext = createContext<Ctx | null>(null);

export function useScene() {
  return use(SceneContext);
}

function useDepth() {
  const wide = useMedia(WIDE);
  // a media-query store (not motion's hook) so the server and the first client render agree
  const reduce = useMedia("(prefers-reduced-motion: reduce)");
  return reduce ? 0 : wide ? 1 : 0.4;
}

/**
 * One part of the day. On wide screens the section is taller than the screen and its stage sticks,
 * so the layers inside drift at their own speeds while the scene holds. On phones it simply stacks.
 */
export function Chapter({
  id,
  len = "200vh",
  label,
  className = "",
  children,
}: {
  id: string;
  len?: string;
  label: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const { scrollYProgress: pin } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const amp = useDepth();
  return (
    <SceneContext value={{ p, pin, amp }}>
      <section
        ref={ref}
        id={`ch-${id}`}
        aria-label={label}
        className={`${s.chapter} ${className}`}
        style={{ "--len": len } as CSSProperties}
      >
        <div className={s.stage}>{children}</div>
      </section>
    </SceneContext>
  );
}

/** A non-sticky block with its own parallax progress. */
export function Scene({ id, className = "", children, label }: { id?: string; className?: string; children: ReactNode; label?: string }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const { scrollYProgress: pin } = useScroll({ target: ref, offset: ["start center", "end center"] });
  const amp = useDepth();
  return (
    <SceneContext value={{ p, pin, amp }}>
      <section ref={ref} id={id} aria-label={label} className={`relative ${className}`}>
        {children}
      </section>
    </SceneContext>
  );
}

/** A layer that drifts with the scene. Higher speed reads as nearer. */
export function Layer({
  speed = 0.3,
  className = "",
  style,
  children,
}: {
  speed?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  const ctx = useScene();
  const still = useMotionValue(0.5);
  const d = speed * 14 * (ctx?.amp ?? 0);
  const y = useTransform(ctx?.p ?? still, [0, 1], [`${d}vh`, `${-d}vh`]);
  return (
    <motion.div className={className} style={{ ...style, y }}>
      {children}
    </motion.div>
  );
}

/** A photograph cut into a shape. The photo drifts a little inside its mask. */
export function Cut({
  photo,
  tone,
  shape,
  className = "",
  sizes = "50vw",
  priority = false,
  niche = false,
  drift = 1,
}: {
  photo: PhotoRef;
  tone?: Tone;
  shape: "arch" | "circle" | "pebble" | "egg";
  className?: string;
  sizes?: string;
  priority?: boolean;
  niche?: boolean;
  drift?: number;
}) {
  const ctx = useScene();
  const still = useMotionValue(0.5);
  const d = 5 * drift * (ctx?.amp ?? 0);
  const y = useTransform(ctx?.p ?? still, [0, 1], [`${-d}%`, `${d}%`]);
  return (
    <div className={`${s.mask} ${s[shape]} ${niche ? s.niche : ""} ${className}`}>
      <motion.div className="absolute inset-[-7%]" style={{ y }}>
        <Photo p={photo} tone={tone} sizes={sizes} priority={priority} />
      </motion.div>
    </div>
  );
}

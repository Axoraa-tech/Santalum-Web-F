import type { CSSProperties, ReactNode } from "react";
import { Photo } from "@/components/Photo";
import type { Tone } from "@/lib/catalog";
import type { PhotoRef } from "@/lib/photos";
import { s } from "./cls";

export function cx(...a: (string | false | null | undefined)[]) {
  return a.filter(Boolean).join(" ");
}

/**
 * Place something on the wall (horizontal mode): x, y, width and height in vh.
 * `vw` is the width used in the stacked guide layout (phones).
 */
export function at(x: number, y: number, o: { wd?: number; ht?: number; vw?: string } = {}): CSSProperties {
  const v: Record<string, string | number> = { "--x": x, "--y": y };
  if (o.wd !== undefined) v["--wd"] = o.wd;
  if (o.ht !== undefined) v["--ht"] = o.ht;
  if (o.vw !== undefined) v["--vw"] = o.vw;
  return v as CSSProperties;
}

export function vars(v: Record<string, string | number>): CSSProperties {
  const out: Record<string, string | number> = {};
  for (const k in v) out[`--${k}`] = v[k];
  return out as CSSProperties;
}

/** A framed photograph: hairline frame, white mat, inner photo that drifts inside the frame as you walk. */
export function Frame({
  p,
  tone,
  alt,
  altTone,
  ar,
  className,
  style,
  sizes = "(min-width: 900px) 60vh, 92vw",
  light = false,
  dim = false,
  priority = false,
  children,
}: {
  p: PhotoRef;
  tone?: Tone;
  /** a second photograph, shown when the exhibit is lit (hover / focus) */
  alt?: PhotoRef;
  altTone?: Tone;
  ar: number;
  className?: string;
  style?: CSSProperties;
  sizes?: string;
  light?: boolean;
  dim?: boolean;
  priority?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className={cx(s.frame, className)} style={{ ...vars({ ar }), ...style }}>
      {light && (
        <>
          <span className={s.pool} aria-hidden="true" />
          <span className={s.fixture} aria-hidden="true" />
        </>
      )}
      <div className={s.frameIn}>
        <div className={s.par} data-par="">
          <Photo p={p} tone={tone} sizes={sizes} priority={priority} />
          {alt && <Photo p={{ id: alt.id, alt: "" }} tone={altTone} sizes={sizes} className={s.alt} />}
        </div>
      </div>
      {dim && <span className={s.dim} aria-hidden="true" />}
      {children}
    </div>
  );
}

/** One room of the corridor: a door frame on its left and a small room sign at the top. */
export function RoomShell({
  id,
  n,
  name,
  w,
  className,
  children,
}: {
  id: string;
  n: string;
  name: string;
  /** room width in vh (horizontal mode); omit to size the room by its content */
  w?: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section data-room={id} data-name={name} className={cx(s.room, className)} style={w ? vars({ w }) : undefined}>
      <p className={s.sign}>
        <span className={s.signN}>{/^\d+$/.test(n) ? `Room ${n}` : n}</span>
        <span className={s.signName}>{name}</span>
      </p>
      {children}
    </section>
  );
}

const SMALL = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
export function words(n: number) {
  return SMALL[n] ?? String(n);
}
export function capital(t: string) {
  return t.charAt(0).toUpperCase() + t.slice(1);
}

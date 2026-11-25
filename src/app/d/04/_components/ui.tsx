import type { CSSProperties, ReactNode } from "react";
import { WT } from "@/components/maison/W";
import type { PhotoRef } from "@/lib/photos";
import type { Tone } from "@/lib/shop/products";
import { s } from "./cls";
import { Pic, type Crop } from "./plates";
import { isNumbered, type Room } from "./rooms";

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
  crop,
  alt,
  altTone,
  altCrop,
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
  crop?: Crop;
  /** a second photograph, shown when the exhibit is lit (hover / focus) */
  alt?: PhotoRef;
  altTone?: Tone;
  altCrop?: Crop;
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
          <Pic p={p} tone={tone} crop={crop} sizes={sizes} priority={priority} />
          {alt && <Pic p={{ id: alt.id, alt: "" }} tone={altTone} crop={altCrop} sizes={sizes} className={s.alt} />}
        </div>
      </div>
      {dim && <span className={s.dim} aria-hidden="true" />}
      {children}
    </div>
  );
}

/** One room of the corridor: a door frame on its left and a small room sign at the top, named for each wood. */
export function RoomShell({
  room,
  w,
  className,
  children,
}: {
  room: Room;
  /** room width in vh (horizontal mode); omit to size the room by its content */
  w?: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section data-room={room.id} className={cx(s.room, className)} style={w ? vars({ w }) : undefined}>
      <p className={s.sign}>
        <span className={s.signN}>{isNumbered(room) ? `Room ${room.n}` : room.n}</span>
        <span className={s.signName}>
          <WT red={room.red} white={room.white} />
        </span>
      </p>
      {children}
    </section>
  );
}

/** An order number at display size: Bodoni's hyphen is a hairline, so the groups are joined by a drawn rule. */
export function OrderNo({ id }: { id: string }) {
  const parts = id.split("-");
  return (
    <>
      {parts.map((g, i) => (
        <span key={i}>
          {i > 0 && <span className="c4-dash">-</span>}
          {g}
        </span>
      ))}
    </>
  );
}

const SMALL = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
export function words(n: number) {
  return SMALL[n] ?? String(n);
}
export function capital(t: string) {
  return t.charAt(0).toUpperCase() + t.slice(1);
}

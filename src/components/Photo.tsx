import Image from "next/image";
import type { CSSProperties } from "react";
import { TONE_FILTER, type Tone } from "@/lib/shop/products";
import type { PhotoRef } from "@/lib/photos";

/** Full-cover photo for a positioned parent. `tone` warms or pales a placeholder photo to suit a wood. */
export function Photo({
  p,
  sizes = "100vw",
  priority = false,
  className = "",
  style,
  tone,
}: {
  p: PhotoRef;
  sizes?: string;
  priority?: boolean;
  className?: string;
  style?: CSSProperties;
  tone?: Tone;
}) {
  return (
    <Image
      src={p.id}
      alt={p.alt}
      fill
      sizes={sizes}
      quality={80}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      className={`object-cover ${className}`}
      style={tone ? { filter: TONE_FILTER[tone], ...style } : style}
    />
  );
}

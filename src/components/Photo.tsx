import Image from "next/image";
import type { CSSProperties } from "react";
import type { PhotoRef } from "@/lib/photos";

/** Full-cover photo for a positioned parent. */
export function Photo({
  p,
  sizes = "100vw",
  priority = false,
  className = "",
  style,
}: {
  p: PhotoRef;
  sizes?: string;
  priority?: boolean;
  className?: string;
  style?: CSSProperties;
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
      style={style}
    />
  );
}

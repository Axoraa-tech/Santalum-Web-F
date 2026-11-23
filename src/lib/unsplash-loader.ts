"use client";

/** next/image loader: Unsplash photo ids ("photo-…") are resized by Unsplash's own CDN. Other srcs pass through. */
export default function unsplashLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  if (src.startsWith("photo-")) {
    return `https://images.unsplash.com/${src}?w=${width}&q=${quality || 75}&auto=format&fit=crop`;
  }
  return src;
}

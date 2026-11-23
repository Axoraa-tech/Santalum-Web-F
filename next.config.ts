import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Photos are served and resized by the Unsplash CDN (see src/lib/unsplash-loader.ts).
    loader: "custom",
    loaderFile: "./src/lib/unsplash-loader.ts",
    qualities: [75, 80],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

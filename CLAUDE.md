@AGENTS.md

# Santalum Aroma — web

Client: **Santalum Aroma** ("Essence of Luxury Wood", Estd. 1985), a sandalwood brand. Agency: Axoraa.
This repo will become their e-commerce site. Today it holds the public coming-soon page and design explorations.

## Routes

- `/` — **the public coming-soon page** (`src/app/(home)/page.tsx`). One cinematic 3D shot (`src/components/soon/MalaScene.tsx`):
  a 108-bead red-sandalwood mala is lowered onto a polished studio floor under one warm spot light while the camera pulls back.
  Copy is only the brand, "Our website is coming soon.", email capture and socials. No products or photos on this page.
- `/options`, `/s1`–`/s10` — earlier coming-soon design options (review only; do not edit without asking).
- `/maison`, `/d/01`–`/d/10` — e-commerce design explorations (review only; do not edit without asking).

## Stack

Next 16 (App Router, `cacheComponents`), React 19, TypeScript, Tailwind 4 (`@theme` tokens in `src/app/globals.css`),
React Three Fiber + drei + three + @react-three/postprocessing, GSAP, Lenis, motion. Read `node_modules/next/dist/docs/` before using Next APIs (see AGENTS.md).

## Brand tokens (from the client's Brand Colours PDFs)

Never pure white or black. Main tokens (Tailwind classes `bg-night`, `text-dust`, etc.):
`night #1c1410` · `charcoal #1f2123` · `amber #8b5e3c` · `dust #c4975a` · `linen #f5f0e8` · `pale #e8e0d0` ·
`sand #c8b89a` · `wood #8b5a2b` · `walnut #5c4331` · `brass #b08d57` · `forest #374038` · `stone #a7a29a` · `rakta #6e2a1f`.
Type: `font-serif` = Cormorant Garamond (display), `font-sans` = Alegreya Sans (body), `font-deva` = Tiro Devanagari.
Logo: `public/brand/logo-mark.png` (tree monogram) and `public/brand/logo-lockup.png`, both cream on transparent.
They are extracted from a raster; replace them with a vector SVG from the client when available.

Voice: calm, warm, crafted, unhurried. Speak of heritage, care and scent; no hype or exclamation marks.

## 3D conventions

- Lazy-load every Canvas through a gate like `src/components/soon/SceneGate.tsx`: `next/dynamic` with `ssr: false`,
  start on idle, skip when WebGL is missing or `prefers-reduced-motion` is set, and keep a static CSS fallback.
- Cap DPR (`dpr={[1, 1.75]}` desktop, `1.25` mobile), reduce particle counts on mobile, avoid remote HDRs/textures
  (use procedural canvas textures or local, compressed assets).
- Realism toolkit used on `/`: procedural canvas wood textures, `MeshPhysicalMaterial` with clearcoat, drei `Environment`
  built from `Lightformer`s (no HDR download), soft spot-light shadows, `MeshReflectorMaterial` floor (desktop only), fog
  for a seamless studio, depth of field that follows the camera, bloom and vignette. Film grain is a monochrome CSS overlay
  (the RGB `Noise` pass leaves coloured specks on the beads).
- `next/image` uses the Unsplash custom loader; use a plain `<img>` for local brand assets.

## Workflow

Branch from `main` (`feat/...`), commit, push, open a PR to `main`. `dev` and `uat` are environment branches.
Run `npm run build` before every PR.

@AGENTS.md

# Santalum Aroma — web

Client: **Santalum Aroma** ("Essence of Luxury Wood", Estd. 1985), a sandalwood brand. Agency: Axoraa.
This repo will become their e-commerce site. Today it holds the public coming-soon page and design explorations.

## Routes

- `/` — **the public coming-soon page** (`src/app/(home)/page.tsx`). A looping cinematic 3D shot (`src/components/soon/`),
  "life ends in a loop": in a pale studio light falls from behind; a spark of light runs round a circle laying a thread
  and each of 108 red-sandalwood beads is born from the ray, glowing, then cools into wood (header counter = loader);
  the ends are knotted, guru bead and tassel settle, a singing bowl rings; the ring then rests and is elastic (drag,
  release); then the light runs back, beads rise into the light, and the cycle begins again. `MalaScene.tsx` holds the
  timeline, `Studio.tsx` the lights, rays and floor, `materials.ts` the textures and glow shader, `bowl.ts` the sound.
  `Inscriptions.tsx` carves classical Sanskrit lines on sandalwood (no deities) as faint turning rings on the floor.
  `Motifs.tsx` stands sepia-sketch watermarks (red/white sandalwood, lotus, a walking spotted deer) around the mala,
  made from public-domain 19th-century plates; sources and licences in `public/motifs/CREDITS.md`. No deities.
  Camera = one continuous take of blended rigs (drone descent, low gimbal follow, banking orbit, macro lead, crane
  reveal, drone drift, bird's-eye return) in `MalaScene.tsx` `Camera`; review any moment with `/?at=<s>&hold`.
  Copy is only the brand, "Our website is coming soon.", email capture and socials. No products, photos or deities.
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
  for a seamless studio, depth of field that follows the camera and vignette; `PerformanceMonitor` drops to a lite setup
  (no reflector or DOF, DPR 1) when the frame rate falls. Film grain is a monochrome CSS overlay
  (the RGB `Noise` pass leaves coloured specks on the beads).
- `next/image` uses the Unsplash custom loader; use a plain `<img>` for local brand assets.

## Workflow

Branch from `main` (`feat/...`), commit, push, open a PR to `main`. `dev` and `uat` are environment branches.
Run `npm run build` before every PR.

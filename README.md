# MAISON VELOCE

A portfolio site for a fictional luxury automobile house that sells and repairs hypercars and supercars.
Gallery-white, cinematic, and every visual carries commercial information: car prices, part prices,
labour, repair times and turnaround. **No WebGL, no canvas, no three.js** — every "3D" effect is CSS
transforms (`matrix()`, `perspective`), SVG and real photography.

Next.js 14 (App Router) · TypeScript · Tailwind · Zustand · Framer Motion (route transitions and modals only) · Lenis.

## Setup

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

Images are already processed into `public/`. To rebuild them from scratch:

```bash
pip install "rembg[cpu]" pillow numpy opencv-python-headless
npm run fetch-images -- candidates   # search Wikimedia Commons → assets-raw/_candidates/*.json
# review candidates, choose in scripts/picks.json
npm run fetch-images -- download     # download picks → assets-raw/{slug}/, write data/image-manifest.json
npm run process-images               # cutouts, normalise, shadows, paint variants → public/
```

`UNSPLASH_ACCESS_KEY` / `PEXELS_API_KEY` in `.env.local` are optional; without them only Wikimedia Commons is used.

## Pages

| Route | What |
|---|---|
| `/` | Showroom Wheel (Mechanic 1) · links to The Garage, All Cars and the Atelier · Heritage |
| `/garage` | The Garage — curved SVG rail (Mechanic 2) |
| `/cars` | All Cars — shuffle grid (Mechanic 3) |
| `/cars/[slug]` | Car Studio: Exterior spin · Interior · Disassemble · Specs · Ownership cost · finance / reserve / quote |
| `/atelier` | Floating parts or grid of services, service panels with before/after · Diagnostic visualiser |
| `/price-list` | Cars, parts and services; click any row for full specs and price |
| `/booking` | Multi-step booking with availability calendar |
| `/credits` | Every image with author, source and licence (generated from `data/image-manifest.json`) |

## The three carousel mechanics

All three are hand-written — no animation or physics library.

1. **Orbit Wheel** (`components/OrbitWheel`, `lib/orbit.ts`). Rotation θ, velocity and drag state live in refs.
   Every rAF frame, car *i* sits at angle `a = θ + i·2π/N`; `x = R·sin a`, `y = r·cos a`, depth `t = (cos a + 1)/2`,
   scale `0.45 + 0.55t`, all baked into one `matrix(s,0,0,s,x,y)` plus opacity/blur/z-index from `t`.
   Drag adds Δx/R to θ; release keeps velocity with `v *= 0.94` friction, then a hand-written ease-out snaps
   to the nearest car. React state changes only when the front car changes (the "In this car" panel).
   Wheel/trackpad (horizontal), arrow keys and clicking a car also rotate. The loop pauses off-screen.
2. **Curved Rail** (`components/CurvedRail`, `lib/rail.ts`). One inline SVG cubic Bézier. Cars are placed with
   `path.getPointAtLength()` at even intervals and rotated to the tangent. Hover/focus dims the rest
   (`opacity .3`, `grayscale(.8)`), lifts the car to 1.15 and moves an SVG radial-gradient spotlight — CSS
   transitions only. Filters re-space the survivors along the path. On mobile it becomes a snap-scroll strip.
3. **Shuffle Grid** (`components/ShuffleGrid`, `lib/shuffle.ts`). A button re-orders the array instantly
   (Fisher–Yates or `Array.sort`) and React re-renders with stable keys. No transition at all.
   Reused for All Cars, the Atelier grid and the Price List.

## Editing prices, rates and labour

- **Cars**: `data/cars.ts` (base price, status, specs, wheels, interior trims).
- **Paint options**: `scripts/paints.json` (shared with the image pipeline, which renders a variant per paint).
- **Parts** (explodable layers, part numbers, prices, labour hours, refurbish options): `data/parts.ts`.
  Prices are per service tier; labour is billed at the car's tier rate.
- **Services and labour rates**: `data/services.ts` (`LABOUR_RATES`: $250 / $320 / $450 per hour).
- **Currency rates, VAT, disclaimer**: `data/currency.ts` (update `RATES_LAST_UPDATED` when you change rates).

## Replacing imagery

Processed files follow `public/cars/{slug}/{view}-{640|1280|2400}.{webp,avif}`, where `view` is
`hero` (front ¾), `side`, `rear` (rear ¾), `alt`, `doors`, `interior-N` or `detail-N`. Cutouts sit on a
2400×1200 transparent canvas, car length 2000px, wheels on the y=1060 baseline, generated contact shadow.
`data/image-meta.json` lists which views exist per car.

- **360° spin** — real 36-frame sets are rarely free, so the spin is built from the real angles listed in
  `data/spin.json` (`angle`: 0 = nose to camera, 90 = left profile, 180 = tail) and mirrored to fill the other
  side, interpolated with a crossfade + slight scale/skew. If you get a true frame set, add the frames as views
  and list them in `spin.json` at 10° steps.
- **Interior** — with interior photos the viewer is a drag-to-pan panoramic strip; without, a CSS 3D cube with
  illustrated faces. Replace with a 6-face panorama by adding `interior/cube_{front,back,left,right,top,bottom}`.
- **Exploded view** — aligned per-part photo layers don't exist publicly, so parts are SVG technical drawings on
  a shared 1200×520 viewBox (`components/ExplodedLayers`). The real side photo crossfades out as the slider moves.
- **Paint variants** — hue/luminance recolour of body panels only; labelled "visualisation" in the UI.

## Accessibility & motion

Keyboard control for the wheel (← →), spin, interior (arrows), rail, grids, studio tabs and hotspots;
visible focus rings; ARIA labels and live regions. `prefers-reduced-motion` removes inertia and snaps instantly.

## Licences

Photos come from Wikimedia Commons under CC BY / CC BY-SA / CC0 / public-domain licences; see `/credits`.
Maison Veloce is fictional and not affiliated with any manufacturer shown. Testimonials are sample content.

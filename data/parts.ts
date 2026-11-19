/**
 * Explodable parts. Each car gets 14 layers built from these templates, priced
 * by its service tier and named after its own drivetrain. All figures sample USD.
 */
import type { Tier } from "./services";

export type ExplodeVector = { x: number; y: number; rotate: number; scale: number };

export type Part = {
  id: string;
  name: string;
  partNumber: string;
  material: string;
  weightKg: number;
  priceUSD: number;
  labourHours: number;
  turnaround: string;
  refurbishOption?: { priceUSD: number; turnaround: string };
  lifespan: string;
  /** key of the SVG layer drawn in ExplodedLayers */
  layer: LayerKey;
  explodeVector: ExplodeVector;
  zIndex: number;
};

export type LayerKey =
  | "body" | "door" | "hood" | "bumper-front" | "bumper-rear"
  | "wheel-fl" | "wheel-rl" | "wheel-fr" | "wheel-rr"
  | "brakes" | "engine" | "gearbox" | "suspension" | "seats" | "exhaust" | "battery";

type Template = Omit<Part, "id" | "partNumber" | "priceUSD" | "refurbishOption" | "name" | "material"> & {
  name: string | ((c: PartContext) => string);
  material: string | ((c: PartContext) => string);
  basePrice: Record<Tier, number>;
  refurb?: { factor: number; turnaround: string };
  code: string;
};

export type PartContext = { make: string; engineShort: string; isEV: boolean; isHybrid: boolean; tier: Tier; doorType: string };

const TEMPLATES: Template[] = [
  { layer: "body", code: "BDY", name: "Carbon monocoque body shell", material: (c) => (c.make === "Rolls-Royce" || c.make === "Aston Martin" ? "Bonded aluminium spaceframe" : "Carbon-fibre monocoque"), weightKg: 98, basePrice: { 1: 42000, 2: 88000, 3: 410000 }, labourHours: 120, turnaround: "6–10 weeks", lifespan: "Lifetime of vehicle", explodeVector: { x: 0, y: -40, rotate: 0, scale: 1 }, zIndex: 5 },
  { layer: "door", code: "DR", name: (c) => `${c.doorType} door assembly (LH)`, material: "Carbon-fibre outer, aluminium frame", weightKg: 14, basePrice: { 1: 9800, 2: 18500, 3: 64000 }, refurb: { factor: 0.32, turnaround: "6 days" }, labourHours: 9, turnaround: "2–3 weeks", lifespan: "Lifetime · hinge/strut service 5 yrs", explodeVector: { x: -30, y: -250, rotate: -8, scale: 1 }, zIndex: 9 },
  { layer: "hood", code: "HD", name: (c) => (c.isEV ? "Front luggage lid" : "Front bonnet / frunk lid"), material: "Carbon fibre, clear-coated", weightKg: 6.2, basePrice: { 1: 4200, 2: 8900, 3: 31000 }, refurb: { factor: 0.35, turnaround: "4 days" }, labourHours: 4, turnaround: "1–2 weeks", lifespan: "Lifetime", explodeVector: { x: 120, y: -230, rotate: 10, scale: 1 }, zIndex: 8 },
  { layer: "bumper-front", code: "FBM", name: "Front bumper & splitter", material: "Carbon fibre / polyurethane", weightKg: 7.4, basePrice: { 1: 5600, 2: 11200, 3: 48000 }, refurb: { factor: 0.3, turnaround: "5 days" }, labourHours: 6, turnaround: "1–2 weeks", lifespan: "Lifetime · splitter wear item", explodeVector: { x: 260, y: -40, rotate: 0, scale: 1 }, zIndex: 8 },
  { layer: "bumper-rear", code: "RDF", name: "Rear bumper & diffuser", material: "Carbon fibre", weightKg: 8.1, basePrice: { 1: 6400, 2: 12800, 3: 52000 }, refurb: { factor: 0.3, turnaround: "5 days" }, labourHours: 7, turnaround: "1–2 weeks", lifespan: "Lifetime", explodeVector: { x: -260, y: -40, rotate: 0, scale: 1 }, zIndex: 8 },
  { layer: "wheel-fl", code: "WHF", name: "Forged wheel & tyre (front left)", material: "Forged aluminium, Cup 2 tyre", weightKg: 19, basePrice: { 1: 4800, 2: 7600, 3: 46000 }, refurb: { factor: 0.12, turnaround: "3 days" }, labourHours: 1, turnaround: "3–7 days", lifespan: "Tyre 8–15k km · wheel lifetime", explodeVector: { x: 40, y: 175, rotate: 40, scale: 1 }, zIndex: 12 },
  { layer: "wheel-rl", code: "WHR", name: "Forged wheel & tyre (rear left)", material: "Forged aluminium, Cup 2 tyre", weightKg: 22, basePrice: { 1: 5200, 2: 8200, 3: 48000 }, refurb: { factor: 0.12, turnaround: "3 days" }, labourHours: 1, turnaround: "3–7 days", lifespan: "Tyre 6–12k km · wheel lifetime", explodeVector: { x: -40, y: 175, rotate: -40, scale: 1 }, zIndex: 12 },
  { layer: "wheel-fr", code: "WHF", name: "Forged wheel & tyre (front right)", material: "Forged aluminium, Cup 2 tyre", weightKg: 19, basePrice: { 1: 4800, 2: 7600, 3: 46000 }, refurb: { factor: 0.12, turnaround: "3 days" }, labourHours: 1, turnaround: "3–7 days", lifespan: "Tyre 8–15k km · wheel lifetime", explodeVector: { x: -250, y: 95, rotate: 30, scale: 0.88 }, zIndex: 1 },
  { layer: "wheel-rr", code: "WHR", name: "Forged wheel & tyre (rear right)", material: "Forged aluminium, Cup 2 tyre", weightKg: 22, basePrice: { 1: 5200, 2: 8200, 3: 48000 }, refurb: { factor: 0.12, turnaround: "3 days" }, labourHours: 1, turnaround: "3–7 days", lifespan: "Tyre 6–12k km · wheel lifetime", explodeVector: { x: 250, y: 95, rotate: -30, scale: 0.88 }, zIndex: 1 },
  { layer: "brakes", code: "CCB", name: "Carbon-ceramic brake set (front)", material: "Carbon-ceramic disc, 10-piston monobloc caliper", weightKg: 14, basePrice: { 1: 9500, 2: 16000, 3: 40000 }, labourHours: 5, turnaround: "2–7 days (parts lead time)", lifespan: "Discs 60–100k km road use", explodeVector: { x: 170, y: 95, rotate: 0, scale: 1.05 }, zIndex: 11 },
  { layer: "engine", code: "ENG", name: (c) => (c.isEV ? `${c.engineShort} drive unit` : `${c.engineShort} engine assembly`), material: (c) => (c.isEV ? "Permanent-magnet synchronous motor" : "Aluminium block, forged internals"), weightKg: 210, basePrice: { 1: 68000, 2: 135000, 3: 720000 }, refurb: { factor: 0.42, turnaround: "6–8 weeks" }, labourHours: 36, turnaround: "6–12 weeks", lifespan: "Rebuild 80–120k km (track use sooner)", explodeVector: { x: -60, y: -150, rotate: 0, scale: 1.08 }, zIndex: 7 },
  { layer: "gearbox", code: "GBX", name: (c) => (c.isEV ? "Two-speed transmission" : "Dual-clutch gearbox"), material: "Magnesium casing", weightKg: 140, basePrice: { 1: 32000, 2: 54000, 3: 260000 }, refurb: { factor: 0.4, turnaround: "3–5 weeks" }, labourHours: 22, turnaround: "4–8 weeks", lifespan: "Clutch pack 40–60k km", explodeVector: { x: -210, y: -110, rotate: 0, scale: 1.04 }, zIndex: 6 },
  { layer: "suspension", code: "SUS", name: "Adaptive suspension corner", material: "Aluminium wishbones, adaptive damper", weightKg: 11, basePrice: { 1: 3600, 2: 6800, 3: 19000 }, refurb: { factor: 0.4, turnaround: "4 days" }, labourHours: 4, turnaround: "1 week", lifespan: "Dampers 60–80k km", explodeVector: { x: -10, y: -95, rotate: 0, scale: 1 }, zIndex: 10 },
  { layer: "seats", code: "STS", name: "Carbon bucket seats (pair)", material: "Carbon shell, Alcantara / semi-aniline", weightKg: 22, basePrice: { 1: 14000, 2: 24000, 3: 68000 }, refurb: { factor: 0.3, turnaround: "2 weeks (retrim)" }, labourHours: 3, turnaround: "2–4 weeks", lifespan: "Retrim ~8–10 yrs", explodeVector: { x: 20, y: -300, rotate: 0, scale: 1 }, zIndex: 6 },
  { layer: "exhaust", code: "EXH", name: "Titanium exhaust system", material: "Grade 2 titanium, Inconel tips", weightKg: 9.5, basePrice: { 1: 9000, 2: 16000, 3: 58000 }, refurb: { factor: 0.25, turnaround: "5 days" }, labourHours: 6, turnaround: "1–2 weeks", lifespan: "Lifetime · mounts 5 yrs", explodeVector: { x: -300, y: 90, rotate: 0, scale: 1 }, zIndex: 4 },
  { layer: "battery", code: "HVB", name: "High-voltage battery pack", material: "Lithium-ion pouch cells, liquid cooled", weightKg: 88, basePrice: { 1: 28000, 2: 46000, 3: 190000 }, refurb: { factor: 0.35, turnaround: "2–3 weeks (module swap)" }, labourHours: 10, turnaround: "3–6 weeks", lifespan: "8 yrs / 160k km warranty typical", explodeVector: { x: 0, y: 200, rotate: 0, scale: 1 }, zIndex: 3 },
];

const LABOUR: Record<Tier, number> = { 1: 250, 2: 320, 3: 450 };

/** Builds the 14–15 explodable parts for one car. */
export function buildParts(slugCode: string, ctx: PartContext): Part[] {
  return TEMPLATES.filter((t) => t.layer !== "battery" || ctx.isEV || ctx.isHybrid)
    .filter((t) => t.layer !== "exhaust" || !ctx.isEV)
    .map((t, i) => {
      const price = t.basePrice[ctx.tier];
      const tierHours = Math.round(t.labourHours * (ctx.tier === 3 ? 1.6 : ctx.tier === 2 ? 1.2 : 1));
      return {
        id: `${t.layer}`,
        name: typeof t.name === "function" ? t.name(ctx) : t.name,
        material: typeof t.material === "function" ? t.material(ctx) : t.material,
        partNumber: `${slugCode}-${t.code}-${String(1100 + i * 37).padStart(4, "0")}${t.layer.endsWith("r") || t.layer.endsWith("rr") ? "R" : ""}`,
        priceUSD: price,
        labourHours: tierHours,
        turnaround: t.turnaround,
        refurbishOption: t.refurb ? { priceUSD: Math.round((price * t.refurb.factor) / 50) * 50 + tierHours * LABOUR[ctx.tier], turnaround: t.refurb.turnaround } : undefined,
        lifespan: t.lifespan,
        layer: t.layer,
        weightKg: t.weightKg,
        explodeVector: t.explodeVector,
        zIndex: t.zIndex,
      };
    });
}

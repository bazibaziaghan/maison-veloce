/**
 * The ten cars. Prices are indicative USD starting prices — edit freely.
 * Paint options live in scripts/paints.json (shared with the image pipeline,
 * which renders a "visualisation" variant of every cutout per paint).
 */
import paintsJson from "@/scripts/paints.json";
import imageMeta from "./image-meta.json";
import spinJson from "./spin.json";
import { buildParts, type Part } from "./parts";
import type { Tier } from "./services";

export type CarStatus = "New" | "Pre-owned" | "Reserved" | "Sold";
export type View = "hero" | "side" | "rear" | "alt" | "doors";

export type Paint = { id: string; name: string; hex: string; priceUSD: number; factory?: boolean };
export type WheelOption = { id: string; name: string; finish: string; priceUSD: number; caliper: string };
export type InteriorTrim = { id: string; name: string; material: string; swatch: [string, string]; priceUSD: number; tint: string };
/** A keyframe of the image-based 360° spin: which processed view sits at which yaw angle. */
export type SpinKey = { view: View; angle: number; flip?: boolean };

export type Car = {
  slug: string;
  make: string;
  model: string;
  year: number;
  status: CarStatus;
  basePriceUSD: number;
  engine: string;
  engineShort: string;
  layout: string;
  displacement: string;
  hp: number;
  torque: number;
  zeroToHundred: number;
  zeroToTwoHundred: number;
  topSpeed: number | null;
  weight: number;
  transmission: string;
  drivetrain: string;
  powertrain: "ICE" | "Hybrid" | "EV";
  doorType: "Dihedral" | "Butterfly" | "Scissor" | "Conventional" | "Coach";
  mileage?: number;
  range?: number;
  dimensions: { length: number; width: number; height: number; wheelbase: number };
  tagline: string;
  colors: Paint[];
  wheels: WheelOption[];
  interiors: InteriorTrim[];
  layers: Part[];
  serviceTier: Tier;
  spin: SpinKey[];
  views: string[];
  arrived: string; // ISO date it arrived in the showroom (for "Newest" sort)
};

type Seed = Omit<Car, "colors" | "layers" | "views" | "engineShort"> & { engineShort: string; code: string };

const paints = paintsJson as Record<string, Paint[]>;
const meta = imageMeta as Record<string, string[]>;

const WHEELS = (tier: Tier, std: string): WheelOption[] => [
  { id: "standard", name: std, finish: "Gloss black", priceUSD: 0, caliper: "Black" },
  { id: "forged", name: "Ultra-lightweight forged", finish: "Satin graphite", priceUSD: tier === 3 ? 58000 : tier === 2 ? 9800 : 6400, caliper: "Racing red" },
  { id: "carbon", name: "Carbon-fibre wheels", finish: "Exposed carbon", priceUSD: tier === 3 ? 92000 : tier === 2 ? 22500 : 16200, caliper: "Papaya" },
];

const TRIMS = (tier: Tier): InteriorTrim[] => [
  { id: "alcantara", name: "Performance", material: "Alcantara with contrast stitch", swatch: ["#2A2A2C", "#D4D1C8"], priceUSD: 0, tint: "#2B2B2E" },
  { id: "semi-aniline", name: "Luxury", material: "Semi-aniline leather", swatch: ["#8B5A3C", "#E6DAC6"], priceUSD: tier === 3 ? 42000 : tier === 2 ? 8400 : 5200, tint: "#7A4A30" },
  { id: "bespoke", name: "Bespoke", material: "Full-grain leather, open-pore carbon", swatch: ["#E7E2D6", "#B3121B"], priceUSD: tier === 3 ? 96000 : tier === 2 ? 19800 : 12400, tint: "#D8D0C0" },
];

const SEEDS: Seed[] = [
  { slug: "mclaren-750s", code: "MCL750", make: "McLaren", model: "750S", year: 2025, status: "New", basePriceUSD: 332000, engine: "4.0L twin-turbo V8", engineShort: "M840T 4.0L V8", layout: "Mid-engine, RWD", displacement: "3,994 cc", hp: 740, torque: 800, zeroToHundred: 2.8, zeroToTwoHundred: 7.2, topSpeed: 332, weight: 1389, transmission: "7-speed SSG dual-clutch", drivetrain: "RWD", powertrain: "ICE", doorType: "Dihedral", dimensions: { length: 4569, width: 1930, height: 1196, wheelbase: 2670 }, tagline: "Lighter, sharper, louder — the purest McLaren supercar.", wheels: WHEELS(2, "10-spoke lightweight"), interiors: TRIMS(2), serviceTier: 2, spin: [], arrived: "2026-10-28" },
  { slug: "mclaren-artura", code: "MCLART", make: "McLaren", model: "Artura", year: 2025, status: "New", basePriceUSD: 250000, engine: "3.0L twin-turbo V6 hybrid", engineShort: "M630 3.0L V6 hybrid", layout: "Mid-engine, RWD", displacement: "2,993 cc", hp: 690, torque: 720, zeroToHundred: 3.0, zeroToTwoHundred: 8.3, topSpeed: 330, weight: 1498, transmission: "8-speed dual-clutch", drivetrain: "RWD", powertrain: "Hybrid", doorType: "Dihedral", range: 33, dimensions: { length: 4539, width: 1976, height: 1193, wheelbase: 2640 }, tagline: "McLaren's high-performance hybrid, electrified to the core.", wheels: WHEELS(1, "15-spoke ultra-lightweight"), interiors: TRIMS(1), serviceTier: 1, spin: [], arrived: "2026-09-14" },
  { slug: "bugatti-chiron-super-sport", code: "BUGCSS", make: "Bugatti", model: "Chiron Super Sport", year: 2022, status: "Pre-owned", mileage: 2400, basePriceUSD: 3825000, engine: "8.0L quad-turbo W16", engineShort: "8.0L W16", layout: "Mid-engine, AWD", displacement: "7,993 cc", hp: 1578, torque: 1600, zeroToHundred: 2.4, zeroToTwoHundred: 5.8, topSpeed: 440, weight: 1995, transmission: "7-speed DSG", drivetrain: "AWD", powertrain: "ICE", doorType: "Conventional", dimensions: { length: 4544, width: 2038, height: 1212, wheelbase: 2711 }, tagline: "Long-tail W16 grand tourer built for 440 km/h.", wheels: WHEELS(3, "Super Sport forged"), interiors: TRIMS(3), serviceTier: 3, spin: [], arrived: "2026-07-02" },
  { slug: "bugatti-tourbillon", code: "BUGTRB", make: "Bugatti", model: "Tourbillon", year: 2026, status: "Reserved", basePriceUSD: 4100000, engine: "8.3L V16 hybrid", engineShort: "8.3L V16 hybrid", layout: "Mid-engine, AWD", displacement: "8,300 cc", hp: 1775, torque: 1800, zeroToHundred: 2.0, zeroToTwoHundred: 5.0, topSpeed: 445, weight: 1995, transmission: "8-speed dual-clutch", drivetrain: "AWD", powertrain: "Hybrid", doorType: "Dihedral", range: 60, dimensions: { length: 4671, width: 2050, height: 1189, wheelbase: 2740 }, tagline: "Naturally aspirated V16, three motors, one hypercar century.", wheels: WHEELS(3, "Turbine forged"), interiors: TRIMS(3), serviceTier: 3, spin: [], arrived: "2026-11-10" },
  { slug: "porsche-911-gt3-rs", code: "POR992R", make: "Porsche", model: "911 GT3 RS", year: 2025, status: "New", basePriceUSD: 242000, engine: "4.0L naturally aspirated flat-6", engineShort: "4.0L flat-six", layout: "Rear-engine, RWD", displacement: "3,996 cc", hp: 518, torque: 465, zeroToHundred: 3.2, zeroToTwoHundred: 10.6, topSpeed: 296, weight: 1450, transmission: "7-speed PDK", drivetrain: "RWD", powertrain: "ICE", doorType: "Conventional", dimensions: { length: 4572, width: 1900, height: 1322, wheelbase: 2457 }, tagline: "992-generation track weapon with 860 kg of downforce.", wheels: WHEELS(1, "Forged centre-lock"), interiors: TRIMS(1), serviceTier: 1, spin: [], arrived: "2026-10-05" },
  { slug: "porsche-taycan-turbo-gt", code: "PORTGT", make: "Porsche", model: "Taycan Turbo GT", year: 2025, status: "New", basePriceUSD: 231000, engine: "Dual-motor EV", engineShort: "Dual-motor", layout: "Dual-motor, AWD", displacement: "—", hp: 1092, torque: 1340, zeroToHundred: 2.2, zeroToTwoHundred: 6.6, topSpeed: 290, weight: 2220, transmission: "2-speed rear transmission", drivetrain: "AWD", powertrain: "EV", doorType: "Conventional", range: 555, dimensions: { length: 4968, width: 1966, height: 1381, wheelbase: 2904 }, tagline: "Up to 1,092 hp on overboost. The fastest Porsche saloon ever.", wheels: WHEELS(1, "Aero forged"), interiors: TRIMS(1), serviceTier: 1, spin: [], arrived: "2026-08-21" },
  { slug: "ferrari-sf90-stradale", code: "FERSF90", make: "Ferrari", model: "SF90 Stradale", year: 2024, status: "New", basePriceUSD: 528000, engine: "4.0L twin-turbo V8 plug-in hybrid", engineShort: "F154 4.0L V8 PHEV", layout: "Mid-engine, AWD", displacement: "3,990 cc", hp: 986, torque: 800, zeroToHundred: 2.5, zeroToTwoHundred: 6.7, topSpeed: 340, weight: 1570, transmission: "8-speed dual-clutch", drivetrain: "AWD", powertrain: "Hybrid", doorType: "Conventional", range: 25, dimensions: { length: 4710, width: 1972, height: 1186, wheelbase: 2650 }, tagline: "Maranello's first series-production plug-in hybrid.", wheels: WHEELS(2, "Forged 5-twin-spoke"), interiors: TRIMS(2), serviceTier: 2, spin: [], arrived: "2026-06-18" },
  { slug: "lamborghini-revuelto", code: "LAMRVT", make: "Lamborghini", model: "Revuelto", year: 2025, status: "New", basePriceUSD: 608000, engine: "6.5L V12 hybrid", engineShort: "L545 6.5L V12 hybrid", layout: "Mid-engine, AWD", displacement: "6,498 cc", hp: 1001, torque: 725, zeroToHundred: 2.5, zeroToTwoHundred: 7.0, topSpeed: 350, weight: 1772, transmission: "8-speed transverse DCT", drivetrain: "AWD", powertrain: "Hybrid", doorType: "Scissor", range: 10, dimensions: { length: 4947, width: 2033, height: 1160, wheelbase: 2779 }, tagline: "The first V12 HPEV — 1,001 hp and scissor doors.", wheels: WHEELS(2, "Forged Altanius"), interiors: TRIMS(2), serviceTier: 2, spin: [], arrived: "2026-11-01" },
  { slug: "rolls-royce-spectre", code: "RRSPC", make: "Rolls-Royce", model: "Spectre", year: 2025, status: "New", basePriceUSD: 420000, engine: "Dual-motor EV", engineShort: "Dual-motor", layout: "Dual-motor, AWD", displacement: "—", hp: 577, torque: 900, zeroToHundred: 4.5, zeroToTwoHundred: 14.2, topSpeed: 250, weight: 2975, transmission: "Single-speed", drivetrain: "AWD", powertrain: "EV", doorType: "Coach", range: 530, dimensions: { length: 5475, width: 2017, height: 1573, wheelbase: 3210 }, tagline: "The first fully electric Rolls-Royce. Silent, monumental.", wheels: WHEELS(2, "23-inch part-polished"), interiors: TRIMS(2), serviceTier: 2, spin: [], arrived: "2026-05-30" },
  { slug: "aston-martin-db12", code: "AMDB12", make: "Aston Martin", model: "DB12", year: 2024, status: "Pre-owned", mileage: 6800, basePriceUSD: 250000, engine: "4.0L twin-turbo V8", engineShort: "4.0L V8", layout: "Front-mid engine, RWD", displacement: "3,982 cc", hp: 671, torque: 800, zeroToHundred: 3.6, zeroToTwoHundred: 9.4, topSpeed: 325, weight: 1685, transmission: "8-speed automatic", drivetrain: "RWD", powertrain: "ICE", doorType: "Conventional", dimensions: { length: 4725, width: 1980, height: 1295, wheelbase: 2805 }, tagline: "The world's first 'Super Tourer'. Grand, quick, beautifully made.", wheels: WHEELS(1, "21-inch forged"), interiors: TRIMS(1), serviceTier: 1, spin: [], arrived: "2026-04-11" },
];

/**
 * Spin keyframes — the yaw angle each processed view represents (0 = nose to camera,
 * 90 = left profile, 180 = tail, 270 = right profile). Views are mirrored with CSS
 * to fill the opposite side. Set after eyeballing each cutout's orientation.
 */
const SPIN = spinJson as Record<string, SpinKey[]>;

export const CARS: Car[] = SEEDS.map(({ code, ...s }) => ({
  ...s,
  colors: paints[s.slug] ?? [],
  views: meta[s.slug] ?? [],
  spin: SPIN[s.slug] ?? [{ view: "hero", angle: 45 }],
  layers: buildParts(code, {
    make: s.make,
    engineShort: s.engineShort,
    isEV: s.powertrain === "EV",
    isHybrid: s.powertrain === "Hybrid",
    tier: s.serviceTier,
    doorType: s.doorType,
  }),
}));

export const MARQUES = Array.from(new Set(CARS.map((c) => c.make)));

export const carBySlug = (slug: string) => CARS.find((c) => c.slug === slug);

/** Path of a processed image. Views are cutouts on transparent canvases; photos are full-bleed. */
export const carImg = (slug: string, view: string, size: 640 | 1280 | 2400 = 1280, paint?: string) =>
  paint && paint !== "factory" && size !== 2400 ? `/cars/${slug}/${view}-${paint}-${size}.webp` : `/cars/${slug}/${view}-${size}.webp`;

export const hasView = (car: Car, view: string) => car.views.includes(view);
export const interiorShots = (car: Car) => car.views.filter((v) => v.startsWith("interior"));
export const detailShots = (car: Car) => car.views.filter((v) => v.startsWith("detail"));

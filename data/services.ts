/** Sample workshop menu. All figures are indicative estimates in USD — edit freely. */
export type Tier = 1 | 2 | 3;

export const LABOUR_RATES: Record<Tier, number> = { 1: 250, 2: 320, 3: 450 };

export const TIER_LABEL: Record<Tier, string> = {
  1: "Tier 1 · Porsche, Aston Martin, McLaren Artura",
  2: "Tier 2 · McLaren, Ferrari, Lamborghini, Rolls-Royce",
  3: "Tier 3 · Bugatti",
};

export type ServiceCategory =
  | "Diagnostics"
  | "Maintenance"
  | "Brakes"
  | "Drivetrain"
  | "Engine"
  | "Hybrid & EV"
  | "Chassis"
  | "Wheels & Tyres"
  | "Performance"
  | "Paint & Body"
  | "Interior"
  | "Logistics";

export type Service = {
  id: string;
  name: string;
  category: ServiceCategory;
  /** Total customer price per tier (parts + labour). Missing tier = not offered. */
  priceByTier: Partial<Record<Tier, number>>;
  /** True when the top tier figure is a "from" price (e.g. $300,000+). */
  priceIsFrom?: boolean;
  labourHours: { min: number; max: number };
  turnaround: { min: number; max: number; unit: "hours" | "days" | "weeks"; note?: string };
  warranty: string;
  includes: string[];
  description: string;
  /** Part illustration key used by Atelier floating parts */
  part?: string;
  /** Diagnostic zones this service relates to */
  zones: string[];
};

const s = (x: Service) => x;

export const SERVICES: Service[] = [
  s({ id: "diagnostic", name: "Full diagnostic scan & health report", category: "Diagnostics", priceByTier: { 1: 350, 2: 600, 3: 2500 }, labourHours: { min: 2, max: 2 }, turnaround: { min: 0, max: 0, unit: "days", note: "Same day" }, warranty: "—", includes: ["Factory-tool scan of every module", "Fault-code history & freeze frames", "Battery & charging test", "Written health report with photos"], description: "A complete electronic and visual health check using manufacturer diagnostic tooling, delivered as a written report.", part: "ecu", zones: ["electrics", "engine"] }),
  s({ id: "annual-service", name: "Annual service (oil, filters, fluids, inspection)", category: "Maintenance", priceByTier: { 1: 1800, 2: 4500, 3: 25000 }, labourHours: { min: 6, max: 10 }, turnaround: { min: 1, max: 2, unit: "days" }, warranty: "12 months", includes: ["Engine oil & filter", "Air & cabin filters", "Brake fluid check", "Coolant top-up", "120-point inspection", "Service book stamp"], description: "Manufacturer-schedule annual service with genuine fluids and filters, recorded in the digital service history.", part: "engine-v8", zones: ["engine"] }),
  s({ id: "major-service", name: "Major service (plugs, belts, all fluids, 150-pt check)", category: "Maintenance", priceByTier: { 1: 4500, 2: 9500, 3: 45000 }, labourHours: { min: 16, max: 24 }, turnaround: { min: 3, max: 5, unit: "days" }, warranty: "12 months", includes: ["Spark plugs", "Auxiliary belts", "All fluids incl. gearbox", "150-point inspection", "Road test & report"], description: "The big one: every consumable replaced, every system inspected, with a full road-test report.", part: "engine-v12", zones: ["engine", "gearbox"] }),
  s({ id: "brakes-steel", name: "Brake pads + rotors (steel)", category: "Brakes", priceByTier: { 1: 2800 }, labourHours: { min: 4, max: 4 }, turnaround: { min: 1, max: 1, unit: "days" }, warranty: "12 months", includes: ["OEM pads & rotors", "Brake fluid flush", "Bedding-in procedure"], description: "Genuine steel rotors and pads with fluid flush and bedding-in.", part: "caliper", zones: ["brakes-front", "brakes-rear"] }),
  s({ id: "brakes-ccm", name: "Carbon-ceramic disc + pad set (per axle)", category: "Brakes", priceByTier: { 1: 9500, 2: 16000, 3: 40000 }, labourHours: { min: 5, max: 5 }, turnaround: { min: 2, max: 7, unit: "days", note: "Parts lead time" }, warranty: "24 months", includes: ["Carbon-ceramic discs (pair)", "Pad set", "Wear-sensor replacement", "Fluid flush", "Bedding-in"], description: "Carbon-ceramic discs and pads, per axle, measured and fitted to factory torque specs.", part: "caliper", zones: ["brakes-front", "brakes-rear"] }),
  s({ id: "clutch", name: "Clutch replacement (DCT clutch pack)", category: "Drivetrain", priceByTier: { 1: 9000, 2: 18000, 3: 60000 }, labourHours: { min: 20, max: 30 }, turnaround: { min: 5, max: 10, unit: "days" }, warranty: "24 months", includes: ["Dual-clutch pack", "Gearbox oil", "Clutch adaptation", "Road test"], description: "Dual-clutch pack replacement with full adaptation and gearbox oil change.", part: "gearbox", zones: ["gearbox"] }),
  s({ id: "gearbox-rebuild", name: "Gearbox rebuild", category: "Drivetrain", priceByTier: { 1: 18000, 2: 35000, 3: 120000 }, labourHours: { min: 40, max: 60 }, turnaround: { min: 3, max: 5, unit: "weeks" }, warranty: "24 months", includes: ["Strip & inspect", "Bearings & seals", "Synchros/clutch as required", "Mechatronic test", "Bench & road test"], description: "Complete strip-down and rebuild of the transmission with new bearings, seals and mechatronic validation.", part: "gearbox", zones: ["gearbox"] }),
  s({ id: "engine-top-end", name: "Engine top-end rebuild", category: "Engine", priceByTier: { 1: 25000, 2: 45000, 3: 150000 }, labourHours: { min: 60, max: 80 }, turnaround: { min: 4, max: 6, unit: "weeks" }, warranty: "24 months", includes: ["Cylinder head overhaul", "Valves & guides", "Cam timing", "Gaskets & seals", "Dyno verification"], description: "Heads off, valves and guides renewed, cam timing restored, finished with dyno verification.", part: "engine-v8", zones: ["engine"] }),
  s({ id: "engine-full", name: "Full engine rebuild", category: "Engine", priceByTier: { 1: 45000, 2: 90000, 3: 300000 }, priceIsFrom: true, labourHours: { min: 120, max: 200 }, turnaround: { min: 8, max: 12, unit: "weeks" }, warranty: "36 months", includes: ["Full strip & crack test", "Pistons, rings, bearings", "Head overhaul", "Balancing", "Dyno run-in & report"], description: "Bottom-end and top-end rebuild to factory tolerance, balanced and run-in on our dyno.", part: "engine-w16", zones: ["engine"] }),
  s({ id: "turbos", name: "Turbocharger replacement (pair)", category: "Engine", priceByTier: { 1: 11000, 2: 19000, 3: 55000 }, labourHours: { min: 18, max: 18 }, turnaround: { min: 1, max: 2, unit: "weeks" }, warranty: "24 months", includes: ["Turbocharger pair", "Oil & coolant lines", "Gaskets", "Boost calibration check"], description: "Replacement of both turbochargers with new feed lines and a boost calibration check.", part: "turbo", zones: ["engine", "exhaust"] }),
  s({ id: "battery-check", name: "Hybrid/EV battery health check", category: "Hybrid & EV", priceByTier: { 1: 600, 2: 900, 3: 3000 }, labourHours: { min: 3, max: 3 }, turnaround: { min: 0, max: 0, unit: "days", note: "Same day" }, warranty: "—", includes: ["Cell-balance analysis", "Insulation test", "Cooling-loop check", "State-of-health certificate"], description: "High-voltage battery state-of-health test with a printable certificate — ideal before purchase or sale.", part: "battery", zones: ["electrics"] }),
  s({ id: "battery-module", name: "Hybrid battery module replacement", category: "Hybrid & EV", priceByTier: { 1: 12000, 2: 22000 }, labourHours: { min: 12, max: 12 }, turnaround: { min: 1, max: 3, unit: "weeks" }, warranty: "36 months", includes: ["Module replacement", "Cell balancing", "HV isolation test", "Software update"], description: "Replacement of degraded high-voltage modules by HV-certified technicians.", part: "battery", zones: ["electrics"] }),
  s({ id: "suspension", name: "Suspension refresh (dampers + bushes)", category: "Chassis", priceByTier: { 1: 7500, 2: 14000, 3: 38000 }, labourHours: { min: 14, max: 14 }, turnaround: { min: 3, max: 4, unit: "days" }, warranty: "24 months", includes: ["Four dampers", "Bush set", "Alignment", "Corner weighting"], description: "New dampers and bushes, finished with alignment and corner weighting.", part: "coilover", zones: ["suspension"] }),
  s({ id: "nose-lift", name: "Nose-lift system repair", category: "Chassis", priceByTier: { 2: 4800 }, labourHours: { min: 6, max: 6 }, turnaround: { min: 2, max: 2, unit: "days" }, warranty: "12 months", includes: ["Hydraulic pump test", "Seal kit", "Fluid", "Calibration"], description: "Diagnosis and repair of the front-axle lift system — pump, seals and calibration.", part: "coilover", zones: ["suspension"] }),
  s({ id: "alignment", name: "4-wheel alignment & corner weighting", category: "Chassis", priceByTier: { 1: 450, 2: 750, 3: 2000 }, labourHours: { min: 3, max: 3 }, turnaround: { min: 0, max: 0, unit: "days", note: "Same day" }, warranty: "—", includes: ["Laser alignment", "Corner weighting", "Printout before/after"], description: "Laser four-wheel alignment and corner weighting with before/after printout.", part: "wheel", zones: ["wheels", "suspension"] }),
  s({ id: "tyres", name: "Tyre set (Pilot Sport Cup 2 / Bugatti-spec)", category: "Wheels & Tyres", priceByTier: { 1: 2400, 2: 3800, 3: 42000 }, labourHours: { min: 2, max: 2 }, turnaround: { min: 1, max: 1, unit: "days", note: "Bugatti: 2 weeks" }, warranty: "Manufacturer", includes: ["Four tyres", "Fitting & balancing", "TPMS reset"], description: "Four new tyres, fitted and balanced with TPMS reset. Bugatti-spec tyres are ordered to the car.", part: "wheel", zones: ["wheels"] }),
  s({ id: "wheel-refurb", name: "Forged wheel refurbishment (per wheel)", category: "Wheels & Tyres", priceByTier: { 1: 450, 2: 650, 3: 3500 }, labourHours: { min: 3, max: 3 }, turnaround: { min: 3, max: 3, unit: "days" }, warranty: "12 months", includes: ["Strip & crack test", "Straighten if required", "Refinish in factory colour", "Lacquer"], description: "Forged wheels stripped, crack-tested, refinished and lacquered to factory colour.", part: "wheel", zones: ["wheels"] }),
  s({ id: "ecu-tune", name: "ECU tune / performance remap", category: "Performance", priceByTier: { 1: 3500, 2: 6000 }, labourHours: { min: 8, max: 8 }, turnaround: { min: 2, max: 2, unit: "days" }, warranty: "12 months", includes: ["Baseline dyno", "Custom map", "Data logging", "Final dyno sheet"], description: "Custom performance calibration validated on the dyno, with before and after sheets.", part: "ecu", zones: ["electrics", "engine"] }),
  s({ id: "exhaust", name: "Titanium exhaust system install", category: "Performance", priceByTier: { 1: 9000, 2: 16000 }, labourHours: { min: 10, max: 10 }, turnaround: { min: 2, max: 3, unit: "days" }, warranty: "24 months", includes: ["Titanium system", "Gaskets & hangers", "Valve control", "Sound check"], description: "Supply and fit of a titanium exhaust with valve control integration.", part: "exhaust", zones: ["exhaust"] }),
  s({ id: "ppf", name: "Full-body paint protection film (PPF)", category: "Paint & Body", priceByTier: { 1: 8500, 2: 10500, 3: 18000 }, labourHours: { min: 40, max: 40 }, turnaround: { min: 5, max: 7, unit: "days" }, warranty: "10 years", includes: ["Decontamination", "Single-stage polish", "Full-body self-healing film", "Wrapped edges"], description: "Self-healing protection film over every painted panel, with wrapped edges for an invisible finish.", part: "coating", zones: ["bodywork"] }),
  s({ id: "wrap", name: "Full colour-change wrap", category: "Paint & Body", priceByTier: { 1: 9500, 2: 12000, 3: 20000 }, labourHours: { min: 50, max: 50 }, turnaround: { min: 7, max: 10, unit: "days" }, warranty: "3 years", includes: ["Panel removal", "Premium cast film", "Door shuts", "Reassembly"], description: "Full colour change in premium cast film, including door shuts.", part: "paint-gun", zones: ["bodywork"] }),
  s({ id: "ceramic", name: "Paint correction (2-stage) + ceramic coating", category: "Paint & Body", priceByTier: { 1: 2500, 2: 3500, 3: 6500 }, labourHours: { min: 20, max: 20 }, turnaround: { min: 3, max: 3, unit: "days" }, warranty: "5 years", includes: ["Wash & decontamination", "Two-stage correction", "Ceramic coating", "Wheels & glass coated"], description: "Two-stage machine correction followed by a five-year ceramic coating.", part: "coating", zones: ["bodywork"] }),
  s({ id: "repaint", name: "Panel repaint (per panel, factory colour match)", category: "Paint & Body", priceByTier: { 1: 1800, 2: 3200, 3: 9000 }, labourHours: { min: 12, max: 12 }, turnaround: { min: 4, max: 6, unit: "days" }, warranty: "Lifetime", includes: ["Spectrophotometer match", "Prep & prime", "Base + clear", "Blend into adjacent panels"], description: "Factory colour matched with a spectrophotometer, blended invisibly into neighbouring panels.", part: "paint-gun", zones: ["bodywork"] }),
  s({ id: "carbon-repair", name: "Carbon-fibre panel repair", category: "Paint & Body", priceByTier: { 1: 3500, 2: 6500, 3: 18000 }, labourHours: { min: 16, max: 16 }, turnaround: { min: 1, max: 2, unit: "weeks" }, warranty: "24 months", includes: ["Damage mapping", "Structural carbon repair", "Weave-matched cosmetic layer", "Clear coat"], description: "Structural and cosmetic carbon repair with weave-matched visible carbon.", part: "coating", zones: ["bodywork"] }),
  s({ id: "windscreen", name: "Windscreen replacement", category: "Paint & Body", priceByTier: { 1: 3000, 2: 6500, 3: 25000 }, labourHours: { min: 6, max: 6 }, turnaround: { min: 2, max: 7, unit: "days" }, warranty: "24 months", includes: ["OEM glass", "Sensor recalibration", "Trim & seals"], description: "OEM windscreen with ADAS and rain-sensor recalibration.", zones: ["bodywork"] }),
  s({ id: "retrim", name: "Full leather/Alcantara interior retrim", category: "Interior", priceByTier: { 1: 14000, 2: 22000, 3: 60000 }, labourHours: { min: 80, max: 80 }, turnaround: { min: 3, max: 4, unit: "weeks" }, warranty: "5 years", includes: ["Seats", "Door cards", "Dash & headliner", "Contrast stitching options"], description: "Complete retrim in semi-aniline leather or Alcantara with your choice of stitching.", part: "steering", zones: ["interior"] }),
  s({ id: "ac", name: "AC regas & service", category: "Interior", priceByTier: { 1: 350, 2: 500, 3: 1500 }, labourHours: { min: 2, max: 2 }, turnaround: { min: 0, max: 0, unit: "days", note: "Same day" }, warranty: "6 months", includes: ["Leak test", "Regas", "Cabin filter", "Vent temperature check"], description: "Leak test, regas and cabin filter — tuned for tropical conditions.", zones: ["interior", "electrics"] }),
  s({ id: "detailing", name: "Concours detailing", category: "Paint & Body", priceByTier: { 1: 1200, 2: 1800, 3: 3500 }, labourHours: { min: 12, max: 12 }, turnaround: { min: 2, max: 2, unit: "days" }, warranty: "—", includes: ["Exterior decon & polish", "Engine bay", "Interior deep clean", "Leather feed"], description: "Show-ready detailing inside, outside and under the bonnet.", part: "coating", zones: ["bodywork", "interior"] }),
  s({ id: "ppi", name: "Pre-purchase inspection (PPI)", category: "Diagnostics", priceByTier: { 1: 900, 2: 1500, 3: 5000 }, labourHours: { min: 6, max: 6 }, turnaround: { min: 1, max: 1, unit: "days" }, warranty: "—", includes: ["Paint-depth survey", "Diagnostic scan", "Lift inspection", "Road test", "Written report"], description: "An independent inspection before you buy, with paint-depth map and full diagnostic report.", part: "ecu", zones: ["engine", "bodywork", "electrics"] }),
  s({ id: "transport", name: "Enclosed transport / collection (Lagos/Abuja/Port Harcourt)", category: "Logistics", priceByTier: { 1: 350, 2: 350, 3: 350 }, priceIsFrom: true, labourHours: { min: 0, max: 0 }, turnaround: { min: 0, max: 0, unit: "days", note: "Scheduled" }, warranty: "Fully insured", includes: ["Enclosed trailer", "Door-to-door", "Insured in transit"], description: "Enclosed, insured collection and delivery across Lagos, Abuja and Port Harcourt.", zones: [] }),
];

export const SERVICE_CATEGORIES = Array.from(new Set(SERVICES.map((x) => x.category)));

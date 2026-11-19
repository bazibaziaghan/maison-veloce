/**
 * MAISON VELOCE — image fetcher (Wikimedia Commons, no key needed;
 * Unsplash / Pexels optional when UNSPLASH_ACCESS_KEY / PEXELS_API_KEY are set).
 *
 * Two stages, because every pick is reviewed by eye before it ships:
 *   node scripts/fetch-images.ts candidates   -> assets-raw/_candidates/{group}.json (licence-filtered, >=1600px)
 *   node scripts/fetch-images.ts download     -> reads scripts/picks.json, downloads into assets-raw/{slug}/,
 *                                                writes data/image-manifest.json
 * Runs on Node 22.6+ (native TypeScript type stripping).
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const UA = "MaisonVeloceImageFetcher/1.0 (static portfolio build script)";
const API = "https://commons.wikimedia.org/w/api.php";
const ROOT = path.resolve(import.meta.dirname, "..");
const RAW = path.join(ROOT, "assets-raw");
const OK_LICENCE = /^(cc0|public domain|pd|cc by(-sa)? \d)/i;

type Candidate = {
  title: string;
  thumb: string;
  url: string;
  width: number;
  height: number;
  licence: string;
  licenceUrl: string;
  author: string;
  descriptionUrl: string;
};

const SEARCHES: Record<string, string[]> = {
  "mclaren-750s": ["McLaren 750S"],
  "mclaren-artura": ["McLaren Artura"],
  "bugatti-chiron-super-sport": ["Bugatti Chiron Super Sport"],
  "bugatti-tourbillon": ["Bugatti Tourbillon"],
  "porsche-911-gt3-rs": ["Porsche 992 GT3 RS", "Porsche 911 GT3 RS 992"],
  "porsche-taycan-turbo-gt": ["Porsche Taycan Turbo GT", "Taycan Turbo GT"],
  "ferrari-sf90-stradale": ["Ferrari SF90 Stradale", "SF90 Stradale interior"],
  "lamborghini-revuelto": ["Lamborghini Revuelto"],
  "rolls-royce-spectre": ["Rolls-Royce Spectre"],
  "aston-martin-db12": ["Aston Martin DB12"],
  parts: [
    "carbon ceramic brake disc",
    "brake caliper carbon ceramic",
    "forged alloy wheel",
    "V12 engine",
    "W16 engine Bugatti",
    "V8 twin turbo engine",
    "dual clutch transmission cutaway",
    "turbocharger",
    "titanium exhaust",
    "coilover",
    "engine control unit",
    "electric vehicle battery module",
    "sports car steering wheel",
    "spray gun painting",
  ],
  workshop: ["car mechanic workshop", "supercar workshop", "car detailing polishing", "tyre change workshop"],
};

async function api(params: Record<string, string>) {
  const qs = new URLSearchParams({ format: "json", origin: "*", ...params });
  for (let attempt = 0; attempt < 6; attempt++) {
    const res = await fetch(`${API}?${qs}`, { headers: { "User-Agent": UA } });
    if (res.ok) return res.json();
    if (res.status !== 429 && res.status < 500) throw new Error(`Commons ${res.status}`);
    await sleep(2000 * 2 ** attempt); // polite exponential backoff
  }
  throw new Error("Commons: too many retries");
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const strip = (s = "") => s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

async function search(q: string, limit = 40): Promise<Candidate[]> {
  const data = await api({
    action: "query",
    generator: "search",
    gsrsearch: `${q} filetype:bitmap`,
    gsrnamespace: "6",
    gsrlimit: String(limit),
    prop: "imageinfo",
    iiprop: "url|size|extmetadata",
    iiurlwidth: "360",
  });
  const pages = Object.values<any>(data?.query?.pages ?? {});
  return pages
    .map((p) => {
      const ii = p.imageinfo?.[0];
      if (!ii) return null;
      const m = ii.extmetadata ?? {};
      return {
        title: p.title,
        thumb: ii.thumburl,
        url: ii.url,
        width: ii.width,
        height: ii.height,
        licence: strip(m.LicenseShortName?.value),
        licenceUrl: strip(m.LicenseUrl?.value),
        author: strip(m.Artist?.value) || "Unknown",
        descriptionUrl: ii.descriptionurl,
      } as Candidate;
    })
    .filter((c): c is Candidate => !!c && c.width >= 1600 && OK_LICENCE.test(c.licence));
}

async function candidates() {
  const out = path.join(RAW, "_candidates");
  await mkdir(out, { recursive: true });
  for (const [group, qs] of Object.entries(SEARCHES)) {
    if (existsSync(path.join(out, `${group}.json`))) continue;
    const seen = new Map<string, Candidate & { query: string }>();
    for (const q of qs) {
      for (const c of await search(q, group === "parts" || group === "workshop" ? 12 : 50)) {
        if (!seen.has(c.title)) seen.set(c.title, { ...c, query: q });
      }
      await sleep(800);
    }
    const list = [...seen.values()];
    await writeFile(path.join(out, `${group}.json`), JSON.stringify(list, null, 2));
    console.log(`${group.padEnd(30)} ${list.length} licensed candidates`);
  }
}

/** Standard-size (1920px) download URL via Commons thumbnails, as Wikimedia requests (keeps raw files ~1 MB). */
async function downloadUrl(title: string, width = 1920) {
  const d = await api({ action: "query", titles: title, prop: "imageinfo", iiprop: "url|size|extmetadata", iiurlwidth: String(width) });
  const p: any = Object.values(d.query.pages)[0];
  return p.imageinfo[0];
}

type Pick = { title: string; role: string; file: string; flip?: boolean };

async function download() {
  const picks: Record<string, Pick[]> = JSON.parse(await readFile(path.join(ROOT, "scripts/picks.json"), "utf8"));
  const manifest: any[] = [];
  for (const [slug, list] of Object.entries(picks)) {
    const dir = path.join(RAW, slug);
    await mkdir(dir, { recursive: true });
    for (const pick of list) {
      const ii = await downloadUrl(pick.title);
      const m = ii.extmetadata ?? {};
      const dest = path.join(dir, pick.file);
      if (!existsSync(dest)) {
        let res: Response | null = null;
        const urls = [ii.thumburl, ii.thumburl, ii.thumburl].filter(Boolean); // standard 1920px thumb size (Wikimedia policy)
        for (let attempt = 0; attempt < urls.length; attempt++) {
          res = await fetch(urls[attempt], { headers: { "User-Agent": UA } });
          if (res.ok || (res.status !== 429 && res.status < 500)) break;
          await sleep(Number(res.headers.get("retry-after") ?? 30) * 1000 + 2000);
        }
        if (!res || !res.ok) { console.warn(`  ! ${pick.title}: HTTP ${res?.status}`); continue; }
        await writeFile(dest, Buffer.from(await res.arrayBuffer()));
        await sleep(1200);
      }
      manifest.push({
        group: slug,
        role: pick.role,
        file: `${slug}/${pick.file}`,
        title: pick.title.replace(/^File:/, ""),
        sourceUrl: ii.descriptionurl,
        author: strip(m.Artist?.value) || "Unknown",
        licence: strip(m.LicenseShortName?.value),
        licenceUrl: strip(m.LicenseUrl?.value) || null,
        editorial: false,
        width: ii.width,
        height: ii.height,
      });
      console.log(`  ✓ ${slug}/${pick.file}`);
    }
  }
  await writeFile(path.join(ROOT, "data/image-manifest.json"), JSON.stringify(manifest, null, 2));
  console.log(`\nManifest: ${manifest.length} images`);
}

const mode = process.argv[2] ?? "candidates";
if (!process.env.UNSPLASH_ACCESS_KEY || !process.env.PEXELS_API_KEY) {
  console.log("note: UNSPLASH_ACCESS_KEY / PEXELS_API_KEY not set - using Wikimedia Commons only.");
}
await (mode === "download" ? download() : candidates());

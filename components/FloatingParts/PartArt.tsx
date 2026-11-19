/* eslint-disable @next/next/no-img-element */
/** Real cutouts where we found good isolated photos; clean line illustrations otherwise. */
const S = { fill: "none", stroke: "var(--c-ink)", strokeWidth: 3, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

const SVGS: Record<string, JSX.Element> = {
  coilover: (
    <svg viewBox="0 0 200 300"><rect x="80" y="10" width="40" height="40" rx="4" {...S} fill="var(--c-fill)" />{Array.from({ length: 9 }).map((_, i) => <path key={i} d={`M58 ${70 + i * 20} Q100 ${60 + i * 20} 142 ${80 + i * 20}`} {...S} stroke="#B3121B" strokeWidth={7} />)}<rect x="88" y="50" width="24" height="200" {...S} fill="#D8D6D0" /><circle cx="100" cy="270" r="18" {...S} fill="var(--c-fill)" /></svg>
  ),
  battery: (
    <svg viewBox="0 0 300 200"><path d="M30 70 L150 30 L270 70 L270 150 L150 190 L30 150 Z" {...S} fill="#3D4B57" stroke="var(--c-ink)" /><path d="M30 70 L150 110 L270 70 M150 110 V190" {...S} stroke="var(--c-fill)" />{[60, 90, 120].map((x) => <path key={x} d={`M${x} ${80 + (x - 30) / 3} V${160 + (x - 30) / 3}`} stroke="var(--c-fill)" strokeWidth={2} />)}<path d="M200 60 l14 -5 M240 74 l14 -5" stroke="#B3121B" strokeWidth={6} /></svg>
  ),
  coating: (
    <svg viewBox="0 0 160 300"><rect x="45" y="20" width="70" height="40" rx="6" {...S} fill="var(--c-ink)" /><path d="M35 70 Q80 55 125 70 L125 270 Q80 285 35 270 Z" {...S} fill="var(--c-fill)" /><rect x="50" y="130" width="60" height="80" fill="#B3121B" /><text x="80" y="176" fontSize="14" textAnchor="middle" fill="#fff" fontFamily="serif">9H</text></svg>
  ),
  ecu: (
    <svg viewBox="0 0 300 220"><rect x="30" y="40" width="240" height="150" rx="10" {...S} fill="#C9CCCF" />{Array.from({ length: 8 }).map((_, i) => <path key={i} d={`M${60 + i * 25} 40 V22`} {...S} />)}<rect x="70" y="80" width="160" height="70" rx="4" {...S} fill="var(--c-tyre)" /><circle cx="250" cy="170" r="6" fill="#B3121B" /></svg>
  ),
};

const PHOTO: Record<string, string> = {
  wheel: "/parts/wheel-640.webp", "engine-w16": "/parts/engine-w16-640.webp", "engine-v12": "/parts/engine-v12-640.webp", "engine-v8": "/parts/engine-v8-640.webp",
  gearbox: "/parts/gearbox-640.webp", turbo: "/parts/turbo-640.webp", exhaust: "/parts/exhaust-640.webp", steering: "/parts/steering-640.webp", "paint-gun": "/parts/paint-gun-640.webp",
  caliper: "/parts/caliper-photo-640.webp",
};

export default function PartArt({ id, alt }: { id: string; alt: string }) {
  if (SVGS[id]) return <div role="img" aria-label={alt} className="h-full w-full [&>svg]:h-full [&>svg]:w-full">{SVGS[id]}</div>;
  return <img src={PHOTO[id]} alt={alt} draggable={false} loading="lazy" className={`h-full w-full ${id === "caliper" ? "rounded-full object-cover" : "object-contain"}`} />;
}

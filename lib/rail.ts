/** Mechanic 2 — even spacing of items along an SVG path. */
export type RailPoint = { x: number; y: number; angle: number };

/** Samples n evenly spaced points (with end padding) on a path, each with its tangent angle in degrees. */
export function pointsAlong(path: SVGPathElement, n: number, pad = 0.06): RailPoint[] {
  const L = path.getTotalLength();
  const out: RailPoint[] = [];
  for (let i = 0; i < n; i++) {
    const f = n === 1 ? 0.5 : pad + (1 - 2 * pad) * (i / (n - 1));
    const d = f * L;
    const p = path.getPointAtLength(d);
    const p2 = path.getPointAtLength(Math.min(L, d + 1));
    const p1 = path.getPointAtLength(Math.max(0, d - 1));
    out.push({ x: p.x, y: p.y, angle: (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI });
  }
  return out;
}

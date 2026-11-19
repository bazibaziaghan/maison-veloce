/** Mechanic 1 — the showroom wheel's maths. Pure functions, called from a rAF loop. */
export const TAU = Math.PI * 2;

export type OrbitPose = { transform: string; opacity: number; blur: number; z: number; t: number };

/**
 * For car i of n at wheel rotation θ, returns a single matrix() transform plus depth cues.
 * x = R·sin(a), z = cos(a), y = r·cos(a); t = (z+1)/2; s = 0.45 + 0.55t.
 */
export function orbitPose(theta: number, i: number, n: number, R: number, r: number): OrbitPose {
  const a = theta + i * (TAU / n);
  const x = R * Math.sin(a);
  const z = Math.cos(a);
  const y = r * z;
  const t = (z + 1) / 2;
  const s = 0.45 + 0.55 * t;
  return {
    transform: `matrix(${s.toFixed(4)}, 0, 0, ${s.toFixed(4)}, ${x.toFixed(2)}, ${y.toFixed(2)})`,
    opacity: 0.25 + 0.75 * t,
    blur: (1 - t) * 6,
    z: Math.round(t * 100),
    t,
  };
}

/** Index of the car currently nearest the front for rotation θ. */
export function frontIndex(theta: number, n: number) {
  const step = TAU / n;
  // car i is at front when θ + i·step ≡ 0  →  i ≡ -θ/step
  return ((Math.round(-theta / step) % n) + n) % n;
}

/** θ that brings car i to the front, choosing the nearest equivalent to the current θ. */
export function thetaForIndex(i: number, n: number, current: number) {
  const step = TAU / n;
  const base = -i * step;
  const k = Math.round((current - base) / TAU);
  return base + k * TAU;
}

/** Nearest snap target for θ (a multiple of the step). */
export const snapTheta = (theta: number, n: number) => Math.round(theta / (TAU / n)) * (TAU / n);

/** Hand-written ease-out (cubic). */
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

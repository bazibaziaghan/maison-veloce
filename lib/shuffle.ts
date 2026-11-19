/** Mechanic 3 — instant re-sorts. No animation, no physics: just a new array order. */

/** Fisher–Yates, returns a new array. */
export function fisherYates<T>(input: readonly T[], rand: () => number = Math.random): T[] {
  const a = input.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export type SortDef<T> = { id: string; label: string; fn?: (a: T, b: T) => number };

/** Applies a sort definition; a def without fn is treated as Shuffle. */
export function reshuffle<T>(items: readonly T[], def: SortDef<T>): T[] {
  return def.fn ? items.slice().sort(def.fn) : fisherYates(items);
}

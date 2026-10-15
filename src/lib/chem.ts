// IUPAC standard atomic weights (abridged/conventional values, CIAAW 2021).
// TODO(verify): values typed from memory of the CIAAW table; ciaaw.org was unreachable from the build sandbox.
export const ATOMIC_WEIGHTS: Record<string, number> = {
  H: 1.008, C: 12.011, N: 14.007, O: 15.999, Na: 22.98976928, Mg: 24.305,
  P: 30.973761998, S: 32.06, Cl: 35.45, K: 39.0983, Ca: 40.078, Fe: 55.845,
  Cu: 63.546, Zn: 65.38, Li: 6.94, I: 126.90447,
};

/** Molecular weight (g/mol) from a simple formula such as "C6H12O6" or "CaCl2". */
export function molarMass(formula: string): number {
  const re = /([A-Z][a-z]?)(\d*)/g;
  let total = 0;
  let consumed = 0;
  for (const m of formula.matchAll(re)) {
    const w = ATOMIC_WEIGHTS[m[1]];
    if (w === undefined) throw new Error(`Unknown element ${m[1]} in ${formula}`);
    total += w * (m[2] ? parseInt(m[2], 10) : 1);
    consumed += m[0].length;
  }
  if (consumed !== formula.length) throw new Error(`Cannot parse formula ${formula}`);
  return total;
}

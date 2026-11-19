// Small chemistry toolkit: formula parsing, atom counting, pretty printing.

const SUB = '₀₁₂₃₄₅₆₇₈₉';
const SUP: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '+': '⁺', '-': '⁻' };
export const sub = (s: string | number) => String(s).replace(/\d/g, (d) => SUB[+d]);
export const sup = (s: string) => s.split('').map((c) => SUP[c] ?? c).join('');

/** Count atoms in a formula like "Ca(NO3)2" or "C6H12O6". Charge suffixes are ignored. */
export function atoms(formula: string): Record<string, number> {
  const f = formula.replace(/\^?\d*[+-]$/, '');
  let i = 0;
  function group(): Record<string, number> {
    const out: Record<string, number> = {};
    while (i < f.length && f[i] !== ')') {
      let part: Record<string, number>;
      if (f[i] === '(') {
        i++;
        part = group();
        i++; // ')'
      } else {
        const m = /^[A-Z][a-z]?/.exec(f.slice(i));
        if (!m) throw new Error(`Bad formula ${formula}`);
        part = { [m[0]]: 1 };
        i += m[0].length;
      }
      const n = /^\d+/.exec(f.slice(i));
      const k = n ? Number(n[0]) : 1;
      if (n) i += n[0].length;
      for (const [el, c] of Object.entries(part)) out[el] = (out[el] ?? 0) + c * k;
    }
    return out;
  }
  return group();
}

export function scale(a: Record<string, number>, k: number) {
  return Object.fromEntries(Object.entries(a).map(([e, n]) => [e, n * k]));
}
export function addAtoms(...xs: Record<string, number>[]) {
  const out: Record<string, number> = {};
  for (const x of xs) for (const [e, n] of Object.entries(x)) out[e] = (out[e] ?? 0) + n;
  return out;
}
export function sameAtoms(a: Record<string, number>, b: Record<string, number>) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) if ((a[k] ?? 0) !== (b[k] ?? 0)) return false;
  return true;
}

/** "Ca(NO3)2" -> "Ca(NO₃)₂", "SO4^2-" -> "SO₄²⁻", "Mg2+" -> "Mg²⁺", "NO3-" -> "NO₃⁻". */
export function pretty(token: string): string {
  if (/^(sp|d\d)/.test(token)) return token;
  const caret = /^(.*)\^(\d*[+-])$/.exec(token);
  if (caret) return prettyBody(caret[1]) + sup(caret[2]);
  // single element ion like Mg2+, O2-, Al3+, Cl-
  const ion = /^([A-Z][a-z]?)(\d*)([+-])$/.exec(token);
  if (ion) return ion[1] + sup(ion[2] + ion[3]);
  const poly = /^(.*[A-Za-z\d)])([+-])$/.exec(token);
  if (poly && /[A-Z]/.test(poly[1]) && /[A-Z].*[A-Z]|\d/.test(poly[1])) return prettyBody(poly[1]) + sup(poly[2]);
  return prettyBody(token);
}
function prettyBody(t: string) {
  // leading coefficient stays normal size: 3H2O -> 3H₂O
  const m = /^(\d*)(.*)$/.exec(t)!;
  return m[1] + m[2].replace(/([A-Za-z)\]])(\d+)/g, (_, a, d) => a + sub(d));
}

/** Pretty-print chemistry inside free text (study guide strings). */
export function prettyText(s: string): string {
  return s
    .replace(/->/g, '→')
    .replace(/\b(?:\d*(?:[A-Z][a-z]?\d*|\((?:[A-Z][a-z]?\d*)+\)\d*)+(?:\^\d*[+-]|[+-](?![A-Za-z\d]))?)/g, (tok) => {
      if (!/[A-Z]/.test(tok)) return tok;
      // leave plain words and labels alone (e.g. "A", "CH", single capital letters without digits/charges)
      if (/^[A-Z][a-z]?$/.test(tok) && !/[+-]$/.test(tok)) return tok;
      return pretty(tok);
    })
    .replace(/\be-(?![A-Za-z])/g, 'e⁻');
}

/* ---------- element data ---------- */

export const VALENCE: Record<string, number> = { H: 1, He: 2, Li: 1, Be: 2, B: 3, C: 4, N: 5, O: 6, F: 7, Ne: 8, Na: 1, Mg: 2, Al: 3, Si: 4, P: 5, S: 6, Cl: 7, Ar: 8, K: 1, Ca: 2, Br: 7, I: 7, Xe: 8, Se: 6 };
/** Pauling electronegativities. */
export const EN: Record<string, number> = { H: 2.2, Li: 0.98, Be: 1.57, B: 2.04, C: 2.55, N: 3.04, O: 3.44, F: 3.98, Na: 0.93, Mg: 1.31, Al: 1.61, Si: 1.9, P: 2.19, S: 2.58, Cl: 3.16, K: 0.82, Ca: 1.0, Br: 2.96, I: 2.66 };

export function valenceElectrons(formula: string, charge = 0) {
  const a = atoms(formula);
  return Object.entries(a).reduce((s, [e, n]) => s + VALENCE[e] * n, 0) - charge;
}

/* ---------- equations ---------- */

export interface Equation { r: string[]; p: string[]; c: number[]; type?: 'combination' | 'decomposition' | 'combustion' | 'single replacement' | 'double replacement' }

export function isBalanced(eq: Equation, c = eq.c) {
  const left = addAtoms(...eq.r.map((f, i) => scale(atoms(f), c[i])));
  const right = addAtoms(...eq.p.map((f, i) => scale(atoms(f), c[eq.r.length + i])));
  return sameAtoms(left, right);
}
export function eqText(eq: Equation, c: (number | string)[] | null = eq.c) {
  const term = (f: string, i: number) => {
    const k = c ? c[i] : '';
    return `${k === 1 ? '' : k}${pretty(f)}`;
  };
  return `${eq.r.map((f, i) => term(f, i)).join(' + ')} → ${eq.p.map((f, i) => term(f, eq.r.length + i)).join(' + ')}`;
}

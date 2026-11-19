// World 9 · Chapter 8 · Chemical reactions
import { atoms, eqText, isBalanced, pretty, type Equation } from '../chem';
import { addGuide, adder, choice, concept, pick, sample, shuffle, sig, type Template } from './shared';

export const W9_CONCEPTS = [
  concept({ id: 'w9-equations', world: 'w9', sec: 19, name: 'Reading equations', short: 'Eqn', card: 'Zn', cardName: 'Zinc', cardFact: 'Zn + 2HCl → ZnCl₂ + H₂: drop zinc in acid and it fizzes with hydrogen gas.', watchTitle: 'Coefficients vs subscripts', moLine: 'Coefficient = how many. Subscript = what it is.' }),
  concept({ id: 'w9-balance', world: 'w9', sec: 20, name: 'Balancing equations', short: 'Bal', card: 'K', cardName: 'Potassium', cardFact: 'Heating potassium chlorate releases oxygen: 2KClO₃ → 2KCl + 3O₂.', watchTitle: 'Same atoms in, same atoms out', moLine: 'Change coefficients only. Save H and O for last.' }),
  concept({ id: 'w9-types', world: 'w9', sec: 21, name: 'Reaction types', short: 'Type', card: 'Cu', cardName: 'Copper', cardFact: 'Copper roofs turn green as copper slowly reacts with air and water to form a patina.', watchTitle: 'Five patterns', moLine: 'Combine, break apart, burn, swap one, swap two.' }),
  concept({ id: 'w9-moles', world: 'w9', sec: 22, name: 'Mole ratios', short: 'Ratio', card: 'Co', cardName: 'Cobalt', cardFact: 'Cobalt chloride paper turns from blue to pink when it touches water.', watchTitle: 'Coefficients are mole ratios', moLine: 'Moles are the bridge between substances.' }),
  concept({ id: 'w9-limiting', world: 'w9', sec: 23, name: 'Limiting reactant', short: 'Limit', card: 'Mn', cardName: 'Manganese', cardFact: 'MnO₂ is a catalyst that makes hydrogen peroxide break down fast into water and oxygen.', watchTitle: 'Who runs out first?', moLine: 'Whichever makes LESS product limits the reaction.' }),
  concept({ id: 'w9-yield', world: 'w9', sec: 24, name: 'Percent yield', short: '% Yld', card: 'Ni', cardName: 'Nickel', cardFact: 'Nickel catalysts help turn liquid vegetable oils into solid fats by adding hydrogen.', watchTitle: 'Actual vs theoretical', moLine: '% yield = actual ÷ theoretical × 100.' }),
];

export const W9_TEMPLATES: Template[] = [];
const add = adder(W9_TEMPLATES);

export const EQUATIONS: Equation[] = [
  { r: ['H2', 'O2'], p: ['H2O'], c: [2, 1, 2], type: 'combination' },
  { r: ['CH4', 'O2'], p: ['CO2', 'H2O'], c: [1, 2, 1, 2], type: 'combustion' },
  { r: ['C3H8', 'O2'], p: ['CO2', 'H2O'], c: [1, 5, 3, 4], type: 'combustion' },
  { r: ['C2H6', 'O2'], p: ['CO2', 'H2O'], c: [2, 7, 4, 6], type: 'combustion' },
  { r: ['C2H6O', 'O2'], p: ['CO2', 'H2O'], c: [1, 3, 2, 3], type: 'combustion' },
  { r: ['C6H12O6', 'O2'], p: ['CO2', 'H2O'], c: [1, 6, 6, 6], type: 'combustion' },
  { r: ['C4H10', 'O2'], p: ['CO2', 'H2O'], c: [2, 13, 8, 10], type: 'combustion' },
  { r: ['Al', 'O2'], p: ['Al2O3'], c: [4, 3, 2], type: 'combination' },
  { r: ['N2', 'H2'], p: ['NH3'], c: [1, 3, 2], type: 'combination' },
  { r: ['Fe', 'O2'], p: ['Fe2O3'], c: [4, 3, 2], type: 'combination' },
  { r: ['Na', 'Cl2'], p: ['NaCl'], c: [2, 1, 2], type: 'combination' },
  { r: ['CaO', 'CO2'], p: ['CaCO3'], c: [1, 1, 1], type: 'combination' },
  { r: ['SO3', 'H2O'], p: ['H2SO4'], c: [1, 1, 1], type: 'combination' },
  { r: ['P4', 'O2'], p: ['P4O10'], c: [1, 5, 1], type: 'combination' },
  { r: ['KClO3'], p: ['KCl', 'O2'], c: [2, 2, 3], type: 'decomposition' },
  { r: ['CaCO3'], p: ['CaO', 'CO2'], c: [1, 1, 1], type: 'decomposition' },
  { r: ['H2O2'], p: ['H2O', 'O2'], c: [2, 2, 1], type: 'decomposition' },
  { r: ['HgO'], p: ['Hg', 'O2'], c: [2, 2, 1], type: 'decomposition' },
  { r: ['NaN3'], p: ['Na', 'N2'], c: [2, 2, 3], type: 'decomposition' },
  { r: ['Zn', 'HCl'], p: ['ZnCl2', 'H2'], c: [1, 2, 1, 1], type: 'single replacement' },
  { r: ['Zn', 'CuSO4'], p: ['ZnSO4', 'Cu'], c: [1, 1, 1, 1], type: 'single replacement' },
  { r: ['Al', 'HCl'], p: ['AlCl3', 'H2'], c: [2, 6, 2, 3], type: 'single replacement' },
  { r: ['Cl2', 'NaBr'], p: ['NaCl', 'Br2'], c: [1, 2, 2, 1], type: 'single replacement' },
  { r: ['Fe2O3', 'Al'], p: ['Al2O3', 'Fe'], c: [1, 2, 1, 2], type: 'single replacement' },
  { r: ['AgNO3', 'NaCl'], p: ['AgCl', 'NaNO3'], c: [1, 1, 1, 1], type: 'double replacement' },
  { r: ['BaCl2', 'Na2SO4'], p: ['BaSO4', 'NaCl'], c: [1, 1, 1, 2], type: 'double replacement' },
  { r: ['Pb(NO3)2', 'KI'], p: ['PbI2', 'KNO3'], c: [1, 2, 1, 2], type: 'double replacement' },
  { r: ['HCl', 'NaOH'], p: ['NaCl', 'H2O'], c: [1, 1, 1, 1], type: 'double replacement' },
  { r: ['H2SO4', 'NaOH'], p: ['Na2SO4', 'H2O'], c: [1, 2, 1, 2], type: 'double replacement' },
  { r: ['Ca(OH)2', 'HCl'], p: ['CaCl2', 'H2O'], c: [1, 2, 1, 2], type: 'double replacement' },
];
const fmt = (eq: Equation) => eqText(eq);
const unbalanced = (eq: Equation) => eqText(eq, null);
/** Metal + O₂ and P₄ + O₂ can be called combination OR combustion, so they stay out of type questions. */
const clearType = (e: Equation) => !!e.type && !(e.type === 'combination' && e.r.includes('O2'));
const isMultiple = (a: number[], b: number[]) => { const k = a[0] / b[0]; return a.every((x, i) => Math.abs(x / b[i] - k) < 1e-9); };

/* ---------- 19. equations ---------- */
addGuide(add, 'w9-equations', 19, [
  'Coefficients change the chemical formula of a substance.',
  '(aq) means the substance is a pure liquid.',
  'A balanced equation always has the same number of molecules on both sides.',
  'The reaction arrow means both sides are mathematically equal.',
]);
const COUNT_ITEMS: [number, string][] = [[3, 'Ca(NO3)2'], [2, 'Al2(SO4)3'], [4, 'H2O'], [2, 'C6H12O6'], [3, 'Mg(OH)2'], [5, 'CO2'], [2, '(NH4)3PO4'], [6, 'NaHCO3'], [2, 'Fe2(CO3)3'], [3, 'H2SO4']];
add('w9-count', 'w9-equations', 2, -0.3, (rng) => {
  const [k, f] = pick(rng, COUNT_ITEMS);
  const a = atoms(f);
  const el = pick(rng, Object.keys(a).filter((e) => a[e] > 1 || f.includes('(')));
  const per = a[el];
  const right = k * per;
  const noParen = atoms(f.replace(/\)(\d+)/g, ')'))[el] ?? per;
  return choice(rng, `How many ${el} atoms are in ${k}${pretty(f)}?`, String(right), [String(per), String(k * noParen), String(k + per), String(noParen)].filter((x) => x !== String(right)),
    `One ${pretty(f)} has ${per} ${el}. The coefficient ${k} multiplies the whole formula: ${k} × ${per} = ${right}.`,
    'Subscript after a parenthesis multiplies everything inside. The coefficient multiplies the whole formula.');
});
add('w9-states', 'w9-equations', 3, 0.0, (rng) => {
  const items = [['(aq)', 'Dissolved in water'], ['(s)', 'Solid'], ['(l)', 'Liquid'], ['(g)', 'Gas']] as const;
  const [sym, mean] = pick(rng, items);
  return choice(rng, `What does ${sym} mean after a formula?`, mean, [...items.map((x) => x[1] as string).filter((x) => x !== mean), 'Acidic'],
    `${sym} = ${mean.toLowerCase()}. (aq) comes from "aqueous": dissolved in water, which is not the same as a pure liquid.`, 'aq = aqueous.');
});

/* ---------- 20. balancing ---------- */
addGuide(add, 'w9-balance', 20, [
  'You can balance an equation by changing the subscripts.',
  'A blank coefficient means zero of that substance.',
  'Balanced coefficients are the exact amounts used in every experiment.',
  'Once one element balances, you can stop checking.',
]);
function badCoefs(rng: () => number, eq: Equation): number[][] {
  const out: number[][] = [];
  for (let k = 0; out.length < 6 && k < 200; k++) {
    const c = eq.c.map((x) => Math.max(1, x + (rng() < 0.45 ? Math.round((rng() - 0.5) * 4) : 0)));
    if (!isBalanced(eq, c) && !out.some((o) => o.join() === c.join())) out.push(c);
  }
  return out;
}
add('w9-coef', 'w9-balance', 2, -0.1, (rng) => {
  const eq = pick(rng, EQUATIONS.filter((e) => e.c.some((x) => x > 1)));
  const idx = eq.c.findIndex((x, i) => x > 1 && i > 0) >= 0 ? eq.c.findIndex((x, i) => x > 1 && i > 0) : eq.c.findIndex((x) => x > 1);
  const all = [...eq.r, ...eq.p];
  const right = eq.c[idx];
  const shown = eq.c.map((x, i) => (i === idx ? '__' : x));
  return choice(rng, `Fill the blank to balance: ${eqText(eq, shown).replace('__', '__ ')}`, String(right), [right + 1, right - 1, right + 2, right * 2].filter((x) => x > 0 && x !== right).map(String),
    `With ${right} in front of ${pretty(all[idx])}, every element balances: ${fmt(eq)}.`, 'Count each element on both sides. Fix the coefficient, never the subscript.');
});
add('w9-pick-balanced', 'w9-balance', 3, 0.4, (rng) => {
  const eq = pick(rng, EQUATIONS.filter((e) => e.c.some((x) => x > 1)));
  const bads = badCoefs(rng, eq).filter((c) => !isMultiple(c, eq.c)).slice(0, 3);
  return choice(rng, `Which coefficients balance ${unbalanced(eq)}?`, eq.c.join(', '), bads.map((c) => c.join(', ')),
    `${fmt(eq)}. Count each element: they all match on both sides.`, 'Check every element, one at a time.');
});
add('w9-o2-hard', 'w9-balance', 4, 0.9, (rng) => {
  const eq = pick(rng, EQUATIONS.filter((e) => e.type === 'combustion' && e.c[1] > 2));
  const right = eq.c[1];
  return choice(rng, `Balance the combustion ${unbalanced(eq)} with the smallest whole numbers. What is the coefficient on O₂?`, String(right), [right - 1, right + 1, Math.ceil(right / 2), right * 2].filter((x) => x > 0 && x !== right).map(String),
    `Balance C first, then H, then O last: ${fmt(eq)}.`, 'Balance C, then H, then O. If O₂ needs a half, double everything.');
});

/* ---------- 21. reaction types ---------- */
addGuide(add, 'w9-types', 21, [
  'Any reaction that involves oxygen is a combustion reaction.',
  'Complete combustion of a hydrocarbon makes C and H₂.',
  'In a decomposition reaction, two reactants join into one product.',
  'If an equation balances, the predicted products must be right.',
]);
const TYPES = ['combination', 'decomposition', 'combustion', 'single replacement', 'double replacement'];
add('w9-type', 'w9-types', 2, -0.2, (rng) => {
  const eq = pick(rng, EQUATIONS.filter(clearType));
  const t = eq.type!;
  const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
  const desc: Record<string, string> = {
    combination: 'two or more substances combine into one product',
    decomposition: 'one reactant breaks into two or more products',
    combustion: 'a fuel reacts with O₂ to make CO₂ and H₂O',
    'single replacement': 'an element swaps places with one element in a compound',
    'double replacement': 'two compounds swap partners',
  };
  return choice(rng, `What type of reaction is ${fmt(eq)}?`, cap(t), TYPES.filter((x) => x !== t).map(cap),
    `${cap(t)}: ${desc[t]}.`, 'Look at the pattern: how many reactants and products, and what swapped?');
});
add('w9-combust', 'w9-types', 3, 0.3, (rng) => {
  const fuel = pick(rng, ['C3H8', 'C4H10', 'C2H6', 'C5H12', 'C8H18', 'C2H6O']);
  return choice(rng, `What are the products of complete combustion of ${pretty(fuel)}?`, 'CO₂ and H₂O', ['C and H₂', 'CO and H₂', 'CO₂ and H₂', `${pretty(fuel.replace(/H\d+/, ''))} and H₂O`],
    'Burning a hydrocarbon (or C, H, O compound) in plenty of oxygen always makes carbon dioxide and water.', 'Carbon ends up in CO₂, hydrogen ends up in H₂O.');
});
add('w9-type-swipe', 'w9-types', 4, 0.6, (rng) => {
  const pairA = pick(rng, [['combination', 'decomposition'], ['single replacement', 'double replacement']] as const);
  const cards = shuffle(rng, [
    ...sample(rng, EQUATIONS.filter((e) => clearType(e) && e.type === pairA[0]), 3).map((e) => ({ text: fmt(e), side: 'L' as const })),
    ...sample(rng, EQUATIONS.filter((e) => clearType(e) && e.type === pairA[1]), 3).map((e) => ({ text: fmt(e), side: 'R' as const })),
  ]);
  const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
  return {
    kind: 'swipe', left: cap(pairA[0]), right: cap(pairA[1]), cards, prompt: `${cap(pairA[0])} or ${pairA[1]}?`,
    hint: pairA[0] === 'combination' ? 'Many → one is combination. One → many is decomposition.' : 'One element + one compound = single. Two compounds = double.',
    why: pairA[0] === 'combination' ? 'Combination: several reactants make one product. Decomposition: one reactant splits into several products.' : 'Single replacement: an element kicks out one partner. Double replacement: two compounds trade partners.',
  };
});

/* ---------- 22. mole ratios ---------- */
addGuide(add, 'w9-moles', 22, [
  'Coefficients give gram-to-gram ratios.',
  'You can do stoichiometry with an unbalanced equation.',
  'Molar mass converts moles of one substance directly into moles of another.',
  'In N₂ + 3H₂ → 2NH₃, 3 g of H₂ makes 2 g of NH₃.',
]);
add('w9-ratio', 'w9-moles', 2, -0.2, (rng) => {
  const eq = pick(rng, EQUATIONS.filter((e) => new Set(e.c).size > 1));
  const all = [...eq.r, ...eq.p];
  let i = Math.floor(rng() * all.length);
  let j = Math.floor(rng() * all.length);
  for (let k = 0; k < 20 && (i === j || eq.c[i] === eq.c[j]); k++) { i = Math.floor(rng() * all.length); j = Math.floor(rng() * all.length); }
  if (i === j) j = (i + 1) % all.length;
  const n = pick(rng, [1.5, 2, 3, 4.5, 6, 0.5, 2.5, 5]);
  const ans = (n * eq.c[j]) / eq.c[i];
  const s = (x: number) => `${sig(x, 3)} mol`;
  return choice(rng, `${fmt(eq)}. How many moles of ${pretty(all[j])} go with ${sig(n, 3)} mol of ${pretty(all[i])}?`, s(ans), [s((n * eq.c[i]) / eq.c[j]), s(n), s(n * eq.c[j]), s(ans * 2)],
    `Mole ratio ${eq.c[j]} ${pretty(all[j])} : ${eq.c[i]} ${pretty(all[i])}. ${sig(n, 3)} × ${eq.c[j]}/${eq.c[i]} = ${s(ans)}.`, 'Multiply by (coefficient you want) ÷ (coefficient you have).');
});
const MM: Record<string, number> = { H: 1.008, C: 12.01, N: 14.01, O: 16.0, Na: 22.99, Mg: 24.31, Al: 26.98, S: 32.07, Cl: 35.45, K: 39.1, Ca: 40.08, Fe: 55.85 };
const molarMass = (f: string) => Object.entries(atoms(f)).reduce((s, [e, n]) => s + MM[e] * n, 0);
add('w9-grams', 'w9-moles', 3, 0.7, (rng) => {
  const eq = pick(rng, EQUATIONS.filter((e) => [...e.r, ...e.p].every((f) => Object.keys(atoms(f)).every((x) => MM[x])) && new Set(e.c).size > 1));
  const all = [...eq.r, ...eq.p];
  const i = 0;
  const j = eq.r.length + Math.floor(rng() * eq.p.length);
  const g = pick(rng, [10.0, 12.0, 25.0, 5.00, 18.0, 32.0]);
  const mi = molarMass(all[i]);
  const mj = molarMass(all[j]);
  const mol = (g / mi) * (eq.c[j] / eq.c[i]);
  const ans = mol * mj;
  const s = (x: number) => `${sig(x, 3)} g`;
  return choice(rng, `${fmt(eq)}. What mass of ${pretty(all[j])} forms from ${sig(g, 3)} g of ${pretty(all[i])} (others in excess)? Molar masses: ${pretty(all[i])} ${mi.toFixed(2)}, ${pretty(all[j])} ${mj.toFixed(2)} g/mol.`, s(ans),
    [s(g * (eq.c[j] / eq.c[i])), s((g / mi) * mj), s((g / mi) * (eq.c[i] / eq.c[j]) * mj)],
    `${sig(g, 3)} g ÷ ${mi.toFixed(2)} = ${sig(g / mi, 3)} mol → × ${eq.c[j]}/${eq.c[i]} = ${sig(mol, 3)} mol → × ${mj.toFixed(2)} = ${s(ans)}.`, 'grams → moles → mole ratio → grams. Never use the coefficients on grams.');
});

/* ---------- 23. limiting reactant ---------- */
addGuide(add, 'w9-limiting', 23, [
  'The reactant with the smallest mass is always the limiting reactant.',
  'The excess reactant gets completely used up.',
  'The limiting reactant always has the smallest coefficient.',
  'Theoretical yield is calculated from the excess reactant.',
]);
function limitSetup(rng: () => number) {
  const eq = pick(rng, EQUATIONS.filter((e) => e.r.length === 2));
  const [a, b] = eq.r;
  let na = 0, nb = 0;
  for (let k = 0; k < 30; k++) {
    na = pick(rng, [1, 1.5, 2, 3, 4, 5, 6]);
    nb = pick(rng, [1, 1.5, 2, 3, 4, 5, 6]);
    if (Math.abs(na / eq.c[0] - nb / eq.c[1]) > 0.2) break;
  }
  const p = eq.p[0];
  const cp = eq.c[eq.r.length];
  const fromA = (na * cp) / eq.c[0];
  const fromB = (nb * cp) / eq.c[1];
  return { eq, a, b, na, nb, p, fromA, fromB, lim: fromA < fromB ? a : b };
}
add('w9-limit', 'w9-limiting', 2, 0.1, (rng) => {
  const s = limitSetup(rng);
  return choice(rng, `${fmt(s.eq)}. You start with ${sig(s.na, 3)} mol ${pretty(s.a)} and ${sig(s.nb, 3)} mol ${pretty(s.b)}. Which is limiting?`, pretty(s.lim), [pretty(s.lim === s.a ? s.b : s.a), pretty(s.p), 'Neither: they react exactly'],
    `${pretty(s.a)} could make ${sig(s.fromA, 3)} mol ${pretty(s.p)}; ${pretty(s.b)} could make ${sig(s.fromB, 3)} mol. The smaller amount wins: ${pretty(s.lim)} runs out first.`,
    'Work out how much product each reactant could make. The smaller one is limiting.');
});
add('w9-limit-yield', 'w9-limiting', 3, 0.6, (rng) => {
  const s = limitSetup(rng);
  const right = Math.min(s.fromA, s.fromB);
  const m = (x: number) => `${sig(x, 3)} mol`;
  return choice(rng, `${fmt(s.eq)}. ${sig(s.na, 3)} mol ${pretty(s.a)} + ${sig(s.nb, 3)} mol ${pretty(s.b)}. Maximum moles of ${pretty(s.p)}?`, m(right), [m(Math.max(s.fromA, s.fromB)), m(s.fromA + s.fromB), m(Math.min(s.na, s.nb))],
    `From ${pretty(s.a)}: ${m(s.fromA)}. From ${pretty(s.b)}: ${m(s.fromB)}. The limiting reactant caps it at ${m(right)}.`, 'The smaller possible amount is the real answer.');
});

/* ---------- 24. percent yield ---------- */
addGuide(add, 'w9-yield', 24, [
  'Theoretical yield is the amount you actually collect.',
  'Percent yield and percent error are the same thing.',
  'A 106% yield means the reaction made extra matter.',
  'Percent yield = theoretical ÷ actual × 100%.',
]);
add('w9-pct', 'w9-yield', 2, -0.2, (rng) => {
  const theo = pick(rng, [25.0, 18.5, 40.0, 12.0, 50.0, 8.40, 32.6]);
  const actual = Math.round(theo * (0.55 + rng() * 0.4) * 10) / 10;
  const p = (actual / theo) * 100;
  const f = (x: number) => `${sig(x, 3)}%`;
  return choice(rng, `Theoretical yield ${sig(theo, 3)} g, actual yield ${sig(actual, 3)} g. Percent yield?`, f(p), [f((theo / actual) * 100), f(((theo - actual) / theo) * 100), f(actual / theo)],
    `${sig(actual, 3)} ÷ ${sig(theo, 3)} × 100% = ${f(p)}.`, 'Actual on top, theoretical on the bottom.');
});
add('w9-over100', 'w9-yield', 3, 0.4, (rng) => {
  const right = pick(rng, ['The product was still wet or contaminated', 'Leftover solvent or water was weighed with the product', 'A weighing mistake was made']);
  return choice(rng, 'A student gets a 106% yield. What is the most likely reason?', right, ['The reaction created extra matter', 'The limiting reactant was used up', 'The theoretical yield was too large'],
    'Matter can’t be created, so a yield over 100% means something extra was weighed: water, solvent, impurities, or a measurement error.', 'Conservation of mass still holds.');
});
add('w9-full', 'w9-yield', 4, 1.0, (rng) => {
  const s = limitSetup(rng);
  const theo = Math.min(s.fromA, s.fromB);
  const pct = 60 + Math.round(rng() * 35);
  const actual = (theo * pct) / 100;
  const f = (x: number) => `${sig(x, 3)}%`;
  const wrongTheo = Math.max(s.fromA, s.fromB);
  return choice(rng, `${fmt(s.eq)}. ${sig(s.na, 3)} mol ${pretty(s.a)} + ${sig(s.nb, 3)} mol ${pretty(s.b)} gives ${sig(actual, 3)} mol ${pretty(s.p)}. Percent yield?`, f((actual / theo) * 100),
    [f((actual / wrongTheo) * 100), f((theo / actual) * 100), f((actual / (s.fromA + s.fromB)) * 100)],
    `Limiting reactant gives a theoretical yield of ${sig(theo, 3)} mol. ${sig(actual, 3)} ÷ ${sig(theo, 3)} × 100% = ${f((actual / theo) * 100)}.`, 'Find the limiting reactant first. Theoretical yield comes from it.');
});

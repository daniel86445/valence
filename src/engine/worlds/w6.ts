// World 6 · Chapter 5 · Ionic and covalent compounds
import { EN, pretty, sub, sup } from '../chem';
import { addGuide, adder, choice, concept, pick, sample, shuffle, type Template } from './shared';

export const W6_CONCEPTS = [
  concept({ id: 'w6-ions', world: 'w6', sec: 1, name: 'Forming ions', short: 'Ions', card: 'Na', cardName: 'Sodium', cardFact: 'Sodium gives up its one valence electron so easily that the metal reacts violently with water.', watchTitle: 'Ions: lose or gain electrons', moLine: 'Metals lose electrons (+). Nonmetals gain them (−).' }),
  concept({ id: 'w6-formulas', world: 'w6', sec: 2, name: 'Ionic formulas', short: 'Formula', card: 'Ca', cardName: 'Calcium', cardFact: 'Calcium carbonate, CaCO₃, is chalk, limestone, marble and seashells.', watchTitle: 'Charges must cancel', moLine: 'Total + must equal total −. Then reduce the ratio.' }),
  concept({ id: 'w6-naming', world: 'w6', sec: 3, name: 'Naming ionic compounds', short: 'Names', card: 'Fe', cardName: 'Iron', cardFact: 'Iron makes both Fe²⁺ and Fe³⁺. That is exactly why names like iron(II) and iron(III) exist.', watchTitle: 'Cation first, anion second', moLine: 'Roman numeral = the metal’s charge. Never the subscript.' }),
  concept({ id: 'w6-covalent', world: 'w6', sec: 4, name: 'Covalent bonds', short: 'Bonds', card: 'N', cardName: 'Nitrogen', cardFact: 'N₂ has a triple bond, one of the strongest bonds in chemistry. It makes up about 78% of air.', watchTitle: 'Sharing electron pairs', moLine: 'Single, double, triple: more bonds = shorter and stronger.' }),
  concept({ id: 'w6-polarity', world: 'w6', sec: 5, name: 'Electronegativity & bond polarity', short: 'EN', card: 'F', cardName: 'Fluorine', cardFact: 'Fluorine is the most electronegative element. It pulls shared electrons harder than anything else.', watchTitle: 'Tug of war for electrons', moLine: 'Bigger electronegativity gap = more polar bond.' }),
  concept({ id: 'w6-lattice', world: 'w6', sec: 6, name: 'Lattice energy', short: 'Lattice', card: 'Mg', cardName: 'Magnesium', cardFact: 'MgO melts near 2850 °C because Mg²⁺ and O²⁻ (charges of 2) attract so strongly.', watchTitle: 'How hard ions hold on', moLine: 'Bigger charges and smaller ions = stronger lattice.' }),
];

export const W6_TEMPLATES: Template[] = [];
const add = adder(W6_TEMPLATES);

/* ---------- data ---------- */

const ION_OF: Record<string, number> = { Li: 1, Na: 1, K: 1, Mg: 2, Ca: 2, Ba: 2, Al: 3, N: -3, P: -3, O: -2, S: -2, F: -1, Cl: -1, Br: -1, I: -1 };
const NAME_OF: Record<string, string> = { Li: 'lithium', Na: 'sodium', K: 'potassium', Mg: 'magnesium', Ca: 'calcium', Ba: 'barium', Al: 'aluminum', N: 'nitrogen', P: 'phosphorus', O: 'oxygen', S: 'sulfur', F: 'fluorine', Cl: 'chlorine', Br: 'bromine', I: 'iodine' };
const chargeStr = (q: number) => (Math.abs(q) === 1 ? '' : String(Math.abs(q))) + (q > 0 ? '+' : '-');
const ionStr = (sym: string, q: number) => sym + sup(chargeStr(q));

interface Ion { f: string; q: number; name: string; poly?: boolean; fixed?: boolean }
const CATIONS: Ion[] = [
  { f: 'Na', q: 1, name: 'sodium', fixed: true }, { f: 'K', q: 1, name: 'potassium', fixed: true }, { f: 'Li', q: 1, name: 'lithium', fixed: true },
  { f: 'Mg', q: 2, name: 'magnesium', fixed: true }, { f: 'Ca', q: 2, name: 'calcium', fixed: true }, { f: 'Ba', q: 2, name: 'barium', fixed: true },
  { f: 'Al', q: 3, name: 'aluminum', fixed: true }, { f: 'Zn', q: 2, name: 'zinc', fixed: true },
  { f: 'Fe', q: 2, name: 'iron(II)' }, { f: 'Fe', q: 3, name: 'iron(III)' }, { f: 'Cu', q: 1, name: 'copper(I)' }, { f: 'Cu', q: 2, name: 'copper(II)' },
  { f: 'Pb', q: 2, name: 'lead(II)' }, { f: 'Co', q: 3, name: 'cobalt(III)' },
  { f: 'NH4', q: 1, name: 'ammonium', poly: true, fixed: true },
];
const ANIONS: Ion[] = [
  { f: 'Cl', q: -1, name: 'chloride' }, { f: 'Br', q: -1, name: 'bromide' }, { f: 'F', q: -1, name: 'fluoride' }, { f: 'I', q: -1, name: 'iodide' },
  { f: 'O', q: -2, name: 'oxide' }, { f: 'S', q: -2, name: 'sulfide' }, { f: 'N', q: -3, name: 'nitride' },
  { f: 'OH', q: -1, name: 'hydroxide', poly: true }, { f: 'NO3', q: -1, name: 'nitrate', poly: true }, { f: 'SO4', q: -2, name: 'sulfate', poly: true },
  { f: 'PO4', q: -3, name: 'phosphate', poly: true }, { f: 'CO3', q: -2, name: 'carbonate', poly: true },
];
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
const part = (ion: Ion, n: number) => (n === 1 ? ion.f : ion.poly ? `(${ion.f})${n}` : `${ion.f}${n}`);
export function formulaOf(c: Ion, a: Ion) {
  const g = gcd(c.q, -a.q);
  return part(c, -a.q / g) + part(a, c.q / g);
}
const ionLabel = (i: Ion) => pretty(i.f) + sup(chargeStr(i.q));
const nameOf = (c: Ion, a: Ion) => `${c.name} ${a.name}`;

/* ---------- 1. ions ---------- */
addGuide(add, 'w6-ions', 1, [
  'A positive ion forms when an atom gains protons.',
  'Cations are bigger than the neutral atoms they come from.',
  'Ionic bonding is just one atom handing an electron to another.',
  'Metals usually gain electrons to become anions.',
]);
add('w6-ion-charge', 'w6-ions', 2, -0.6, (rng) => {
  const el = pick(rng, Object.keys(ION_OF));
  const q = ION_OF[el];
  const right = ionStr(el, q);
  const wrongs = shuffle(rng, [1, 2, 3, -1, -2, -3].filter((x) => x !== q)).map((x) => ionStr(el, x));
  return choice(rng, `What ion does ${NAME_OF[el]} (${el}) usually form?`, right, wrongs,
    `${el} ${q > 0 ? `is a metal and loses ${q} electron${q > 1 ? 's' : ''}` : `is a nonmetal and gains ${-q} electron${q < -1 ? 's' : ''}`} to reach a noble-gas configuration: ${right}.`,
    'Use the group: groups 1, 2, 13 lose 1, 2, 3. Groups 15, 16, 17 gain 3, 2, 1.');
});
add('w6-ion-size', 'w6-ions', 3, 0.3, (rng) => {
  const series = [['N', -3], ['O', -2], ['F', -1], ['Na', 1], ['Mg', 2], ['Al', 3]] as const;
  const four = sample(rng, series, 4);
  const big = rng() < 0.5;
  const sorted = [...four].sort((a, b) => a[1] - b[1]); // most negative first = largest
  const target = big ? sorted[0] : sorted[sorted.length - 1];
  return choice(rng, `These ions all have 10 electrons. Which is ${big ? 'LARGEST' : 'SMALLEST'}?`, ionStr(target[0], target[1]), four.filter((x) => x !== target).map((x) => ionStr(x[0], x[1])),
    `Same 10 electrons, different numbers of protons. ${big ? 'Fewest' : 'Most'} protons = ${big ? 'weakest' : 'strongest'} pull = ${big ? 'largest' : 'smallest'} ion: ${ionStr(target[0], target[1])}.`,
    'Same electrons. Count protons: more protons pull the electrons in tighter.');
});
add('w6-ion-vs-atom', 'w6-ions', 4, 0.6, (rng) => {
  const el = pick(rng, Object.keys(ION_OF));
  const q = ION_OF[el];
  const ion = ionStr(el, q);
  const right = q > 0 ? `${el} is bigger than ${ion}` : `${ion} is bigger than ${el}`;
  const wrong = q > 0 ? `${ion} is bigger than ${el}` : `${el} is bigger than ${ion}`;
  return choice(rng, `Compare the size of a ${NAME_OF[el]} atom (${el}) with its ion (${ion}).`, right, [wrong, 'They are the same size', 'It depends on the temperature'],
    q > 0 ? `Losing electrons (here the whole outer shell) lets the protons pull the rest in tighter. Cations are smaller than their atoms.` : `Adding electrons increases electron–electron repulsion with the same nuclear charge, so the cloud spreads out. Anions are larger than their atoms.`,
    'Cations lose electrons. Anions gain them.');
});

/* ---------- 2. formulas ---------- */
addGuide(add, 'w6-formulas', 2, [
  'In MgCl₂, the subscript 2 is the charge on the chloride ion.',
  'An ionic formula like NaCl shows one separate molecule.',
  'To balance charges you can change the subscripts inside NO₃⁻.',
  'An ionic compound can have a small leftover charge.',
]);
function formulaWrongs(c: Ion, a: Ion): string[] {
  const out = [
    part(c, -a.q) + part(a, c.q), // not reduced
    part(c, c.q) + part(a, -a.q), // charges swapped onto wrong ion
    part(c, 1) + part(a, 1),
    c.f + (a.poly ? a.f + (c.q > 1 ? c.q : '') : a.f + (c.q > 1 ? c.q : '')), // forgot parentheses
    part(c, 2) + part(a, 3),
  ];
  return out.map(pretty);
}
add('w6-formula', 'w6-formulas', 2, -0.3, (rng) => {
  let c = pick(rng, CATIONS);
  let a = pick(rng, ANIONS);
  for (let i = 0; i < 6 && c.q === -a.q && rng() < 0.6; i++) { c = pick(rng, CATIONS); a = pick(rng, ANIONS); }
  const right = pretty(formulaOf(c, a));
  const g = gcd(c.q, -a.q);
  return choice(rng, `${ionLabel(c)} + ${ionLabel(a)} → what formula?`, right, formulaWrongs(c, a),
    `${-a.q / g} × (+${c.q}) and ${c.q / g} × (${a.q}) cancel to zero: ${right}.`,
    'Find how many of each ion make the + and − totals equal. Use the smallest whole numbers.');
});
add('w6-formula-name', 'w6-formulas', 3, 0.4, (rng) => {
  const c = pick(rng, CATIONS);
  const a = pick(rng, ANIONS.filter((x) => x.poly || rng() < 0.5));
  const right = pretty(formulaOf(c, a));
  return choice(rng, `Write the formula for ${nameOf(c, a)}.`, right, formulaWrongs(c, a),
    `${c.name} is ${ionLabel(c)} and ${a.name} is ${ionLabel(a)}. Balance the charges: ${right}.`,
    'Turn each name into an ion with its charge first.');
});
add('w6-formula-count', 'w6-formulas', 4, 0.8, (rng) => {
  const c = pick(rng, CATIONS);
  const a = pick(rng, ANIONS.filter((x) => x.poly));
  const f = formulaOf(c, a);
  const g = gcd(c.q, -a.q);
  const nA = c.q / g;
  return choice(rng, `How many ${a.name} ions are in one formula unit of ${pretty(f)}?`, String(nA), [String(nA + 1), String(Math.max(1, nA - 1)), String(-a.q / g + 3)].filter((x) => x !== String(nA)).concat(['0']),
    nA === 1 ? `No subscript after ${pretty(a.f)} means just 1 ${a.name} ion.` : `The subscript outside the parentheses counts ${a.name} ions: ${nA}.`, 'Look at the number right after the polyatomic ion (outside any parentheses).');
});

/* ---------- 3. naming ---------- */
addGuide(add, 'w6-naming', 3, [
  'FeCl₃ is named iron trichloride.',
  'The Roman numeral tells how many metal ions are in the formula.',
  'NaCl should be named sodium(I) chloride.',
  'Sulfide and sulfate are two names for the same ion.',
]);
function nameWrongs(c: Ion, a: Ion, f: string): string[] {
  const base = c.name.replace(/\(.*\)/, '');
  const g = gcd(c.q, -a.q);
  const nC = -a.q / g;
  const nA = c.q / g;
  const roman = ['', 'I', 'II', 'III', 'IV'];
  const swapAnion: Record<string, string> = { sulfide: 'sulfate', sulfate: 'sulfide', nitride: 'nitrate', nitrate: 'nitride', oxide: 'hydroxide', hydroxide: 'oxide', chloride: 'chlorate', phosphate: 'phosphide', carbonate: 'carbide' };
  const prefix = ['', '', 'di', 'tri', 'tetra'];
  const out = [
    `${base} ${a.name}`.replace(/\s+/, ' '),
    `${base}(${roman[nC] || 'I'}) ${a.name}`, // numeral = subscript (common error)
    `${prefix[nC]}${base} ${prefix[nA]}${a.name}`,
    `${c.name} ${swapAnion[a.name] ?? a.name + 'ate'}`,
    c.fixed ? `${base}(${roman[c.q]}) ${a.name}` : `${base}(${roman[c.q === 3 ? 2 : c.q + 1]}) ${a.name}`,
  ];
  void f;
  return out;
}
add('w6-name', 'w6-naming', 2, -0.2, (rng) => {
  const c = pick(rng, CATIONS);
  const a = pick(rng, ANIONS);
  const f = formulaOf(c, a);
  const right = nameOf(c, a);
  return choice(rng, `Name ${pretty(f)}.`, right, nameWrongs(c, a, f),
    c.fixed ? `${c.name} has only one possible charge, so no Roman numeral: ${right}.` : `Work out the metal charge from the anion: ${a.name} is ${a.q}, so the metal must be +${c.q}. Name: ${right}.`,
    'Cation first, anion second. Variable-charge metals (Fe, Cu, Pb, Co) need a Roman numeral for their charge.');
});
add('w6-name-numeral', 'w6-naming', 3, 0.6, (rng) => {
  const c = pick(rng, CATIONS.filter((x) => !x.fixed));
  const a = pick(rng, ANIONS);
  const f = formulaOf(c, a);
  const right = nameOf(c, a);
  return choice(rng, `${pretty(f)} contains a metal that can have more than one charge. What is its name?`, right, nameWrongs(c, a, f),
    `Total negative charge: ${(c.q / gcd(c.q, -a.q)) * a.q}. That is spread over the metal ions, so each is +${c.q}: ${right}.`,
    'Total the anion charge, then divide by the number of metal ions.');
});

/* ---------- 4. covalent bonds ---------- */
addGuide(add, 'w6-covalent', 4, [
  'A double bond is twice as long as a single bond.',
  'Covalent bonds always share electrons perfectly equally.',
  'Higher bond order means a longer, weaker bond.',
  'Shared electrons only count toward one of the two bonded atoms.',
]);
const BOND_SETS = [
  { a: 'C', b: 'C', orders: [['C–C', 154], ['C=C', 134], ['C≡C', 120]] },
  { a: 'C', b: 'O', orders: [['C–O', 143], ['C=O', 123], ['C≡O', 113]] },
  { a: 'N', b: 'N', orders: [['N–N', 145], ['N=N', 125], ['N≡N', 110]] },
  { a: 'C', b: 'N', orders: [['C–N', 147], ['C=N', 128], ['C≡N', 116]] },
] as const;
add('w6-bond-order', 'w6-covalent', 2, -0.4, (rng) => {
  const s = pick(rng, BOND_SETS);
  const ask = pick(rng, ['shortest', 'longest', 'strongest', 'weakest'] as const);
  const i = ask === 'shortest' || ask === 'strongest' ? 2 : 0;
  return choice(rng, `Between ${s.a} and ${s.b}, which bond is ${ask.toUpperCase()}?`, s.orders[i][0], [...s.orders.filter((_, j) => j !== i).map((o) => o[0] as string), 'All the same'],
    `Bond order ${i + 1} (${s.orders[i][0]}). Higher bond order = more shared pairs = shorter and stronger. Lengths: ${s.orders.map((o) => `${o[0]} ${o[1]} pm`).join(', ')}.`,
    'More shared pairs pull the atoms closer and hold them tighter.');
});
add('w6-shared-pairs', 'w6-covalent', 3, 0.3, (rng) => {
  const items = [['Cl₂ (Cl–Cl)', 1], ['O₂ (O=O)', 2], ['N₂ (N≡N)', 3], ['H₂ (H–H)', 1], ['CO₂ (each C=O)', 2], ['HCN (the C≡N)', 3]] as const;
  const [label, n] = pick(rng, items);
  return choice(rng, `How many electrons are SHARED in the bond in ${label}?`, String(n * 2), [String(n), String(n * 2 + 2), String(n + 1), '8'],
    `${['single', 'double', 'triple'][n - 1]} bond = ${n} shared pair${n > 1 ? 's' : ''} = ${n * 2} electrons.`, 'Each bond line is one shared PAIR (2 electrons).');
});

/* ---------- 5. electronegativity ---------- */
addGuide(add, 'w6-polarity', 5, [
  'A polar covalent bond has full +1 and −1 charges on its atoms.',
  'Any molecule with a polar bond must be a polar molecule.',
  'The more electronegative atom gets the partial positive charge.',
  'Electronegativity increases toward the bottom left of the periodic table.',
]);
const BONDS = [['C', 'H'], ['N', 'H'], ['O', 'H'], ['F', 'H'], ['C', 'O'], ['C', 'F'], ['C', 'Cl'], ['H', 'Cl'], ['H', 'Br'], ['S', 'H'], ['C', 'N'], ['B', 'F'], ['Si', 'O'], ['P', 'Cl'], ['N', 'O'], ['C', 'S']] as const;
const diff = (x: readonly [string, string]) => Math.abs(EN[x[0]] - EN[x[1]]);
add('w6-most-polar', 'w6-polarity', 2, 0.0, (rng) => {
  let set = sample(rng, BONDS, 4);
  for (let k = 0; k < 20; k++) {
    const d = set.map(diff).sort((a, b) => b - a);
    if (d[0] - d[1] >= 0.3) break;
    set = sample(rng, BONDS, 4);
  }
  const best = [...set].sort((a, b) => diff(b) - diff(a))[0];
  const lab = (x: readonly [string, string]) => `${x[0]}–${x[1]}`;
  return choice(rng, 'Which bond is MOST polar?', lab(best), set.filter((x) => x !== best).map(lab),
    `Electronegativity gaps: ${set.map((x) => `${lab(x)} ${diff(x).toFixed(2)}`).join(', ')}. Biggest gap = most polar: ${lab(best)}.`,
    'Find the biggest electronegativity difference. F, O, N, Cl are the strong pullers.');
});
add('w6-partial', 'w6-polarity', 3, 0.3, (rng) => {
  const b = pick(rng, BONDS.filter((x) => diff(x) > 0.3));
  const neg = EN[b[0]] > EN[b[1]] ? b[0] : b[1];
  const pos = neg === b[0] ? b[1] : b[0];
  return choice(rng, `In a ${b[0]}–${b[1]} bond, which atom carries the partial NEGATIVE charge (δ−)?`, `${neg}, because it is more electronegative`,
    [`${pos}, because it is more electronegative`, `${pos}, because it is smaller`, 'Neither: the electrons are shared equally'],
    `${neg} (${EN[neg]}) beats ${pos} (${EN[pos]}), so shared electrons spend more time near ${neg}: δ− on ${neg}, δ+ on ${pos}.`, 'Electrons drift toward the atom that pulls harder.');
});
add('w6-bond-type', 'w6-polarity', 4, 0.7, (rng) => {
  const items = [['Cl–Cl', 'Nonpolar covalent', 0], ['H–H', 'Nonpolar covalent', 0], ['C–H', 'Nonpolar covalent', 0.35], ['O–H', 'Polar covalent', 1.24], ['H–Cl', 'Polar covalent', 0.96], ['C–O', 'Polar covalent', 0.89], ['Na–Cl', 'Ionic', 2.23], ['K–F', 'Ionic', 3.16], ['Mg–O', 'Ionic', 2.13], ['N–H', 'Polar covalent', 0.84]] as const;
  const [bond, right, d] = pick(rng, items);
  return choice(rng, `Classify the ${bond} bond (electronegativity difference ${d.toFixed(2)}).`, right, ['Nonpolar covalent', 'Polar covalent', 'Ionic', 'Metallic'].filter((x) => x !== right),
    `A difference of ${d.toFixed(2)} is ${d < 0.5 ? 'small: electrons are shared nearly equally' : d < 2 ? 'medium: shared unequally' : 'huge: electrons are essentially transferred'}. So it is ${right.toLowerCase()}.`,
    'Rough guide: under 0.5 nonpolar, 0.5 to 2 polar covalent, over 2 ionic.');
});

/* ---------- 6. lattice energy ---------- */
addGuide(add, 'w6-lattice', 6, [
  'Solid NaCl conducts electricity because it is made of ions.',
  'Ionic solids melt easily because ionic attractions are weak.',
  'Lattice energy depends only on ion charge, not ion size.',
  'Ionic crystals bend instead of shattering when hit.',
]);
const LATTICE_PAIRS = [
  ['MgO', 'NaCl', 'Charges 2+/2− beat 1+/1−.'], ['CaO', 'KCl', 'Charges 2+/2− beat 1+/1−.'], ['NaF', 'NaCl', 'F⁻ is smaller than Cl⁻, so the ions sit closer.'],
  ['LiF', 'KF', 'Li⁺ is smaller than K⁺, so the ions sit closer.'], ['NaCl', 'KBr', 'Na⁺ and Cl⁻ are both smaller than K⁺ and Br⁻.'], ['MgO', 'BaO', 'Mg²⁺ is smaller than Ba²⁺.'],
  ['CaO', 'BaS', 'Ca²⁺ and O²⁻ are smaller than Ba²⁺ and S²⁻.'], ['MgO', 'LiF', 'Charges 2+/2− beat 1+/1−.'], ['NaCl', 'NaI', 'Cl⁻ is smaller than I⁻.'],
] as const;
add('w6-lattice-pair', 'w6-lattice', 2, -0.2, (rng) => {
  const [big, small, why] = pick(rng, LATTICE_PAIRS);
  return choice(rng, `Which has the LARGER lattice energy (stronger attraction between ions)?`, pretty(big), [pretty(small), 'They are equal'],
    `${pretty(big)}. ${why} Bigger charges and smaller distances both strengthen the attraction.`, 'Check charges first. If charges match, the smaller ions win.');
});
add('w6-conduct', 'w6-lattice', 3, 0.3, (rng) => ({
  kind: 'swipe', left: 'Conducts', right: 'Does not conduct',
  cards: shuffle(rng, [
    { text: 'Solid NaCl', side: 'R' as const }, { text: 'Molten NaCl', side: 'L' as const }, { text: 'NaCl dissolved in water', side: 'L' as const },
    { text: 'Solid KBr crystal', side: 'R' as const }, { text: 'Molten MgO', side: 'L' as const }, { text: 'CaCl₂ in water', side: 'L' as const }, { text: 'Solid MgO', side: 'R' as const },
  ]).slice(0, 6),
  prompt: 'Does it conduct electricity?', hint: 'Conducting needs charged particles that can MOVE.',
  why: 'In a solid ionic crystal the ions are locked in place. Melt it or dissolve it and the ions can move, so it conducts.',
}));
add('w6-lattice-rank', 'w6-lattice', 4, 0.9, (rng) => {
  const sets = [
    { order: ['MgO', 'NaF', 'NaCl', 'KBr'], why: 'MgO has 2+/2− charges. Then among 1+/1− compounds, smaller ions win: NaF > NaCl > KBr.' },
    { order: ['CaO', 'LiF', 'NaCl', 'KI'], why: 'CaO has 2+/2− charges. Then smaller ions win: LiF > NaCl > KI.' },
    { order: ['MgO', 'CaO', 'BaO', 'NaCl'], why: 'All the oxides are 2+/2−; smaller cation wins: Mg > Ca > Ba. NaCl (1+/1−) is last.' },
  ];
  const s = pick(rng, sets);
  const right = s.order.map(pretty).join(' > ');
  const wrongs = [[...s.order].reverse(), [s.order[1], s.order[0], s.order[2], s.order[3]], [s.order[0], s.order[2], s.order[1], s.order[3]]].map((o) => o.map(pretty).join(' > '));
  return choice(rng, 'Rank by lattice energy, largest first.', right, wrongs, s.why, 'Charges first, then size.');
});

export { ionStr, sub };

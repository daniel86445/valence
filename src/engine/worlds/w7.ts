// World 7 · Chapter 6 · Representing molecules
import { VALENCE, atoms, pretty, valenceElectrons } from '../chem';
import { addGuide, adder, choice, concept, pick, sample, shuffle, type Template } from './shared';
import { MOLECULES, label, type Molecule } from './molecules';

export const W7_CONCEPTS = [
  concept({ id: 'w7-valence', world: 'w7', sec: 7, name: 'Counting valence electrons', short: 'e⁻', card: 'Si', cardName: 'Silicon', cardFact: 'Silicon has 4 valence electrons, just like carbon. It is the heart of every computer chip.', watchTitle: 'Count before you draw', moLine: 'Add up valence electrons. Negative ion: add. Positive ion: subtract.' }),
  concept({ id: 'w7-lewis', world: 'w7', sec: 8, name: 'Drawing Lewis structures', short: 'Lewis', card: 'C', cardName: 'Carbon', cardFact: 'Carbon makes 4 bonds in almost every Lewis structure you will draw. That is why it sits in the middle so often.', watchTitle: 'Skeleton, bonds, octets', moLine: 'Least electronegative atom (not H) goes in the middle.' }),
  concept({ id: 'w7-formal', world: 'w7', sec: 9, name: 'Formal charge', short: 'FC', card: 'S', cardName: 'Sulfur', cardFact: 'Sulfur gives rotten eggs their smell (H₂S) and is in the amino acids that build your hair.', watchTitle: 'Bookkeeping for electrons', moLine: 'FC = valence − lone-pair electrons − bonds.' }),
  concept({ id: 'w7-resonance', world: 'w7', sec: 10, name: 'Resonance', short: 'Res', card: 'O', cardName: 'Oxygen', cardFact: 'Ozone (O₃) is a resonance hybrid: both O–O bonds are exactly the same length.', watchTitle: 'Same atoms, moved electrons', moLine: 'Resonance moves electrons, never atoms.' }),
  concept({ id: 'w7-octet', world: 'w7', sec: 11, name: 'Octet rule exceptions', short: 'Octet', card: 'P', cardName: 'Phosphorus', cardFact: 'In PCl₅, phosphorus holds 10 electrons. Period 3 and below can expand their octet.', watchTitle: 'When 8 is not the rule', moLine: 'Too few (B, Be), odd count, or expanded (period 3+).' }),
  concept({ id: 'w7-enthalpy', world: 'w7', sec: 12, name: 'Bond enthalpy', short: 'ΔH', card: 'Br', cardName: 'Bromine', cardFact: 'Bromine is one of only two elements that are liquid at room temperature. The other is mercury.', watchTitle: 'Breaking costs, forming pays', moLine: 'ΔH ≈ bonds broken − bonds formed.' }),
];

export const W7_TEMPLATES: Template[] = [];
const add = adder(W7_TEMPLATES);

const ION_EXTRA: { f: string; charge: number }[] = [
  { f: 'SO4', charge: -2 }, { f: 'PO4', charge: -3 }, { f: 'CN', charge: -1 }, { f: 'H3O', charge: 1 }, { f: 'OH', charge: -1 }, { f: 'ClO3', charge: -1 },
];
const show = (f: string, charge = 0) => pretty(charge ? `${f}^${Math.abs(charge) > 1 ? Math.abs(charge) : ''}${charge > 0 ? '+' : '-'}` : f);

/* ---------- 7. valence electrons ---------- */
addGuide(add, 'w7-valence', 7, [
  'For a negative ion, subtract electrons from the total.',
  'Lewis structures show all of an atom’s electrons, including core electrons.',
  'NH₄⁺ has 9 valence electrons.',
  'CO₂ has 12 valence electrons.',
]);
function veQuestion(rng: () => number, f: string, charge: number) {
  const right = valenceElectrons(f, charge);
  const a = atoms(f);
  const noSubs = Object.keys(a).reduce((s, e) => s + VALENCE[e], 0) - charge;
  const wrongs = [right + 2 * charge, valenceElectrons(f, 0), noSubs, right + 2, right - 2].filter((x) => x !== right && x > 0).map(String);
  const parts = Object.entries(a).map(([e, n]) => `${n > 1 ? n + '×' : ''}${e}(${VALENCE[e]})`).join(' + ');
  return choice(rng, `How many total valence electrons should you use to draw ${show(f, charge)}?`, String(right), wrongs,
    `${parts}${charge ? (charge < 0 ? ` + ${-charge} (negative charge adds electrons)` : ` − ${charge} (positive charge removes electrons)`) : ''} = ${right}.`,
    'Group number = valence electrons for main-group atoms. Don’t forget the ion’s charge.');
}
add('w7-ve-molecule', 'w7-valence', 2, -0.5, (rng) => {
  const m = pick(rng, MOLECULES.filter((x) => !x.charge));
  return veQuestion(rng, m.f, 0);
});
add('w7-ve-ion', 'w7-valence', 3, 0.3, (rng) => {
  const m = pick(rng, [...MOLECULES.filter((x) => x.charge).map((x) => ({ f: x.f, charge: x.charge! })), ...ION_EXTRA]);
  return veQuestion(rng, m.f, m.charge);
});

/* ---------- 8. drawing Lewis structures ---------- */
addGuide(add, 'w7-lewis', 8, [
  'Hydrogen needs eight electrons in a Lewis structure.',
  'The first atom written in a formula is always the central atom.',
  'The most electronegative atom usually goes in the center.',
  'If the electron count is right, the Lewis structure must be right.',
]);
const lewisOf = (m: Molecule) => ({ central: m.central, bonds: m.bonds, lp: m.lp, charge: m.charge });
add('w7-central', 'w7-lewis', 2, -0.3, (rng) => {
  const m = pick(rng, MOLECULES.filter((x) => new Set([x.central, ...x.bonds.map((b) => b[0])]).size > 1 && x.f !== 'O3'));
  const others = Array.from(new Set(m.bonds.map((b) => b[0]).filter((e) => e !== m.central)));
  const wrongs = [...others, 'H'].filter((e) => e !== m.central);
  return choice(rng, `Which atom goes in the CENTER of ${show(m.f, m.charge)}?`, m.central, wrongs,
    `${m.central} is the least electronegative atom that isn’t hydrogen, so it goes in the middle${m.f === 'OF2' ? ' (O is less electronegative than F)' : ''}.`,
    'Not H (it only makes one bond). Pick the least electronegative of the rest.', { lewis: lewisOf(m), revealOnly: true });
});
add('w7-lone-pairs', 'w7-lewis', 3, 0.4, (rng) => {
  const m = pick(rng, MOLECULES.filter((x) => x.octet === 'ok'));
  return choice(rng, `In the Lewis structure of ${show(m.f, m.charge)}, how many lone pairs are on the central ${m.central}?`, String(m.lp), ['0', '1', '2', '3'].filter((x) => x !== String(m.lp)),
    `${m.ve} valence electrons. ${m.bonds.length} bonds to ${m.central}${m.bonds.some((b) => b[1] > 1) ? ' (including a multiple bond)' : ''}; after giving outer atoms their octets, ${m.lp === 0 ? 'no electrons are left' : `${m.lp * 2} electrons are left`} for ${m.central}: ${m.lp} lone pair${m.lp === 1 ? '' : 's'}.`,
    'Count total valence electrons, draw single bonds, fill outer octets, put leftovers on the center.', { lewis: lewisOf(m), revealOnly: true });
});
add('w7-multiple', 'w7-lewis', 4, 0.8, (rng) => {
  const m = pick(rng, MOLECULES.filter((x) => x.bonds.some((b) => b[1] > 1) && !x.resonance));
  const [atom, order] = m.bonds.find((b) => b[1] > 1)!;
  return choice(rng, `In ${show(m.f, m.charge)}, what kind of bond joins ${m.central} and ${atom}?`, ['single', 'double', 'triple'][order - 1] + ' bond', ['single bond', 'double bond', 'triple bond', 'ionic bond'],
    `With only ${m.ve} valence electrons, single bonds leave ${m.central} short of an octet. Turning lone pairs into shared pairs gives a ${['single', 'double', 'triple'][order - 1]} bond.`,
    'If the center lacks an octet, move a lone pair from a neighbor into a shared pair.', { lewis: lewisOf(m), revealOnly: true });
});

/* ---------- 9. formal charge ---------- */
addGuide(add, 'w7-formal', 9, [
  'Formal charge is the real, measured charge on an atom.',
  'The formal charges in a neutral molecule add up to +1.',
  'The best structure puts negative formal charge on the least electronegative atom.',
  'Every atom in a stable molecule must have a formal charge of zero.',
]);
add('w7-fc-calc', 'w7-formal', 2, -0.2, (rng) => {
  const combos = [
    ['N', 0, 4], ['N', 1, 3], ['N', 2, 2], ['O', 1, 3], ['O', 2, 2], ['O', 3, 1], ['C', 0, 4], ['C', 1, 3], ['B', 0, 4], ['S', 2, 2], ['Cl', 3, 1], ['F', 3, 1], ['C', 0, 3], ['O', 0, 4],
  ] as const;
  const [el, lp, b] = pick(rng, combos);
  const v = VALENCE[el];
  const fc = v - 2 * lp - b;
  const fmt = (x: number) => (x > 0 ? `+${x}` : String(x));
  return choice(rng, `A ${el} atom (${v} valence e⁻) has ${lp} lone pair${lp === 1 ? '' : 's'} and ${b} bond${b === 1 ? '' : 's'}. Its formal charge is…`, fmt(fc),
    [fmt(v - lp - b), fmt(v - 2 * lp - 2 * b), fmt(-fc), fmt(fc + 1)],
    `FC = ${v} − ${2 * lp} (lone-pair electrons) − ${b} (one per bond) = ${fmt(fc)}.`,
    'FC = valence − (electrons in lone pairs) − (number of bonds). Each lone pair is 2 electrons.');
});
add('w7-fc-known', 'w7-formal', 3, 0.5, (rng) => {
  const items = [
    { q: 'the N in NH₄⁺', fc: '+1', why: 'N has 5 valence e⁻, 0 lone pairs, 4 bonds: 5 − 0 − 4 = +1.' },
    { q: 'the O in H₃O⁺', fc: '+1', why: 'O has 6 valence e⁻, 1 lone pair (2 e⁻), 3 bonds: 6 − 2 − 3 = +1.' },
    { q: 'the C in CN⁻ (C≡N with one lone pair on C)', fc: '-1', why: 'C has 4 valence e⁻, 2 lone-pair e⁻, 3 bonds: 4 − 2 − 3 = −1.' },
    { q: 'the B in BF₄⁻', fc: '-1', why: 'B has 3 valence e⁻, 0 lone pairs, 4 bonds: 3 − 0 − 4 = −1.' },
    { q: 'the central O in O₃', fc: '+1', why: 'Central O: 6 valence e⁻, 1 lone pair (2), 3 bonds (one double, one single): 6 − 2 − 3 = +1.' },
    { q: 'the single-bonded O in O₃', fc: '-1', why: '6 valence e⁻, 3 lone pairs (6), 1 bond: 6 − 6 − 1 = −1.' },
    { q: 'the C in CO₂ (O=C=O)', fc: '0', why: '4 valence e⁻, 0 lone pairs, 4 bonds: 4 − 0 − 4 = 0.' },
  ];
  const it = pick(rng, items);
  return choice(rng, `What is the formal charge on ${it.q}?`, it.fc, ['+1', '-1', '0', '+2', '-2'].filter((x) => x !== it.fc), it.why, 'FC = valence − lone-pair electrons − bonds.');
});
add('w7-fc-sum', 'w7-formal', 4, 0.7, (rng) => {
  const m = pick(rng, [...MOLECULES, ...MOLECULES.filter((x) => x.charge)]);
  const c = m.charge ?? 0;
  const fmt = (x: number) => (x > 0 ? `+${x}` : String(x));
  return choice(rng, `The formal charges on all atoms in ${show(m.f, c)} must add up to…`, fmt(c), [fmt(c + 1), fmt(c - 1), fmt(-c || 2), 'the number of bonds'],
    `Formal charges always sum to the overall charge of the species: ${fmt(c)}.`, 'Neutral molecule → 0. Ion → its charge.');
});

/* ---------- 10. resonance ---------- */
addGuide(add, 'w7-resonance', 10, [
  'A molecule flips back and forth between its resonance structures.',
  'Atoms move to new positions in each resonance structure.',
  'Resonance structures are different compounds.',
  'In NO₃⁻, one N–O bond is shorter than the other two.',
]);
add('w7-res-sort', 'w7-resonance', 2, -0.1, (rng) => {
  const yes = MOLECULES.filter((m) => m.resonance).map((m) => show(m.f, m.charge));
  const no = ['CH₄', 'NH₃', 'H₂O', 'CCl₄', 'HCN', 'NH₄⁺', 'BF₃'];
  const cards = shuffle(rng, [...sample(rng, yes, 3).map((text) => ({ text, side: 'L' as const })), ...sample(rng, no, 3).map((text) => ({ text, side: 'R' as const }))]);
  return {
    kind: 'swipe', left: 'Has resonance', right: 'No resonance', cards,
    prompt: 'Does it need resonance structures?', hint: 'Resonance shows up when a double bond could sit in more than one equivalent spot.',
    why: 'NO₃⁻, CO₃²⁻, NO₂⁻, SO₂ and O₃ each have a double bond that could be drawn to different, equivalent O atoms. The others have only one good structure.',
  };
});
add('w7-res-bo', 'w7-resonance', 3, 0.6, (rng) => {
  const items = [['NO₃⁻', '1⅓', '3 N–O bonds share 1 double bond: 4 shared pairs ÷ 3 bonds = 1⅓.'], ['CO₃²⁻', '1⅓', '3 C–O bonds share 1 double bond: 4 ÷ 3 = 1⅓.'], ['O₃', '1½', '2 O–O bonds share 1 double bond: 3 ÷ 2 = 1½.'], ['NO₂⁻', '1½', '2 N–O bonds share 1 double bond: 3 ÷ 2 = 1½.'], ['SO₂', '1½', 'In the octet structures, 2 S–O bonds share 1 double bond: 3 ÷ 2 = 1½.']] as const;
  const [sp, bo, why] = pick(rng, items);
  return choice(rng, `In the resonance hybrid of ${sp}, what is the average bond order of each bond to the central atom?`, bo, ['1', '2', '1½', '1⅓', '3'].filter((x) => x !== bo), `${why} All the bonds are identical in reality.`, 'Total bonds (shared pairs) ÷ number of positions.');
});

/* ---------- 11. octet exceptions ---------- */
addGuide(add, 'w7-octet', 11, [
  'Every stable molecule obeys the octet rule.',
  'Carbon, nitrogen and oxygen can have expanded octets.',
  'BF₃’s Lewis structure is wrong because boron only has 6 electrons.',
  'Hydrogen can hold 8 electrons in a Lewis structure.',
]);
add('w7-octet-type', 'w7-octet', 2, 0.0, (rng) => {
  const pool = [
    ...MOLECULES.filter((m) => !m.charge).map((m) => ({ f: m.f, t: m.octet })),
    { f: 'NO', t: 'odd' as const }, { f: 'NO2', t: 'odd' as const }, { f: 'ClO2', t: 'odd' as const }, { f: 'BH3', t: 'incomplete' as const },
  ];
  const it = pick(rng, pool);
  const names = { ok: 'Follows the octet rule', incomplete: 'Incomplete octet', expanded: 'Expanded octet', odd: 'Odd number of electrons' } as const;
  const ve = valenceElectrons(it.f);
  return choice(rng, `Which describes the central atom in ${pretty(it.f)} (${ve} valence e⁻)?`, names[it.t], Object.values(names).filter((x) => x !== names[it.t]),
    it.t === 'odd' ? `${ve} is odd, so one electron must be unpaired. No structure gives every atom an octet.` : it.t === 'incomplete' ? 'B and Be are often stable with fewer than 8 electrons around them.' : it.t === 'expanded' ? 'The central atom is in period 3 or below and holds more than 8 electrons.' : 'Every atom (except H with 2) ends up with 8 electrons.',
    'Odd total? Odd-electron. B or Be center? Incomplete. More than 4 atoms bonded, period 3+? Expanded.');
});
add('w7-octet-swipe', 'w7-octet', 3, 0.5, (rng) => {
  const ok = ['CH₄', 'NH₃', 'H₂O', 'CO₂', 'HCN', 'CCl₄'];
  const ex = ['BF₃', 'BeCl₂', 'NO', 'PCl₅', 'SF₆', 'XeF₄', 'NO₂', 'SF₄'];
  return {
    kind: 'swipe', left: 'Octet rule works', right: 'Exception', cards: shuffle(rng, [...sample(rng, ok, 3).map((text) => ({ text, side: 'L' as const })), ...sample(rng, ex, 3).map((text) => ({ text, side: 'R' as const }))]),
    prompt: 'Does the central atom follow the octet rule?', hint: 'Look for B/Be centers, odd electron totals, and big period 3+ centers with lots of neighbors.',
    why: 'BF₃ and BeCl₂ are electron-deficient, NO and NO₂ have odd electron counts, and PCl₅, SF₆, SF₄ and XeF₄ expand past 8.',
  };
});

/* ---------- 12. bond enthalpy ---------- */
addGuide(add, 'w7-enthalpy', 12, [
  'Breaking a chemical bond releases energy.',
  'Forming a chemical bond requires energy.',
  'A triple bond is the longest of single, double and triple bonds.',
  'Average bond enthalpies give exact reaction enthalpies.',
]);
add('w7-dh', 'w7-enthalpy', 2, 0.0, (rng) => {
  const broken = 100 * Math.round(2 + rng() * 25) + 10 * Math.round(rng() * 9);
  let formed = broken + (rng() < 0.5 ? -1 : 1) * (40 + 10 * Math.round(rng() * 40));
  if (formed <= 0) formed = broken + 160;
  const dh = broken - formed;
  const fmt = (x: number) => `${x > 0 ? '+' : ''}${x} kJ, ${x < 0 ? 'exothermic' : 'endothermic'}`;
  return choice(rng, `A reaction breaks bonds needing ${broken} kJ and forms bonds releasing ${formed} kJ. Estimate ΔH.`, fmt(dh), [fmt(-dh), `${broken + formed} kJ, endothermic`, `${-(broken + formed)} kJ, exothermic`],
    `ΔH ≈ broken − formed = ${broken} − ${formed} = ${dh > 0 ? '+' : ''}${dh} kJ. ${dh < 0 ? 'More energy released than absorbed: exothermic.' : 'More energy absorbed than released: endothermic.'}`,
    'Breaking costs energy (+). Forming releases energy (−). ΔH ≈ broken − formed.');
});
add('w7-dh-table', 'w7-enthalpy', 3, 0.6, (rng) => {
  const rx = [
    { eq: 'H₂ + Cl₂ → 2HCl', broken: [['H–H', 436, 1], ['Cl–Cl', 243, 1]], formed: [['H–Cl', 431, 2]] },
    { eq: 'H₂ + F₂ → 2HF', broken: [['H–H', 436, 1], ['F–F', 159, 1]], formed: [['H–F', 567, 2]] },
    { eq: 'H₂ + Br₂ → 2HBr', broken: [['H–H', 436, 1], ['Br–Br', 193, 1]], formed: [['H–Br', 366, 2]] },
    { eq: 'N₂ + 3H₂ → 2NH₃', broken: [['N≡N', 941, 1], ['H–H', 436, 3]], formed: [['N–H', 393, 6]] },
  ] as const;
  const r = pick(rng, rx);
  const b = r.broken.reduce((s, x) => s + x[1] * x[2], 0);
  const f = r.formed.reduce((s, x) => s + x[1] * x[2], 0);
  const dh = b - f;
  const fmt = (x: number) => `${x > 0 ? '+' : ''}${x} kJ`;
  const list = [...r.broken, ...r.formed].map((x) => `${x[0]} ${x[1]}`).join(', ');
  return choice(rng, `Use bond enthalpies (kJ/mol: ${list}) to estimate ΔH for ${r.eq}.`, fmt(dh), [fmt(-dh), fmt(b + f), fmt(dh + 200)],
    `Broken: ${r.broken.map((x) => `${x[2]}×${x[1]}`).join(' + ')} = ${b}. Formed: ${r.formed.map((x) => `${x[2]}×${x[1]}`).join(' + ')} = ${f}. ΔH ≈ ${b} − ${f} = ${fmt(dh)}.`,
    'Multiply each bond by how many times it appears. ΔH ≈ broken − formed.');
});
add('w7-bond-rank', 'w7-enthalpy', 4, 0.5, (rng) => {
  const ask = pick(rng, ['longest to shortest', 'weakest to strongest'] as const);
  return choice(rng, `Rank the carbon–carbon bonds from ${ask}.`, 'C–C, C=C, C≡C', ['C≡C, C=C, C–C', 'C=C, C–C, C≡C', 'They are all the same'],
    'Bond order goes 1, 2, 3. Higher order = shorter and stronger, so the single bond is longest and weakest, the triple bond shortest and strongest.', 'More shared pairs = shorter, stronger.');
});

export { label };

// World 8 · Chapter 7 · Molecular geometry, intermolecular forces, bonding theories
import { pretty } from '../chem';
import { addGuide, adder, choice, concept, pick, sample, shuffle, type Template } from './shared';
import { IMF_EXTRA, MOLECULES, domains, neutral, type Molecule } from './molecules';

export const W8_CONCEPTS = [
  concept({ id: 'w8-vsepr', world: 'w8', sec: 13, name: 'VSEPR & electron domains', short: 'VSEPR', card: 'Kr', cardName: 'Krypton', cardFact: 'Krypton is a noble gas, yet it forms KrF₂: a linear molecule, just as VSEPR predicts.', watchTitle: 'Electron groups spread out', moLine: 'Count domains: each bond (even double/triple) or lone pair = 1.' }),
  concept({ id: 'w8-shape', world: 'w8', sec: 14, name: 'Molecular geometry', short: 'Shape', card: 'Se', cardName: 'Selenium', cardFact: 'H₂Se is bent, just like water, because selenium has two lone pairs.', watchTitle: 'Lone pairs bend shapes', moLine: 'Name the shape by the ATOMS. Lone pairs squeeze the angles.' }),
  concept({ id: 'w8-molpolar', world: 'w8', sec: 15, name: 'Molecular polarity', short: 'Polar', card: 'Cl', cardName: 'Chlorine', cardFact: 'HCl is polar: chlorine pulls the shared electrons, leaving H slightly positive.', watchTitle: 'Do the dipoles cancel?', moLine: 'Polar bonds + symmetric shape can still be nonpolar.' }),
  concept({ id: 'w8-imf', world: 'w8', sec: 16, name: 'Intermolecular forces', short: 'IMF', card: 'Ar', cardName: 'Argon', cardFact: 'Argon atoms only feel weak dispersion forces, so argon boils at −186 °C.', watchTitle: 'Forces BETWEEN molecules', moLine: 'Dispersion always. Dipole-dipole if polar. H-bonds need H on N, O or F.' }),
  concept({ id: 'w8-hybrid', world: 'w8', sec: 17, name: 'Hybridization, σ and π', short: 'sp', card: 'Ge', cardName: 'Germanium', cardFact: 'Germanium crystals use sp³ bonding, the same pattern as diamond.', watchTitle: 'Mixing orbitals', moLine: '2 domains sp, 3 sp², 4 sp³. Double = 1σ + 1π.' }),
  concept({ id: 'w8-mo', world: 'w8', sec: 18, name: 'Molecular orbital theory', short: 'MO', card: 'Ne', cardName: 'Neon', cardFact: 'MO theory gives Ne₂ a bond order of 0, which is why neon stays as single atoms.', watchTitle: 'Bonding vs antibonding', moLine: 'Bond order = ½(bonding − antibonding).' }),
];

export const W8_TEMPLATES: Template[] = [];
const add = adder(W8_TEMPLATES);
const show = (m: Molecule) => pretty(m.charge ? `${m.f}^${Math.abs(m.charge) > 1 ? Math.abs(m.charge) : ''}${m.charge > 0 ? '+' : '-'}` : m.f);
const lewisOf = (m: Molecule) => ({ central: m.central, bonds: m.bonds, lp: m.lp, charge: m.charge });
const EG = ['linear', 'trigonal planar', 'tetrahedral', 'trigonal bipyramidal', 'octahedral'];
const MG = ['linear', 'trigonal planar', 'bent', 'tetrahedral', 'trigonal pyramidal', 'trigonal bipyramidal', 'seesaw', 'T-shaped', 'octahedral', 'square planar'];

/* ---------- 13. VSEPR ---------- */
addGuide(add, 'w8-vsepr', 13, [
  'A double bond counts as two electron domains.',
  'Lone pairs do not count as electron domains.',
  'Electron-domain geometry and molecular geometry are always the same.',
  'NH₃ has trigonal planar electron-domain geometry.',
]);
add('w8-domains', 'w8-vsepr', 2, -0.4, (rng) => {
  const m = pick(rng, MOLECULES);
  const d = domains(m);
  const allBondPairs = m.bonds.reduce((s, b) => s + b[1], 0) + m.lp;
  return choice(rng, `How many electron domains surround the central ${m.central} in ${show(m)}?`, String(d), [String(allBondPairs), String(m.bonds.length), String(d + 1), String(d - 1)].filter((x) => x !== String(d) && x !== '0'),
    `${m.bonds.length} bonded atom${m.bonds.length > 1 ? 's' : ''} + ${m.lp} lone pair${m.lp === 1 ? '' : 's'} = ${d}.${m.bonds.some((b) => b[1] > 1) ? ' A double or triple bond is still just ONE domain.' : ''}`,
    'Each bonded atom is one domain (no matter single, double or triple). Each lone pair is one domain.', { lewis: lewisOf(m) });
});
add('w8-eg', 'w8-vsepr', 3, 0.3, (rng) => {
  const m = pick(rng, MOLECULES);
  return choice(rng, `What is the ELECTRON-DOMAIN geometry around ${m.central} in ${show(m)}?`, m.eg, shuffle(rng, EG.filter((x) => x !== m.eg)).concat(m.mg !== m.eg ? [m.mg] : []).reverse(),
    `${domains(m)} electron domains → ${m.eg}. Lone pairs count here${m.lp ? `, so it is ${m.eg} even though the atoms make a ${m.mg} shape` : ''}.`,
    '2 linear, 3 trigonal planar, 4 tetrahedral, 5 trigonal bipyramidal, 6 octahedral.', { lewis: lewisOf(m) });
});

/* ---------- 14. molecular geometry ---------- */
addGuide(add, 'w8-shape', 14, [
  'Every molecule with 4 electron domains is tetrahedral in shape.',
  'Lone pairs take up no space around the central atom.',
  'Water’s H–O–H bond angle is 109.5°.',
  'Bent molecules can only come from 4 electron domains.',
]);
add('w8-mg', 'w8-shape', 2, 0.0, (rng) => {
  const m = pick(rng, MOLECULES.filter((x) => domains(x) <= 4 || rng() < 0.3));
  const wrongs = [m.eg, ...shuffle(rng, MG)].filter((x) => x !== m.mg);
  return choice(rng, `What is the MOLECULAR geometry (shape) of ${show(m)}?`, m.mg, wrongs,
    `${domains(m)} domains (${m.bonds.length} bonded, ${m.lp} lone pair${m.lp === 1 ? '' : 's'}). The atoms form a ${m.mg} shape${m.lp ? `; the electron geometry is ${m.eg}` : ''}.`,
    'Find electron geometry first, then ignore the lone pairs when naming the shape.', { lewis: lewisOf(m), revealOnly: true });
});
add('w8-angle', 'w8-shape', 3, 0.5, (rng) => {
  const trio = [['CH₄', '109.5°'], ['NH₃', '107°'], ['H₂O', '104.5°']] as const;
  const ask = pick(rng, [0, 1, 2]);
  return choice(rng, `CH₄, NH₃ and H₂O all have 4 electron domains. What is the bond angle in ${trio[ask][0]}?`, trio[ask][1], ['109.5°', '107°', '104.5°', '120°', '90°'].filter((x) => x !== trio[ask][1]),
    'Each lone pair pushes harder than a bonding pair and squeezes the angles: 0 lone pairs 109.5°, 1 lone pair 107°, 2 lone pairs 104.5°.', 'More lone pairs = smaller angle.');
});
add('w8-shape-master', 'w8-shape', 4, 0.9, (rng) => {
  const m = pick(rng, MOLECULES.filter((x) => domains(x) >= 5));
  return choice(rng, `${show(m)}: ${domains(m)} electron domains, ${m.lp} lone pair${m.lp === 1 ? '' : 's'} on ${m.central}. What is its shape?`, m.mg, MG.filter((x) => x !== m.mg).slice(0, 6).sort(() => rng() - 0.5),
    `${m.eg} electron geometry with ${m.lp} lone pair${m.lp === 1 ? '' : 's'} → ${m.mg}.`, 'In a trigonal bipyramid, lone pairs go in the flat (equatorial) positions first.', { lewis: lewisOf(m), revealOnly: true });
});

/* ---------- 15. molecular polarity ---------- */
addGuide(add, 'w8-molpolar', 15, [
  'Polar bonds always make a polar molecule.',
  'CO₂ is polar because its C–O bonds are polar.',
  'You can tell if a molecule is polar from electronegativity alone.',
  'BF₃ is a polar molecule.',
]);
add('w8-polar-swipe', 'w8-molpolar', 2, 0.0, (rng) => {
  const ps = neutral.filter((m) => m.polar !== undefined);
  const pol = sample(rng, ps.filter((m) => m.polar), 3);
  const non = sample(rng, ps.filter((m) => !m.polar), 3);
  return {
    kind: 'swipe', left: 'Polar', right: 'Nonpolar', cards: shuffle(rng, [...pol.map((m) => ({ text: `${show(m)} (${m.mg})`, side: 'L' as const })), ...non.map((m) => ({ text: `${show(m)} (${m.mg})`, side: 'R' as const }))]),
    prompt: 'Polar or nonpolar molecule?', hint: 'Symmetric shape with identical outer atoms → dipoles cancel → nonpolar.',
    why: `Nonpolar here: ${non.map((m) => show(m)).join(', ')} (symmetric, so bond dipoles cancel). Polar: ${pol.map((m) => show(m)).join(', ')} (lone pairs or different outer atoms break the symmetry).`,
  };
});
add('w8-polar-why', 'w8-molpolar', 3, 0.5, (rng) => {
  const m = pick(rng, neutral.filter((x) => x.polar !== undefined && x.bonds.some((b) => b[0] !== x.central)));
  const right = m.polar ? 'Polar: the bond dipoles do not cancel' : 'Nonpolar: the bond dipoles cancel';
  return choice(rng, `${show(m)} is ${m.mg}. Is it polar?`, right, [m.polar ? 'Nonpolar: the bond dipoles cancel' : 'Polar: the bond dipoles do not cancel', 'Nonpolar: it has no polar bonds', 'Polar: every molecule with polar bonds is polar'],
    m.polar ? `In a ${m.mg} shape${m.lp ? ' with lone pairs' : ' with different outer atoms'}, the pulls don’t balance, so there is a net dipole.` : `The ${m.mg} shape is perfectly symmetric with identical outer atoms, so the bond dipoles cancel.`,
    'Polar bonds are not enough. The shape decides whether they cancel.', { lewis: lewisOf(m), revealOnly: true });
});

/* ---------- 16. intermolecular forces ---------- */
addGuide(add, 'w8-imf', 16, [
  'Any molecule that contains hydrogen can hydrogen bond.',
  'Nonpolar molecules have no intermolecular forces at all.',
  'Boiling water breaks the O–H bonds inside each molecule.',
  'CH₄ molecules hydrogen bond to each other.',
]);
const IMF_POOL = [...neutral.filter((m) => m.imf).map((m) => ({ f: m.f, imf: m.imf!, note: m.polar ? `polar, ${m.mg}` : `nonpolar, ${m.mg}` })), ...IMF_EXTRA];
add('w8-strongest-imf', 'w8-imf', 2, 0.0, (rng) => {
  const it = pick(rng, IMF_POOL);
  const names = { dispersion: 'London dispersion', 'dipole-dipole': 'Dipole–dipole', 'hydrogen bonding': 'Hydrogen bonding' } as const;
  return choice(rng, `What is the STRONGEST intermolecular force between ${pretty(it.f)} molecules?`, names[it.imf], [...Object.values(names), 'Ionic bonding'].filter((x) => x !== names[it.imf]),
    `${pretty(it.f)}: ${it.note}. ${it.imf === 'hydrogen bonding' ? 'H bonded to N, O or F → hydrogen bonding.' : it.imf === 'dipole-dipole' ? 'Polar, but no H on N, O or F → dipole–dipole.' : 'Nonpolar → only dispersion forces.'}`,
    'Has H–N, H–O or H–F? Hydrogen bonding. Otherwise polar? Dipole–dipole. Otherwise dispersion only.');
});
add('w8-bp', 'w8-imf', 3, 0.5, (rng) => {
  const pairs = [
    ['H₂O', 'H₂S', 'H₂O hydrogen bonds; H₂S only has dipole–dipole forces.'], ['HF', 'HCl', 'HF hydrogen bonds; HCl does not.'], ['NH₃', 'CH₄', 'NH₃ hydrogen bonds; CH₄ only has dispersion.'],
    ['Br₂', 'Cl₂', 'Both nonpolar; Br₂ is bigger with more electrons, so stronger dispersion.'], ['I₂', 'Br₂', 'Both nonpolar; I₂ is bigger and more polarizable.'], ['C₈H₁₈', 'C₄H₁₀', 'Both nonpolar; the longer chain has more surface area for dispersion.'],
    ['CH₃OH', 'CH₄', 'CH₃OH has an O–H group and hydrogen bonds.'],
  ] as const;
  const [hi, lo, why] = pick(rng, pairs);
  return choice(rng, `Which has the HIGHER boiling point?`, hi, [lo], `${hi}. ${why} Stronger intermolecular forces = more energy to pull molecules apart = higher boiling point.`, 'Stronger attractions between molecules → higher boiling point.');
});
add('w8-hbond', 'w8-imf', 4, 0.7, (rng) => {
  const yes = ['NH₃', 'H₂O', 'HF', 'CH₃OH'];
  const no = ['CH₄', 'H₂S', 'HCl', 'CH₃Cl', 'CH₂O', 'PH₃'];
  const right = pick(rng, yes);
  return choice(rng, 'Which of these can hydrogen bond to its own kind?', right, sample(rng, no, 3),
    `${right} has H bonded directly to N, O or F. The others have H on C, S, Cl or P (or no H on an electronegative atom), so no hydrogen bonds.`, 'You need H directly bonded to N, O or F.');
});

/* ---------- 17. hybridization ---------- */
addGuide(add, 'w8-hybrid', 17, [
  'A double bond is made of two sigma bonds.',
  'Lone pairs are ignored when finding hybridization.',
  'Four electron domains means sp² hybridization.',
  'Pi bonds form from head-on overlap of orbitals.',
]);
add('w8-hyb', 'w8-hybrid', 2, -0.2, (rng) => {
  const m = pick(rng, MOLECULES.filter((x) => x.hyb));
  const h = m.hyb!;
  const disp = (x: string) => x.replace(/(\d)/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[+d]);
  return choice(rng, `What is the hybridization of the central ${m.central} in ${show(m)}?`, disp(h), ['sp', 'sp2', 'sp3', 'sp3d', 'sp3d2'].filter((x) => x !== h).map(disp),
    `${domains(m)} electron domains (lone pairs count!) → ${disp(h)}.`, '2 domains sp, 3 sp², 4 sp³, 5 sp³d, 6 sp³d².', { lewis: lewisOf(m) });
});
add('w8-sigma-pi', 'w8-hybrid', 3, 0.5, (rng) => {
  const items = [['CO₂', 2, 2], ['HCN', 2, 2], ['N₂', 1, 2], ['O₂', 1, 1], ['C₂H₄ (ethene)', 5, 1], ['C₂H₂ (ethyne)', 3, 2], ['CH₂O', 3, 1], ['CH₄', 4, 0]] as const;
  const [f, s, p] = pick(rng, items);
  const t = (a: number, b: number) => `${a} σ and ${b} π`;
  return choice(rng, `How many sigma (σ) and pi (π) bonds are in ${f}?`, t(s, p), [t(s + p, 0), t(p, s), t(s - 1 > 0 ? s - 1 : s + 1, p + 1)].filter((x) => x !== t(s, p)),
    `Every bond has exactly one σ. Each extra line in a double or triple bond is a π. Total: ${t(s, p)}.`, 'Single = 1σ. Double = 1σ + 1π. Triple = 1σ + 2π.');
});

/* ---------- 18. MO theory ---------- */
addGuide(add, 'w8-mo', 18, [
  'Bond order equals the total number of bonding electrons.',
  'Electrons in antibonding orbitals increase the bond order.',
  'Paramagnetism comes from a molecule being polar.',
  'O₂ has no unpaired electrons.',
]);
add('w8-bo-calc', 'w8-mo', 2, -0.1, (rng) => {
  const b = pick(rng, [2, 4, 6, 8, 10]);
  const a = pick(rng, [0, 2, 4, 6].filter((x) => x < b));
  const bo = (b - a) / 2;
  const f = (x: number) => (Number.isInteger(x) ? String(x) : x.toFixed(1));
  return choice(rng, `A species has ${b} electrons in bonding MOs and ${a} in antibonding MOs. Bond order?`, f(bo), [f(b - a), f((b + a) / 2), f(b / 2), f(bo + 1)].filter((x) => x !== f(bo)),
    `Bond order = ½(${b} − ${a}) = ${f(bo)}.`, 'Bond order = ½ × (bonding − antibonding).');
});
const DIATOMIC = [['H₂', 1, false], ['He₂', 0, false], ['Li₂', 1, false], ['B₂', 1, true], ['C₂', 2, false], ['N₂', 3, false], ['O₂', 2, true], ['F₂', 1, false], ['Ne₂', 0, false], ['O₂⁺', 2.5, true], ['O₂⁻', 1.5, true], ['O₂²⁻', 1, false], ['H₂⁺', 0.5, true]] as const;
add('w8-magnet', 'w8-mo', 3, 0.6, (rng) => {
  const para = DIATOMIC.filter((d) => d[2]);
  const dia = DIATOMIC.filter((d) => !d[2] && d[1] > 0);
  const right = pick(rng, para);
  return choice(rng, 'Which species is PARAMAGNETIC (has unpaired electrons)?', right[0], sample(rng, dia, 3).map((d) => d[0]),
    `${right[0]} has unpaired electrons in its MO diagram, so it is pulled into a magnetic field. ${right[0] === 'O₂' ? 'Simple Lewis structures miss this, but MO theory gets it right.' : ''}`, 'Fill the MO diagram and look for lone (unpaired) electrons. O₂ and B₂ are the famous ones.');
});
add('w8-exists', 'w8-mo', 4, 0.8, (rng) => {
  const d = pick(rng, DIATOMIC.filter((x) => x[0] !== 'H₂⁺'));
  const f = (x: number) => (Number.isInteger(x) ? String(x) : x.toFixed(1));
  return choice(rng, `MO theory gives ${d[0]} a bond order of ${f(d[1])}. What does that tell you?`, d[1] === 0 ? 'It should not exist as a stable molecule' : d[1] >= 2.5 ? 'It has a very strong, short bond' : 'It exists with a bond',
    ['It should not exist as a stable molecule', 'It exists with a bond', 'It has a very strong, short bond', 'It must be ionic'].filter((x) => x !== (d[1] === 0 ? 'It should not exist as a stable molecule' : d[1] >= 2.5 ? 'It has a very strong, short bond' : 'It exists with a bond')),
    d[1] === 0 ? 'Bond order 0 means antibonding electrons cancel all the bonding: no bond, no stable molecule.' : `Bond order ${f(d[1])} > 0, so there is a net bond. Higher bond order = stronger, shorter bond.`, 'Bond order 0 = no bond.');
});

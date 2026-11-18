import type { ConceptId, Diagram, Question, Rung, State } from './types';

export type Rng = () => number;
export const pick = <T,>(rng: Rng, xs: readonly T[]): T => xs[Math.floor(rng() * xs.length)];
export function shuffle<T>(rng: Rng, xs: readonly T[]): T[] {
  const a = xs.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export function mulberry32(seed: number): Rng {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------- concepts ---------- */

export interface ConceptInfo {
  id: ConceptId;
  name: string;
  short: string;
  card: string; // element symbol won on mastery
  watchTitle: string;
  watchText: string[];
  moLine: string;
}

export const CONCEPTS: ConceptInfo[] = [
  {
    id: 'states', name: 'States of matter', short: 'S/L/G', card: 'H',
    watchTitle: 'Solid, liquid, gas',
    watchText: [
      'Solid: particles packed tight in rows. They only vibrate. Fixed shape, fixed volume.',
      'Liquid: particles touching but sliding past each other. Takes the container’s shape, keeps its volume.',
      'Gas: particles far apart and flying fast. Fills whatever container it is in.',
    ],
    moLine: 'Everything is made of tiny particles. How they move decides the state.',
  },
  {
    id: 'phase', name: 'Phase changes', short: 'Phase', card: 'He',
    watchTitle: 'Changing state',
    watchText: [
      'Add heat: solid → liquid is MELTING, liquid → gas is BOILING (vaporization), solid → gas is SUBLIMATION.',
      'Remove heat: gas → liquid is CONDENSATION, liquid → solid is FREEZING, gas → solid is DEPOSITION.',
      'Below the melting point it’s solid. Between melting and boiling point it’s liquid. Above the boiling point it’s gas.',
    ],
    moLine: 'Heat in = particles speed up. Heat out = they slow down and huddle.',
  },
  {
    id: 'classify', name: 'Element, compound, mixture', short: 'E/C/M', card: 'Li',
    watchTitle: 'What is it made of?',
    watchText: [
      'ELEMENT: only one kind of atom. Can be single atoms or same-atom pairs like O₂.',
      'COMPOUND: different atoms chemically BONDED in a fixed ratio, like H₂O. Every particle is the same.',
      'MIXTURE: two or more substances just mixed, not bonded. You see different kinds of particles.',
    ],
    moLine: 'Look at the particles: one kind of atom, bonded different atoms, or a jumble?',
  },
  {
    id: 'change', name: 'Physical vs chemical change', short: 'P/C', card: 'Be',
    watchTitle: 'New stuff or same stuff?',
    watchText: [
      'PHYSICAL change: same substance, new look. Melting, cutting, dissolving, bending.',
      'CHEMICAL change: new substances form. Burning, rusting, cooking, rotting.',
      'Signs of chemical change: gas bubbles, color change, light or heat given off, a new smell, a solid forming in a liquid.',
    ],
    moLine: 'Ask: did the atoms rearrange into something NEW?',
  },
  {
    id: 'density', name: 'Density', short: 'ρ', card: 'B',
    watchTitle: 'Float or sink',
    watchText: [
      'Density = mass ÷ volume. Units here are g/cm³ (same as g/mL).',
      'Water’s density is 1.00 g/cm³.',
      'Less dense than the liquid → floats. More dense → sinks.',
    ],
    moLine: 'Divide mass by volume, then compare with the liquid. That’s it.',
  },
];
export const conceptInfo = (id: ConceptId) => CONCEPTS.find((c) => c.id === id)!;

/* ---------- particle diagrams ---------- */

const COLORS = ['#3DE8FF', '#FFB020', '#B48CFF', '#5BE38A', '#FF6B8A'];

function stateDiagram(state: State, color: string): Diagram {
  const n = state === 'solid' ? 16 : state === 'liquid' ? 13 : 7;
  return { kind: 'state', state, groups: Array.from({ length: n }, () => [color]) };
}
type MatterKind = 'element' | 'diatomic' | 'compound' | 'mix-elements' | 'mix-compounds' | 'mix-el-comp';
function matterDiagram(rng: Rng, kind: MatterKind): Diagram {
  const [a, b, c] = shuffle(rng, COLORS);
  let groups: string[][] = [];
  if (kind === 'element') groups = Array.from({ length: 8 }, () => [a]);
  if (kind === 'diatomic') groups = Array.from({ length: 5 }, () => [a, a]);
  if (kind === 'compound') groups = Array.from({ length: 5 }, () => [b, a, b]);
  if (kind === 'mix-elements') groups = [...Array.from({ length: 4 }, () => [a]), ...Array.from({ length: 4 }, () => [b])];
  if (kind === 'mix-compounds') groups = [...Array.from({ length: 3 }, () => [a, b]), ...Array.from({ length: 3 }, () => [c, a, c])];
  if (kind === 'mix-el-comp') groups = [...Array.from({ length: 3 }, () => [c, c]), ...Array.from({ length: 3 }, () => [a, b])];
  return { kind: 'matter', state: 'gas', groups: shuffle(rng, groups) };
}
const matterAnswer = (k: MatterKind) => (k === 'element' || k === 'diatomic' ? 'Element' : k === 'compound' ? 'Compound' : 'Mixture');

/* ---------- data ---------- */

const SUBSTANCES = [
  { name: 'water', mp: 0, bp: 100, min: -40, max: 140, step: 5, b: -0.7 },
  { name: 'ethanol', mp: -114, bp: 78, min: -150, max: 120, step: 5, b: 0.1 },
  { name: 'iron', mp: 1538, bp: 2862, min: 0, max: 3200, step: 50, b: 0.4 },
  { name: 'nitrogen', mp: -210, bp: -196, min: -230, max: -170, step: 2, b: 0.7 },
  { name: 'mercury', mp: -39, bp: 357, min: -80, max: 400, step: 5, b: 0.5 },
];
const stateAt = (s: { mp: number; bp: number }, t: number): State => (t < s.mp ? 'solid' : t < s.bp ? 'liquid' : 'gas');

const TRANSITIONS: { from: State; to: State; name: string; heat: 'L' | 'R'; b: number }[] = [
  { from: 'solid', to: 'liquid', name: 'Melting', heat: 'L', b: -1.2 },
  { from: 'liquid', to: 'solid', name: 'Freezing', heat: 'R', b: -1.0 },
  { from: 'liquid', to: 'gas', name: 'Boiling', heat: 'L', b: -0.9 },
  { from: 'gas', to: 'liquid', name: 'Condensation', heat: 'R', b: -0.3 },
  { from: 'solid', to: 'gas', name: 'Sublimation', heat: 'L', b: 0.4 },
  { from: 'gas', to: 'solid', name: 'Deposition', heat: 'R', b: 0.6 },
];

const OBJECTS = [
  { name: 'Wood block', d: 0.6, color: '#C98B4A' }, { name: 'Ice cube', d: 0.92, color: '#B8F6FF' },
  { name: 'Rock', d: 2.7, color: '#8FA3C4' }, { name: 'Steel bolt', d: 7.8, color: '#6F85A8' },
  { name: 'Cork', d: 0.24, color: '#E3B77A' }, { name: 'Gold bar', d: 19.3, color: '#FFD27A' },
  { name: 'Apple', d: 0.8, color: '#FF6B8A' }, { name: 'Plastic brick', d: 1.05, color: '#5BE38A' },
  { name: 'Candle wax', d: 0.9, color: '#FFE8C7' }, { name: 'Rubber ball', d: 1.15, color: '#B48CFF' },
  { name: 'Aluminum can (crushed)', d: 2.7, color: '#C9D6EA' }, { name: 'Glass marble', d: 2.5, color: '#3DE8FF' },
];
const LIQUIDS = [
  { name: 'water', density: 1.0, color: '#1C7FD6' }, { name: 'vegetable oil', density: 0.92, color: '#E8C547' },
  { name: 'corn syrup', density: 1.33, color: '#C47A00' }, { name: 'ethanol', density: 0.79, color: '#6FB8D6' },
  { name: 'honey', density: 1.42, color: '#D99A1E' }, { name: 'mercury', density: 13.5, color: '#9AA8BC' },
];

const PURE_MIX: [string, 'L' | 'R'][] = [
  ['Gold', 'L'], ['Salt water', 'R'], ['Distilled water', 'L'], ['Air', 'R'], ['Sugar', 'L'], ['Trail mix', 'R'],
  ['Carbon dioxide', 'L'], ['Milk', 'R'], ['Oxygen gas', 'L'], ['Steel', 'R'], ['Table salt', 'L'], ['Soda', 'R'],
];
const EL_COMP: [string, 'L' | 'R'][] = [
  ['Iron (Fe)', 'L'], ['Water (H₂O)', 'R'], ['Oxygen (O₂)', 'L'], ['Table salt (NaCl)', 'R'], ['Helium (He)', 'L'],
  ['Carbon dioxide (CO₂)', 'R'], ['Gold (Au)', 'L'], ['Glucose (C₆H₁₂O₆)', 'R'], ['Nitrogen (N₂)', 'L'], ['Ammonia (NH₃)', 'R'],
];
const PHYS_CHEM_EASY: [string, 'L' | 'R'][] = [
  ['Cutting paper', 'L'], ['Burning wood', 'R'], ['Melting ice', 'L'], ['Baking a cake', 'R'], ['Crushing a can', 'L'],
  ['Iron rusting', 'R'], ['Tearing cloth', 'L'], ['Frying an egg', 'R'],
];
const PHYS_CHEM_HARD: [string, 'L' | 'R'][] = [
  ['Dissolving sugar in tea', 'L'], ['Boiling water', 'L'], ['Digesting food', 'R'], ['Fireworks exploding', 'R'],
  ['Milk going sour', 'R'], ['Dry ice turning to gas', 'L'], ['Baking soda + vinegar fizzing', 'R'], ['Bending a wire', 'L'],
  ['Silver tarnishing', 'R'], ['Grinding coffee beans', 'L'], ['A battery running down', 'R'], ['Water condensing on a cold can', 'L'],
];
const SHAPE_CARDS: [string, 'L' | 'R'][] = [
  ['Ice cube', 'L'], ['Orange juice', 'R'], ['Steam', 'R'], ['Rock', 'L'], ['Air in a balloon', 'R'], ['Steel nail', 'L'],
  ['Honey', 'R'], ['Wooden chair', 'L'], ['Helium', 'R'], ['Frozen pizza', 'L'],
];
const HOMO_HETERO: [string, 'Homogeneous' | 'Heterogeneous'][] = [
  ['Salt water', 'Homogeneous'], ['Sand in water', 'Heterogeneous'], ['Air', 'Homogeneous'], ['Garden salad', 'Heterogeneous'],
  ['Brass', 'Homogeneous'], ['Chocolate chip cookie', 'Heterogeneous'], ['Apple juice (clear)', 'Homogeneous'], ['Granite', 'Heterogeneous'],
];
const CHEM_SIGNS = [
  { right: 'Bubbles of a new gas appear when two liquids mix', wrong: ['Ice melts into water', 'Sugar dissolves in tea', 'A glass cup shatters'] },
  { right: 'A solid suddenly forms when two clear liquids are mixed', wrong: ['Water boils on the stove', 'A puddle evaporates', 'Butter softens in the sun'] },
  { right: 'A log gives off light and heat as it turns to ash', wrong: ['A rubber band stretches', 'Salt is ground finer', 'Wax melts around a wick'] },
  { right: 'A copper roof slowly turns green', wrong: ['Paint is mixed from blue and yellow', 'A metal rod is bent', 'Sand is poured into a jar'] },
];

/* ---------- templates ---------- */

type Gen = (rng: Rng) => Omit<Question, 'id' | 'template' | 'concept' | 'rung' | 'b'> & { b?: number };
export interface Template { id: string; concept: ConceptId; rung: Rung; b: number; gen: Gen }

const T: Template[] = [];
const add = (id: string, concept: ConceptId, rung: Rung, b: number, gen: Gen) => T.push({ id, concept, rung, b, gen });

const STATES: State[] = ['solid', 'liquid', 'gas'];
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

/* states */
add('states-pick', 'states', 1, -1.4, (rng) => {
  const target = pick(rng, STATES);
  const color = pick(rng, COLORS);
  const order = shuffle(rng, STATES);
  return {
    kind: 'peek', prompt: `Which box shows a ${target.toUpperCase()}?`,
    options: order.map((s) => ({ diagram: stateDiagram(s, color) })), answer: order.indexOf(target),
    hint: target === 'gas' ? 'Gas particles are far apart and zooming around.' : target === 'solid' ? 'Solid particles sit in neat rows and just vibrate.' : 'Liquid particles touch but slide around.',
    why: `${cap(target)}: ${target === 'solid' ? 'packed in rows, only vibrating' : target === 'liquid' ? 'touching but sliding past each other' : 'far apart and moving fast'}.`,
    b: target === 'liquid' ? -1.1 : -1.5,
  };
});
add('states-name', 'states', 1, -1.2, (rng) => {
  const s = pick(rng, STATES);
  return {
    kind: 'peek', prompt: 'What state of matter is this?', show: stateDiagram(s, pick(rng, COLORS)),
    options: STATES.map((x) => ({ label: cap(x) })), answer: STATES.indexOf(s),
    hint: 'Watch how close the particles are and how much they move.',
    why: `Those particles are ${s === 'solid' ? 'locked in rows' : s === 'liquid' ? 'close but sliding' : 'spread out and flying'}, so it’s a ${s}.`,
  };
});
add('states-set', 'states', 2, -0.7, (rng) => {
  const s = SUBSTANCES[0];
  const target = pick(rng, STATES);
  return {
    kind: 'phase', mode: 'set', substance: s, min: s.min, max: s.max, step: s.step, target,
    prompt: `Slide the temperature until the water is a ${target.toUpperCase()}.`,
    hint: 'Water melts at 0 °C and boils at 100 °C.',
    why: `Water is solid below 0 °C, liquid from 0 to 100 °C, and gas above 100 °C.`,
  };
});
add('states-props', 'states', 2, -0.4, (rng) => {
  const qs = [
    { p: 'Which state has a fixed shape AND a fixed volume?', a: 0 },
    { p: 'Which state takes the shape of its container but keeps its volume?', a: 1 },
    { p: 'Which state spreads out to fill its whole container?', a: 2 },
    { p: 'In which state do particles only vibrate in place?', a: 0 },
    { p: 'In which state are particles farthest apart?', a: 2 },
  ];
  const q = pick(rng, qs);
  return {
    kind: 'peek', prompt: q.p, options: STATES.map((x) => ({ label: cap(x), diagram: stateDiagram(x, '#3DE8FF') })), answer: q.a,
    hint: 'Picture what the particles are doing.', why: `It’s a ${STATES[q.a]}. ${conceptInfo('states').watchText[q.a]}`,
  };
});
add('states-swipe', 'states', 3, 0.2, (rng) => ({
  kind: 'swipe', left: 'Fixed shape', right: 'Takes container’s shape',
  cards: shuffle(rng, SHAPE_CARDS).slice(0, 6).map(([text, side]) => ({ text, side })),
  prompt: 'Sort each one: does it keep its own shape?', hint: 'Only solids keep their own shape. Liquids AND gases take the container’s shape.',
  why: 'Solids keep a fixed shape. Liquids and gases both flow, so they take the shape of whatever holds them.',
}));
add('states-read', 'states', 3, 0.3, (rng) => {
  const s = pick(rng, SUBSTANCES.slice(1));
  const t = Math.round((s.min + rng() * (s.max - s.min)) / s.step) * s.step;
  const ans = stateAt(s, t);
  return {
    kind: 'phase', mode: 'read', substance: s, min: s.min, max: s.max, step: s.step, temp: t, answer: ans, b: s.b,
    prompt: `${cap(s.name)} melts at ${s.mp} °C and boils at ${s.bp} °C. At ${t} °C it is a…`,
    hint: 'Below the melting point: solid. Between the two: liquid. Above boiling: gas.',
    why: `${t} °C is ${ans === 'solid' ? 'below the melting point' : ans === 'liquid' ? 'between the melting and boiling points' : 'above the boiling point'}, so ${s.name} is a ${ans}.`,
  };
});
add('states-master', 'states', 4, 0.9, (rng) => {
  const qs = [
    { p: 'You squeeze a syringe full of air with the end blocked. It compresses. Why?', o: ['Gas particles have lots of space between them', 'Air particles shrink when squeezed', 'Air turns into a liquid instantly', 'The syringe gets bigger'], a: 0, w: 'Gas particles are far apart, so pushing them closer is easy. Liquids and solids barely compress.' },
    { p: 'A sealed balloon is moved from a cold room to a hot car. What happens to the gas particles?', o: ['They move faster and push harder on the balloon', 'They get bigger', 'They stop moving', 'They turn into liquid'], a: 0, w: 'Heat makes particles move faster. Faster particles hit the walls harder, so the balloon expands.' },
    { p: 'Which has the strongest attraction between its particles?', o: ['A steel spoon', 'Water', 'Steam', 'Air'], a: 0, w: 'Solids have the strongest attractions, which is why their particles stay locked in place.' },
  ];
  const q = pick(rng, qs);
  const order = shuffle(rng, q.o.map((_, i) => i));
  return { kind: 'peek', prompt: q.p, options: order.map((i) => ({ label: q.o[i] })), answer: order.indexOf(q.a), hint: 'Think about spacing and speed of particles.', why: q.w };
});

/* phase */
add('phase-name', 'phase', 1, -1.0, (rng) => {
  const t = pick(rng, TRANSITIONS);
  const wrong = shuffle(rng, TRANSITIONS.filter((x) => x !== t)).slice(0, 3);
  const opts = shuffle(rng, [t, ...wrong]);
  return {
    kind: 'peek', prompt: `${cap(t.from)} → ${t.to} is called…`, b: t.b,
    show: undefined, options: opts.map((o) => ({ label: o.name })), answer: opts.indexOf(t),
    hint: t.heat === 'L' ? 'Heat is being added here.' : 'Heat is being removed here.',
    why: `${cap(t.from)} to ${t.to} is ${t.name.toUpperCase()}. ${t.heat === 'L' ? 'It needs heat added.' : 'It gives heat off.'}`,
  };
});
add('phase-set', 'phase', 2, -0.3, (rng) => {
  const s = pick(rng, SUBSTANCES);
  const target = pick(rng, STATES);
  const verb = target === 'solid' ? 'Freeze' : target === 'liquid' ? 'Melt' : 'Boil';
  return {
    kind: 'phase', mode: 'set', substance: s, min: s.min, max: s.max, step: s.step, target, b: s.b + 0.2,
    prompt: `${verb} the ${s.name}! Melts at ${s.mp} °C, boils at ${s.bp} °C. Make it a ${target.toUpperCase()}.`,
    hint: `Solid below ${s.mp} °C, liquid between, gas above ${s.bp} °C.`,
    why: `${cap(s.name)} is a ${target} ${target === 'solid' ? `below ${s.mp} °C` : target === 'liquid' ? `between ${s.mp} and ${s.bp} °C` : `above ${s.bp} °C`}.`,
  };
});
add('phase-heat', 'phase', 3, 0.5, (rng) => ({
  kind: 'swipe', left: 'Heat goes IN', right: 'Heat comes OUT',
  cards: shuffle(rng, TRANSITIONS).slice(0, 5).map((t) => ({ text: t.name, side: t.heat })),
  prompt: 'Does each change need heat added, or give heat off?', hint: 'Going toward gas needs heat. Going toward solid gives heat off.',
  why: 'Melting, boiling and sublimation absorb heat. Freezing, condensation and deposition release it.',
}));
add('phase-read', 'phase', 3, 0.4, (rng) => {
  const s = pick(rng, SUBSTANCES);
  const t = Math.round((s.min + rng() * (s.max - s.min)) / s.step) * s.step;
  const ans = stateAt(s, t);
  return {
    kind: 'phase', mode: 'read', substance: s, min: s.min, max: s.max, step: s.step, temp: t, answer: ans, b: s.b + 0.3,
    prompt: `${cap(s.name)} is at ${t} °C. Melting point ${s.mp} °C, boiling point ${s.bp} °C. What state is it?`,
    hint: 'Compare the temperature with both points.',
    why: `${t} °C is ${ans === 'solid' ? 'below' : ans === 'liquid' ? 'between' : 'above'} ${ans === 'liquid' ? 'the two points' : ans === 'solid' ? 'the melting point' : 'the boiling point'}, so it’s a ${ans}.`,
  };
});
add('phase-master', 'phase', 4, 1.0, (rng) => {
  const qs = [
    { p: 'Frost forms on a car window on a cold night, straight from water vapor. That change is…', o: ['Deposition', 'Condensation', 'Freezing', 'Sublimation'], a: 0, w: 'Gas straight to solid is deposition.' },
    { p: 'Dry ice (solid CO₂) makes fog without melting into a puddle. It is…', o: ['Subliming', 'Melting', 'Evaporating', 'Condensing'], a: 0, w: 'Solid straight to gas is sublimation. The fog is cold air making water vapor condense.' },
    { p: 'A pot of water stays at 100 °C while it boils, even with the burner on high. Where does the heat go?', o: ['Into turning liquid into gas', 'It disappears', 'Into the pot handle only', 'Into making the water denser'], a: 0, w: 'During a phase change the energy breaks particles apart instead of raising the temperature.' },
    { p: 'Water droplets appear on the outside of a cold soda can. That is…', o: ['Condensation', 'The can leaking', 'Melting', 'Sublimation'], a: 0, w: 'Water vapor in the air cools on the can and turns liquid: condensation.' },
  ];
  const q = pick(rng, qs);
  const order = shuffle(rng, q.o.map((_, i) => i));
  return { kind: 'peek', prompt: q.p, options: order.map((i) => ({ label: q.o[i] })), answer: order.indexOf(q.a), hint: 'Name the starting state and the ending state first.', why: q.w };
});

/* classify */
add('classify-pick', 'classify', 1, -0.8, (rng) => {
  const target = pick(rng, ['Element', 'Compound', 'Mixture'] as const);
  const kinds: MatterKind[] = shuffle(rng, ['element', 'compound', pick(rng, ['mix-elements', 'mix-el-comp'] as MatterKind[])]);
  return {
    kind: 'peek', prompt: `Which box shows a ${target.toUpperCase()}?`,
    options: kinds.map((k) => ({ diagram: matterDiagram(rng, k) })), answer: kinds.findIndex((k) => matterAnswer(k) === target),
    b: target === 'Element' ? -1.0 : target === 'Mixture' ? -0.7 : -0.5,
    hint: 'Element = one color only. Compound = every particle the same bonded combo. Mixture = different kinds of particles.',
    why: `${target}: ${target === 'Element' ? 'only one kind of atom' : target === 'Compound' ? 'every particle is the same group of different atoms bonded together' : 'more than one kind of particle, not bonded to each other'}.`,
  };
});
add('classify-name', 'classify', 2, -0.1, (rng) => {
  const k = pick(rng, ['element', 'diatomic', 'compound', 'mix-elements', 'mix-compounds', 'mix-el-comp'] as MatterKind[]);
  const ans = matterAnswer(k);
  const opts = ['Element', 'Compound', 'Mixture'];
  return {
    kind: 'peek', prompt: 'Element, compound, or mixture?', show: matterDiagram(rng, k),
    options: opts.map((label) => ({ label })), answer: opts.indexOf(ans),
    b: k === 'element' ? -0.6 : k === 'diatomic' ? 0.6 : k === 'compound' ? 0 : k === 'mix-compounds' ? 0.5 : 0.3,
    hint: 'Are all the particles identical? If yes, is each one a single kind of atom?',
    why: k === 'diatomic' ? 'Pairs of the SAME atom are still an element (like O₂).' : k === 'compound' ? 'Every particle is the same bonded group of different atoms: a compound.' : k === 'element' ? 'Only one kind of atom: an element.' : 'There are different kinds of particles mixed together: a mixture.',
  };
});
add('classify-pure', 'classify', 3, 0.4, (rng) => ({
  kind: 'swipe', left: 'Pure substance', right: 'Mixture',
  cards: shuffle(rng, PURE_MIX).slice(0, 6).map(([text, side]) => ({ text, side })),
  prompt: 'Pure substance or mixture?', hint: 'Pure substances are one element or one compound. Mixtures have 2+ substances.',
  why: 'Elements and compounds are pure. Salt water, air, milk, steel and soda are mixtures of several substances.',
}));
add('classify-elcomp', 'classify', 3, 0.5, (rng) => ({
  kind: 'swipe', left: 'Element', right: 'Compound',
  cards: shuffle(rng, EL_COMP).slice(0, 6).map(([text, side]) => ({ text, side })),
  prompt: 'Element or compound? Look at the formula.', hint: 'One kind of symbol = element. Two or more different symbols = compound.',
  why: 'Fe, O₂, He, Au and N₂ each have one kind of atom. H₂O, NaCl, CO₂ and NH₃ have different atoms bonded together.',
}));
add('classify-homo', 'classify', 4, 0.9, (rng) => {
  const [item, ans] = pick(rng, HOMO_HETERO);
  const opts = ['Homogeneous', 'Heterogeneous'];
  return {
    kind: 'peek', prompt: `${item} is a mixture. Is it homogeneous or heterogeneous?`, options: opts.map((label) => ({ label })), answer: opts.indexOf(ans),
    hint: 'Homogeneous looks the same all the way through. Heterogeneous has parts you can tell apart.',
    why: `${item} is ${ans.toLowerCase()}: ${ans === 'Homogeneous' ? 'it is evenly mixed, the same everywhere' : 'you can see or pick out different parts'}.`,
  };
});

/* change */
add('change-easy', 'change', 1, -0.7, (rng) => ({
  kind: 'swipe', left: 'Physical', right: 'Chemical',
  cards: shuffle(rng, PHYS_CHEM_EASY).slice(0, 5).map(([text, side]) => ({ text, side })),
  prompt: 'Physical change or chemical change?', hint: 'Chemical = a NEW substance forms. Physical = same stuff, different look.',
  why: 'Burning, rusting, baking and frying make new substances. Cutting, melting, crushing and tearing don’t.',
}));
add('change-sign', 'change', 2, -0.2, (rng) => {
  const s = pick(rng, CHEM_SIGNS);
  const opts = shuffle(rng, [s.right, ...s.wrong]);
  return {
    kind: 'peek', prompt: 'Which one is a CHEMICAL change?', options: opts.map((label) => ({ label })), answer: opts.indexOf(s.right),
    hint: 'Look for a new gas, a color change, light/heat, or a new solid forming.',
    why: `"${s.right}" shows a new substance forming. The others only change size, shape or state.`,
  };
});
add('change-hard', 'change', 3, 0.5, (rng) => ({
  kind: 'swipe', left: 'Physical', right: 'Chemical',
  cards: shuffle(rng, PHYS_CHEM_HARD).slice(0, 6).map(([text, side]) => ({ text, side })),
  prompt: 'Trickier ones. Physical or chemical?', hint: 'Dissolving and changing state are physical, even though they look dramatic.',
  why: 'Dissolving, boiling, condensing and sublimation are physical. Souring, tarnishing, digesting, exploding and fizzing reactions make new substances.',
}));
add('change-master', 'change', 4, 1.0, (rng) => {
  const qs = [
    { p: 'When water boils, the bubbles are made of…', o: ['Water vapor (still H₂O)', 'Hydrogen and oxygen gas', 'Air that was dissolved', 'Heat'], a: 0, w: 'Boiling is physical. The bubbles are water in gas form, still H₂O.' },
    { p: 'Salt dissolves in water and you can get it back by evaporating the water. So dissolving salt is…', o: ['A physical change', 'A chemical change', 'Neither', 'Both'], a: 0, w: 'You got the same salt back, so no new substance formed: physical.' },
    { p: 'A candle burns. Which part is a CHEMICAL change?', o: ['The wax vapor burning in the flame', 'The wax melting', 'The melted wax dripping', 'The wax hardening again'], a: 0, w: 'Burning makes new substances (CO₂ and water). Melting and dripping are physical.' },
  ];
  const q = pick(rng, qs);
  const order = shuffle(rng, q.o.map((_, i) => i));
  return { kind: 'peek', prompt: q.p, options: order.map((i) => ({ label: q.o[i] })), answer: order.indexOf(q.a), hint: 'Did a new substance form?', why: q.w };
});

/* density */
function floatQ(rng: Rng, showDensity: boolean, liquids: typeof LIQUIDS) {
  const liquid = pick(rng, liquids);
  let obj = pick(rng, OBJECTS);
  // avoid near-ties that are unfair to judge
  for (let i = 0; i < 10 && Math.abs(obj.d - liquid.density) < 0.04; i++) obj = pick(rng, OBJECTS);
  const volume = pick(rng, [10, 20, 25, 40, 50, 80, 100]);
  const mass = Math.round(obj.d * volume * 10) / 10;
  return {
    kind: 'float' as const, liquid, showDensity,
    object: { name: obj.name, mass, volume, color: obj.color }, answer: (obj.d < liquid.density ? 'float' : 'sink') as 'float' | 'sink',
    prompt: showDensity ? `Drop the ${obj.name.toLowerCase()} in ${liquid.name}. Float or sink?` : `Mass ${mass} g, volume ${volume} cm³. Float or sink in ${liquid.name}?`,
    hint: showDensity ? `Compare with ${liquid.name}: ${liquid.density} g/cm³.` : 'Density = mass ÷ volume. Then compare with the liquid.',
    why: `${mass} ÷ ${volume} = ${(mass / volume).toFixed(2)} g/cm³. ${liquid.name} is ${liquid.density.toFixed(2)} g/cm³, so it ${obj.d < liquid.density ? 'floats' : 'sinks'}.`,
  };
}
add('density-shown', 'density', 1, -1.0, (rng) => floatQ(rng, true, LIQUIDS.slice(0, 1)));
add('density-calc', 'density', 2, -0.1, (rng) => floatQ(rng, false, LIQUIDS.slice(0, 1)));
add('density-liquids', 'density', 3, 0.6, (rng) => floatQ(rng, false, LIQUIDS.slice(1)));
add('density-compute', 'density', 3, 0.5, (rng) => {
  const obj = pick(rng, OBJECTS);
  const volume = pick(rng, [10, 20, 25, 40, 50]);
  const mass = Math.round(obj.d * volume * 10) / 10;
  const d = mass / volume;
  const right = `${d.toFixed(2)} g/cm³`;
  const wrongs = [`${(volume / mass).toFixed(2)} g/cm³`, `${(mass * volume).toFixed(0)} g/cm³`, `${(mass + volume).toFixed(1)} g/cm³`];
  const opts = shuffle(rng, [right, ...wrongs]);
  return {
    kind: 'peek', prompt: `A ${obj.name.toLowerCase()} has a mass of ${mass} g and a volume of ${volume} cm³. What is its density?`,
    options: opts.map((label) => ({ label })), answer: opts.indexOf(right), hint: 'Density = mass ÷ volume.',
    why: `${mass} g ÷ ${volume} cm³ = ${right}.`,
  };
});
add('density-master', 'density', 4, 1.0, (rng) => {
  const qs = [
    { p: 'You cut a wooden block in half. The density of each half is…', o: ['The same as the whole block', 'Half as much', 'Twice as much', 'Zero'], a: 0, w: 'Mass and volume both halve, so mass ÷ volume stays the same. Density doesn’t depend on size.' },
    { p: 'Oil (0.92), water (1.00) and syrup (1.33) are poured in a glass. Top to bottom they settle as…', o: ['Oil, water, syrup', 'Syrup, water, oil', 'Water, oil, syrup', 'They stay mixed'], a: 0, w: 'Least dense floats on top: oil, then water, then syrup at the bottom.' },
    { p: 'A 30 cm³ object has a density of 2.0 g/cm³. Its mass is…', o: ['60 g', '15 g', '32 g', '0.07 g'], a: 0, w: 'Mass = density × volume = 2.0 × 30 = 60 g.' },
    { p: 'Ice floats on water. That means ice is…', o: ['Less dense than liquid water', 'Lighter than all liquids', 'Denser than liquid water', 'Not made of water'], a: 0, w: 'Water expands when it freezes, so ice (0.92 g/cm³) is less dense than liquid water.' },
  ];
  const q = pick(rng, qs);
  const order = shuffle(rng, q.o.map((_, i) => i));
  return { kind: 'peek', prompt: q.p, options: order.map((i) => ({ label: q.o[i] })), answer: order.indexOf(q.a), hint: 'Density = mass ÷ volume.', why: q.w };
});

export const TEMPLATES = T;

let counter = 0;
export function build(t: Template, rng: Rng): Question {
  const g = t.gen(rng);
  return { ...g, b: g.b ?? t.b, id: `${t.id}-${Date.now().toString(36)}-${counter++}`, template: t.id, concept: t.concept, rung: t.rung } as Question;
}

export function watchCard(concept: ConceptId): Question {
  const c = conceptInfo(concept);
  return { kind: 'watch', id: `watch-${concept}-${counter++}`, template: `watch-${concept}`, concept, rung: 0, b: -3, prompt: c.watchTitle, hint: c.moLine, why: c.watchText.join(' ') };
}

// All worlds, concepts and question templates in one place.
import { CONCEPTS as W1_CONCEPTS, W1_TEMPLATES, mulberry32, type Template } from './content';
import { W6_CONCEPTS, W6_TEMPLATES } from './worlds/w6';
import { W7_CONCEPTS, W7_TEMPLATES } from './worlds/w7';
import { W8_CONCEPTS, W8_TEMPLATES } from './worlds/w8';
import { W9_CONCEPTS, W9_TEMPLATES } from './worlds/w9';
import type { ConceptId, ConceptInfo, Question, Rung } from './types';

export { mulberry32 };

export interface WorldInfo {
  id: string;
  n: number;
  name: string;
  chapter: string;
  blurb: string;
  concepts: ConceptInfo[];
  /** Concepts from earlier worlds that this world leans on. They show up in warm-ups and mixed slots. */
  prereqs: ConceptId[];
  status: 'built' | 'guide-3' | 'soon';
}

export const WORLDS: WorldInfo[] = [
  { id: 'w1', n: 1, name: 'Matter', chapter: 'Ch 1', blurb: 'What stuff is made of, how it changes, and why some things float.', concepts: W1_CONCEPTS, prereqs: [], status: 'built' },
  { id: 'w2', n: 2, name: 'Measurement', chapter: 'Ch 1', blurb: 'Units, sig figs and unit conversions.', concepts: [], prereqs: [], status: 'guide-3' },
  { id: 'w3', n: 3, name: 'Atoms & Elements', chapter: 'Ch 2', blurb: 'Protons, neutrons, electrons, isotopes, the mole.', concepts: [], prereqs: [], status: 'guide-3' },
  { id: 'w4', n: 4, name: 'Electrons & Quantum', chapter: 'Ch 3', blurb: 'Light, orbitals and electron configurations.', concepts: [], prereqs: [], status: 'guide-3' },
  { id: 'w5', n: 5, name: 'Periodic Trends', chapter: 'Ch 4', blurb: 'Atomic radius, ionization energy, electron affinity.', concepts: [], prereqs: [], status: 'guide-3' },
  { id: 'w6', n: 6, name: 'Ions & Bonds', chapter: 'Ch 5', blurb: 'Ionic and covalent compounds: forming ions, formulas, names, polarity, lattice energy.', concepts: W6_CONCEPTS, prereqs: ['classify'], status: 'built' },
  { id: 'w7', n: 7, name: 'Drawing Molecules', chapter: 'Ch 6', blurb: 'Lewis structures, formal charge, resonance, octet exceptions, bond enthalpy.', concepts: W7_CONCEPTS, prereqs: ['w6-covalent', 'w6-polarity'], status: 'built' },
  { id: 'w8', n: 8, name: 'Shapes & Forces', chapter: 'Ch 7', blurb: 'VSEPR shapes, molecular polarity, intermolecular forces, hybridization, MO theory.', concepts: W8_CONCEPTS, prereqs: ['w7-lewis', 'w7-valence', 'w6-polarity'], status: 'built' },
  { id: 'w9', n: 9, name: 'Reactions & Moles', chapter: 'Ch 8', blurb: 'Equations, balancing, reaction types, mole ratios, limiting reactants, percent yield.', concepts: W9_CONCEPTS, prereqs: ['w6-formulas', 'w6-naming'], status: 'built' },
  { id: 'w10', n: 10, name: 'Reactions in Water', chapter: 'Ch 9', blurb: 'Electrolytes, precipitation, net ionic equations, acid–base, redox.', concepts: [], prereqs: [], status: 'soon' },
  { id: 'w11', n: 11, name: 'Energy', chapter: 'Ch 10', blurb: 'Heat, calorimetry, enthalpy, Hess’s law.', concepts: [], prereqs: [], status: 'soon' },
  { id: 'w12', n: 12, name: 'Gases', chapter: 'Ch 11', blurb: 'Pressure, gas laws, PV = nRT, partial pressure.', concepts: [], prereqs: [], status: 'soon' },
  { id: 'w13', n: 13, name: 'Liquids & Solids', chapter: 'Ch 12', blurb: 'IMFs in action, vapor pressure, phase diagrams, crystals.', concepts: [], prereqs: [], status: 'soon' },
  { id: 'w14', n: 14, name: 'Solutions', chapter: 'Ch 13', blurb: 'Solubility, concentration units, colligative properties.', concepts: [], prereqs: [], status: 'soon' },
  { id: 'w15', n: 15, name: 'Extremes', chapter: 'Bonus', blurb: 'Superacids, superheavy elements, why gold is yellow.', concepts: [], prereqs: [], status: 'soon' },
];

export const ALL_CONCEPTS: ConceptInfo[] = WORLDS.flatMap((w) => w.concepts);
export const conceptInfo = (id: ConceptId): ConceptInfo => ALL_CONCEPTS.find((c) => c.id === id)!;
export const worldInfo = (id: string) => WORLDS.find((w) => w.id === id)!;
export const worldOf = (concept: ConceptId) => conceptInfo(concept).world;
export const builtWorlds = () => WORLDS.filter((w) => w.status === 'built');

const RAW: Template[] = [...W1_TEMPLATES, ...W6_TEMPLATES, ...W7_TEMPLATES, ...W8_TEMPLATES, ...W9_TEMPLATES];

/**
 * Every concept needs variety on rungs 1–4 (at least 3 question templates per rung when possible),
 * so a struggling player never sees the same format over and over.
 * Thin rungs borrow from the neighbouring rungs, shifted a little in difficulty.
 */
const MIN_PER_RUNG = 3;
function fillGaps(ts: Template[]): Template[] {
  const out = ts.slice();
  for (const c of ALL_CONCEPTS) {
    const own = (r: number) => ts.filter((t) => t.concept === c.id && t.rung === r);
    for (const r of [1, 2, 3, 4] as Rung[]) {
      const have = () => out.filter((t) => t.concept === c.id && t.rung === r);
      for (const nr of [r + 1, r - 1, r + 2, r - 2]) {
        if (have().length >= MIN_PER_RUNG) break;
        for (const t of own(nr)) {
          if (have().length >= MIN_PER_RUNG) break;
          if (have().some((h) => h.id.split('@')[0] === t.id)) continue;
          out.push({ ...t, id: `${t.id}@${r}`, rung: r, b: t.b + (r - t.rung) * 0.45 });
        }
      }
    }
  }
  return out;
}
export const TEMPLATES: Template[] = fillGaps(RAW);

let counter = 0;
export function build(t: Template, rng: () => number): Question {
  const g = t.gen(rng);
  return { ...g, b: g.b ?? t.b, id: `${t.id}-${Date.now().toString(36)}-${counter++}`, template: t.id, concept: t.concept, rung: t.rung } as Question;
}

export function watchCard(concept: ConceptId): Question {
  const c = conceptInfo(concept);
  return { kind: 'watch', id: `watch-${concept}-${counter++}`, template: `watch-${concept}`, concept, rung: 0, b: -3, prompt: c.watchTitle, hint: c.moLine, why: c.watchText.join(' ') };
}

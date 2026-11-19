import { describe, expect, it } from 'vitest';
import { TEMPLATES, build, mulberry32 } from './registry';
import { applyAnswer, applyWatch, cp, grade, merge, newSave, nextQuestion, startRun, stateAt, prob, currentConcept, finishBoss } from './engine';
import { WORLDS, builtWorlds } from './registry';
import { EQUATIONS } from './worlds/w9';
import { MOLECULES } from './worlds/molecules';
import { formulaOf } from './worlds/w6';
import { atoms, isBalanced, pretty, prettyText, valenceElectrons } from './chem';
import type { Answer, Question } from './types';

const right = (q: Question): Answer => {
  switch (q.kind) {
    case 'peek': return { kind: 'peek', choice: q.answer };
    case 'float': return { kind: 'float', choice: q.answer };
    case 'swipe': return { kind: 'swipe', sides: q.cards.map((c) => c.side) };
    case 'phase':
      if (q.mode === 'read') return { kind: 'phase', choice: q.answer };
      { const s = q.substance; const t = q.target === 'solid' ? s.mp - q.step : q.target === 'liquid' ? (s.mp + s.bp) / 2 : s.bp + q.step; return { kind: 'phase', temp: t }; }
    default: throw new Error('watch');
  }
};

describe('content', () => {
  it('every template makes valid, gradeable questions', () => {
    const rng = mulberry32(7);
    for (const t of TEMPLATES) {
      for (let i = 0; i < 40; i++) {
        const q = build(t, rng);
        expect(q.prompt.length).toBeGreaterThan(5);
        expect(q.why.length).toBeGreaterThan(5);
        if (q.kind === 'peek') { expect(q.answer).toBeGreaterThanOrEqual(0); expect(q.answer).toBeLessThan(q.options.length); }
        if (q.kind === 'swipe') expect(q.cards.length).toBeGreaterThanOrEqual(5);
        if (q.kind === 'float') expect(q.answer).toBe(q.object.mass / q.object.volume < q.liquid.density ? 'float' : 'sink');
        if (q.kind === 'phase' && q.mode === 'read') expect(q.answer).toBe(stateAt(q.substance, q.temp!));
        if (q.kind === 'phase' && q.mode === 'set') {
          const s = q.substance; const t = q.target === 'solid' ? s.mp - q.step : q.target === 'liquid' ? (s.mp + s.bp) / 2 : s.bp + q.step;
          expect(t).toBeGreaterThanOrEqual(q.min); expect(t).toBeLessThanOrEqual(q.max);
        }
        expect(grade(q, right(q))).toBe(true);
      }
    }
  });
  it('every concept in every built world has templates on rungs 1-4', () => {
    for (const w of builtWorlds()) for (const c of w.concepts) for (const r of [1, 2, 3, 4]) expect(TEMPLATES.some((t) => t.concept === c.id && t.rung === r), `${c.id} rung ${r}`).toBe(true);
  });
  it('peek questions have 2-4 distinct options', () => {
    const rng = mulberry32(11);
    for (const t of TEMPLATES) for (let i = 0; i < 25; i++) {
      const q = build(t, rng);
      if (q.kind !== 'peek') continue;
      const labels = q.options.map((o) => o.label ?? JSON.stringify(o.diagram));
      expect(new Set(labels).size, `${t.id}: ${labels.join(' | ')}`).toBe(labels.length);
      expect(labels.length, t.id).toBeGreaterThanOrEqual(2);
      expect(labels.length, t.id).toBeLessThanOrEqual(4);
    }
  });
});

describe('engine', () => {
  it('probability is 0.5 when skill equals difficulty', () => expect(prob(1, 1)).toBeCloseTo(0.5));

  it.each(['w1', 'w6', 'w7', 'w8', 'w9'])('a perfect player masters world %s', (world) => {
    const s = newSave('dev1');
    const rng = mulberry32(3);
    let runs = 0;
    while (currentConcept(s, world) && runs < 60) {
      const run = startRun(false, world);
      while (!run.done) {
        const { q, slot } = nextQuestion(s, run, rng);
        if (q.kind === 'watch') applyWatch(s, run, q.concept);
        else applyAnswer(s, run, q, slot, grade(q, right(q)), true);
      }
      runs++;
    }
    expect(currentConcept(s, world)).toBeNull();
    expect(s.cards.length).toBe(WORLDS.find((w) => w.id === world)!.concepts.length);
    expect(runs).toBeLessThan(20);
  });

  it('two wrong answers on a rung drop it and force a Watch', () => {
    const s = newSave('d');
    cp(s, 'states').rung = 2;
    const run = startRun();
    const rng = mulberry32(1);
    for (let i = 0; i < 2; i++) {
      run.index = 1;
      const { q, slot } = nextQuestion(s, run, rng);
      applyAnswer(s, run, q, slot, false, true);
    }
    expect(cp(s, 'states').rung).toBe(1);
    expect(nextQuestion(s, run, rng).q.kind).toBe('watch');
  });

  it('a wrong answer schedules an echo and costs charge', () => {
    const s = newSave('d');
    cp(s, 'states').rung = 1;
    const run = startRun();
    run.index = 1;
    const rng = mulberry32(2);
    const { q, slot } = nextQuestion(s, run, rng);
    applyAnswer(s, run, q, slot, false, false);
    expect(run.charge).toBe(4);
    expect(run.echoes[0].dueIndex).toBe(4);
  });

  it('boss pass clears the world and unlocks the suit', () => {
    const s = newSave('d');
    const run = startRun(true);
    run.correct = 9;
    finishBoss(s, run);
    expect(run.passed).toBe(true);
    expect(s.outfits).toContain('suit');
    expect(currentConcept(s)).toBeNull();
  });

  it('merge keeps the best of both and never double counts XP', () => {
    const a = newSave('pc1');
    const b = newSave('pc2');
    a.xpByDevice = { pc1: 100 }; b.xpByDevice = { pc2: 50, pc1: 80 };
    cp(a, 'states').rung = 3; cp(b, 'phase').rung = 2; b.cards = ['H'];
    const m1 = merge(a, b);
    const m2 = merge(m1, b);
    expect(m2.xpByDevice).toEqual({ pc1: 100, pc2: 50 });
    expect(m2.concepts.states.rung).toBe(3);
    expect(m2.concepts.phase.rung).toBe(2);
    expect(m2.cards).toEqual(['H']);
    expect(m2.deviceId).toBe('pc1');
  });
});

describe('chemistry data', () => {
  it('every equation is balanced', () => {
    for (const e of EQUATIONS) expect(isBalanced(e), `${e.r.join('+')} -> ${e.p.join('+')}`).toBe(true);
  });
  it('valence electron counts in the molecule table are right', () => {
    for (const m of MOLECULES) expect(valenceElectrons(m.f, m.charge ?? 0), m.f).toBe(m.ve);
  });
  it('domains match geometry', () => {
    const eg: Record<number, string> = { 2: 'linear', 3: 'trigonal planar', 4: 'tetrahedral', 5: 'trigonal bipyramidal', 6: 'octahedral' };
    for (const m of MOLECULES) expect(m.eg, m.f).toBe(eg[m.bonds.length + m.lp]);
    const hyb: Record<number, string> = { 2: 'sp', 3: 'sp2', 4: 'sp3', 5: 'sp3d', 6: 'sp3d2' };
    for (const m of MOLECULES) if (m.hyb) expect(m.hyb, m.f).toBe(hyb[m.bonds.length + m.lp]);
  });
  it('electron bookkeeping in each Lewis structure adds up', () => {
    for (const m of MOLECULES) {
      // bonding electrons + central lone pairs + outer atoms' lone pairs (octet, H duet) = total
      const bonding = m.bonds.reduce((s, b) => s + 2 * b[1], 0);
      const outer = m.bonds.reduce((s, [el, o]) => s + (el === 'H' ? 0 : 8 - 2 * o), 0);
      expect(bonding + outer + 2 * m.lp, m.f).toBe(m.ve);
    }
  });
  it('ionic formulas are neutral', () => {
    expect(formulaOf({ f: 'Al', q: 3, name: '' }, { f: 'O', q: -2, name: '' })).toBe('Al2O3');
    expect(formulaOf({ f: 'Ca', q: 2, name: '' }, { f: 'NO3', q: -1, name: '', poly: true })).toBe('Ca(NO3)2');
    expect(formulaOf({ f: 'NH4', q: 1, name: '', poly: true }, { f: 'PO4', q: -3, name: '', poly: true })).toBe('(NH4)3PO4');
    expect(formulaOf({ f: 'Mg', q: 2, name: '' }, { f: 'O', q: -2, name: '' })).toBe('MgO');
    expect(atoms('(NH4)3PO4')).toEqual({ N: 3, H: 12, P: 1, O: 4 });
  });
  it('pretty prints formulas and ions', () => {
    expect(pretty('Ca(NO3)2')).toBe('Ca(NO₃)₂');
    expect(pretty('SO4^2-')).toBe('SO₄²⁻');
    expect(pretty('Mg2+')).toBe('Mg²⁺');
    expect(pretty('NO3-')).toBe('NO₃⁻');
    expect(prettyText('Cl + e- -> Cl-')).toBe('Cl + e⁻ → Cl⁻');
    expect(prettyText('Which ion is largest? Na+ or Mg2+')).toBe('Which ion is largest? Na⁺ or Mg²⁺');
  });
});

import { describe, expect, it } from 'vitest';
import { TEMPLATES, build, mulberry32 } from './content';
import { applyAnswer, applyWatch, grade, merge, newSave, nextQuestion, startRun, stateAt, prob, currentConcept, finishBoss } from './engine';
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
  it('every concept has templates on rungs 1-4', () => {
    for (const c of ['states', 'phase', 'classify', 'change', 'density']) for (const r of [1, 2, 3, 4]) expect(TEMPLATES.some((t) => t.concept === c && t.rung === r)).toBe(true);
  });
});

describe('engine', () => {
  it('probability is 0.5 when skill equals difficulty', () => expect(prob(1, 1)).toBeCloseTo(0.5));

  it('a perfect player masters all of World 1', () => {
    const s = newSave('dev1');
    const rng = mulberry32(3);
    let runs = 0;
    while (currentConcept(s) && runs < 60) {
      const run = startRun();
      while (!run.done) {
        const { q, slot } = nextQuestion(s, run, rng);
        if (q.kind === 'watch') applyWatch(s, run, q.concept);
        else applyAnswer(s, run, q, slot, grade(q, right(q)), true);
      }
      runs++;
    }
    expect(currentConcept(s)).toBeNull();
    expect(s.cards.sort()).toEqual(['B', 'Be', 'H', 'He', 'Li'].sort());
    expect(runs).toBeLessThan(15);
  });

  it('two wrong answers on a rung drop it and force a Watch', () => {
    const s = newSave('d');
    s.concepts.states.rung = 2;
    const run = startRun();
    const rng = mulberry32(1);
    for (let i = 0; i < 2; i++) {
      run.index = 1;
      const { q, slot } = nextQuestion(s, run, rng);
      applyAnswer(s, run, q, slot, false, true);
    }
    expect(s.concepts.states.rung).toBe(1);
    expect(nextQuestion(s, run, rng).q.kind).toBe('watch');
  });

  it('a wrong answer schedules an echo and costs charge', () => {
    const s = newSave('d');
    s.concepts.states.rung = 1;
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
    a.concepts.states.rung = 3; b.concepts.phase.rung = 2; b.cards = ['H'];
    const m1 = merge(a, b);
    const m2 = merge(m1, b);
    expect(m2.xpByDevice).toEqual({ pc1: 100, pc2: 50 });
    expect(m2.concepts.states.rung).toBe(3);
    expect(m2.concepts.phase.rung).toBe(2);
    expect(m2.cards).toEqual(['H']);
    expect(m2.deviceId).toBe('pc1');
  });
});

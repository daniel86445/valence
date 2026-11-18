import { CONCEPTS, TEMPLATES, build, conceptInfo, watchCard, type Rng, pick } from './content';
import type { Answer, ConceptId, ConceptProgress, Question, Rung, SaveData, State } from './types';

export const RUN_SHAPE = ['warm', 'new', 'new', 'new', 'review', 'new', 'new', 'echo', 'new', 'mixed', 'mixed', 'finale'] as const;
export type Slot = (typeof RUN_SHAPE)[number] | 'boss';
export const TARGET: Record<Slot, number> = { warm: 0.95, new: 0.82, review: 0.82, echo: 0.8, mixed: 0.8, finale: 0.93, boss: 0.72 };
export const REVIEW_DAYS = [1, 3, 7, 16, 35];
export const MAX_CHARGE = 5;
export const SURE_MS = 700;
export const BOSS_COUNT = 10;
export const BOSS_PASS = 8;
export const BOSS_SECONDS = 150;
const DAY = 86_400_000;

/* ---------- save ---------- */

export function newConcept(): ConceptProgress {
  return { rung: 0, mastered: false, theta: 0, streak: 0, sureHit: false, misses: 0, reviewStep: -1, due: 0, updatedAt: 0 };
}
export function newSave(deviceId: string): SaveData {
  const concepts = Object.fromEntries(CONCEPTS.map((c) => [c.id, newConcept()])) as SaveData['concepts'];
  return {
    v: 1, deviceId, concepts, templateB: {}, xpByDevice: {}, answeredByDevice: {}, correctByDevice: {},
    cards: [], outfits: [], bestCombo: 0, worldsCleared: [], recent: [],
    settings: { sound: true, volume: 0.6, reduceMotion: false, alwaysSuit: false }, updatedAt: Date.now(),
  };
}
const sum = (r: Record<string, number>) => Object.values(r).reduce((s, x) => s + x, 0);
export const totalXp = (s: SaveData) => sum(s.xpByDevice);
export const levelOf = (xp: number) => Math.floor(Math.sqrt(xp / 120)) + 1;
export const xpForLevel = (lv: number) => (lv - 1) ** 2 * 120;
export const accuracy = (s: SaveData) => (s.recent.length ? s.recent.reduce((a, b) => a + b, 0) / s.recent.length : 0);

export function currentConcept(s: SaveData): ConceptId | null {
  const c = CONCEPTS.find((x) => !s.concepts[x.id].mastered);
  return c ? c.id : null;
}
export function dueConcepts(s: SaveData, now = Date.now()): ConceptId[] {
  return CONCEPTS.filter((c) => s.concepts[c.id].reviewStep >= 0 && s.concepts[c.id].due <= now)
    .sort((a, b) => s.concepts[a.id].due - s.concepts[b.id].due).map((c) => c.id);
}

/* ---------- difficulty ---------- */

export const prob = (theta: number, b: number) => 1 / (1 + Math.exp(-(theta - b)));
const effB = (s: SaveData, q: Question) => q.b + (s.templateB[q.template] ?? 0);

function choose(s: SaveData, rng: Rng, concepts: ConceptId[], rungOf: (c: ConceptId) => Rung[], target: number, avoid: string[]): Question | null {
  const cands: { q: Question; score: number }[] = [];
  for (const c of concepts) {
    for (const r of rungOf(c)) {
      for (const t of TEMPLATES.filter((x) => x.concept === c && x.rung === r)) {
        const q = build(t, rng);
        const p = prob(s.concepts[c].theta, effB(s, q));
        const penalty = avoid.includes(t.id) ? 0.35 : 0;
        cands.push({ q, score: Math.abs(p - target) + penalty + rng() * 0.04 });
      }
    }
  }
  cands.sort((a, b) => a.score - b.score);
  return cands[0]?.q ?? null;
}
const atOrBelow = (s: SaveData) => (c: ConceptId): Rung[] => {
  const r = s.concepts[c].mastered ? 4 : s.concepts[c].rung;
  return ([1, 2, 3, 4] as Rung[]).filter((x) => x <= Math.max(1, r));
};
const exactly = (s: SaveData) => (c: ConceptId): Rung[] => [Math.max(1, s.concepts[c].rung) as Rung];
const started = (s: SaveData) => CONCEPTS.map((c) => c.id).filter((id) => s.concepts[id].rung >= 1 || s.concepts[id].mastered);

/* ---------- runs ---------- */

export interface Echo { concept: ConceptId; rung: Rung; template: string; dueIndex: number }
export interface RunEvent { kind: 'rungUp' | 'rungDown' | 'mastered' | 'card'; concept: ConceptId; rung?: Rung; card?: string }
export interface RunState {
  boss: boolean;
  plan: Slot[];
  index: number;
  charge: number;
  combo: number;
  bestCombo: number;
  xp: number;
  correct: number;
  answered: number;
  echoes: Echo[];
  forceWatch: ConceptId | null;
  recentTemplates: string[];
  events: RunEvent[];
  startedAt: number;
  done: boolean;
  passed?: boolean;
}

export function startRun(boss = false): RunState {
  return {
    boss, plan: boss ? Array(BOSS_COUNT).fill('boss') : [...RUN_SHAPE], index: 0, charge: boss ? 3 : MAX_CHARGE,
    combo: 0, bestCombo: 0, xp: 0, correct: 0, answered: 0, echoes: [], forceWatch: null, recentTemplates: [], events: [],
    startedAt: Date.now(), done: false,
  };
}

export function nextQuestion(s: SaveData, run: RunState, rng: Rng, now = Date.now()): { q: Question; slot: Slot } {
  const slot = run.plan[run.index];
  const avoid = run.recentTemplates.slice(-3);
  const cur = currentConcept(s);
  if (run.boss) {
    const q = choose(s, rng, CONCEPTS.map((c) => c.id), () => [3, 4], TARGET.boss, avoid)!;
    return { q, slot };
  }
  if (run.forceWatch) return { q: watchCard(run.forceWatch), slot };

  const echo = run.echoes.find((e) => e.dueIndex <= run.index);
  if (echo && slot !== 'finale') {
    run.echoes = run.echoes.filter((e) => e !== echo);
    const q = choose(s, rng, [echo.concept], () => [echo.rung], TARGET.echo, [...avoid, echo.template]);
    if (q) return { q, slot: 'echo' };
  }

  const learnNew = (): { q: Question; slot: Slot } => {
    if (!cur) {
      const q = choose(s, rng, started(s), atOrBelow(s), TARGET.mixed, avoid)!;
      return { q, slot: 'mixed' };
    }
    if (s.concepts[cur].rung === 0) return { q: watchCard(cur), slot: 'new' };
    return { q: choose(s, rng, [cur], exactly(s), TARGET.new, avoid)!, slot: 'new' };
  };

  const pool = started(s);
  switch (slot) {
    case 'warm':
    case 'finale': {
      if (!pool.length) return learnNew();
      return { q: choose(s, rng, pool, atOrBelow(s), TARGET[slot], avoid)!, slot };
    }
    case 'review': {
      const due = dueConcepts(s, now);
      if (!due.length) return learnNew();
      return { q: choose(s, rng, [due[0]], atOrBelow(s), TARGET.review, avoid)!, slot };
    }
    case 'mixed': {
      const others = pool.filter((c) => c !== cur);
      if (!others.length) return learnNew();
      return { q: choose(s, rng, [pick(rng, others)], atOrBelow(s), TARGET.mixed, avoid)!, slot };
    }
    default:
      return learnNew();
  }
}

/** The player finished a Watch card. */
export function applyWatch(s: SaveData, run: RunState, concept: ConceptId) {
  const c = s.concepts[concept];
  if (c.rung === 0) c.rung = 1;
  c.misses = 0;
  c.updatedAt = Date.now();
  run.forceWatch = null;
  run.index++;
  if (run.index >= run.plan.length) run.done = true;
}

export interface AnswerResult { xp: number; mult: number; chargeGained: boolean; events: RunEvent[] }

export function comboMult(combo: number) {
  return Math.min(4, 1 + Math.floor(combo / 3));
}

export function applyAnswer(s: SaveData, run: RunState, q: Question, _slot: Slot, correct: boolean, sure: boolean, now = Date.now()): AnswerResult {
  const c = s.concepts[q.concept];
  const dev = s.deviceId;
  const b = effB(s, q);
  const p = prob(c.theta, b);
  const r = correct ? (sure ? 1 : 0.8) : 0;
  c.theta += 0.5 * (r - p);
  s.templateB[q.template] = Math.max(-1.5, Math.min(1.5, (s.templateB[q.template] ?? 0) - 0.05 * (r - p)));
  c.updatedAt = now;

  s.answeredByDevice[dev] = (s.answeredByDevice[dev] ?? 0) + 1;
  s.recent = [...s.recent, correct ? 1 : 0].slice(-50);
  run.answered++;
  const events: RunEvent[] = [];
  let xp = 0;
  let mult = 1;
  let chargeGained = false;

  if (correct) {
    run.correct++;
    run.combo++;
    run.bestCombo = Math.max(run.bestCombo, run.combo);
    s.bestCombo = Math.max(s.bestCombo, run.combo);
    s.correctByDevice[dev] = (s.correctByDevice[dev] ?? 0) + 1;
    mult = comboMult(run.combo);
    xp = Math.round(10 * (q.rung + 1) * mult * (sure ? 1.5 : 1));
    if (run.combo % 3 === 0 && run.charge < (run.boss ? 3 : MAX_CHARGE)) { run.charge++; chargeGained = true; }
  } else {
    run.combo = 0;
    run.charge--;
    if (!run.boss) run.echoes.push({ concept: q.concept, rung: q.rung, template: q.template, dueIndex: run.index + 3 });
  }

  // Ladder: only answers on the concept's current rung move it.
  if (!run.boss && !c.mastered && q.rung === Math.max(1, c.rung)) {
    if (correct) {
      c.streak++;
      c.misses = 0;
      if (sure) c.sureHit = true;
      if (c.streak >= 2 && c.sureHit) {
        if (c.rung === 4) {
          c.mastered = true;
          events.push({ kind: 'mastered', concept: q.concept });
          const card = conceptInfo(q.concept).card;
          if (!s.cards.includes(card)) { s.cards.push(card); events.push({ kind: 'card', concept: q.concept, card }); }
          c.reviewStep = 0;
          c.due = now + REVIEW_DAYS[0] * DAY;
        } else {
          c.rung = (c.rung + 1) as Rung;
          events.push({ kind: 'rungUp', concept: q.concept, rung: c.rung });
          if (c.rung === 2 && c.reviewStep < 0) { c.reviewStep = 0; c.due = now + REVIEW_DAYS[0] * DAY; }
        }
        c.streak = 0;
        c.sureHit = false;
      }
    } else {
      c.streak = 0;
      c.misses++;
      if (c.misses >= 2) {
        c.misses = 0;
        if (c.rung > 1) { c.rung = (c.rung - 1) as Rung; events.push({ kind: 'rungDown', concept: q.concept, rung: c.rung }); }
        run.forceWatch = q.concept;
      }
    }
  } else if (!run.boss && c.reviewStep >= 0) {
    // review / mixed / warm-up answers move the review timer
    if (correct) { c.reviewStep = Math.min(REVIEW_DAYS.length - 1, c.reviewStep + 1); c.due = now + REVIEW_DAYS[c.reviewStep] * DAY; }
    else { c.reviewStep = 0; c.due = now + REVIEW_DAYS[0] * DAY; }
  }

  run.xp += xp;
  s.xpByDevice[dev] = (s.xpByDevice[dev] ?? 0) + xp;
  run.events.push(...events);
  run.recentTemplates.push(q.template);
  run.index++;
  if (run.index >= run.plan.length || run.charge <= 0) run.done = true;
  if (run.boss && run.done) finishBoss(s, run);
  s.updatedAt = now;
  return { xp, mult, chargeGained, events };
}

export function finishBoss(s: SaveData, run: RunState) {
  run.done = true;
  run.passed = run.correct >= BOSS_PASS;
  if (!run.passed) return;
  const now = Date.now();
  for (const ci of CONCEPTS) {
    const c = s.concepts[ci.id];
    if (!c.mastered) {
      c.mastered = true; c.rung = 4; c.reviewStep = 0; c.due = now + DAY; c.updatedAt = now;
      run.events.push({ kind: 'mastered', concept: ci.id });
    }
    if (!s.cards.includes(ci.card)) { s.cards.push(ci.card); run.events.push({ kind: 'card', concept: ci.id, card: ci.card }); }
  }
  if (!s.worldsCleared.includes('w1')) s.worldsCleared.push('w1');
  if (!s.outfits.includes('suit')) s.outfits.push('suit');
  const bonus = 500;
  run.xp += bonus;
  s.xpByDevice[s.deviceId] = (s.xpByDevice[s.deviceId] ?? 0) + bonus;
}

/* ---------- grading ---------- */

export function stateAt(sub: { mp: number; bp: number }, t: number): State {
  return t < sub.mp ? 'solid' : t < sub.bp ? 'liquid' : 'gas';
}
export function grade(q: Question, a: Answer): boolean {
  if (q.kind === 'peek' && a.kind === 'peek') return a.choice === q.answer;
  if (q.kind === 'float' && a.kind === 'float') return a.choice === q.answer;
  if (q.kind === 'swipe' && a.kind === 'swipe') return q.cards.every((c, i) => a.sides[i] === c.side);
  if (q.kind === 'phase' && a.kind === 'phase') {
    if (q.mode === 'read') return a.choice === q.answer;
    if (a.temp === undefined) return false;
    if (a.temp === q.substance.mp || a.temp === q.substance.bp) return false;
    return stateAt(q.substance, a.temp) === q.target;
  }
  return false;
}

/* ---------- merge (two computers) ---------- */

const rank = (c: ConceptProgress) => (c.mastered ? 100 : 0) + c.rung * 10 + c.streak;
const maxRec = (a: Record<string, number>, b: Record<string, number>) => {
  const out = { ...a };
  for (const [k, v] of Object.entries(b)) out[k] = Math.max(out[k] ?? 0, v);
  return out;
};
const union = (a: string[], b: string[]) => Array.from(new Set([...a, ...b]));

export function merge(local: SaveData, remote: SaveData): SaveData {
  const concepts = { ...local.concepts };
  for (const id of Object.keys(remote.concepts) as ConceptId[]) {
    const a = local.concepts[id];
    const b = remote.concepts[id];
    if (!a) { concepts[id] = b; continue; }
    const best = rank(b) > rank(a) || (rank(b) === rank(a) && b.updatedAt > a.updatedAt) ? b : a;
    concepts[id] = { ...best, theta: Math.max(a.theta, b.theta) };
  }
  const templateB: Record<string, number> = { ...local.templateB };
  for (const [k, v] of Object.entries(remote.templateB)) templateB[k] = k in templateB ? (templateB[k] + v) / 2 : v;
  const newer = remote.updatedAt > local.updatedAt ? remote : local;
  return {
    ...local,
    concepts, templateB,
    xpByDevice: maxRec(local.xpByDevice, remote.xpByDevice),
    answeredByDevice: maxRec(local.answeredByDevice, remote.answeredByDevice),
    correctByDevice: maxRec(local.correctByDevice, remote.correctByDevice),
    cards: union(local.cards, remote.cards),
    outfits: union(local.outfits, remote.outfits),
    worldsCleared: union(local.worldsCleared, remote.worldsCleared),
    bestCombo: Math.max(local.bestCombo, remote.bestCombo),
    recent: newer.recent,
    settings: newer.settings,
    deviceId: local.deviceId,
    updatedAt: Math.max(local.updatedAt, remote.updatedAt),
  };
}

import type { ConceptInfo, Question, Rung } from '../types';
import { prettyText } from '../chem';
import guide1 from '../../content/guide1.json';

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
export function sample<T>(rng: Rng, xs: readonly T[], n: number): T[] {
  return shuffle(rng, xs).slice(0, n);
}

export type Gen = (rng: Rng) => Omit<Question, 'id' | 'template' | 'concept' | 'rung' | 'b'> & { b?: number };
export interface Template { id: string; concept: string; rung: Rung; b: number; gen: Gen }

export function adder(list: Template[]) {
  return (id: string, concept: string, rung: Rung, b: number, gen: Gen) => list.push({ id, concept, rung, b, gen });
}

/** Multiple choice from one right answer and some wrong ones. Duplicates are removed. */
export function choice(rng: Rng, prompt: string, right: string, wrongs: string[], why: string, hint: string, extra: Record<string, unknown> = {}) {
  const ws = Array.from(new Set(wrongs.filter((w) => w !== right))).slice(0, 3);
  const opts = shuffle(rng, [right, ...ws]);
  return { kind: 'peek' as const, prompt, options: opts.map((label) => ({ label })), answer: opts.indexOf(right), why, hint, ...extra };
}

/** Format a number to n significant figures, as a plain string. */
export function sig(x: number, n = 3): string {
  if (x === 0) return '0';
  const s = Number(x.toPrecision(n));
  const digits = Math.max(0, n - 1 - Math.floor(Math.log10(Math.abs(s))));
  return s.toFixed(Math.min(digits, 6));
}

/* ---------- study guide content ---------- */

interface GuideMC { n: number; sec: number; prompt: string; options: string[]; answer: number; why: string }
const G = guide1 as { mc: GuideMC[]; facts: Record<string, string[]>; misconceptions?: Record<string, string[]>; myths: Record<string, string[]> };
export const guideFacts = (sec: number) => G.facts[String(sec)] ?? [];
/** The guide's "Common Misconceptions" lines are written as TRUE corrections. */
export const guideTraps = (sec: number) => G.myths[String(sec)] ?? [];
export const guideMC = (sec: number) => G.mc.filter((q) => q.sec === sec);

/**
 * Adds the study-guide templates for one section:
 *  - rung 1: Fact or Myth swipe (guide facts + corrected misconceptions vs. hand-written myths)
 *  - rung 2/3: the guide's own multiple-choice questions
 */
export function addGuide(add: ReturnType<typeof adder>, concept: string, sec: number, myths: string[]) {
  const truths = [...guideFacts(sec), ...guideTraps(sec)].map(prettyText);
  add(`${concept}-fact`, concept, 1, -0.7, (rng) => {
    const t = sample(rng, truths, 3).map((text) => ({ text, side: 'L' as const }));
    const m = sample(rng, myths, 3).map((text) => ({ text, side: 'R' as const }));
    return {
      kind: 'swipe', left: 'True', right: 'Myth', cards: shuffle(rng, [...t, ...m]),
      prompt: 'Fact or myth? Sort each statement.', hint: 'Myths are the common mistakes on this topic. Read every word.',
      why: `Myths here: ${m.map((x) => `"${x.text}"`).join(' ')} Each one is a classic trap on the test.`,
    };
  });
  guideMC(sec).forEach((q, i) => {
    add(`${concept}-guide${i + 1}`, concept, (i === 0 ? 2 : 3) as Rung, i === 0 ? -0.1 : 0.4, (rng) => {
      const order = shuffle(rng, q.options.map((_, j) => j));
      return {
        kind: 'peek', prompt: prettyText(q.prompt), options: order.map((j) => ({ label: prettyText(q.options[j]) })), answer: order.indexOf(q.answer),
        why: prettyText(q.why), hint: 'This one is straight from your study guide.',
      };
    });
  });
}

export function concept(c: Omit<ConceptInfo, 'watchText' | 'traps'> & { sec: number }): ConceptInfo {
  return { ...c, watchText: guideFacts(c.sec).slice(0, 4).map(prettyText), traps: guideTraps(c.sec).slice(0, 2).map(prettyText) };
}

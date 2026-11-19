export type ConceptId = string;

export interface ConceptInfo {
  id: ConceptId;
  world: string;
  name: string;
  short: string;
  card: string; // element symbol won on mastery
  cardName: string;
  cardFact: string;
  watchTitle: string;
  watchText: string[];
  traps?: string[];
  moLine: string;
  sec?: number;
}

export interface Lewis { central: string; bonds: [string, number][]; lp: number; charge?: number }
export type Rung = 0 | 1 | 2 | 3 | 4; // 0 Watch, 1 Spot, 2 Build, 3 Apply, 4 Master
export const RUNG_NAMES = ['Watch', 'Spot', 'Build', 'Apply', 'Master'] as const;

export type State = 'solid' | 'liquid' | 'gas';

/** A particle box drawn by ParticleBox. */
export interface Diagram {
  kind: 'state' | 'matter';
  state: State;
  /** Particle groups. Each group is one "molecule": a list of atom colors that stick together. */
  groups: string[][];
}

interface QBase {
  id: string;
  template: string;
  concept: ConceptId;
  rung: Rung;
  /** Difficulty on the same scale as player skill. */
  b: number;
  prompt: string;
  hint: string;
  why: string;
}

export interface PeekQ extends QBase {
  kind: 'peek';
  options: { label?: string; diagram?: Diagram }[];
  answer: number;
  /** Optional diagram shown above text options. */
  show?: Diagram;
  /** Optional Lewis structure sketch. */
  lewis?: Lewis;
  /** Only show the Lewis sketch after answering (when it would give the answer away). */
  revealOnly?: boolean;
}

export interface SwipeQ extends QBase {
  kind: 'swipe';
  left: string;
  right: string;
  cards: { text: string; side: 'L' | 'R' }[];
}

export interface FloatQ extends QBase {
  kind: 'float';
  liquid: { name: string; density: number; color: string };
  object: { name: string; mass: number; volume: number; color: string };
  /** When true the density is printed; otherwise the player works it out from mass and volume. */
  showDensity: boolean;
  answer: 'float' | 'sink';
}

export interface PhaseQ extends QBase {
  kind: 'phase';
  substance: { name: string; mp: number; bp: number };
  min: number;
  max: number;
  step: number;
  /** set: slide the thermometer so the substance is `target`. read: pick the state at `temp`. */
  mode: 'set' | 'read';
  target?: State;
  temp?: number;
  answer?: State;
}

export interface WatchQ extends QBase {
  kind: 'watch';
}

export type Question = PeekQ | SwipeQ | FloatQ | PhaseQ | WatchQ;

export type Answer =
  | { kind: 'peek'; choice: number }
  | { kind: 'swipe'; sides: ('L' | 'R')[] }
  | { kind: 'float'; choice: 'float' | 'sink' }
  | { kind: 'phase'; temp?: number; choice?: State };

export interface ConceptProgress {
  rung: Rung;
  mastered: boolean;
  theta: number;
  streak: number; // right answers in a row on this rung
  sureHit: boolean; // at least one "sure" right on this rung
  misses: number; // wrong answers in a row on this rung
  reviewStep: number; // -1 = not scheduled
  due: number; // ms timestamp
  updatedAt: number;
}

export interface Settings {
  sound: boolean;
  volume: number;
  reduceMotion: boolean;
  alwaysSuit: boolean;
  lastWorld?: string;
}

export interface SaveData {
  v: 1;
  deviceId: string;
  concepts: Record<ConceptId, ConceptProgress>;
  /** Template difficulty adjustments, learned from play. */
  templateB: Record<string, number>;
  /** XP and counters are kept per device so merging two computers never double counts. */
  xpByDevice: Record<string, number>;
  answeredByDevice: Record<string, number>;
  correctByDevice: Record<string, number>;
  cards: string[];
  outfits: string[];
  bestCombo: number;
  worldsCleared: string[];
  recent: number[]; // last 50 results, 1 or 0
  settings: Settings;
  updatedAt: number;
}

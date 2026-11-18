// Chiptune sound effects made with the Web Audio API. No audio files.
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let enabled = true;
let volume = 0.6;

function ac() {
  if (!ctx) {
    ctx = new AudioContext();
    master = ctx.createGain();
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') void ctx.resume();
  master!.gain.value = volume * 0.25;
  return ctx;
}

export function setSound(on: boolean, vol: number) {
  enabled = on;
  volume = vol;
  if (master) master.gain.value = vol * 0.25;
}

function tone(freq: number, dur: number, opts: { type?: OscillatorType; at?: number; to?: number; vol?: number } = {}) {
  if (!enabled) return;
  const a = ac();
  const t0 = a.currentTime + (opts.at ?? 0);
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = opts.type ?? 'square';
  o.frequency.setValueAtTime(freq, t0);
  if (opts.to) o.frequency.exponentialRampToValueAtTime(opts.to, t0 + dur);
  g.gain.setValueAtTime(opts.vol ?? 0.5, t0);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  o.connect(g).connect(master!);
  o.start(t0);
  o.stop(t0 + dur + 0.02);
}

const note = (semi: number) => 523.25 * 2 ** (semi / 12); // C5 + semitones
const MAJOR = [0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 17, 19, 21, 23, 24];

export const sfx = {
  tap: () => tone(660, 0.04, { vol: 0.3 }),
  select: () => tone(880, 0.05, { vol: 0.35 }),
  swipe: (left: boolean) => tone(left ? 520 : 700, 0.08, { to: left ? 300 : 1100, vol: 0.3, type: 'triangle' }),
  snap: () => { tone(1400, 0.03, { vol: 0.35 }); tone(700, 0.05, { at: 0.03, vol: 0.3 }); },
  /** Each answer in a streak plays one step higher on the scale. */
  correct: (combo: number) => {
    const base = MAJOR[Math.min(combo, MAJOR.length - 1) % MAJOR.length];
    [0, 4, 7].forEach((s, i) => tone(note(base + s), 0.09, { at: i * 0.06, vol: 0.4 }));
  },
  wrong: () => { tone(160, 0.28, { to: 70, vol: 0.55, type: 'sawtooth' }); tone(90, 0.2, { vol: 0.4, type: 'square' }); },
  combo: () => [0, 4, 7, 12, 16].forEach((s, i) => tone(note(s + 7), 0.07, { at: i * 0.045, vol: 0.3 })),
  card: () => [0, 4, 7, 12, 7, 12, 16, 19].forEach((s, i) => tone(note(s), 0.1, { at: i * 0.08, vol: 0.35, type: i % 2 ? 'square' : 'triangle' })),
  roll: () => [0, 1, 2, 3, 4, 5].forEach((i) => tone(220 + (i % 2) * 40, 0.04, { at: i * 0.07, vol: 0.18, type: 'triangle' })),
  rungUp: () => [0, 7, 12].forEach((s, i) => tone(note(s + 5), 0.12, { at: i * 0.09, vol: 0.35 })),
  charge: () => tone(988, 0.12, { to: 1976, vol: 0.25, type: 'triangle' }),
  sure: () => tone(1318, 0.06, { vol: 0.3 }),
  boss: () => [0, -1, -2, -3].forEach((s, i) => tone(note(s - 12), 0.18, { at: i * 0.2, vol: 0.4, type: 'sawtooth' })),
  /** Hold-to-lock-in hum. Returns a function that sets progress 0..1, and stops on progress < 0. */
  hum: () => {
    if (!enabled) return () => {};
    const a = ac();
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = 'triangle';
    o.frequency.value = 180;
    g.gain.value = 0.18;
    o.connect(g).connect(master!);
    o.start();
    return (p: number) => {
      if (p < 0) { g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.05); o.stop(a.currentTime + 0.06); return; }
      o.frequency.setValueAtTime(180 + p * 420, a.currentTime);
    };
  },
};

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Answer, SaveData } from '../engine/types';
import { RUNG_NAMES } from '../engine/types';
import { conceptInfo, mulberry32 } from '../engine/registry';
import {
  BOSS_SECONDS, MAX_CHARGE, applyAnswer, applyWatch, comboMult, finishBoss, grade, nextQuestion, startRun,
  type AnswerResult, type RunState, type Slot,
} from '../engine/engine';
import { KIND_NAME, QuestionView, isComplete } from '../questions/Views';
import { HoldButton } from '../ui/HoldButton';
import { Mo, type Mood } from '../ui/Mo';
import { Confetti, Flash, Key, Pips } from '../ui/Juice';
import { sfx } from '../game/sfx';

const SLOT_LABEL: Record<Slot, string> = { warm: 'WARM-UP', new: 'NEW', review: 'REVIEW', echo: 'ECHO', mixed: 'MIXED', finale: 'FINALE', boss: 'BOSS' };
const MO_LINES = {
  right: ['LET’S GOOO', 'Big brain.', 'Science!', 'Nailed it.', 'Too easy?', 'Mo approves.'],
  wrong: ['Ooh, close.', 'Watch this one.', 'We’ll get it back.', 'Happens to the best moles.', 'Look at the why!'],
  combo: ['Suit time.', 'Dressed for success.', 'Unstoppable.'],
};

export function Run({ save, boss, world, onSave, onDone, onQuit, reduceMotion, alwaysSuit }: {
  save: SaveData; boss: boolean; world: string; onSave: (s: SaveData) => void; onDone: (run: RunState, s: SaveData) => void; onQuit: () => void; reduceMotion: boolean; alwaysSuit: boolean;
}) {
  const work = useRef<SaveData>(structuredClone(save));
  const run = useRef<RunState>(startRun(boss, world));
  const rng = useMemo(() => mulberry32(Date.now() & 0xffffffff), []);
  const [cur, setCur] = useState(() => nextQuestion(work.current, run.current, rng));
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [phase, setPhase] = useState<'ask' | 'feedback'>('ask');
  const [result, setResult] = useState<(AnswerResult & { correct: boolean; sure: boolean }) | null>(null);
  const [hint, setHint] = useState(false);
  const [fx, setFx] = useState({ flash: 0, color: '#3DE8FF', shake: false, confetti: 0 });
  const [results, setResults] = useState<(0 | 1 | null)[]>(() => run.current.plan.map(() => null));
  const [moLine, setMoLine] = useState<string>(() => (boss ? 'Suit on. Let’s do this.' : 'Ready when you are.'));
  const [timeLeft, setTimeLeft] = useState(BOSS_SECONDS);
  const [, force] = useState(0);
  const r = run.current;
  const q = cur.q;

  useEffect(() => { if (boss) sfx.boss(); }, [boss]);

  const finish = useCallback(() => onDone(run.current, work.current), [onDone]);

  // boss timer
  useEffect(() => {
    if (!boss) return;
    const id = setInterval(() => {
      const left = BOSS_SECONDS - Math.floor((Date.now() - run.current.startedAt) / 1000);
      setTimeLeft(Math.max(0, left));
      if (left <= 0 && !run.current.done) { finishBoss(work.current, run.current); onSave(structuredClone(work.current)); clearInterval(id); finish(); }
    }, 250);
    return () => clearInterval(id);
  }, [boss, finish, onSave]);

  const submit = useCallback((sure: boolean) => {
    if (phase !== 'ask' || q.kind === 'watch' || !isComplete(q, answer)) return;
    const correct = grade(q, answer!);
    const idx = r.index;
    const res = applyAnswer(work.current, r, q, cur.slot, correct, sure);
    onSave(structuredClone(work.current));
    setResults((xs) => xs.map((x, i) => (i === idx ? (correct ? 1 : 0) : x)));
    setResult({ ...res, correct, sure });
    setPhase('feedback');
    if (correct) {
      sfx.correct(r.combo);
      if (r.combo === 5 || r.combo === 10) sfx.combo();
      if (res.chargeGained) setTimeout(sfx.charge, 250);
      if (res.events.some((e) => e.kind === 'card')) setTimeout(sfx.card, 300);
      else if (res.events.some((e) => e.kind === 'rungUp')) setTimeout(sfx.rungUp, 300);
      setFx((f) => ({ ...f, flash: f.flash + 1, color: '#3DE8FF', confetti: f.confetti + 1 }));
      setMoLine(r.combo >= 5 ? MO_LINES.combo[r.combo % 3] : MO_LINES.right[Math.floor(rng() * MO_LINES.right.length)]);
    } else {
      sfx.wrong();
      setFx((f) => ({ ...f, flash: f.flash + 1, color: '#FFB020', shake: true }));
      setTimeout(() => setFx((f) => ({ ...f, shake: false })), 340);
      setMoLine(MO_LINES.wrong[Math.floor(rng() * MO_LINES.wrong.length)]);
    }
  }, [phase, q, answer, r, cur.slot, onSave, rng]);

  const next = useCallback(() => {
    if (r.done) { finish(); return; }
    sfx.tap();
    setCur(nextQuestion(work.current, r, rng));
    setAnswer(null);
    setResult(null);
    setHint(false);
    setPhase('ask');
    setMoLine(boss ? 'Focus.' : '');
  }, [r, rng, finish, boss]);

  const doneWatch = useCallback(() => {
    if (q.kind !== 'watch') return;
    applyWatch(work.current, r, q.concept);
    onSave(structuredClone(work.current));
    setResults((xs) => xs.map((x, i) => (i === r.index - 1 ? 1 : x)));
    sfx.rungUp();
    if (r.done) { finish(); return; }
    setCur(nextQuestion(work.current, r, rng));
    setAnswer(null);
    setHint(false);
    setMoLine('Your turn. You got this.');
  }, [q, r, rng, onSave, finish]);

  const askHint = useCallback(() => {
    if (hint || phase !== 'ask' || q.kind === 'watch' || r.charge <= 1) return;
    r.charge--;
    setHint(true);
    sfx.select();
    setMoLine(q.hint);
    force((x) => x + 1);
  }, [hint, phase, q, r]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.key === 'Escape') onQuit();
      if (e.key === 'h' || e.key === 'H') askHint();
      if (phase === 'feedback' && (e.key === 'Enter' || e.code === 'Space')) { e.preventDefault(); next(); }
      if (phase === 'ask' && q.kind === 'watch' && (e.key === 'Enter' || e.code === 'Space')) { e.preventDefault(); doneWatch(); }
      if (phase === 'ask' && q.kind !== 'watch' && e.key === 'Enter' && isComplete(q, answer)) submit(false);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [phase, next, doneWatch, askHint, onQuit, q, answer, submit]);

  const suit = boss || alwaysSuit || r.combo >= 5;
  const mood: Mood = phase === 'feedback' ? (result?.correct ? 'happy' : 'sad') : q.kind === 'watch' ? 'wow' : hint ? 'wow' : 'focus';
  const info = conceptInfo(q.concept);
  const typeName = q.kind === 'peek' && q.lewis ? 'Molecule View' : q.kind === 'peek' && !q.options.some((o) => o.diagram) && !q.show ? 'Quick Pick' : KIND_NAME[q.kind];
  const rungName = RUNG_NAMES[q.rung];

  return (
    <div className={`dots min-h-full ${fx.shake && !reduceMotion ? 'shake' : ''}`}>
      {fx.flash > 0 && !reduceMotion && <Flash k={fx.flash} color={fx.color} />}
      <div className="mx-auto flex max-w-[1360px] flex-col gap-5 px-8 py-6">
        {/* top bar */}
        <div className="flex flex-wrap items-center gap-4">
          <button onClick={onQuit} className="px press btn-dark h-12 w-12 font-tag text-lg" aria-label="Quit run (Esc)">X</button>
          <div className="flex flex-1 gap-1" aria-label={`Question ${r.index + 1} of ${r.plan.length}`}>
            {results.map((x, i) => (
              <div key={i} className={`h-[14px] flex-1 ${i === r.index && x === null ? 'blink' : ''}`} style={{ background: x === 1 ? '#3DE8FF' : x === 0 ? '#FFB020' : i === r.index ? '#EAF2FF' : '#1E3456' }} />
            ))}
          </div>
          {boss && <div className={`px font-tag text-lg ${timeLeft <= 20 ? 'blink bg-amber text-abyss' : 'bg-panel2 text-ink'} px-3 py-2`}>{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</div>}
          <div className="flex items-center gap-2"><span className="font-tag text-[11px] text-mute">CHARGE</span><Pips n={r.charge} max={boss ? 3 : MAX_CHARGE} color="#FFB020" off="#2A1E08" /></div>
          <div key={r.combo} className={`px ${r.combo >= 3 ? 'punch' : ''} px-3 py-2 font-tag text-base font-bold ${r.combo >= 5 ? 'bg-amber text-abyss' : r.combo >= 3 ? 'bg-cyan text-abyss' : 'bg-panel2 text-mute'}`}>
            COMBO x{comboMult(r.combo)} · {r.combo}
          </div>
        </div>

        <div className="flex flex-wrap items-start gap-6">
          {/* main panel */}
          <div className="px8 relative min-w-0 flex-[999_1_640px] bg-[#0A1424] p-8">
            <div className="flex flex-wrap items-center gap-3 font-tag text-xs">
              <span className="text-cyan">{q.kind === 'watch' ? 'WATCH FIRST' : `${typeName.toUpperCase()} · ${rungName.toUpperCase()}`}</span>
              <span className="text-mute">{info.name.toUpperCase()}</span>
              <span className="px bg-panel2 px-2 py-1 text-mute">{SLOT_LABEL[cur.slot]}</span>
            </div>
            <h1 className="mt-2 text-4xl font-bold leading-tight">{q.kind === 'watch' ? `Watch: ${q.prompt}` : q.prompt}</h1>
            <div className="mt-6">
              <QuestionView key={q.id} q={q} value={answer} onChange={setAnswer} reveal={phase === 'feedback'} />
            </div>

            {phase === 'feedback' && result && (
              <div className={`px8 pop relative mt-6 flex flex-wrap items-center gap-5 p-5 ${result.correct ? 'bg-cyan-deep' : 'bg-amber-deep'}`}>
                {result.correct && fx.confetti > 0 && !reduceMotion && <Confetti key={fx.confetti} seed={fx.confetti} />}
                <div className="flex flex-col">
                  <div className={`font-tag text-xs ${result.correct ? 'text-cyan' : 'text-amber'}`}>{result.correct ? (result.sure ? 'CORRECT · SURE BONUS' : 'CORRECT') : 'NOT QUITE'}</div>
                  <div className={`punch text-5xl font-bold ${result.correct ? 'text-cyan' : 'text-amber'}`} style={{ textShadow: '4px 4px 0 #050A14' }}>
                    {result.correct ? `+${result.xp}` : 'Oops'}
                  </div>
                </div>
                <div className="min-w-[260px] flex-1 font-body text-lg leading-relaxed text-ink">{q.why}</div>
                <div className="flex flex-wrap gap-2 font-tag text-[11px]">
                  {result.correct && result.mult > 1 && <span className="px bg-amber px-2 py-1 text-abyss">x{result.mult} COMBO</span>}
                  {result.chargeGained && <span className="px bg-amber px-2 py-1 text-abyss">+1 CHARGE</span>}
                  {!result.correct && !boss && <span className="px bg-panel2 px-2 py-1 text-ink">ECHO IN 3</span>}
                  {!result.correct && <span className="px bg-panel2 px-2 py-1 text-amber">-1 CHARGE</span>}
                  {result.events.map((e, i) => (
                    <span key={i} className="px bg-gold px-2 py-1 text-abyss">
                      {e.kind === 'rungUp' ? `RUNG UP: ${RUNG_NAMES[e.rung!].toUpperCase()}` : e.kind === 'rungDown' ? `BACK TO ${RUNG_NAMES[e.rung!].toUpperCase()}` : e.kind === 'mastered' ? `MASTERED ${conceptInfo(e.concept).short}` : `NEW CARD: ${e.card}`}
                    </span>
                  ))}
                </div>
                <button onClick={next} className={`px8 press ml-auto h-16 w-48 text-2xl font-bold ${result.correct ? 'btn-cyan' : 'btn-amber'}`}>{r.done ? 'RESULTS' : 'NEXT'}</button>
              </div>
            )}
          </div>

          {/* side panel */}
          <div className="flex max-w-[380px] flex-[1_1_300px] flex-col gap-4">
            <div className="px8 flex flex-col items-start gap-4 bg-panel p-5">
              <div className={phase === 'feedback' && result?.correct ? 'hop' : 'bob'}>
                <Mo mood={mood} suit={suit} px={7} />
              </div>
              {(moLine || q.kind === 'watch') && (
                <div className="px bg-ink px-4 py-3 text-lg font-semibold leading-snug text-abyss">{q.kind === 'watch' && phase === 'ask' ? info.moLine : moLine}</div>
              )}
              {phase === 'ask' && q.kind !== 'watch' && (
                <button onClick={askHint} disabled={hint || r.charge <= 1} className="font-tag text-xs text-amber underline disabled:text-[#4A5F80] disabled:no-underline">
                  {hint ? 'HINT USED · -1 CHARGE' : r.charge <= 1 ? 'NO CHARGE TO SPARE FOR A HINT' : 'ASK MO FOR A HINT (H) · COSTS 1 CHARGE'}
                </button>
              )}
            </div>
            {phase === 'ask' && (q.kind === 'watch' ? (
              <button onClick={doneWatch} className="px8 press btn-cyan h-[72px] text-2xl font-bold">GOT IT (SPACE)</button>
            ) : (
              <HoldButton enabled={isComplete(q, answer)} onSubmit={submit} />
            ))}
            <div className="px8 flex flex-col gap-2 bg-panel p-5 text-[15px]">
              <div className="font-tag text-xs text-mute">KEYS</div>
              {q.kind === 'peek' && <div className="flex items-center gap-2"><Key>1-{q.options.length}</Key> pick</div>}
              {q.kind === 'swipe' && <div className="flex items-center gap-2"><Key>← →</Key> sort · <Key>Z</Key> undo</div>}
              {q.kind === 'float' && <div className="flex items-center gap-2"><Key>↑</Key> float · <Key>↓</Key> sink</div>}
              {q.kind === 'phase' && <div className="flex items-center gap-2">{q.mode === 'set' ? <><Key>← →</Key> temperature</> : <><Key>1-3</Key> pick state</>}</div>}
              <div className="flex items-center gap-2"><Key>SPACE</Key> hold to lock in (longer = sure)</div>
              <div className="flex items-center gap-2"><Key>ENTER</Key> quick lock in / next</div>
              <div className="flex items-center gap-2"><Key>H</Key> hint · <Key>ESC</Key> quit</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

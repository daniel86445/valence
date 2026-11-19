import { useEffect } from 'react';
import type { RunState } from '../engine/engine';
import { BOSS_PASS, BOSS_COUNT } from '../engine/engine';
import { RUNG_NAMES } from '../engine/types';
import { conceptInfo } from '../engine/registry';
import { Mo } from '../ui/Mo';
import { Confetti } from '../ui/Juice';
import { ElementTile } from './Cards';
import { sfx } from '../game/sfx';

export function Results({ run, onAgain, onMap }: { run: RunState; onAgain: () => void; onMap: () => void }) {
  const acc = run.answered ? run.correct / run.answered : 1;
  const grade = run.boss ? (run.passed ? 'W' : 'L') : acc >= 0.9 ? 'A' : acc >= 0.75 ? 'B' : acc >= 0.6 ? 'C' : 'D';
  const good = run.boss ? !!run.passed : acc >= 0.75;
  const outOfCharge = run.charge <= 0;
  const secs = Math.round((Date.now() - run.startedAt) / 1000);
  const cards = run.events.filter((e) => e.kind === 'card');
  const ups = run.events.filter((e) => e.kind !== 'card');

  useEffect(() => {
    if (cards.length || run.passed) sfx.card(); else if (good) sfx.rungUp();
    const h = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.key === 'Enter' || e.code === 'Space') { e.preventDefault(); onAgain(); }
      if (e.key === 'Escape' || e.key === 'm') onMap();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const title = run.boss ? (run.passed ? 'Reactor down!' : 'The Reactor held.') : outOfCharge ? 'Out of charge!' : good ? 'Nice run.' : 'Good practice.';
  const sub = run.boss
    ? run.passed ? `World ${run.world.slice(1)} cleared. Mo’s suit is yours.` : `You needed ${BOSS_PASS} of ${BOSS_COUNT}. Keep climbing and try again.`
    : outOfCharge ? 'Every miss comes back as an echo, so you’ll see these again.' : good ? 'You’re learning fast.' : 'The misses are scheduled to come back. That’s how it sticks.';

  return (
    <div className="mx-auto flex max-w-[920px] flex-col gap-5">
      <div className="relative flex items-center gap-6">
        {(good || cards.length > 0) && <Confetti n={34} seed={7} />}
        <div className={good ? 'hop' : 'bob'}><Mo px={8} mood={good ? 'happy' : 'sad'} suit={!!run.passed || run.boss} /></div>
        <div className="flex-1">
          <div className="font-tag text-xs text-mute">{run.boss ? 'BOSS FIGHT' : 'RUN COMPLETE'}</div>
          <h1 className="text-5xl font-bold">{title}</h1>
          <p className="mt-1 font-body text-lg text-mute">{sub}</p>
        </div>
        <div className={`px8 flex h-28 w-28 items-center justify-center text-7xl font-bold ${good ? 'btn-cyan' : 'btn-amber'}`}>{grade}</div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <div className="px bg-panel p-4"><div className="font-tag text-[11px] text-mute">CORRECT</div><div className="text-4xl font-bold">{run.correct}/{run.answered}</div></div>
        <div className="px bg-panel p-4"><div className="font-tag text-[11px] text-mute">BEST COMBO</div><div className="text-4xl font-bold text-amber">{run.bestCombo}</div></div>
        <div className="px bg-panel p-4"><div className="font-tag text-[11px] text-mute">XP</div><div className="text-4xl font-bold text-cyan">+{run.xp}</div></div>
        <div className="px bg-panel p-4"><div className="font-tag text-[11px] text-mute">TIME</div><div className="text-4xl font-bold">{Math.floor(secs / 60)}:{String(secs % 60).padStart(2, '0')}</div></div>
      </div>

      {ups.length > 0 && (
        <div className="px8 flex flex-col gap-2 bg-panel p-5">
          <div className="font-tag text-xs text-mute">PROGRESS THIS RUN</div>
          <div className="flex flex-wrap gap-2">
            {ups.map((e, i) => (
              <span key={i} className={`px px-3 py-2 text-lg ${e.kind === 'rungDown' ? 'bg-amber-deep text-amber' : 'bg-cyan-deep text-cyan'}`}>
                {conceptInfo(e.concept).name}: {e.kind === 'mastered' ? 'MASTERED' : e.kind === 'rungUp' ? `up to ${RUNG_NAMES[e.rung!]}` : `back to ${RUNG_NAMES[e.rung!]}`}
              </span>
            ))}
          </div>
        </div>
      )}

      {cards.length > 0 && (
        <div className="px8 flex flex-wrap items-center gap-4 bg-amber-deep p-5" style={{ boxShadow: 'inset 0 0 0 4px #FFB020' }}>
          <div className="font-tag text-xs text-amber">NEW CARD{cards.length > 1 ? 'S' : ''}!</div>
          {cards.map((c) => <div key={c.card} className="pop"><ElementTile sym={c.card!} owned big /></div>)}
          {run.passed && <div className="text-lg text-amber">+ Mo’s suit &amp; shades unlocked (turn it on in Settings)</div>}
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onMap} className="px press btn-dark h-16 w-40 font-tag">MAP (ESC)</button>
        <button onClick={onAgain} className="px8 press btn-cyan h-16 flex-1 text-3xl font-bold">ONE MORE RUN (SPACE)</button>
      </div>
    </div>
  );
}

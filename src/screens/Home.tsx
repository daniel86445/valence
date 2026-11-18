import { useEffect, useState } from 'react';
import type { SaveData } from '../engine/types';
import { CONCEPTS } from '../engine/content';
import { BOSS_COUNT, BOSS_PASS, BOSS_SECONDS, accuracy, currentConcept, dueConcepts } from '../engine/engine';
import { Mo } from '../ui/Mo';
import { sfx } from '../game/sfx';

const WORLDS = ['Matter', 'Measuring', 'Atoms', 'Periodic Table', 'Electrons', 'Bonding', 'Reactions & Moles', 'Gases & Energy', 'Rates & Equilibrium', 'Acids & Redox', 'Organic & Quantum', 'Extremes'];
const NODE = 84;
const GAP = 22;

export function Home({ save, onPlay, onBoss }: { save: SaveData; onPlay: () => void; onBoss: () => void }) {
  const cur = currentConcept(save);
  const curIdx = cur ? CONCEPTS.findIndex((c) => c.id === cur) : CONCEPTS.length;
  const [moIdx, setMoIdx] = useState(Math.max(0, curIdx - 1));
  const [rolling, setRolling] = useState(false);
  const cleared = save.worldsCleared.includes('w1');
  const due = dueConcepts(save).length;

  useEffect(() => {
    if (moIdx === curIdx) return;
    const t1 = setTimeout(() => { setRolling(true); setMoIdx(curIdx); sfx.roll(); }, 300);
    const t2 = setTimeout(() => setRolling(false), 1100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (!e.repeat && (e.key === 'Enter' || e.code === 'Space')) { e.preventDefault(); onPlay(); } };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onPlay]);

  const acc = accuracy(save);
  return (
    <div className="flex flex-wrap items-start gap-6">
      <nav className="px8 flex max-w-[300px] flex-[1_1_240px] flex-col gap-1 bg-panel p-4" aria-label="Worlds">
        <div className="mb-2 font-tag text-xs text-mute">WORLDS</div>
        {WORLDS.map((w, i) => (
          <div key={w} className={`px flex justify-between px-3 py-2 ${i === 0 ? 'bg-cyan font-bold text-abyss' : 'text-[#5F7598]'}`}>
            <span>{i + 1} {w}</span>
            <span className="font-tag text-[10px]">{i === 0 ? (cleared ? 'CLEARED' : `${CONCEPTS.filter((c) => save.concepts[c.id].mastered).length}/5`) : 'SOON'}</span>
          </div>
        ))}
      </nav>

      <div className="flex min-w-0 flex-[999_1_600px] flex-col gap-5">
        <div className="px8 flex flex-col gap-6 bg-[#0A1424] p-7">
          <div>
            <div className="font-tag text-xs text-mute">WORLD 1 / 12</div>
            <h1 className="text-5xl font-bold">Matter</h1>
            <p className="mt-1 font-body text-mute">What stuff is made of, how it changes, and why some things float.</p>
          </div>

          <div className="overflow-x-auto pb-2">
            <div className="relative" style={{ width: CONCEPTS.length * (NODE + GAP) + NODE + 24, height: 300 }}>
              {CONCEPTS.map((c, i) => {
                const p = save.concepts[c.id];
                const isCur = c.id === cur;
                const done = p.mastered;
                const x = i * (NODE + GAP);
                return (
                  <div key={c.id}>
                    {i > 0 && <div className="absolute" style={{ left: x - GAP, top: 168 + NODE / 2 - 4, width: GAP, height: 8, background: done || isCur ? '#3DE8FF' : '#1E3456' }} />}
                    {isCur && <div className="blink absolute" style={{ left: x - 8, top: 160, width: NODE + 16, height: NODE + 16, border: '4px dashed #3DE8FF' }} />}
                    <div className={`px8 absolute flex flex-col items-center justify-center text-center ${done ? 'btn-cyan' : isCur ? 'bg-ink text-abyss' : 'bg-panel2 text-[#5F7598]'}`} style={{ left: x, top: 168, width: NODE, height: NODE }}>
                      <div className="text-2xl font-bold">{c.short}</div>
                      <div className="mt-1 flex gap-1">{[1, 2, 3, 4].map((r) => { const on = done || p.rung >= r; return <div key={r} style={{ width: 10, height: 10, background: done ? '#050A14' : isCur ? (on ? '#1C7FD6' : '#C9D6EA') : on ? '#3DE8FF' : '#1E3456' }} />; })}</div>
                      <div className="mt-1 font-tag text-[9px]">{done ? 'MASTERED' : isCur ? `RUNG ${Math.max(p.rung, 0)}` : 'LOCKED'}</div>
                    </div>
                    <div className="absolute text-center text-sm text-mute" style={{ left: x - 10, top: 168 + NODE + 10, width: NODE + 20 }}>{c.name}</div>
                  </div>
                );
              })}
              {/* boss */}
              <div className="absolute" style={{ left: CONCEPTS.length * (NODE + GAP) - GAP, top: 168 + NODE / 2 - 4, width: GAP, height: 8, background: '#1E3456' }} />
              <button onClick={onBoss} className="px8 press btn-amber absolute flex flex-col items-center justify-center font-tag text-xs font-bold" style={{ left: CONCEPTS.length * (NODE + GAP), top: 160, width: NODE + 16, height: NODE + 16 }}>
                <span>BOSS</span><span>REACTOR</span><span className="mt-1 text-[9px]">{cleared ? 'BEATEN' : 'CHALLENGE'}</span>
              </button>
              {/* Mo */}
              <div className={`absolute ${rolling ? '' : 'bob'}`} style={{ left: Math.min(moIdx, CONCEPTS.length) * (NODE + GAP) + NODE / 2 - 60, top: 20, transition: 'left .8s steps(8)' }}>
                <Mo px={6} rolling={rolling} mood={cur ? 'idle' : 'happy'} suit={save.settings.alwaysSuit} />
              </div>
              {!rolling && (
                <div className="px absolute bg-ink px-3 py-2 text-base font-semibold text-abyss" style={{ left: Math.min(moIdx, CONCEPTS.length) * (NODE + GAP) + NODE / 2 + 70, top: 30, maxWidth: 260 }}>
                  {cur ? (save.concepts[cur].rung === 0 ? `New topic: ${CONCEPTS[curIdx].name}! I’ll show you first.` : `${CONCEPTS[curIdx].name}. Let’s climb.`) : cleared ? 'World cleared. Keep reviewing to keep it fresh!' : 'All 5 mastered. Boss time?'}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))' }}>
          <div className="px bg-panel p-4"><div className="font-tag text-[11px] text-mute">ACCURACY, LAST 50</div><div className="text-3xl font-bold">{save.recent.length ? `${Math.round(acc * 100)}%` : '—'}</div><div className="text-sm text-mute">{!save.recent.length ? 'Play a run' : acc > 0.9 ? 'Getting harder soon' : acc < 0.7 ? 'Easing off a bit' : 'Right in the sweet spot'}</div></div>
          <div className="px bg-panel p-4"><div className="font-tag text-[11px] text-mute">BEST COMBO</div><div className="text-3xl font-bold text-amber">{save.bestCombo}</div><div className="text-sm text-mute">5+ puts Mo in the suit</div></div>
          <div className="px bg-panel p-4"><div className="font-tag text-[11px] text-mute">REVIEWS DUE</div><div className="text-3xl font-bold text-cyan">{due}</div><div className="text-sm text-mute">Mixed into your next run</div></div>
        </div>
      </div>

      <div className="flex max-w-[340px] flex-[1_1_280px] flex-col gap-3">
        <div className="px8 flex flex-col gap-4 bg-panel p-5">
          <div className="text-2xl font-bold">Next run</div>
          <p className="font-body text-[15px] leading-relaxed text-mute">12 questions, about 5 minutes. {cur ? `Mostly ${CONCEPTS[curIdx].name.toLowerCase()}` : 'Mixed review of the whole world'}{due ? `, plus ${due} review${due > 1 ? 's' : ''}` : ''}. Play as many as you want.</p>
          <button onClick={onPlay} className="px8 press btn-cyan h-20 text-4xl font-bold tracking-widest">PLAY</button>
          <div className="text-center font-tag text-[11px] text-mute">OR PRESS SPACE</div>
        </div>
        <button onClick={onBoss} className="px press btn-amber h-14 font-tag text-sm">{cleared ? 'REMATCH THE REACTOR' : 'CHALLENGE BOSS TO SKIP'}</button>
        <p className="px-1 font-body text-sm text-mute">Boss: {BOSS_COUNT} mixed questions, {BOSS_SECONDS / 60 | 0}:{String(BOSS_SECONDS % 60).padStart(2, '0')} on the clock, 3 charge. Get {BOSS_PASS}+ right to clear World 1 and unlock Mo’s suit.</p>
      </div>
    </div>
  );
}

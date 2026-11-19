import { useEffect, useState } from 'react';
import type { SaveData } from '../engine/types';
import { WORLDS, worldInfo } from '../engine/registry';
import { BOSS_COUNT, BOSS_PASS, BOSS_SECONDS, accuracy, currentConcept, dueConcepts, worldMastered } from '../engine/engine';
import { Mo } from '../ui/Mo';
import { sfx } from '../game/sfx';

export function Home({ save, world, onWorld, onPlay, onBoss }: { save: SaveData; world: string; onWorld: (id: string) => void; onPlay: () => void; onBoss: () => void }) {
  const w = worldInfo(world);
  const concepts = w.concepts;
  const NODE = concepts.length > 5 ? 76 : 84;
  const GAP = concepts.length > 5 ? 18 : 22;
  const cur = currentConcept(save, world);
  const curIdx = cur ? concepts.findIndex((c) => c.id === cur) : concepts.length;
  const [moIdx, setMoIdx] = useState(Math.max(0, curIdx - 1));
  const [rolling, setRolling] = useState(false);
  const cleared = save.worldsCleared.includes(world);
  const due = dueConcepts(save).length;
  const skippedAhead = WORLDS.some((x) => x.n < w.n && (x.status !== 'built' || (!save.worldsCleared.includes(x.id) && worldMastered(save, x.id) < x.concepts.length)));

  useEffect(() => {
    setMoIdx(Math.max(0, curIdx - 1));
    const t1 = setTimeout(() => { setRolling(true); setMoIdx(curIdx); sfx.roll(); }, 300);
    const t2 = setTimeout(() => setRolling(false), 1100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [world]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (!e.repeat && (e.key === 'Enter' || e.code === 'Space')) { e.preventDefault(); onPlay(); } };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onPlay]);

  const acc = accuracy(save);
  const moX = Math.min(moIdx, concepts.length) * (NODE + GAP) + NODE / 2 - 60;
  const mapW = concepts.length * (NODE + GAP) + NODE + 24;
  return (
    <div className="flex flex-wrap items-start gap-6">
      <nav className="px8 flex max-w-[300px] flex-[1_1_240px] flex-col gap-1 bg-panel p-4" aria-label="Worlds">
        <div className="mb-2 font-tag text-xs text-mute">WORLDS · CHEM 1111</div>
        {WORLDS.map((x) => {
          const built = x.status === 'built';
          const active = x.id === world;
          const done = save.worldsCleared.includes(x.id);
          const m = built ? worldMastered(save, x.id) : 0;
          return (
            <button key={x.id} disabled={!built} onClick={() => { sfx.select(); onWorld(x.id); }}
              className={`px flex items-center justify-between gap-2 px-3 py-2 text-left ${active ? 'bg-cyan font-bold text-abyss' : built ? 'text-ink hover:bg-panel2' : 'cursor-default text-[#4A5F80]'}`}>
              <span className="leading-tight">{x.n} {x.name} <span className={`font-tag text-[9px] ${active ? 'text-abyss' : 'text-mute'}`}>{x.chapter}</span></span>
              <span className="shrink-0 font-tag text-[10px]">{built ? (done ? 'CLEARED' : `${m}/${x.concepts.length}`) : x.status === 'guide-3' ? 'GUIDE 3' : 'SOON'}</span>
            </button>
          );
        })}
      </nav>

      <div className="flex min-w-0 flex-[999_1_600px] flex-col gap-5">
        <div className="px8 flex flex-col gap-6 bg-[#0A1424] p-7">
          <div>
            <div className="font-tag text-xs text-mute">WORLD {w.n} / {WORLDS.length} · {w.chapter.toUpperCase()}</div>
            <h1 className="text-5xl font-bold">{w.name}</h1>
            <p className="mt-1 font-body text-mute">{w.blurb}</p>
            {skippedAhead && <p className="px mt-3 inline-block bg-amber-deep px-3 py-2 font-body text-sm text-amber">Jumped ahead for test prep? No problem. Earlier worlds still come first on the path, and skills this world needs from them show up in your warm-ups.</p>}
          </div>

          <div className="overflow-x-auto pb-2">
            <div className="relative" style={{ width: mapW, height: 300 }}>
              {concepts.map((c, i) => {
                const p = save.concepts[c.id];
                const rung = p?.rung ?? 0;
                const isCur = c.id === cur;
                const done = !!p?.mastered;
                const x = i * (NODE + GAP);
                return (
                  <div key={c.id}>
                    {i > 0 && <div className="absolute" style={{ left: x - GAP, top: 168 + NODE / 2 - 4, width: GAP, height: 8, background: done || isCur ? '#3DE8FF' : '#1E3456' }} />}
                    {isCur && <div className="blink absolute" style={{ left: x - 8, top: 160, width: NODE + 16, height: NODE + 16, border: '4px dashed #3DE8FF' }} />}
                    <div className={`px8 absolute flex flex-col items-center justify-center text-center ${done ? 'btn-cyan' : isCur ? 'bg-ink text-abyss' : 'bg-panel2 text-[#5F7598]'}`} style={{ left: x, top: 168, width: NODE, height: NODE }} title={c.name}>
                      <div className="text-xl font-bold">{c.short}</div>
                      <div className="mt-1 flex gap-1">{[1, 2, 3, 4].map((r) => { const on = done || rung >= r; return <div key={r} style={{ width: 9, height: 9, background: done ? '#050A14' : isCur ? (on ? '#1C7FD6' : '#C9D6EA') : on ? '#3DE8FF' : '#1E3456' }} />; })}</div>
                      <div className="mt-1 font-tag text-[8px]">{done ? 'MASTERED' : isCur ? `RUNG ${rung}` : 'LOCKED'}</div>
                    </div>
                    <div className="absolute text-center text-[13px] leading-tight text-mute" style={{ left: x - 8, top: 168 + NODE + 10, width: NODE + 16 }}>{c.name}</div>
                  </div>
                );
              })}
              <div className="absolute" style={{ left: concepts.length * (NODE + GAP) - GAP, top: 168 + NODE / 2 - 4, width: GAP, height: 8, background: '#1E3456' }} />
              <button onClick={onBoss} className="px8 press btn-amber absolute flex flex-col items-center justify-center font-tag text-[11px] font-bold" style={{ left: concepts.length * (NODE + GAP), top: 160, width: NODE + 16, height: NODE + 16 }}>
                <span>BOSS</span><span>REACTOR</span><span className="mt-1 text-[9px]">{cleared ? 'BEATEN' : 'CHALLENGE'}</span>
              </button>
              <div className={`absolute ${rolling ? '' : 'bob'}`} style={{ left: moX, top: 20, transition: 'left .8s steps(8)' }}>
                <Mo px={6} rolling={rolling} mood={cur ? 'idle' : 'happy'} suit={save.settings.alwaysSuit} />
              </div>
              {!rolling && (
                <div className="px absolute bg-ink px-3 py-2 text-base font-semibold text-abyss" style={{ left: Math.max(0, Math.min(moX + 130, mapW - 270)), top: 30, maxWidth: 260 }}>
                  {cur ? ((save.concepts[cur]?.rung ?? 0) === 0 ? `New topic: ${concepts[curIdx].name}! I’ll show you first.` : `${concepts[curIdx].name}. Let’s climb.`) : cleared ? 'World cleared. Keep reviewing to keep it fresh!' : 'All mastered. Boss time?'}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))' }}>
          <div className="px bg-panel p-4"><div className="font-tag text-[11px] text-mute">ACCURACY, LAST 50</div><div className="text-3xl font-bold">{save.recent.length ? `${Math.round(acc * 100)}%` : '—'}</div><div className="text-sm text-mute">{!save.recent.length ? 'Play a run' : acc > 0.9 ? 'Getting harder soon' : acc < 0.7 ? 'Easing off a bit' : 'Right in the sweet spot'}</div></div>
          <div className="px bg-panel p-4"><div className="font-tag text-[11px] text-mute">BEST COMBO</div><div className="text-3xl font-bold text-amber">{save.bestCombo}</div><div className="text-sm text-mute">5+ puts Mo in the suit</div></div>
          <div className="px bg-panel p-4"><div className="font-tag text-[11px] text-mute">REVIEWS DUE</div><div className="text-3xl font-bold text-cyan">{due}</div><div className="text-sm text-mute">From any world, mixed into runs</div></div>
        </div>
      </div>

      <div className="flex max-w-[340px] flex-[1_1_280px] flex-col gap-3">
        <div className="px8 flex flex-col gap-4 bg-panel p-5">
          <div className="text-2xl font-bold">Next run</div>
          <p className="font-body text-[15px] leading-relaxed text-mute">12 questions, about 5 minutes. {cur ? `Mostly ${concepts[curIdx].name.toLowerCase()}` : 'Mixed review of this world'}{due ? `, plus ${due} review${due > 1 ? 's' : ''}` : ''}. Play as many as you want.</p>
          <button onClick={onPlay} className="px8 press btn-cyan h-20 text-4xl font-bold tracking-widest">PLAY</button>
          <div className="text-center font-tag text-[11px] text-mute">OR PRESS SPACE</div>
        </div>
        <button onClick={onBoss} className="px press btn-amber h-14 font-tag text-sm">{cleared ? 'REMATCH THE REACTOR' : 'CHALLENGE BOSS TO SKIP'}</button>
        <p className="px-1 font-body text-sm text-mute">Boss: {BOSS_COUNT} mixed questions from this world, {Math.floor(BOSS_SECONDS / 60)}:{String(BOSS_SECONDS % 60).padStart(2, '0')} on the clock, 3 charge. Get {BOSS_PASS}+ right to clear World {w.n}.</p>
      </div>
    </div>
  );
}

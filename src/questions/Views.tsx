import { useEffect } from 'react';
import type { Answer, FloatQ, PeekQ, PhaseQ, Question, State, SwipeQ } from '../engine/types';
import { stateAt } from '../engine/engine';
import { conceptInfo } from '../engine/registry';
import { ParticleBox } from '../ui/ParticleBox';
import { LewisBox } from '../ui/LewisBox';
import { sfx } from '../game/sfx';

export interface ViewProps<Q extends Question> {
  q: Q;
  value: Answer | null;
  onChange: (a: Answer | null) => void;
  reveal: boolean;
}

export function isComplete(q: Question, a: Answer | null): boolean {
  if (!a) return false;
  if (q.kind === 'swipe' && a.kind === 'swipe') return a.sides.length === q.cards.length;
  if (q.kind === 'phase' && a.kind === 'phase') return q.mode === 'set' ? a.temp !== undefined : a.choice !== undefined;
  return true;
}

const typing = (e: KeyboardEvent) => e.target instanceof HTMLInputElement && e.target.type !== 'range';
function useKeys(active: boolean, handler: (e: KeyboardEvent) => void, deps: unknown[]) {
  useEffect(() => {
    if (!active) return;
    const h = (e: KeyboardEvent) => { if (!typing(e) && !e.repeat) handler(e); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, ...deps]);
}

function tileStyle(state: 'idle' | 'chosen' | 'right' | 'wrong') {
  if (state === 'chosen') return 'bg-cyan-deep text-cyan shadow-[inset_0_0_0_4px_#3DE8FF]';
  if (state === 'right') return 'bg-cyan text-abyss shadow-[inset_0_-6px_0_#1C7FD6]';
  if (state === 'wrong') return 'bg-amber-deep text-amber shadow-[inset_0_0_0_4px_#FFB020]';
  return 'bg-panel2 text-ink shadow-[inset_0_-6px_0_#0A1426] hover:shadow-[inset_0_0_0_4px_#1E3456,inset_0_-6px_0_#0A1426]';
}

/* ---------- Particle Peek / multiple choice ---------- */
export function PeekView({ q, value, onChange, reveal }: ViewProps<PeekQ>) {
  const chosen = value?.kind === 'peek' ? value.choice : -1;
  const choose = (i: number) => { if (reveal) return; sfx.select(); onChange({ kind: 'peek', choice: i }); };
  useKeys(!reveal, (e) => { const n = Number(e.key); if (n >= 1 && n <= q.options.length) choose(n - 1); }, [q.id]);
  const hasDiagrams = q.options.some((o) => o.diagram);
  return (
    <div className="flex flex-col gap-5">
      {q.show && <div className="flex justify-center"><ParticleBox d={q.show} w={360} h={200} /></div>}
      {q.lewis && (!q.revealOnly || reveal) && <div className={`flex justify-center ${reveal && q.revealOnly ? 'pop' : ''}`}><LewisBox l={q.lewis} /></div>}
      <div className={`grid gap-3 ${hasDiagrams ? 'grid-cols-3' : q.options.length > 3 ? 'grid-cols-2' : 'grid-cols-3'}`}>
        {q.options.map((o, i) => {
          const st = reveal ? (i === q.answer ? 'right' : i === chosen ? 'wrong' : 'idle') : i === chosen ? 'chosen' : 'idle';
          return (
            <button key={i} onClick={() => choose(i)} className={`px8 press flex flex-col items-center gap-3 p-3 text-left ${tileStyle(st)}`} aria-pressed={i === chosen}>
              {o.diagram && <ParticleBox d={o.diagram} w={200} h={150} />}
              <div className="flex w-full items-center gap-3">
                <span className="font-tag text-xs opacity-70">{i + 1}</span>
                <span className="text-xl font-semibold leading-tight">{o.label ?? ['Box A', 'Box B', 'Box C', 'Box D'][i]}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Swipe Sort ---------- */
export function SwipeView({ q, value, onChange, reveal }: ViewProps<SwipeQ>) {
  const sides = value?.kind === 'swipe' ? value.sides : [];
  const i = sides.length;
  const done = i >= q.cards.length;
  const put = (s: 'L' | 'R') => { if (reveal || done) return; sfx.swipe(s === 'L'); onChange({ kind: 'swipe', sides: [...sides, s] }); };
  const undo = () => { if (reveal || !sides.length) return; sfx.tap(); onChange(sides.length > 1 ? { kind: 'swipe', sides: sides.slice(0, -1) } : null); };
  useKeys(!reveal, (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === '1') put('L');
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === '2') put('R');
    if (e.key === 'z' || e.key === 'Backspace') undo();
  }, [sides.length, done, q.id]);

  if (reveal || done) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {(['L', 'R'] as const).map((side) => (
          <div key={side} className="px8 flex flex-col gap-2 bg-panel p-4">
            <div className="font-tag text-sm text-mute">{side === 'L' ? '◄ ' + q.left : q.right + ' ►'}</div>
            {q.cards.map((c, j) => {
              if (sides[j] !== side) return null;
              const ok = c.side === side;
              const st = reveal ? (ok ? 'right' : 'wrong') : 'chosen';
              return <div key={j} className={`px px-3 py-2 ${c.text.length > 40 ? 'text-base' : 'text-lg'} ${tileStyle(st)}`}>{c.text}{reveal && !ok && <span className="ml-2 font-tag text-[11px]">→ {c.side === 'L' ? q.left : q.right}</span>}</div>;
            })}
          </div>
        ))}
        {!reveal && <button onClick={undo} className="col-span-2 font-tag text-xs text-mute underline">UNDO LAST (Z)</button>}
      </div>
    );
  }
  const card = q.cards[i];
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="font-tag text-xs text-mute">CARD {i + 1} / {q.cards.length}</div>
      <div className="flex w-full items-center justify-between gap-4">
        <button onClick={() => put('L')} className={`px8 press flex h-40 w-56 flex-col items-center justify-center gap-2 ${tileStyle('idle')}`}>
          <span className="text-4xl">◄</span><span className="px-3 text-center text-xl font-bold">{q.left}</span>
        </button>
        <div key={i} className={`px8 pop flex min-h-44 flex-1 items-center justify-center bg-ink p-6 text-center font-bold text-abyss ${card.text.length < 32 ? 'text-3xl' : card.text.length < 80 ? 'text-xl leading-snug' : 'text-lg leading-snug'}`} style={{ boxShadow: 'inset 0 -8px 0 #8FA3C4' }}>
          {card.text}
        </div>
        <button onClick={() => put('R')} className={`px8 press flex h-40 w-56 flex-col items-center justify-center gap-2 ${tileStyle('idle')}`}>
          <span className="text-4xl">►</span><span className="px-3 text-center text-xl font-bold">{q.right}</span>
        </button>
      </div>
      <div className="flex gap-2">
        {q.cards.map((_, j) => <div key={j} style={{ width: 22, height: 10, background: j < i ? '#3DE8FF' : j === i ? '#EAF2FF' : '#1E3456' }} />)}
      </div>
      {i > 0 && <button onClick={undo} className="font-tag text-xs text-mute underline">UNDO (Z)</button>}
    </div>
  );
}

/* ---------- Float or Sink ---------- */
export function FloatView({ q, value, onChange, reveal }: ViewProps<FloatQ>) {
  const chosen = value?.kind === 'float' ? value.choice : null;
  const choose = (c: 'float' | 'sink') => { if (reveal) return; sfx.select(); onChange({ kind: 'float', choice: c }); };
  useKeys(!reveal, (e) => {
    if (e.key === 'ArrowUp' || e.key === 'f' || e.key === '1') choose('float');
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === '2') choose('sink');
  }, [q.id]);
  const d = q.object.mass / q.object.volume;
  const pos = reveal ? (q.answer === 'float' ? 'top' : 'bottom') : chosen === 'float' ? 'hover-top' : chosen === 'sink' ? 'hover-bottom' : 'above';
  const top = pos === 'top' ? 52 : pos === 'bottom' ? 212 : pos === 'hover-top' ? 30 : pos === 'hover-bottom' ? 70 : 6;
  const maxD = Math.max(d, q.liquid.density) * 1.15;
  return (
    <div className="flex items-stretch gap-6">
      <div className="relative" style={{ width: 300, height: 280 }} aria-label={`Tank of ${q.liquid.name}`} role="img">
        <div className="absolute bottom-0 left-0 right-0" style={{ height: 210, background: q.liquid.color, opacity: 0.55 }} />
        <div className="absolute bottom-0 left-0 right-0" style={{ height: 210, boxShadow: 'inset 0 0 0 6px #EAF2FF' }} />
        <div className="absolute left-0 right-0" style={{ top: 70, height: 6, background: '#B8F6FF', opacity: 0.6 }} />
        <div className="absolute left-3 font-tag text-xs text-ink" style={{ bottom: 12 }}>{q.liquid.name.toUpperCase()}{(q.showDensity || reveal) && ` · ${q.liquid.density.toFixed(2)} g/cm³`}</div>
        <div className="px absolute flex items-center justify-center text-center text-sm font-bold text-abyss" style={{ left: 105, top, width: 90, height: 56, background: q.object.color, transition: 'top .5s steps(5)', boxShadow: 'inset -6px -6px 0 rgba(0,0,0,.3), inset 4px 4px 0 rgba(255,255,255,.4)' }}>
          {q.object.name.split(' (')[0]}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-4">
        <div className="px8 grid grid-cols-3 gap-3 bg-panel p-4">
          <div><div className="font-tag text-[11px] text-mute">MASS</div><div className="text-3xl font-bold">{q.object.mass} g</div></div>
          <div><div className="font-tag text-[11px] text-mute">VOLUME</div><div className="text-3xl font-bold">{q.object.volume} cm³</div></div>
          <div><div className="font-tag text-[11px] text-mute">DENSITY</div><div className="text-3xl font-bold text-cyan">{q.showDensity || reveal ? `${d.toFixed(2)}` : '?'}</div></div>
        </div>
        {reveal && (
          <div className="px8 flex flex-col gap-2 bg-panel p-4">
            {[{ n: q.object.name, v: d, c: q.object.color }, { n: q.liquid.name, v: q.liquid.density, c: q.liquid.color }].map((r) => (
              <div key={r.n} className="flex items-center gap-3">
                <div className="w-32 truncate text-base">{r.n}</div>
                <div style={{ width: `${(r.v / maxD) * 100}%`, height: 18, background: r.c, minWidth: 6 }} />
                <div className="font-tag text-xs">{r.v.toFixed(2)}</div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-auto grid grid-cols-2 gap-3">
          {(['float', 'sink'] as const).map((c, i) => {
            const st = reveal ? (c === q.answer ? 'right' : c === chosen ? 'wrong' : 'idle') : c === chosen ? 'chosen' : 'idle';
            return (
              <button key={c} onClick={() => choose(c)} className={`px8 press h-20 text-3xl font-bold ${tileStyle(st)}`}>
                {c === 'float' ? '▲ FLOAT' : '▼ SINK'} <span className="font-tag text-xs opacity-60">{i === 0 ? '↑' : '↓'}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------- Phase Shift ---------- */
const STATES: State[] = ['solid', 'liquid', 'gas'];
const STATE_COL: Record<State, string> = { solid: '#8FB4FF', liquid: '#3DE8FF', gas: '#FFB020' };

function Thermo({ q, temp, reveal }: { q: PhaseQ; temp: number; reveal: boolean }) {
  const span = q.max - q.min;
  const at = (t: number) => `${((t - q.min) / span) * 100}%`;
  return (
    <div className="relative h-14 w-full">
      <div className="absolute inset-x-0 top-4 h-6 bg-panel2" />
      {reveal && (
        <>
          <div className="absolute top-4 h-6" style={{ left: 0, width: at(q.substance.mp), background: STATE_COL.solid, opacity: 0.6 }} />
          <div className="absolute top-4 h-6" style={{ left: at(q.substance.mp), width: `calc(${at(q.substance.bp)} - ${at(q.substance.mp)})`, background: STATE_COL.liquid, opacity: 0.6 }} />
          <div className="absolute top-4 h-6" style={{ left: at(q.substance.bp), right: 0, background: STATE_COL.gas, opacity: 0.6 }} />
          <div className="absolute top-11 font-tag text-[10px] text-mute" style={{ left: at(q.substance.mp) }}>{q.substance.mp}°</div>
          <div className="absolute top-11 font-tag text-[10px] text-mute" style={{ left: at(q.substance.bp) }}>{q.substance.bp}°</div>
        </>
      )}
      <div className="absolute top-1 h-12 w-2 bg-ink" style={{ left: `calc(${at(temp)} - 4px)`, transition: 'left .15s steps(2)' }} />
    </div>
  );
}

export function PhaseView({ q, value, onChange, reveal }: ViewProps<PhaseQ>) {
  const a = value?.kind === 'phase' ? value : null;
  const mid = Math.round((q.min + q.max) / 2 / q.step) * q.step;
  const temp = q.mode === 'read' ? q.temp! : a?.temp ?? mid;
  const setTemp = (t: number) => { if (reveal) return; const v = Math.max(q.min, Math.min(q.max, Math.round(t / q.step) * q.step)); sfx.tap(); onChange({ kind: 'phase', temp: v }); };
  const choose = (s: State) => { if (reveal) return; sfx.select(); onChange({ kind: 'phase', choice: s }); };
  useKeys(!reveal, (e) => {
    if (q.mode === 'set') {
      if (e.key === 'ArrowLeft') setTemp(temp - q.step * (e.shiftKey ? 5 : 1));
      if (e.key === 'ArrowRight') setTemp(temp + q.step * (e.shiftKey ? 5 : 1));
    } else {
      const n = Number(e.key);
      if (n >= 1 && n <= 3) choose(STATES[n - 1]);
    }
  }, [q.id, temp]);
  // Held arrow keys should keep sliding.
  useEffect(() => {
    if (reveal || q.mode !== 'set') return;
    const h = (e: KeyboardEvent) => { if (e.repeat && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) setTemp(temp + (e.key === 'ArrowLeft' ? -1 : 1) * q.step * (e.shiftKey ? 5 : 1)); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });
  const shownState = stateAt(q.substance, temp);
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-6">
        <div className="px8 flex w-60 flex-col items-center bg-panel p-4">
          <div className="font-tag text-[11px] text-mute">{q.substance.name.toUpperCase()} AT</div>
          <div className="text-6xl font-bold" style={{ color: reveal ? STATE_COL[shownState] : '#EAF2FF' }}>{temp}°C</div>
        </div>
        {reveal ? (
          <ParticleBox d={{ kind: 'state', state: shownState, groups: Array.from({ length: shownState === 'solid' ? 16 : shownState === 'liquid' ? 13 : 7 }, () => [STATE_COL[shownState]]) }} w={240} h={150} label={`${q.substance.name} as a ${shownState}`} />
        ) : (
          <div className="px8 flex h-[150px] w-[240px] items-center justify-center bg-panel text-center font-tag text-xs text-mute">LOCK IN TO SEE<br />THE PARTICLES</div>
        )}
      </div>
      <Thermo q={q} temp={temp} reveal={reveal} />
      {q.mode === 'set' ? (
        <div className="flex flex-col gap-2">
          <label className="font-tag text-xs text-mute" htmlFor={`t-${q.id}`}>DRAG OR USE ← → (SHIFT = BIG STEPS)</label>
          <input id={`t-${q.id}`} type="range" min={q.min} max={q.max} step={q.step} value={temp} disabled={reveal}
            onChange={(e) => setTemp(Number(e.target.value))} className="w-full accent-[#3DE8FF]" />
          {reveal && <div className="text-lg">You set {temp} °C, which makes {q.substance.name} a <b style={{ color: STATE_COL[shownState] }}>{shownState}</b>.</div>}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {STATES.map((s, i) => {
            const st = reveal ? (s === q.answer ? 'right' : s === a?.choice ? 'wrong' : 'idle') : s === a?.choice ? 'chosen' : 'idle';
            return <button key={s} onClick={() => choose(s)} className={`px8 press h-20 text-3xl font-bold ${tileStyle(st)}`}><span className="mr-2 font-tag text-xs opacity-60">{i + 1}</span>{s[0].toUpperCase() + s.slice(1)}</button>;
          })}
        </div>
      )}
    </div>
  );
}

/* ---------- Watch (animated explainer) ---------- */
const solidD = (c: string) => ({ kind: 'state' as const, state: 'solid' as const, groups: Array.from({ length: 16 }, () => [c]) });
const liquidD = (c: string) => ({ kind: 'state' as const, state: 'liquid' as const, groups: Array.from({ length: 13 }, () => [c]) });
const gasD = (c: string) => ({ kind: 'state' as const, state: 'gas' as const, groups: Array.from({ length: 7 }, () => [c]) });

export function WatchView({ q }: { q: Question }) {
  const info = conceptInfo(q.concept);
  let visual: React.ReactNode = null;
  if (q.concept === 'states' || q.concept === 'phase') {
    visual = (
      <div className="flex items-center justify-center gap-4">
        {[solidD('#8FB4FF'), liquidD('#3DE8FF'), gasD('#FFB020')].map((d, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="flex flex-col items-center gap-2"><ParticleBox d={d} w={200} h={150} /><div className="font-tag text-sm">{['SOLID', 'LIQUID', 'GAS'][i]}</div></div>
            {q.concept === 'phase' && i < 2 && (
              <div className="flex flex-col items-center font-tag text-[11px] leading-5">
                <span className="text-amber">{i === 0 ? 'MELTING →' : 'BOILING →'}</span>
                <span className="text-cyan">{i === 0 ? '← FREEZING' : '← CONDENSING'}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }
  if (q.concept === 'classify') {
    visual = (
      <div className="flex justify-center gap-4">
        {[
          { l: 'ELEMENT', d: { kind: 'matter' as const, state: 'gas' as const, groups: Array.from({ length: 6 }, () => ['#3DE8FF', '#3DE8FF']) } },
          { l: 'COMPOUND', d: { kind: 'matter' as const, state: 'gas' as const, groups: Array.from({ length: 5 }, () => ['#FFB020', '#3DE8FF', '#FFB020']) } },
          { l: 'MIXTURE', d: { kind: 'matter' as const, state: 'gas' as const, groups: [['#B48CFF'], ['#3DE8FF', '#3DE8FF'], ['#B48CFF'], ['#3DE8FF', '#3DE8FF'], ['#FFB020', '#3DE8FF', '#FFB020'], ['#B48CFF']] } },
        ].map((x) => <div key={x.l} className="flex flex-col items-center gap-2"><ParticleBox d={x.d} w={220} h={160} /><div className="font-tag text-sm">{x.l}</div></div>)}
      </div>
    );
  }
  if (q.concept === 'change') {
    visual = (
      <div className="grid grid-cols-2 gap-4">
        <div className="px8 bg-panel p-4"><div className="font-tag text-sm text-cyan">PHYSICAL · SAME STUFF</div><div className="mt-2 text-xl leading-8">Ice → water<br />Cutting paper<br />Sugar dissolving</div></div>
        <div className="px8 bg-amber-deep p-4"><div className="font-tag text-sm text-amber">CHEMICAL · NEW STUFF</div><div className="mt-2 text-xl leading-8">Wood → ash + smoke<br />Iron → rust<br />Batter → cake</div></div>
      </div>
    );
  }
  if (q.concept === 'density') {
    visual = (
      <div className="flex items-center justify-center gap-10">
        <div className="text-5xl font-bold">ρ = <span className="text-cyan">m</span> ÷ <span className="text-amber">V</span></div>
        <div className="relative" style={{ width: 220, height: 170 }}>
          <div className="absolute bottom-0 left-0 right-0" style={{ height: 130, background: '#1C7FD6', opacity: 0.55, boxShadow: 'inset 0 0 0 5px #EAF2FF' }} />
          <div className="px absolute flex items-center justify-center text-xs font-bold text-abyss" style={{ left: 20, top: 26, width: 70, height: 44, background: '#C98B4A' }}>WOOD 0.6</div>
          <div className="px absolute flex items-center justify-center text-xs font-bold text-abyss" style={{ left: 120, top: 120, width: 70, height: 44, background: '#8FA3C4' }}>ROCK 2.7</div>
        </div>
      </div>
    );
  }
  if (!visual) {
    return (
      <div className="grid gap-4 md:grid-cols-[3fr_2fr]">
        <div className="px8 flex flex-col gap-3 bg-panel p-5">
          <div className="font-tag text-xs text-cyan">KEY IDEAS</div>
          {info.watchText.map((t, i) => (
            <div key={i} className="flex gap-3 font-body text-lg leading-relaxed text-[#C9D6EA]"><span className="font-tag text-sm text-cyan">{i + 1}</span><span>{t}</span></div>
          ))}
        </div>
        {info.traps && info.traps.length > 0 && (
          <div className="px8 flex flex-col gap-3 bg-amber-deep p-5">
            <div className="font-tag text-xs text-amber">DON’T FALL FOR IT</div>
            {info.traps.map((t, i) => <p key={i} className="font-body text-base leading-relaxed text-amber-light">{t}</p>)}
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-6">
      {visual}
      <div className="flex flex-col gap-2">
        {info.watchText.map((t, i) => <p key={i} className="font-body text-lg leading-relaxed text-[#C9D6EA]">{t}</p>)}
      </div>
    </div>
  );
}

export function QuestionView(props: ViewProps<Question>) {
  const { q } = props;
  switch (q.kind) {
    case 'peek': return <PeekView {...(props as ViewProps<PeekQ>)} />;
    case 'swipe': return <SwipeView {...(props as ViewProps<SwipeQ>)} />;
    case 'float': return <FloatView {...(props as ViewProps<FloatQ>)} />;
    case 'phase': return <PhaseView {...(props as ViewProps<PhaseQ>)} />;
    default: return <WatchView q={q} />;
  }
}

export const KIND_NAME: Record<Question['kind'], string> = { peek: 'Particle Peek', swipe: 'Swipe Sort', float: 'Float or Sink', phase: 'Phase Shift', watch: 'Watch' };

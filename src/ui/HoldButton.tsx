import { useCallback, useEffect, useRef, useState } from 'react';
import { SURE_MS } from '../engine/engine';
import { sfx } from '../game/sfx';

/** Press and hold to lock in. Holding past SURE_MS means "I'm sure". Space works too. */
export function HoldButton({ enabled, onSubmit, label = 'HOLD SPACE TO LOCK IN' }: { enabled: boolean; onSubmit: (sure: boolean) => void; label?: string }) {
  const [p, setP] = useState(0);
  const t0 = useRef<number | null>(null);
  const raf = useRef(0);
  const hum = useRef<((x: number) => void) | null>(null);
  const crossed = useRef(false);

  const tick = useCallback(() => {
    if (t0.current === null) return;
    const x = Math.min(1, (performance.now() - t0.current) / SURE_MS);
    setP(x);
    hum.current?.(x);
    if (x >= 1 && !crossed.current) { crossed.current = true; sfx.sure(); }
    raf.current = requestAnimationFrame(tick);
  }, []);

  const start = useCallback(() => {
    if (!enabled || t0.current !== null) return;
    t0.current = performance.now();
    crossed.current = false;
    hum.current = sfx.hum();
    raf.current = requestAnimationFrame(tick);
  }, [enabled, tick]);

  const end = useCallback(() => {
    if (t0.current === null) return;
    const held = performance.now() - t0.current;
    t0.current = null;
    cancelAnimationFrame(raf.current);
    hum.current?.(-1);
    hum.current = null;
    setP(0);
    onSubmit(held >= SURE_MS);
  }, [onSubmit]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => { if (e.code === 'Space' && !e.repeat) { e.preventDefault(); start(); } };
    const up = (e: KeyboardEvent) => { if (e.code === 'Space') { e.preventDefault(); end(); } };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [start, end]);
  useEffect(() => () => { cancelAnimationFrame(raf.current); hum.current?.(-1); }, []);

  const sure = p >= 1;
  return (
    <button
      disabled={!enabled}
      onPointerDown={(e) => { e.preventDefault(); start(); }}
      onPointerUp={end}
      onPointerLeave={end}
      className={`px8 relative h-[72px] w-full overflow-hidden text-xl font-bold tracking-wide ${enabled ? 'bg-panel2 text-ink' : 'bg-panel text-[#4A5F80]'}`}
      aria-label="Hold to lock in your answer. Hold longer if you are sure."
    >
      <span className="absolute inset-y-0 left-0" style={{ width: `${p * 100}%`, background: sure ? '#FFD27A' : '#3DE8FF', boxShadow: `inset 0 -8px 0 ${sure ? '#C47A00' : '#1C7FD6'}` }} />
      <span className={`relative ${p > 0.5 ? 'text-abyss' : ''}`}>{sure ? 'SURE! LET GO' : p > 0 ? 'KEEP HOLDING IF SURE…' : enabled ? label : 'ANSWER FIRST'}</span>
    </button>
  );
}

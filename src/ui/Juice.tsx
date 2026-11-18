import { useMemo } from 'react';

/** Pixel confetti burst from the center of its parent. */
export function Confetti({ n = 26, seed = 1 }: { n?: number; seed?: number }) {
  const bits = useMemo(() => {
    const colors = ['#3DE8FF', '#FFB020', '#B8F6FF', '#FFD27A', '#EAF2FF', '#B48CFF'];
    return Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2 + seed;
      const r = 120 + ((i * 53 + seed * 31) % 140);
      return { dx: Math.cos(a) * r, dy: Math.sin(a) * r - 40, c: colors[i % colors.length], s: 8 + (i % 3) * 4 };
    });
  }, [n, seed]);
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2" aria-hidden>
      {bits.map((b, i) => (
        <div key={i} className="confetti" style={{ background: b.c, width: b.s, height: b.s, ['--dx' as string]: `${b.dx}px`, ['--dy' as string]: `${b.dy}px` }} />
      ))}
    </div>
  );
}

export function Flash({ color, k }: { color: string; k: number }) {
  return <div key={k} className="flash pointer-events-none fixed inset-0 z-40" style={{ background: color }} aria-hidden />;
}

export function Pips({ n, max, color, off }: { n: number; max: number; color: string; off: string }) {
  return (
    <div className="flex gap-1" aria-label={`${n} of ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <div key={i} style={{ width: 16, height: 16, background: i < n ? color : off }} />
      ))}
    </div>
  );
}

export function Key({ children }: { children: React.ReactNode }) {
  return <span className="px inline-block bg-panel2 px-2 py-1 font-tag text-[11px] text-ink" style={{ boxShadow: 'inset 0 -4px 0 #050A14' }}>{children}</span>;
}

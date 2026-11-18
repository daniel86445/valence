import { useMemo } from 'react';
import type { Diagram } from '../engine/types';
import { mulberry32 } from '../engine/content';

/** A box of moving pixel particles. Solids vibrate in rows, liquids slide, gases zoom. */
export function ParticleBox({ d, w = 200, h = 150, label }: { d: Diagram; w?: number; h?: number; label?: string }) {
  const P = 12;
  const items = useMemo(() => {
    const seed = d.groups.length * 97 + d.groups.flat().join('').length + (d.state === 'solid' ? 1 : d.state === 'liquid' ? 2 : 3);
    const rng = mulberry32(seed);
    const out: { x: number; y: number; atoms: string[]; delay: number }[] = [];
    if (d.kind === 'state' && d.state === 'solid') {
      const cols = 4;
      d.groups.forEach((g, i) => {
        const cx = w / 2 - (cols * (P + 4)) / 2 + (i % cols) * (P + 4);
        const cy = h - 16 - P - Math.floor(i / cols) * (P + 4);
        out.push({ x: cx, y: cy, atoms: g, delay: rng() });
      });
    } else if (d.kind === 'state' && d.state === 'liquid') {
      const cols = 7;
      d.groups.forEach((g, i) => {
        const cx = 14 + (i % cols) * (P + 13) + (Math.floor(i / cols) % 2) * 8 + rng() * 4;
        const cy = h - 18 - P - Math.floor(i / cols) * (P + 4) - rng() * 3;
        out.push({ x: cx, y: cy, atoms: g, delay: rng() });
      });
    } else {
      // spread out: jittered grid so groups never overlap
      const cols = d.kind === 'matter' ? 3 : 3;
      const rows = Math.ceil(d.groups.length / cols);
      const cw = (w - 20) / cols;
      const rh = (h - 20) / Math.max(rows, 2);
      d.groups.forEach((g, i) => {
        const gw = g.length * P;
        const cx = 10 + (i % cols) * cw + rng() * Math.max(0, cw - gw - 4);
        const cy = 10 + Math.floor(i / cols) * rh + rng() * Math.max(0, rh - P - 4);
        out.push({ x: cx, y: cy, atoms: g, delay: rng() });
      });
    }
    return out;
  }, [d, w, h]);

  const motion = d.kind === 'matter' ? 'p-liquid' : `p-${d.state}`;
  return (
    <div
      className="relative overflow-hidden bg-[#0A1424]"
      style={{ width: w, height: h, boxShadow: 'inset 0 0 0 4px #1E3456' }}
      role="img"
      aria-label={label ?? `Particle diagram`}
    >
      {items.map((it, i) => (
        <div
          key={i}
          className={`absolute flex ${motion}`}
          style={{ left: it.x, top: it.y, animationDelay: `-${it.delay * 2}s` }}
        >
          {it.atoms.map((c, j) => (
            <div key={j} style={{ width: P, height: P, background: c, boxShadow: `inset -3px -3px 0 rgba(0,0,0,.35), inset 3px 3px 0 rgba(255,255,255,.35)` }} />
          ))}
        </div>
      ))}
    </div>
  );
}

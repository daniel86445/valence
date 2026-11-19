import type { Lewis } from '../engine/types';
import { sup } from '../engine/chem';

const COLOR: Record<string, string> = { H: '#EAF2FF', C: '#8C95A6', N: '#6F9BFF', O: '#FF6B6B', F: '#5BE38A', Cl: '#5BE38A', Br: '#C47A3A', S: '#FFD27A', P: '#FFB020', B: '#FFB59E', Be: '#B8F6FF', Xe: '#B48CFF', Kr: '#B48CFF', Se: '#FFD27A' };

/** A flat 2D Lewis sketch: central atom, bonds as bars, central lone pairs as dot pairs. Outer lone pairs are not drawn. */
export function LewisBox({ l, w = 280, h = 220 }: { l: Lewis; w?: number; h?: number }) {
  const D = l.bonds.length + l.lp;
  const cx = w / 2;
  const cy = h / 2;
  const R = Math.min(w, h) / 2 - 30;
  const start = D === 2 ? 180 : D === 3 ? 90 : D === 4 ? 180 : 90;
  const ang = (i: number) => ((start + (i * 360) / D) * Math.PI) / 180;
  const A = 34; // atom size
  const atom = (el: string, x: number, y: number, key: string, big = false) => (
    <div key={key} className="px absolute flex items-center justify-center font-bold text-abyss" style={{ left: x - (big ? A / 2 + 4 : A / 2), top: y - (big ? A / 2 + 4 : A / 2), width: big ? A + 8 : A, height: big ? A + 8 : A, background: COLOR[el] ?? '#C9D6EA', fontSize: el.length > 1 ? 15 : 18 }}>
      {el}
    </div>
  );
  return (
    <div className="relative bg-[#0A1424]" style={{ width: w, height: h, boxShadow: 'inset 0 0 0 4px #1E3456' }} role="img"
      aria-label={`Lewis sketch: ${l.central} bonded to ${l.bonds.map(([e, o]) => `${e} by a ${['single', 'double', 'triple'][o - 1]} bond`).join(', ')}, with ${l.lp} lone pair${l.lp === 1 ? '' : 's'} on ${l.central}`}>
      {l.bonds.map(([, order], i) => {
        const a = ang(i);
        const len = R - A / 2 - 6 - 4;
        return Array.from({ length: order }, (_, k) => {
          const off = (k - (order - 1) / 2) * 7;
          return (
            <div key={`b${i}-${k}`} className="absolute" style={{ left: cx, top: cy, width: len, height: 3, background: '#EAF2FF', transformOrigin: '0 50%', transform: `rotate(${-(a * 180) / Math.PI}deg) translate(${A / 2 + 6}px, ${off - 1.5}px)` }} />
          );
        });
      })}
      {Array.from({ length: l.lp }, (_, j) => {
        const a = ang(l.bonds.length + j);
        const x = cx + Math.cos(a) * 34;
        const y = cy - Math.sin(a) * 34;
        const px = -Math.sin(a) * 5;
        const py = -Math.cos(a) * 5;
        return (
          <div key={`lp${j}`}>
            <div className="absolute bg-amber" style={{ left: x + px - 3, top: y + py - 3, width: 6, height: 6 }} />
            <div className="absolute bg-amber" style={{ left: x - px - 3, top: y - py - 3, width: 6, height: 6 }} />
          </div>
        );
      })}
      {l.bonds.map(([el], i) => atom(el, cx + Math.cos(ang(i)) * R, cy - Math.sin(ang(i)) * R, `a${i}`))}
      {atom(l.central, cx, cy, 'c', true)}
      {l.charge ? <div className="absolute right-3 top-2 font-tag text-sm text-ink">[ ]{sup((Math.abs(l.charge) > 1 ? String(Math.abs(l.charge)) : '') + (l.charge > 0 ? '+' : '-'))}</div> : null}
      <div className="absolute bottom-1 left-2 font-tag text-[9px] text-mute">AMBER DOTS = LONE PAIRS ON CENTER</div>
    </div>
  );
}

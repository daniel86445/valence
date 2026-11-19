import { useState } from 'react';
import type { SaveData } from '../engine/types';
import { Mo } from '../ui/Mo';
import { ALL_CONCEPTS, worldInfo } from '../engine/registry';

const SYM = 'H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr'.split(' ');
const CAT = 'n g a e m n n n h g a e p m n n h g a e t t t t t t t t t t p m m n h g'.split(' ');
const COL: Record<string, [string, string]> = {
  n: ['#3DE8FF', '#050A14'], g: ['#B48CFF', '#160B33'], a: ['#FFB020', '#1A1206'], e: ['#FFD27A', '#1A1206'],
  m: ['#8FA3C4', '#050A14'], h: ['#5BE38A', '#05200F'], p: ['#6F85A8', '#050A14'], t: ['#3561E0', '#FFFFFF'],
};
const CARD_INFO = (sym: string) => ALL_CONCEPTS.find((c) => c.card === sym);

export function ElementTile({ sym, owned, big = false, onClick }: { sym: string; owned: boolean; big?: boolean; onClick?: () => void }) {
  const i = SYM.indexOf(sym);
  const [bg, fg] = COL[CAT[i] ?? 'n'];
  const size = big ? 'h-28 w-24' : 'h-16 w-full';
  return (
    <button onClick={onClick} disabled={!owned} className={`px press flex ${size} flex-col items-center justify-center`} style={{ background: owned ? bg : '#0B1526', color: owned ? fg : '#2E4468', boxShadow: owned ? 'inset 0 -6px 0 rgba(0,0,0,.3), inset 0 4px 0 rgba(255,255,255,.35)' : 'none' }} aria-label={owned ? CARD_INFO(sym)?.cardName ?? sym : 'Locked card'}>
      <span className="font-tag text-[10px]">{i + 1}</span>
      <span className={`${big ? 'text-5xl' : 'text-2xl'} font-bold leading-none`}>{owned ? sym : '?'}</span>
    </button>
  );
}

export function Cards({ save }: { save: SaveData }) {
  const [sel, setSel] = useState<string | null>(save.cards[0] ?? null);
  const f = sel ? CARD_INFO(sel) : null;
  return (
    <div className="flex flex-wrap items-start gap-6">
      <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-4">
        <div className="flex items-baseline justify-between"><h1 className="text-4xl font-bold">Your elements</h1><div className="font-tag text-sm text-cyan">{save.cards.length}/118</div></div>
        <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(9, minmax(0, 1fr))' }}>
          {SYM.map((s) => <ElementTile key={s} sym={s} owned={save.cards.includes(s)} onClick={() => setSel(s)} />)}
        </div>
        <p className="font-body text-mute">Master a concept to win its element card. Every world has its own set.</p>
      </div>
      <div className="flex max-w-[380px] flex-[1_1_300px] flex-col gap-4">
        {f && sel ? (
          <div className="px8 flex flex-col gap-3 bg-panel p-5">
            <ElementTile sym={sel} owned big />
            <div className="text-3xl font-bold">{f.cardName}</div>
            <div className="font-body text-lg leading-relaxed text-[#C9D6EA]">{f.cardFact}</div>
            <div className="font-tag text-[11px] text-mute">WON FROM: {f.name.toUpperCase()} · WORLD {worldInfo(f.world).n}</div>
          </div>
        ) : (
          <div className="px8 bg-panel p-5 font-body text-mute">No cards yet. Master your first concept to win Hydrogen.</div>
        )}
        <div className="px8 flex flex-col gap-3 bg-panel p-5">
          <div className="font-tag text-xs text-mute">MO’S WARDROBE</div>
          <div className="flex items-end gap-6">
            <div className="flex flex-col items-center gap-2"><Mo px={4} /><span className="font-tag text-[10px]">CLASSIC</span></div>
            <div className="flex flex-col items-center gap-2" style={{ opacity: save.outfits.includes('suit') ? 1 : 0.3 }}><Mo px={4} suit /><span className="font-tag text-[10px]">{save.outfits.includes('suit') ? 'SUIT & SHADES' : 'BEAT THE BOSS'}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

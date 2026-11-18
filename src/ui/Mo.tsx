import { useEffect, useRef, useState } from 'react';
import sprites from '../mo_sprites.json';

export type Mood = 'idle' | 'happy' | 'sad' | 'focus' | 'wow';

const PAL: Record<string, string> = {
  k: '#2A1608', o: '#F2A65A', O: '#C97A3A', c: '#FFE8C7', p: '#FF8FA3', e: '#0A0A12', w: '#FFFFFF',
  n: '#3A3F52', N: '#262A38', s: '#F0F4FA', t: '#3DE8FF', g: '#050A14', h: '#3DE8FF', l: '#FFD696',
};

function sub(rows: string[], edits: Record<number, string>): string[] {
  const out = rows.slice();
  for (const [i, half] of Object.entries(edits)) out[+i] = half + half.split('').reverse().join('');
  return out;
}
const SIT = sprites.sit as string[];
const SPRITES: Record<Mood, string[]> = {
  idle: SIT,
  happy: sprites.happy as string[],
  wow: sub(SIT, { 9: 'koooooookk', 10: 'kOooooockp' }),
  focus: sub(SIT, { 6: 'kooooooooo', 7: 'kokkkooooo' }),
  sad: sub(SIT, { 6: 'kookoooooo', 7: 'kooeeooooo', 8: 'kotpoooocp', 9: 'koooooockk', 10: 'kOoooockcc' }),
};
const SUIT_FACE: Record<Mood, Record<number, string>> = {
  idle: {}, happy: { 9: 'kooooocckc' }, wow: { 9: 'koooooookk', 10: 'kOooooockp' }, focus: {}, sad: { 9: 'koooooockk' },
};
const SUIT = sprites.suit as string[];
const BALL = sprites.ball as string[][];

function draw(canvas: HTMLCanvasElement, rows: string[], px: number) {
  const w = rows[0].length;
  const h = rows.length;
  canvas.width = w * px;
  canvas.height = h * px;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  rows.forEach((r, y) => {
    for (let x = 0; x < r.length; x++) {
      const col = PAL[r[x]];
      if (!col) continue;
      ctx.fillStyle = col;
      ctx.fillRect(x * px, y * px, px, px);
    }
  });
}

export function Sprite({ rows, px, label, className = '' }: { rows: string[]; px: number; label?: string; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { if (ref.current) draw(ref.current, rows, px); }, [rows, px]);
  return (
    <canvas
      ref={ref}
      className={className}
      style={{ imageRendering: 'pixelated', display: 'block' }}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}

/** Mo the hamster. `rolling` curls him into a ball and spins him. */
export function Mo({ mood = 'idle', suit = false, rolling = false, px = 6, className = '' }: { mood?: Mood; suit?: boolean; rolling?: boolean; px?: number; className?: string }) {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    if (!rolling) return;
    const id = setInterval(() => setFrame((f) => (f + 1) % 4), 90);
    return () => clearInterval(id);
  }, [rolling]);
  if (rolling) {
    return (
      <div className={className} style={{ width: 20 * px, height: 20 * px, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
        <Sprite rows={BALL[frame]} px={px} label="Mo, curled into a ball and rolling" />
      </div>
    );
  }
  const rows = suit ? sub(SUIT, SUIT_FACE[mood]) : SPRITES[mood];
  const label = `Mo the hamster${suit ? ' in a suit and sunglasses' : ''}, ${mood === 'idle' ? 'ready' : mood === 'sad' ? 'a little sad' : mood === 'focus' ? 'concentrating' : mood === 'wow' ? 'amazed' : 'happy'}`;
  return <Sprite rows={rows} px={px} label={label} className={className} />;
}

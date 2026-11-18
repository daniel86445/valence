import { useState } from 'react';
import type { SaveData, Settings as S } from '../engine/types';
import { syncAvailable, type SyncUser } from '../game/sync';
import { Mo } from '../ui/Mo';

export function Settings({ save, onSettings, onReset, user, syncState, onSignIn, onSignOut, onSyncNow }: {
  save: SaveData; onSettings: (s: Partial<S>) => void; onReset: () => void;
  user: SyncUser | null; syncState: string; onSignIn: () => void; onSignOut: () => void; onSyncNow: () => void;
}) {
  const [confirm, setConfirm] = useState(false);
  const st = save.settings;
  const Toggle = ({ k, label, desc, disabled }: { k: keyof S; label: string; desc: string; disabled?: boolean }) => (
    <label className={`px flex items-center justify-between gap-4 bg-panel p-4 ${disabled ? 'opacity-40' : 'cursor-pointer'}`}>
      <span><span className="block text-xl font-bold">{label}</span><span className="font-body text-sm text-mute">{desc}</span></span>
      <input type="checkbox" className="h-6 w-6 accent-[#3DE8FF]" checked={!!st[k]} disabled={disabled} onChange={(e) => onSettings({ [k]: e.target.checked })} />
    </label>
  );
  return (
    <div className="mx-auto flex max-w-[760px] flex-col gap-4">
      <h1 className="text-4xl font-bold">Settings</h1>

      <section className="px8 flex flex-col gap-3 bg-[#0A1424] p-5" aria-labelledby="sync-h">
        <h2 id="sync-h" className="text-2xl font-bold">Sync between computers</h2>
        {!syncAvailable ? (
          <p className="font-body text-mute">Google sign-in isn’t set up for this copy of Valence yet, so progress is saved in this browser only. (Add the Firebase config to <code>src/firebaseConfig.ts</code>.)</p>
        ) : user ? (
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 font-body"><div className="text-ink">Signed in as {user.name}</div><div className="text-sm text-mute">{user.email} · {syncState}</div></div>
            <button onClick={onSyncNow} className="px press btn-cyan h-12 px-4 font-tag text-sm">SYNC NOW</button>
            <button onClick={onSignOut} className="px press btn-dark h-12 px-4 font-tag text-sm">SIGN OUT</button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <p className="flex-1 font-body text-mute">Sign in with Google and your progress follows you to any computer. Your guest progress gets merged in.</p>
            <button onClick={onSignIn} className="px8 press btn-cyan h-14 px-6 text-xl font-bold">SIGN IN WITH GOOGLE</button>
          </div>
        )}
        {syncState.startsWith('Error') && <p className="font-body text-sm text-amber">{syncState}</p>}
      </section>

      <Toggle k="sound" label="Sound" desc="8-bit chimes, thuds and combo arpeggios." />
      <label className="px flex items-center justify-between gap-4 bg-panel p-4">
        <span className="text-xl font-bold">Volume</span>
        <input type="range" min={0} max={1} step={0.05} value={st.volume} onChange={(e) => onSettings({ volume: Number(e.target.value) })} className="w-64 accent-[#3DE8FF]" aria-label="Volume" />
      </label>
      <Toggle k="reduceMotion" label="Reduce motion" desc="Turns off screen shake, flashes and confetti." />
      <div className="flex items-center gap-4">
        <div className="flex-1"><Toggle k="alwaysSuit" label="Mo always wears the suit" desc={save.outfits.includes('suit') ? 'Unlocked! Normally he only suits up at combo 5+ and in boss fights.' : 'Beat the World 1 boss to unlock.'} disabled={!save.outfits.includes('suit')} /></div>
        <Mo px={4} suit={st.alwaysSuit} />
      </div>

      <section className="px flex items-center justify-between gap-4 bg-panel p-4">
        <span><span className="block text-xl font-bold">Reset progress</span><span className="font-body text-sm text-mute">Wipes this browser’s save. Synced progress comes back when you sign in again.</span></span>
        {confirm ? (
          <span className="flex gap-2">
            <button onClick={() => setConfirm(false)} className="px press btn-dark h-11 px-4 font-tag text-xs">CANCEL</button>
            <button onClick={() => { setConfirm(false); onReset(); }} className="px press btn-amber h-11 px-4 font-tag text-xs">YES, RESET</button>
          </span>
        ) : (
          <button onClick={() => setConfirm(true)} className="px press btn-dark h-11 px-4 font-tag text-xs text-amber">RESET…</button>
        )}
      </section>
    </div>
  );
}

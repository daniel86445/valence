import { useCallback, useEffect, useRef, useState } from 'react';
import type { SaveData, Settings as S } from './engine/types';
import { levelOf, merge, newSave, totalXp, xpForLevel, type RunState } from './engine/engine';
import { loadLocal, normalize, saveLocal, deviceId } from './game/save';
import { pull, push, signIn, signOutUser, syncAvailable, watchUser, type SyncUser } from './game/sync';
import { setSound, sfx } from './game/sfx';
import { Home } from './screens/Home';
import { Run } from './screens/Run';
import { Results } from './screens/Results';
import { Cards } from './screens/Cards';
import { Settings } from './screens/Settings';

type Screen = { name: 'home' } | { name: 'run'; boss: boolean; key: number } | { name: 'results'; run: RunState; boss: boolean } | { name: 'cards' } | { name: 'settings' };

export default function App() {
  const [save, setSave] = useState<SaveData>(loadLocal);
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const [user, setUser] = useState<SyncUser | null>(null);
  const [syncState, setSyncState] = useState('Not synced yet');
  const saveRef = useRef(save);
  saveRef.current = save;
  const userRef = useRef(user);
  userRef.current = user;
  const pushTimer = useRef<number | undefined>(undefined);

  useEffect(() => { setSound(save.settings.sound, save.settings.volume); }, [save.settings.sound, save.settings.volume]);

  const syncNow = useCallback(async () => {
    const u = userRef.current;
    if (!u) return;
    try {
      setSyncState('Syncing…');
      const remote = await pull(u.uid);
      const merged = remote ? merge(saveRef.current, normalize(remote, deviceId())) : saveRef.current;
      setSave(merged);
      saveLocal(merged);
      await push(u.uid, merged);
      setSyncState(`Synced at ${new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`);
    } catch (e) {
      setSyncState(`Error syncing: ${(e as Error).message}`);
    }
  }, []);

  const update = useCallback((s: SaveData) => {
    setSave(s);
    saveLocal(s);
    if (userRef.current) {
      window.clearTimeout(pushTimer.current);
      pushTimer.current = window.setTimeout(() => void syncNow(), 4000);
    }
  }, [syncNow]);

  useEffect(() => {
    if (!syncAvailable) return;
    let off = () => {};
    void watchUser((u) => { setUser(u); userRef.current = u; if (u) void syncNow(); else setSyncState('Not signed in'); }).then((f) => { off = f; });
    return () => off();
  }, [syncNow]);

  const onSettings = (p: Partial<S>) => update({ ...saveRef.current, settings: { ...saveRef.current.settings, ...p }, updatedAt: Date.now() });

  const play = useCallback((boss = false) => { sfx.tap(); setScreen({ name: 'run', boss, key: Date.now() }); }, []);
  const goHome = useCallback(() => setScreen({ name: 'home' }), []);

  const xp = totalXp(save);
  const lv = levelOf(xp);
  const into = (xp - xpForLevel(lv)) / (xpForLevel(lv + 1) - xpForLevel(lv));
  const inRun = screen.name === 'run';

  return (
    <div className={`dots min-h-full ${save.settings.reduceMotion ? 'reduce-motion' : ''}`}>
      {inRun ? (
        <Run
          key={screen.key}
          save={save}
          boss={screen.boss}
          onSave={update}
          onQuit={goHome}
          onDone={(run) => setScreen({ name: 'results', run, boss: screen.boss })}
          reduceMotion={save.settings.reduceMotion}
          alwaysSuit={save.settings.alwaysSuit}
        />
      ) : (
        <div className="mx-auto flex max-w-[1360px] flex-col gap-6 px-8 py-6">
          <header className="flex flex-wrap items-center gap-x-8 gap-y-3">
            <button onClick={goHome} className="text-3xl font-bold tracking-[0.08em] text-cyan" style={{ textShadow: '3px 3px 0 #0A3A66' }}>VALENCE</button>
            <nav className="flex flex-1 flex-wrap gap-6 font-tag text-sm" aria-label="Main">
              {(['home', 'cards', 'settings'] as const).map((n) => (
                <button key={n} onClick={() => { sfx.tap(); setScreen({ name: n } as Screen); }} className={screen.name === n ? 'text-cyan' : 'text-mute hover:text-cyan'}>
                  {n === 'home' ? 'MAP' : n.toUpperCase()}
                </button>
              ))}
            </nav>
            <div className="flex items-center gap-2 font-tag text-xs">
              {syncAvailable && <span className={`px px-3 py-2 ${user ? 'bg-cyan-deep text-cyan' : 'bg-panel2 text-mute'}`}>{user ? 'SYNCED' : 'GUEST'}</span>}
              <span className="px bg-amber-deep px-3 py-2 text-amber">LV {lv}</span>
              <span className="px flex items-center gap-2 bg-panel2 px-3 py-2 text-ink">{xp} XP
                <span className="inline-block h-2 w-16 bg-line"><span className="block h-2 bg-cyan" style={{ width: `${Math.round(into * 100)}%` }} /></span>
              </span>
              <span className="px bg-panel2 px-3 py-2 text-cyan">{save.cards.length}/118</span>
            </div>
          </header>
          <main>
            {screen.name === 'home' && <Home save={save} onPlay={() => play(false)} onBoss={() => play(true)} />}
            {screen.name === 'cards' && <Cards save={save} />}
            {screen.name === 'settings' && (
              <Settings
                save={save}
                onSettings={onSettings}
                onReset={() => update(newSave(deviceId()))}
                user={user}
                syncState={syncState}
                onSignIn={() => signIn().catch((e) => setSyncState(`Error signing in: ${(e as Error).message}`))}
                onSignOut={() => void signOutUser()}
                onSyncNow={() => void syncNow()}
              />
            )}
            {screen.name === 'results' && <Results run={screen.run} onAgain={() => play(screen.boss && !screen.run.passed ? true : false)} onMap={goHome} />}
          </main>
        </div>
      )}
    </div>
  );
}

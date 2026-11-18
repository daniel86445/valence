import { newSave, newConcept } from '../engine/engine';
import { CONCEPTS } from '../engine/content';
import type { SaveData } from '../engine/types';

const KEY = 'valence-save-v1';
const DEV = 'valence-device-id';

export function deviceId(): string {
  let id = '';
  try { id = localStorage.getItem(DEV) ?? ''; } catch { /* storage blocked */ }
  if (!id) {
    id = 'pc-' + Math.random().toString(36).slice(2, 10);
    try { localStorage.setItem(DEV, id); } catch { /* ignore */ }
  }
  return id;
}

/** Fill in anything a newer version of the game added. */
export function normalize(s: SaveData, dev: string): SaveData {
  const fresh = newSave(dev);
  const out: SaveData = { ...fresh, ...s, settings: { ...fresh.settings, ...s.settings }, deviceId: dev };
  for (const c of CONCEPTS) if (!out.concepts[c.id]) out.concepts[c.id] = newConcept();
  return out;
}

export function loadLocal(): SaveData {
  const dev = deviceId();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return normalize(JSON.parse(raw), dev);
  } catch { /* corrupted or blocked */ }
  return newSave(dev);
}

export function saveLocal(s: SaveData) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* ignore */ }
}

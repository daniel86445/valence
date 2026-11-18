import { firebaseConfig } from '../firebaseConfig';
import type { SaveData } from '../engine/types';

export const syncAvailable = firebaseConfig !== null;

type Fb = {
  auth: import('firebase/auth').Auth;
  db: import('firebase/firestore').Firestore;
  A: typeof import('firebase/auth');
  F: typeof import('firebase/firestore');
};
let fb: Promise<Fb> | null = null;

function init(): Promise<Fb> {
  if (!firebaseConfig) return Promise.reject(new Error('Firebase is not set up yet'));
  if (!fb) {
    fb = (async () => {
      const [{ initializeApp }, A, F] = await Promise.all([import('firebase/app'), import('firebase/auth'), import('firebase/firestore')]);
      const app = initializeApp(firebaseConfig!);
      return { auth: A.getAuth(app), db: F.getFirestore(app), A, F };
    })();
  }
  return fb;
}

export interface SyncUser { uid: string; name: string; email: string }

export async function watchUser(cb: (u: SyncUser | null) => void): Promise<() => void> {
  if (!syncAvailable) { cb(null); return () => {}; }
  const { auth, A } = await init();
  return A.onAuthStateChanged(auth, (u) => cb(u ? { uid: u.uid, name: u.displayName ?? 'Player', email: u.email ?? '' } : null));
}

export async function signIn() {
  const { auth, A } = await init();
  await A.signInWithPopup(auth, new A.GoogleAuthProvider());
}

export async function signOutUser() {
  const { auth, A } = await init();
  await A.signOut(auth);
}

export async function pull(uid: string): Promise<SaveData | null> {
  const { db, F } = await init();
  const snap = await F.getDoc(F.doc(db, 'saves', uid));
  if (!snap.exists()) return null;
  const data = snap.data() as { save?: string };
  return data.save ? (JSON.parse(data.save) as SaveData) : null;
}

export async function push(uid: string, s: SaveData) {
  const { db, F } = await init();
  await F.setDoc(F.doc(db, 'saves', uid), { save: JSON.stringify(s), updatedAt: s.updatedAt });
}

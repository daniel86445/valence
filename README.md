# Valence

A pixel-art chemistry game that teaches from the basics up. Your companion is **Mo**, a hamster who curls into a ball and rolls, and suits up with sunglasses when you're on a streak.

**Play:** https://daniel86445.github.io/valence/

## How it teaches

- **5-rung ladder per concept:** Watch → Spot → Build → Apply → Master. Climb a rung with 2 right in a row, at least one locked in as "sure".
- **Runs of 12 questions** in a fixed shape: warm-up, new, review, echo, mixed, and an easy finale.
- **Difficulty aims for ~82% right.** Each concept has a skill score θ, each question a difficulty b, and P(correct) = 1 / (1 + e^-(θ-b)).
- **Hold to lock in.** Holding past 0.7 s means "sure": ×1.5 XP if right, a bigger replay if wrong.
- **Misses come back** as an echo 3 questions later, and reviews spread out at 1, 3, 7, 16 and 35 days.

## Worlds (Chem 1111, Burdge & Overby *Atoms First*)

| World | Chapter | Status |
|---|---|---|
| 1 Matter | Ch 1 | Playable |
| 2–5 Measurement, Atoms, Electrons, Periodic Trends | Ch 1–4 | Waiting for study guide 3 |
| 6 Ions & Bonds | Ch 5 | Playable |
| 7 Drawing Molecules | Ch 6 | Playable |
| 8 Shapes & Forces | Ch 7 | Playable |
| 9 Reactions & Moles | Ch 8 | Playable |
| 10–14 Water, Energy, Gases, Liquids & Solids, Solutions | Ch 9–13 | Next (study guide 2) |
| 15 Extremes | Bonus | Later |

Worlds 6–9 come from study guide 1: each section is a concept with a Watch card (key ideas + traps), a Fact-or-Myth swipe built from the guide's misconceptions, the guide's own practice questions, and code-generated questions from data tables (`src/engine/worlds/`). Chemistry data is checked by tests: every equation balances, valence counts and Lewis electron bookkeeping add up, ionic formulas are neutral.

## Develop

```bash
npm install
npm run dev        # local dev server
npx vitest run     # engine + content tests
npm run build
```

Code map: `src/engine` (learning engine + question generators, no UI), `src/questions` (question views), `src/screens`, `src/ui` (Mo, particles, juice), `src/game` (sound, save, sync).

## Google sign-in sync (Firebase)

1. Create a project at https://console.firebase.google.com (Analytics off is fine).
2. **Build → Authentication → Get started → Google → Enable.**
3. **Authentication → Settings → Authorized domains → Add** `daniel86445.github.io`.
4. **Build → Firestore Database → Create database** (production mode), then paste these **Rules** and Publish:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /saves/{uid} {
         allow read, write: if request.auth != null && request.auth.uid == uid;
       }
     }
   }
   ```
5. **Project settings → Your apps → Web (</>)**, register the app, and copy the `firebaseConfig` values into `src/firebaseConfig.ts`.

Until then the game saves in the browser only.

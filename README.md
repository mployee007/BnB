# BnB

Standalone Next.js + Tailwind Kanban board for an Airbnb management / consultant business.

## What it does

- Tracks leads, proposals, onboarding, active clients, follow-up, and closed wins.
- Stores board state in `data/board.json`.
- Supports drag-and-drop card movement between pipeline stages.
- Every board mutation writes the JSON file, creates a git commit, and attempts to push to `origin main`.
- Runs as a standard Next.js app.

## Stack

- Next.js 16
- React 19
- Tailwind CSS 4
- dnd-kit drag-and-drop
- File-based JSON persistence
- Server-side git sync via route handlers

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Git auto-sync behavior

Board mutations call server-side helpers in `src/lib/git-sync.ts`:

1. `git add data/board.json`
2. `git commit -m "..."`
3. `git push origin main`

If no remote is configured yet, the app commits locally and reports that push was skipped.
If git credentials fail, the board change is still saved locally and committed, but the push result is surfaced in the UI.

## API routes

- `GET /api/board`
- `POST /api/board`
- `POST /api/board/reorder`
- `PATCH /api/cards/[cardId]`
- `DELETE /api/cards/[cardId]`

## Deployment recommendation

**Best choice: Vercel.**

Why:
- Native fit for Next.js App Router and route handlers
- Easiest deployment from GitHub
- Good default performance and preview workflows
- No custom server setup required for this app

### Recommended deployment flow

1. Log into Vercel
2. Import `mployee007/BnB`
3. Deploy the `main` branch
4. Keep the app on a host that has git credentials only if you want in-app auto-commit/push to keep working

### Important note about auto-push from production

This app currently performs git commits and pushes from the running server process. That works on a persistent machine with git + credentials available. On Vercel's serverless platform, that pattern is not a great long-term fit.

For production, the stronger architecture is:
- keep board data in a database (Supabase / Postgres)
- stop committing runtime changes back to git from the deployed app
- use git only for source code changes

If you want, the next upgrade should be moving board data from `data/board.json` to Supabase.

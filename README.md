# BnB

Standalone Next.js + Tailwind Kanban board for an Airbnb management / consultant business.

## What it does

- Tracks leads, proposals, onboarding, active clients, follow-up, and closed wins.
- Stores board state in `data/board.json`.
- Every board mutation writes the JSON file, creates a git commit, and attempts to push to `origin main`.
- Runs as a standard Next.js app.

## Stack

- Next.js 16
- React 19
- Tailwind CSS 4
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
- `PATCH /api/cards/[cardId]`
- `DELETE /api/cards/[cardId]`

## Notes

This auto-push behavior depends on the machine hosting the app having git access to the repo. On local/VM hosting with stored credentials, new cards will commit and push automatically.

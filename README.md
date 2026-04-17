# draw-game

A browser-based multiplayer game with session-scoped chat, built on React + Vite with Supabase as the realtime backend.

## Stack

- React 18 + TypeScript + Vite
- Supabase (auth + realtime database)
- Zustand for state (`authStore`, `sessionStore`, `messageStore`)
- React Router for page navigation
- Lucide React for icons

## What's inside

| Page | Purpose |
|---|---|
| `Auth` | Email/password sign-in and sign-up via Supabase auth |
| `Sessions` | List and join active game sessions |
| `Chat` | Session-scoped real-time chat messages |

## Setup

```bash
npm install
cp .env.example .env
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```

App runs on `http://localhost:5173`.

## Supabase schema

The app expects these Supabase tables:
- `sessions` — game sessions with owner and status
- `messages` — chat messages scoped to a session
- Supabase Auth for users

## Build

```bash
npm run build
npm run preview
```

## License

MIT

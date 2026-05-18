# King of the Cord

A CS2 stats tracker and leaderboard for a friend group. Upload match replays (`.dem` files) to track player performance, browse match history, and compete on a live leaderboard ranked by HLTV rating.

## Features

- **Leaderboard** — Players ranked by average HLTV rating with rank change indicators
- **Match history** — Browse all matches with scores, map, date, and team breakdowns
- **Match detail** — Per-player stats (K/D/A, rating, rating change) for each match
- **Player profiles** — Individual stat history, map breakdowns, duel stats, and rating timeline
- **Team builder** — Balance teams based on player ratings
- **Replay upload** — POST `.dem` files to parse and store match data

## Tech Stack

- [SvelteKit](https://kit.svelte.dev/) + TypeScript
- [MongoDB](https://www.mongodb.com/) for match and player data
- [demoparser2](https://github.com/LaihoE/demoparser) for CS2 replay parsing
- [Tailwind CSS](https://tailwindcss.com/) + [bits-ui](https://bits-ui.com/) for UI
- [Docker Compose](https://docs.docker.com/compose/) for deployment

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB instance (or use the included Docker Compose setup)

### Install dependencies

```bash
npm install
```

### Configure environment

Copy `.env.example` to `.env` and set your values:

```bash
cp .env.example .env
```

| Variable | Description | Default |
|---|---|---|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017` |
| `MONGODB_DB` | Database name | `kingofthecord` |
| `PUBLIC_LOG_LEVEL` | Log level (`debug`, `info`, `warn`, `error`) | `debug` |
| `BODY_SIZE_LIMIT` | Max upload size | `Infinity` |
| `ORIGIN` | App origin URL | `http://localhost:5173` |
| `PUBLIC_ORIGIN` | Public-facing origin URL | `http://localhost:5173` |

### Run the dev server

```bash
npm run dev
```

## Uploading Replays

Send `.dem` files to the upload API as `multipart/form-data`:

```bash
curl -X POST http://localhost:5173/api/upload \
  -F "replays=@match.dem"
```

The API parses the replay, inserts it into MongoDB, and returns a result per file with status `processed`, `skipped` (already exists), or `failed`.

## Deployment

A Docker Compose setup is included that runs MongoDB and the app together:

```bash
docker compose up -d
```

The app runs on port `7777`. To customise, set `PORT` and `ORIGIN` in your environment before starting.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build |
| `npm run check` | Type-check with svelte-check |
| `npm run lint` | Lint and check formatting |
| `npm run format` | Auto-format with Prettier |
| `npm run db:push` | Push Drizzle schema to database |
| `npm run db:studio` | Open Drizzle Studio |

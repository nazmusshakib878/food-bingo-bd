# Food Bingo BD

A responsive Bangladesh food-map experience: choose the signature foods you have tried from all 64 districts, colour the map, and create a shareable poster.

## Highlights

- Interactive 64-district Bangladesh map
- District and food search with saved selections
- Bangla / English interface
- Poster creation, image upload, download, sharing, and challenge links
- Optional Upstash-backed anonymous visitor counter
- Vercel Analytics events without personal data

## Quick start

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Run the Vite frontend locally |
| `npm run build` | Create a production build |
| `npm run preview` | Preview the production build |
| `npm test` | Run serverless API tests |
| `npm run lint` | Run Oxc linting |

## Local Vercel APIs

The real visitor counter runs as a Vercel serverless function. To test the frontend and APIs together:

```bash
vercel env pull .env.local
vercel dev
```

Set these environment variables in Vercel (and locally through `.env.local`):

```text
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
```

Without these credentials, the UI safely shows that the live visitor count is unavailable; it never displays a fake count.

## Project structure

```text
api/                 Vercel serverless endpoints
public/              Static assets, district food images, SEO image
scripts/             Data and map maintenance utilities
  legacy/            One-off migration helpers kept for reference
src/
  components/        Map, district list, and poster UI
  data/              District records, map paths, image-source data
  hooks/             Visitor and legacy usage-counter hooks
  App.jsx            Application composition
  index.css          Global styles and responsive polish
test/                API tests
```

## Content maintenance

- `scripts/build-map.mjs` and `scripts/verify-map.mjs` maintain and validate map data.
- `scripts/download-wiki-images.js` and `scripts/download-images.js` are image-research utilities. They are not part of normal app startup.
- `FOOD_DATA_AUDIT.md` records content-audit notes.

## Deployment

The project is configured for Vercel. Pushes to `main` can trigger deployment when the GitHub repository is connected to a Vercel project.
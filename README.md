# Food Bingo BD

A viral web app to track how many famous Bangladeshi foods you have eaten out of 100! 

## Features
- **100 Famous Foods**: Curated list of traditional and street foods, sweets, and regional dishes.
- **Tap to Reveal**: Hidden items flip to full color upon selection.
- **Live Progress**: Score counter with level badges.
- **Poster Generator**: Make a shareable poster showing your score, complete with custom themes and your photo.
- **Download Support**: Save your poster as PNG, JPG, or PDF.

## Tech Stack
- React + Vite
- Tailwind CSS
- html2canvas & jsPDF for poster generation
- Lucide React for icons

## Setup
1. Clone the repository
2. Run `npm install`
3. Run `npm run dev`
4. Visit `http://localhost:5173`

## Screenshots / Share
Make sure to try out the Poster Generator and share your score!

## Usage counter (Upstash Redis)

The optional “people used this map” badge is backed by the Vercel function at `/api/count`. It stores only the total counter and short-lived, salted hashes for per-IP burst limiting; individual selections remain in the visitor’s browser.

1. Create an [Upstash Redis](https://upstash.com/) database.
2. Add these Vercel environment variables: `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`. Vercel KV-compatible names, `KV_REST_API_URL` and `KV_REST_API_TOKEN`, are also supported. Set `COUNTER_SALT` to a private random value for rate-limit hashing.
3. For local development, pull the same environment variables and run the Vercel development server:

```bash
vercel env pull .env.local
vercel dev
```

Without Redis credentials, `/api/count` safely returns `503 {"error":"not_configured"}` and the badge remains hidden.

Run the counter handler tests with:

```bash
npm test
```
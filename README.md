# Perfect Saturday Planner

A small Vite + React frontend for turning a city, budget, time, and mood into a considered Saturday itinerary.

## Local development

```bash
npm install
cp .env.example .env
npm run dev
```

The app posts the form as JSON to `${VITE_API_URL}/api/plan`. `VITE_API_URL` defaults to the deployed demo backend, so a local `.env` is optional when testing against the hosted API. To use a local backend instead, set `VITE_API_URL=http://localhost:8000`. The response includes a plan, validation details, fallback information, and an execution trace.

## Production build

```bash
npm run build
npm run preview
```

## Deploying

### Vercel

Import the repository in Vercel and set **Root Directory** to `frontend`. Vercel detects Vite automatically. Add `VITE_API_URL=https://planner-backend-sooty.vercel.app` in **Settings → Environment Variables**, then redeploy.

### Netlify

Create a new site from the repository, set **Base directory** to `frontend`, **Build command** to `npm run build`, and **Publish directory** to `dist`. Add `VITE_API_URL` under **Site configuration → Environment variables** with the public backend URL and trigger a new deploy. Vite variables are embedded at build time, so update the variable before rebuilding.

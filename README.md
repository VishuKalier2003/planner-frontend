# Perfect Saturday Planner

A small Vite + React frontend for turning a city, budget, time, and mood into a considered Saturday itinerary.

## Local development

```bash
npm install
cp .env.example .env
npm run dev
```

The app posts the form as JSON to `${VITE_API_URL}/plan`. `VITE_API_URL` defaults to `http://localhost:8000`, so it can be omitted when the backend is running locally. The response may include `plan`, or return the plan fields (`title`, `intro`, `stops`, `total`, and `rationale`) at the top level.

## Production build

```bash
npm run build
npm run preview
```

## Deploying

### Vercel

Import the repository in Vercel and set **Root Directory** to `frontend`. Vercel detects Vite automatically. Add `VITE_API_URL` in **Settings → Environment Variables** with the public URL of your deployed backend (for example `https://api.example.com`), then redeploy.

### Netlify

Create a new site from the repository, set **Base directory** to `frontend`, **Build command** to `npm run build`, and **Publish directory** to `dist`. Add `VITE_API_URL` under **Site configuration → Environment variables** with the public backend URL and trigger a new deploy. Vite variables are embedded at build time, so update the variable before rebuilding.

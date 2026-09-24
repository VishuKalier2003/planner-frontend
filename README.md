# Perfect Saturday Planner — Frontend

Vite + React frontend for the Perfect Saturday Planner agent. The UI sends a
structured brief to the separate FastAPI backend and displays the plan,
costs, rationale, map links, fallback information, and sequential tool trace.

## Repository layout

This repository contains the frontend only:

```text
frontend/
  src/
  index.html
  package.json
  .env.example
```

The backend lives in the sibling [`../backend`](../backend) repository/folder.

## Run both applications locally

You need Node.js 18+ and Python 3.10+ installed.

### 1. Start the backend

Open **Command Prompt window 1**:

```cmd
cd /d D:\Open-source-Projects\Bitscale\backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Keep this terminal running. Verify the backend in a browser:

```text
http://localhost:8000/health
```

Expected response:

```json
{"status":"ok"}
```

FastAPI's interactive API page is available at:

```text
http://localhost:8000/docs
```

### 2. Start the frontend

Open **Command Prompt window 2**:

```cmd
cd /d D:\Open-source-Projects\Bitscale\frontend
npm install
copy .env.example .env
```

For local backend testing, set `.env` to:

```env
VITE_API_URL=http://localhost:8000
```

Then start Vite:

```cmd
npm run dev
```

Open the URL printed by Vite, usually:

```text
http://localhost:5173
```

The frontend calls:

```text
POST http://localhost:8000/api/plan
```

If you do not want to run the backend locally, set `.env` to the deployed
backend instead:

```env
VITE_API_URL=https://planner-backend-sooty.vercel.app
```

Restart `npm run dev` after changing `.env`.

### PowerShell equivalent

If using PowerShell rather than Command Prompt, copy the environment file with:

```powershell
Copy-Item .env.example .env
```

## Test the agent

Use this sample input in the UI:

```text
City: Bangalore
Budget: 2000
Available time: 4 hours
Mood: tired but wants to do something fun
Interests: Local food, Nature
Constraints: vegetarian, Visit a monument
```

The response should show:

- A sequential loading trace while the backend tools run.
- A realistic itinerary with one or more activities and a meal.
- A cost for every stop and a matching estimated total.
- A Google Maps search link for every stop.
- A rationale, tips, validation warnings, and trade-offs where relevant.
- Live OpenStreetMap data when available, with curated suggestions as fallback.

Useful edge cases to try:

| Input | Expected behavior |
|---|---|
| `Evening only` | Starts around 17:00 and schedules the meal afterward |
| `vegetarian, Visit a monument` | Filters food and prioritizes culture/heritage options |
| No interests | Returns a useful plan and asks a clarifying question |
| Budget `100` | Shows a budget warning/trade-off |
| City `Atlantis` | Returns a graceful city fallback notice |
| `All day` with several interests | Adds more activities while respecting time |

### When clarification questions appear

The agent asks one or two follow-up questions when the brief is underspecified:

- No interests are selected.
- The user has only a very short relaxed/slow plan (three hours or less).

The questions appear below the first plan with answer fields. Select **Refine
my plan** to send those answers back through the same planner tools as
additional constraints. Normal, specific briefs skip this interaction.

## Test the API directly

From PowerShell:

```powershell
$body = @{
  city = "Bangalore"
  budget = 2000
  available_time = "4 hours"
  mood = "tired but wants to do something fun"
  interests = @("Local food", "Nature")
  constraints = @("vegetarian", "Visit a monument")
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri "http://localhost:8000/api/plan" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

The response contains:

```text
plan
trace
validation
clarifying_questions
fallback
```

## Production build

```cmd
npm run build
npm run preview
```

## Deploy the frontend

### Vercel

1. Push this frontend repository to GitHub.
2. Import it into Vercel.
3. Use the repository root as the project root.
4. Select the Vite framework preset.
5. Set:

```text
Build command: npm run build
Output directory: dist
```

6. Add this environment variable:

```env
VITE_API_URL=https://planner-backend-sooty.vercel.app
```

7. Deploy or redeploy after saving the variable.

### Netlify

1. Import this repository into Netlify.
2. Set the base directory to the frontend repository root.
3. Set:

```text
Build command: npm run build
Publish directory: dist
```

4. Add `VITE_API_URL` with the public backend URL.
5. Trigger a new deploy after changing the variable.

Vite embeds `VITE_*` variables at build time, so environment-variable changes
require a rebuild.

## Coding-agent note

I used coding agents as focused engineering collaborators: one agent shaped the
FastAPI tool pipeline and another built the React experience, while I integrated
their contracts, tested edge cases, and iterated on deployment behavior. This
kept the work parallel without hiding the reasoning—the planner exposes its
actual stages, live-data lookup status, fallbacks, validation, and trade-offs
in the product itself.

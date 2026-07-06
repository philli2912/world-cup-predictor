# World Cup Knockout Predictor

An interpretable demo model that estimates win probabilities for World Cup
knockout matchups — and shows its reasoning. Built as a small AI/data
portfolio project demonstrating practical forecasting, honest data
provenance, and clean product execution.

**Not** a betting model. **Not** affiliated with or endorsed by FIFA. It does
not claim to accurately predict the World Cup — see
[Limitations](#limitations) below.

## What it does

- **Matchup predictor** — pick any two of 16 major teams and get a win
  probability with a factor-by-factor explanation of why one side is favored.
- **Current knockout context** — real fixtures, results, and quarter-final
  paths from the ongoing tournament, fetched by a data script and displayed
  with source, fetch timestamp, and freshness labels.
- **Methodology & limitations pages** — the full model spelled out, plus an
  honest list of everything it can't tell you.

## The model

Each team gets a strength score from three public signals, min–max normalized
across the dataset:

```
strength = 0.5 × Elo rating + 0.3 × FIFA ranking (inverted) + 0.2 × World Cup history
```

The strength gap maps to a win probability through an Elo-style logistic
curve, scaled so even the largest gap in the dataset stays below ~92% —
knockout football is never a certainty. Weights are fixed and chosen for
interpretability — not fitted to historical outcomes.

⚠️ **All team strength inputs are demo values**: hand-set placeholders in
[`lib/model/teams.ts`](lib/model/teams.ts), plausible but not fetched from a
documented source. The UI labels every derived output as *demo model values*.

## Tournament data

Bracket fixtures/results are **fetched, not assumed**:

```bash
npm run update-data
```

The script ([`scripts/update-knockout-context.ts`](scripts/update-knockout-context.ts)):

1. Fetches current fixtures/results from a **FIFA website data endpoint**
   (undocumented — it may change shape or disappear), falling back to ESPN's
   public scoreboard JSON.
2. Validates the payload shape and normalizes knockout matches — completed
   results (including penalty shootouts), upcoming fixtures, and
   quarter-final paths derived from official bracket placeholders.
3. Writes a static snapshot to [`data/knockoutContext.json`](data/knockoutContext.json)
   with source URL, `fetchedAt` timestamp, and per-match status labels
   (`confirmed result` / `upcoming fixture` / `pending confirmation`).
4. On failure, exits loudly and leaves the previous snapshot untouched — it
   never invents fixtures. Undecided slots stay as "Winner of M93", and
   bracket teams outside the demo dataset get no prediction.

The app itself stays fully static: it reads the committed JSON at build time
and does no fetching in the browser. Refreshing data = run the script, commit,
redeploy.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, static pages)
- TypeScript
- Tailwind CSS v4
- No backend, no database — deployable to Vercel as-is

Model logic (`lib/model/`) is pure TypeScript with no React or I/O, so the
demo dataset can be swapped for real data without touching UI code.

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
npm run update-data  # refresh data/knockoutContext.json from live sources
npm run build        # production build
npm run lint
```

## Project structure

```
app/                  pages: landing, /predict, /methodology, /limitations
components/           layout, predictor, knockout-context, and UI primitives
lib/model/            teams.ts (demo data) · weights.ts · predict.ts (pure functions)
lib/knockout.ts       loads the committed tournament snapshot
data/                 knockoutContext.json — generated, never hand-authored
scripts/              update-knockout-context.ts — the data ingestion script
```

## Limitations

The short version (full page in the app at `/limitations`):

- Team strength inputs are **hand-set placeholders**, not live data.
- The probability curve is **uncalibrated** — a displayed 70% has not been
  validated against historical outcomes.
- No injuries, form, tactics, or any match context.
- The fixtures endpoint is undocumented and may break; the UI surfaces the
  fetch timestamp and a staleness warning.
- 16 teams only; unknown teams get no prediction rather than invented numbers.
- Not betting advice.

## Roadmap ideas

- Real Elo/ranking ingestion from documented sources
- Full bracket visualization with round-by-round advancement probabilities
- AI-generated matchup analysis grounded in the factor breakdown
- Calibration backtest against past tournaments

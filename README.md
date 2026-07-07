# World Cup Knockout Predictor

An interpretable, demo-calibrated model that estimates win probabilities for
the active World Cup knockout teams from source-backed FIFA rank and Elo
inputs — and shows its reasoning. Built as a small AI/data portfolio project
demonstrating practical forecasting, honest data provenance, and clean
product execution.

**Not** a betting model. **Not** affiliated with or endorsed by FIFA. It does
not claim to accurately predict the World Cup — see
[Limitations](#limitations) below.

## What it does

- **Matchup predictor** — pick any two of the 12 teams still active in the
  knockout bracket and get a win probability with a factor-by-factor
  explanation of why one side is favored.
- **Current knockout context** — real fixtures, results, and quarter-final
  paths from the ongoing tournament, fetched by a data script and displayed
  with source, fetch timestamp, and freshness labels.
- **Methodology & limitations pages** — the full model spelled out, plus an
  honest list of everything it can't tell you.

## The model

Each **active** team gets a strength score from three signals, min–max
normalized across the active knockout field:

```
strength = 0.5 × Elo rating + 0.3 × FIFA ranking (inverted) + 0.2 × World Cup history
```

The strength gap maps to a win probability through an Elo-style logistic
curve, scaled so even the largest gap in the dataset stays below ~92% —
knockout football is never a certainty. Weights are fixed and chosen for
interpretability — not fitted to historical outcomes. The curve is
**demo-calibrated**, not professional forecasting.

### Model inputs & provenance

Inputs live in [`data/teamStrength.json`](data/teamStrength.json) and cover
**only the 12 teams still active in the bracket**:

| Input | Status | Source |
|---|---|---|
| FIFA rank | **source-backed** | Official [FIFA Men's World Ranking](https://inside.fifa.com/fifa-world-ranking/men), release of 2026-06-11 |
| Elo rating | **source-backed** | [World Football Elo Ratings](https://www.eloratings.net/) (eloratings.net, independent of FIFA), as of 2026-07-06 |
| World Cup history | **derived demo** | Hand-derived 0–100 pedigree score, no documented source |

Each team entry records its own source URLs, as-of dates, and per-input
status. Values are manually captured static snapshots (the sources render
client-side and have no stable public API), so they age until re-captured.

**Only active teams are modelled forward.** Eliminated teams (Brazil,
Germany, Netherlands, Mexico…) stay in the bracket snapshot and are shown as
completed results, but they carry no model data and never get a prediction.

Source-backed inputs improve transparency — every number can be checked
against its source — but they do **not** demonstrate predictive accuracy.

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
   bracket teams outside the active-team strength dataset get no prediction.

The app itself stays fully static: it reads the committed JSON at build time
and does no fetching in the browser. Refreshing data = run the script, commit,
redeploy.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, static pages)
- TypeScript
- Tailwind CSS v4
- No backend, no database — deployable to Vercel as-is

Model logic (`lib/model/`) is pure TypeScript with no React or I/O; strength
inputs load from `data/teamStrength.json`, so refreshing or extending the
dataset never touches UI code.

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
lib/model/            teams.ts (loads strength data) · weights.ts · predict.ts (pure functions)
lib/knockout.ts       loads the committed tournament snapshot
data/                 knockoutContext.json (generated bracket snapshot) ·
                      teamStrength.json (active-team inputs with provenance)
scripts/              update-knockout-context.ts — the data ingestion script
```

## Reproducibility / timestamping

The project keeps an auditable record of *what was known when* — four
independent timestamps document the state of the world at build time:

1. **Git commit history** — the data snapshot and prediction log are
   committed, so every change to "what the model knew" is dated and diffable.
2. **`data/knockoutContext.json`** — carries its own `fetchedAt` timestamp
   and source URL, written by the update script at fetch time.
3. **[`docs/prediction-log.md`](docs/prediction-log.md)** — a frozen,
   human-readable record generated from the snapshot: completed results,
   upcoming fixtures, and the model's predictions for them. Regenerated by
   `npm run generate-log` (and automatically after `npm run update-data`).
4. **Vercel deployment time** — each deployment is independently timestamped
   by the hosting platform.

Together these establish ordering: predictions in the log demonstrably
predate the fixtures they refer to. Completed matches are displayed as
results, never claimed as predictions.

**What this does *not* prove:** predictive accuracy. The record shows the
model's claims were made honestly and are reproducible — not that they were
right. FIFA/Elo inputs are source-backed snapshots, the history score is a
derived demo value, and the probability curve is demo-calibrated (see below).

## Limitations

The short version (full page in the app at `/limitations`):

- FIFA rank and Elo rating are **source-backed but static snapshots** — they
  age until manually re-captured. The World Cup history score is a
  **derived demo value** with no documented source.
- The probability curve is **demo-calibrated** — a displayed 70% has not been
  validated against historical outcomes. Source-backed inputs improve
  transparency, not accuracy.
- No injuries, form, tactics, or any match context.
- The fixtures endpoint is undocumented and may break; the UI surfaces the
  fetch timestamp and a staleness warning.
- **Active knockout teams only (12)** — eliminated teams stay in completed
  results but get no prediction rather than invented numbers.
- Not betting advice.

## Roadmap ideas

- Automated Elo/ranking ingestion (script-fetched with validation, like the
  bracket data) instead of manually captured snapshots
- Full bracket visualization with round-by-round advancement probabilities
- AI-generated matchup analysis grounded in the factor breakdown
- Calibration backtest against past tournaments

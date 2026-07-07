# Prediction log

A frozen record of what was known — and what the model estimated — at
the time the tournament snapshot was fetched. Regenerated whenever the
snapshot updates; git history preserves earlier versions.

- **Log generated:** 2026-07-07T00:53:23.452Z
- **Snapshot fetchedAt:** 2026-07-06T17:18:44.231Z
- **Source:** FIFA website data endpoint (fixtures/results)
- **Source URL:** https://api.fifa.com/api/v3/calendar/matches?idCompetition=17&idSeason=285023&count=500&language=en
- **Snapshot dataStatus:** fetched
- **Tournament:** FIFA World Cup 2026™

## Notes on interpretation

- Completed matches below are **displayed as results, not predictions** —
  the model takes no credit for matches already decided at snapshot time.
- Predictions **only apply to fixtures that were upcoming at snapshot
  time**. A prediction logged after a result is known would be worthless;
  the `fetchedAt` timestamp and git commit history establish the ordering.
- **Only teams still active in the bracket are modelled forward.**
  Eliminated teams remain in the completed-results table above but carry
  no model data — no prediction is ever produced for them.
- Model inputs (see `data/teamStrength.json`): FIFA rank and Elo rating
  are **source-backed** (official FIFA Men's World Ranking and
  eloratings.net, with per-team source URLs and as-of dates); the World
  Cup history score is a **derived demo value**. The probability curve is
  **demo-calibrated**, not professional forecasting. Source-backed inputs
  improve transparency but do not demonstrate predictive accuracy — this
  log only documents what was claimed, and when.

## Completed matches at snapshot time (20)

| Match | Round | Fixture | Result | Advanced |
|---|---|---|---|---|
| M73 | Round of 32 | South Africa vs Canada | 0–1 | Canada |
| M76 | Round of 32 | Brazil vs Japan | 2–1 | Brazil |
| M74 | Round of 32 | Germany vs Paraguay | 1–1 (3–4 pens) | Paraguay |
| M75 | Round of 32 | Netherlands vs Morocco | 1–1 (2–3 pens) | Morocco |
| M78 | Round of 32 | Côte d'Ivoire vs Norway | 1–2 | Norway |
| M77 | Round of 32 | France vs Sweden | 3–0 | France |
| M79 | Round of 32 | Mexico vs Ecuador | 2–0 | Mexico |
| M80 | Round of 32 | England vs Congo DR | 2–1 | England |
| M82 | Round of 32 | Belgium vs Senegal | 3–2 | Belgium |
| M81 | Round of 32 | USA vs Bosnia and Herzegovina | 2–0 | USA |
| M84 | Round of 32 | Spain vs Austria | 3–0 | Spain |
| M83 | Round of 32 | Portugal vs Croatia | 2–1 | Portugal |
| M85 | Round of 32 | Switzerland vs Algeria | 2–0 | Switzerland |
| M88 | Round of 32 | Australia vs Egypt | 1–1 (2–4 pens) | Egypt |
| M86 | Round of 32 | Argentina vs Cabo Verde | 3–2 | Argentina |
| M87 | Round of 32 | Colombia vs Ghana | 1–0 | Colombia |
| M90 | Round of 16 | Canada vs Morocco | 0–3 | Morocco |
| M89 | Round of 16 | Paraguay vs France | 0–1 | France |
| M91 | Round of 16 | Brazil vs Norway | 1–2 | Norway |
| M92 | Round of 16 | Mexico vs England | 2–3 | England |

## Upcoming fixtures at snapshot time (12)

| Match | Round | Fixture | Kickoff (UTC) | Status |
|---|---|---|---|---|
| M93 | Round of 16 | Portugal vs Spain | 2026-07-06T19:00:00Z | upcoming fixture |
| M94 | Round of 16 | USA vs Belgium | 2026-07-07T00:00:00Z | upcoming fixture |
| M95 | Round of 16 | Argentina vs Egypt | 2026-07-07T16:00:00Z | upcoming fixture |
| M96 | Round of 16 | Switzerland vs Colombia | 2026-07-07T20:00:00Z | upcoming fixture |
| M97 | Quarter-final | France vs Morocco | 2026-07-09T20:00:00Z | upcoming fixture |
| M98 | Quarter-final | Winner of M93 vs Winner of M94 | 2026-07-10T19:00:00Z | upcoming fixture |
| M99 | Quarter-final | Norway vs England | 2026-07-11T21:00:00Z | upcoming fixture |
| M100 | Quarter-final | Winner of M95 vs Winner of M96 | 2026-07-12T01:00:00Z | upcoming fixture |
| M101 | Semi-final | Winner of M97 vs Winner of M98 | 2026-07-14T19:00:00Z | upcoming fixture |
| M102 | Semi-final | Winner of M99 vs Winner of M100 | 2026-07-15T19:00:00Z | upcoming fixture |
| M103 | Play-off for third place | Loser of M101 vs Loser of M102 | 2026-07-18T21:00:00Z | upcoming fixture |
| M104 | Final | Winner of M101 vs Winner of M102 | 2026-07-19T19:00:00Z | upcoming fixture |

## Predictions for upcoming fixtures (6)

Only fixtures where both teams are in the active-team strength dataset
(source-backed FIFA rank & Elo, derived demo history score).
**Demo-calibrated model — not professional forecasting, not betting advice.**

| Match | Fixture | P(win) | Favored |
|---|---|---|---|
| M93 | Portugal vs Spain | 34% / 66% | Spain |
| M94 | United States vs Belgium | 35% / 65% | Belgium |
| M95 | Argentina vs Egypt | 92% / 8% | Argentina |
| M96 | Switzerland vs Colombia | 43% / 57% | Colombia |
| M97 | France vs Morocco | 78% / 22% | France |
| M99 | Norway vs England | 23% / 77% | England |

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project state

This is currently an unmodified `create-next-app` scaffold (Next.js 16.2.10, React 19.2.4) — no application code has been written yet beyond the default starter page (`app/page.tsx`, `app/layout.tsx`). There are no tests, no CI config, and no custom routes or components.

## Commands

```bash
npm run dev     # start dev server (Turbopack) at localhost:3000
npm run build   # production build
npm run start   # run production build
npm run lint    # eslint
```

There is no test runner configured yet.

## Architecture

- App Router (`app/`) with TypeScript, path alias `@/*` → repo root.
- Styling via Tailwind CSS v4, configured through PostCSS (`postcss.config.mjs`) and imported in `app/globals.css` (`@import "tailwindcss"`) — there is no `tailwind.config.*` file; theme tokens are declared inline in `globals.css` via `@theme`.
- ESLint uses the flat config format (`eslint.config.mjs`) extending `eslint-config-next`'s core-web-vitals and typescript rule sets.

## Important: non-standard Next.js version

Per `AGENTS.md`, this project's Next.js version has breaking changes relative to what may be in training data. Before writing code that touches routing, data fetching, config, or other framework APIs, check the bundled docs in `node_modules/next/dist/docs/` (organized by App Router, Pages Router, architecture, and community topics) rather than relying on prior knowledge of Next.js conventions.

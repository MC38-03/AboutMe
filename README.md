# muhammed-cetinkaya-portfolio

My personal portfolio, built with Astro, TypeScript, Tailwind CSS and React islands.

## Getting started

```bash
npm install
npm run dev
```

## Scripts

| Script           | What it does                        |
| ---------------- | ----------------------------------- |
| `npm run dev`    | Dev server on http://localhost:4321 |
| `npm run build`  | Type check (`astro check`) + build  |
| `npm run lint`   | ESLint, fails on any warning        |
| `npm run format` | Prettier                            |

## Content

- Projects: `src/content/projects/{nl,en}/<slug>.mdx`, one file per language. The schema lives in `src/content.config.ts`.
- Timeline: `src/content/timeline/timeline.json`
- Skills and personal details: `src/data/`

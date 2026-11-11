# muhammed-cetinkaya-portfolio

My personal portfolio, built with Astro, TypeScript, Tailwind CSS and React islands.

## Getting started

```bash
npm install
npm run dev
```

## Scripts

| Script               | What it does                              |
| -------------------- | ----------------------------------------- |
| `npm run dev`        | Dev server on http://localhost:4321       |
| `npm run build`      | Type check (`astro check`) + build        |
| `npm run lint`       | ESLint, fails on any warning              |
| `npm run format`     | Prettier                                  |
| `npm run emulators`  | Firestore emulator on port 8080           |
| `npm run test:rules` | Firestore rule tests against the emulator |

## Content

- Projects: `src/content/projects/{nl,en}/<slug>.mdx`, one file per language. The schema lives in `src/content.config.ts`.
- Timeline: `src/content/timeline/timeline.json`
- Skills and personal details: `src/data/`

## Firebase

The site is static. Firebase is only used for hosting, the contact form and the view counter on project pages.

- Copy `.env.example` to `.env` and fill in the web app config. These values are public by design, access is controlled by `firestore.rules`.
- With `PUBLIC_FIREBASE_EMULATOR=true` the site talks to the local emulator, so run `npm run emulators` next to `npm run dev`.
- `messages` is create-only with validation on every field. `views` only allows a counter to go up by one.
- App Check (reCAPTCHA Enterprise) turns on when `PUBLIC_RECAPTCHA_SITE_KEY` is set.

## Deploy

Every push to `main` runs formatting, lint, rule tests and the build, then deploys to Firebase Hosting. Pull requests get a preview channel.

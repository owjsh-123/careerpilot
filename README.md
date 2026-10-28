# CareerPilot — Smart Internship Finder

**Created by Omar Eshatti · © 2026 Omar Eshatti. All rights reserved.**

CareerPilot is an original, local-first full-stack job discovery and internship application management project. It has a responsive web dashboard, rule-based personalized match scoring, a SQLite database, CSV export and a companion CLI. This project is independently implemented and is not a copy of Smart Job CLI.

## Requirements
- Node.js **22.13+** (recommended 22 LTS or later); Node's built-in `node:sqlite` API may display an experimental warning in some Node versions.
- No `npm install` or third-party JavaScript dependencies required.

## Run the web application

```bash
npm start
```

Open **http://127.0.0.1:3000** on your computer. Choose **Load demo jobs** for sample records or **Search live jobs** to query the Remotive public API.

## CLI examples

```bash
npm run cli -- demo
npm run cli -- fetch --keyword="software intern" --limit=30
npm run cli -- list
npm run cli -- list --status=applied
npm run cli -- add --title="QA Intern" --company="Example" --location="Montreal" --url="https://example.com/job"
npm run cli -- update 1 --status=applied --notes="Applied today"
npm run cli -- configure --keywords="TypeScript,Python,SQL" --locations="Montreal,Remote"
npm run cli -- stats
npm run cli -- export --file=jobs.csv
npm test
```

## Architecture
- `public/index.html`, `style.css`, `app.js` — original responsive, dependency-free frontend.
- `src/server.js` — Node HTTP JSON API and static file server.
- `src/db.js` — local SQLite schema and persistence.
- `src/core.js` — matching, tracking and input validation.
- `src/sources.js` — Remotive public jobs API integration (not LinkedIn scraping).
- `src/cli.js` — terminal interface.
- `tests/` — automated tests.

## What match scores mean
The ranking is a **transparent heuristic**, not AI: up to 40 points for skills, 25 for target title, 20 for preferred location, 15 for intern/entry-level wording, minus 35 for excluded seniority. A high score does not guarantee eligibility or an interview. Update preferences under **Preferences**.

## Data and sourcing
Live search uses Remotive's publicly available remote-job endpoint and requires internet access. Its availability, terms and listings may change; internship results may be limited and unrelated roles may appear. Results are stored with source attribution, URLs and IDs. Sample jobs are deliberately fictitious and labeled `(sample)`. You can always add a posting manually. External job links open at the original source; the app never automatically applies.

## Privacy and safety
**This is a single-user local development app with no authentication, authorization, CSRF defense, rate limiting, or production hardening. Do not deploy it publicly or use `HOST=0.0.0.0` on an untrusted network.** All saved job data and notes are in `data/careerpilot.sqlite`, which is git-ignored. Back up this file to preserve your records. GitHub Pages alone cannot host the SQLite backend. Do not add private CVs or secrets to a public repository.

## Testing
Run `npm test`. A full external API integration test is not bundled because it would require internet access. The local backend and CRUD routes can be exercised with curl.

## License
This original code is **not offered under an open-source license** (`UNLICENSED` in package.json). © 2026 Omar Eshatti. All rights reserved. External APIs and Node.js retain their own licenses and terms; those are not claims of ownership over third-party software or data.

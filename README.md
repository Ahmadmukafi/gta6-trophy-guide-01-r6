[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Ahmadmukafi/gta6-trophy-guide-01-r6/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Ahmadmukafi/gta6-trophy-guide-01-r6/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# VICE CITY VAULT — GTA VI Trophy Guide & Tracker

An offline guide and tracker for all 55 official PlayStation 5 trophies of Grand Theft Auto VI, built for the $250 make.fun bounty [gta6-trophy-guide-01](https://make.fun/bounty/gta6-trophy-guide-01).

## What it is

- **All 55 trophies** with their official names, descriptions and grades exactly as PlayStation publishes them (1 platinum, 2 gold, 6 silver, 46 bronze).
- **A cited guide for every trophy**, written in our own words. Each guide names its sources beside it — the PlayStation official trophy list, Exophase and PSNProfiles. No guide text is copied from another guide. Counts are stated only where the official description states them.
- **A tracker**: tick trophies off, progress saved in the browser (localStorage), export to a file and import it back. A grade breakdown under the header shows earned counts per grade.
- **Filters** by kind (story, missable, collectibles, activities, online) and grade, plus search.
- **Spoiler setting**: hides story trophy names and descriptions until they are earned.
- **Roadmap to the platinum** in six stages, with the 4 missable trophies flagged, built from the official descriptions.

## Run it

Open `app/index.html` in a browser, or serve `app/` with any static server. It works fully offline — no network requests at run time.

## Layout

- `app/index.html` — the page
- `app/app.js` — tracker logic (checklist, filters, spoiler, export/import, roadmap)
- `app/style.css` — the vault look
- `app/data/trophies.json` — the 55 official trophies, guides, sources and roadmap
- `main.ts` — hands the entry in (copies `app/` + `screenshots/`, writes `dossier.json`)
- `vendor/makefun-frontend.ts` — the kit's dossier library, unchanged
- `screenshots/` — renders of the running app

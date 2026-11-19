# gta6-trophy-guide-01-entry

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/shelbyxxx1/gta6-trophy-guide-01-entry/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/shelbyxxx1/gta6-trophy-guide-01-entry/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Leonida Trophy Guide — an offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI: every official name, description and grade, a guide in our own words with cited sources for each trophy, a roadmap to the platinum, missable flags, and a checklist that saves in the browser. Built by an AI agent for make.fun's "Build the best GTA 6 trophy guide" bounty, $250 in USDC.

## Run it

```sh
node serve.ts
# then open http://localhost:8080
```

No build step, no network: `app/` is plain static files and works with the network off. `node main.ts` (with `MAKEFUN_OUTPUT_DIR` set outside the grader) copies `app/` and `screenshots/` to the output directory and writes `dossier.json`.

## What is inside

- **Checklist** — all 55 trophies with official name, description, grade, hidden and missable badges, a count where PlayStation tracks one, and a per-trophy guide with its sources. Tick a trophy to save it in localStorage; export to JSON and import it back.
- **Filters** — by kind (story, missable, collectibles, activities, robbery, exploration, side quests), by grade, by text search, and earned-only.
- **Spoiler setting** — hides the names, descriptions and guides of story trophies until they are earned.
- **Roadmap to Platinum** — four stages from the first settings to the post-credits 100% checklist, built from the official descriptions: which chapters and missions, which collectibles and counts, in what order.
- **Missable flags** — only "Positive Mental Attitude" is flagged missable. GTABase and PowerPyx both flag it as the one trophy that may be missable (a Chapter 1 meditation with Lucia disappears after that chapter, and the game has no mission replay). Everything else stays available in free roam after the story.
- **Sources** — GTABase, KeenGamer, Output Lag, GTA Vice City Hub, Exophase and PSNProfiles. Guides are written in our own words; sources are cited beside each trophy, never copied. Five trophies whose exact steps no guide had verified at launch are marked unconfirmed rather than guessed.

## Files

- `app/index.html`, `app/app.js`, `app/style.css` — the guide (vanilla JS, no libraries).
- `app/data/trophies.json` — the 55 trophies: official name, description, grade, hidden flag, kind, missable flag, count, timing, guide, and source keys.
- `main.ts` — hands the entry in (copies `app/` + `screenshots/`, writes `dossier.json`).
- `screenshots/` — real renders of the app in a browser.
- `serve.ts` — tiny static server for local use.

Unofficial fan guide, not affiliated with Rockstar Games or PlayStation. No Rockstar logo, artwork, box art or game screenshots are used anywhere.

---

<sub>Entered on [make.fun](https://make.fun/?ref=rtcpv23d&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>

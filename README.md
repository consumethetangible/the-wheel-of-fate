# The Wheel of Fates 🎡

A weighted random selection wheel for group listening clubs. Members nominate albums, the wheel picks one, and nominees that survive multiple rounds without being chosen accumulate weight — making them progressively more likely to win over time.

---

## What it does

- **Six nominee slots** split evenly among up to three members (two each)
- **Weighted spinning wheel** — albums that survive rounds grow heavier, giving patient picks a better chance
- **Cover art** fetched automatically from MusicBrainz and the Cover Art Archive
- **Canonical titles** — artist and album names are standardized from MusicBrainz at the point of sealing
- **Chronicle of Battles** — a running history of every tournament result with cover art thumbnails
- **Roster management** — replace any seat before the next spin; survivors gain weight automatically
- **Manual weight correction** — sealed cards expose +/− controls for fixing a weight by hand
- **Re-spin option** — dismiss a result and spin again without recording it
- **Rules sidebar** — an unfurling parchment scroll explaining the full system

---

## How the weighting works

Weight is automatic. Every album enters at **1× weight**, and gains **+1 for every tourney it sits through** without being chosen (2×, 3×, 4×…). Nothing is stored or clicked: each seat remembers the round its album arrived (`enteredRound`) and the wheel works the weight out from that.

- **Keep it** → do nothing; it just gets heavier
- **Replace it** → press *Replace* on its card any time before the next spin; the empty seat can be filled whenever you have a pick, and a new album enters at 1×
- The winner leaves after each spin and its seat opens up

The wheel allocates slice size proportionally to weight, so a 3× album occupies three times as much of the wheel as a 1× album. Cover art fills the slice width proportionally, so heavier albums are visually larger. The +/− buttons on sealed cards are a manual correction only (they shift the stored round).

---

## How to use it

1. Enter an **Artist** and **Album** for each seat
2. Wait for cover art to load from the archive
3. Press **✦ Seal this Champion** to lock in the entry — canonical names are applied at this point
4. Once all six seats are sealed, press **Decree the Fates** to spin
5. Accept the result or re-spin
6. Fill the vacated seat whenever you have a pick (before the next spin), and replace any other seat you want to swap out

State (nominees, weights, round number, chronicle) persists in `localStorage` between sessions. Cover art does not persist — it re-fetches each session from MusicBrainz.

---

## How it was built

A single self-contained HTML file — no framework, no build step, no dependencies. Vanilla HTML, CSS, and JavaScript only.

- **Wheel rendering** — HTML5 Canvas with clip-path masking for cover art per slice
- **Cover art** — MusicBrainz search API → Cover Art Archive, with a first-release fallback
- **Persistence** — `localStorage` with versioned keys and migration for older saves
- **Fonts** — Cinzel (headings) and EB Garamond (body) via Google Fonts
- **Aesthetic** — illuminated manuscript / aged parchment throughout; dark leather header, ruled parchment cards, rolled scroll sidebar

---

## Deployment

Served as a static file — no server required.

**GitHub Pages:** push `index.html` to the root of a repo, enable Pages from the main branch, and share the URL. Add a `.nojekyll` file to prevent Jekyll processing.

**Local:** open `index.html` directly in any modern browser.

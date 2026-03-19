# The Wheel of Fates 🎵

**Album Discussion Club — Tournament of the Listening Throne**

A weighted random wheel for selecting which album your listening club discusses next.

## How it works

Three members (Baxter, Chris, Erik) each nominate two albums. The wheel spins, weighted so albums that survive multiple rounds without being chosen grow more likely to win over time. After each pick, nominees can keep their albums (gaining weight) or swap them out (resetting to 1×).

Cover art is fetched automatically from MusicBrainz / Cover Art Archive. Canonical artist and album titles are applied from the archive when you seal a champion.

Tournament history is recorded in the Chronicle of Battles below the wheel.

## Usage

Open `index.html` in any modern browser, or visit the GitHub Pages URL.

- Fill in Artist and Album for each of the six seats
- Wait for cover art to load, then press **✦ Seal this Champion**
- Once all six are sealed, press **Decree the Fates**
- The winner is revealed with ceremony; use the post-spin panel to manage swaps for next round

State (nominees, weights, chronicle) persists in `localStorage` between sessions. Art does not persist — it refetches each session.

## Deployment

This is a single static HTML file. No build step, no dependencies, no server required. GitHub Pages serves it directly from the root.

#!/usr/bin/env node
/**
 * validate-wheel-state.js
 *
 * Checks that a wheel-state.json file is structurally sound before it gets
 * pushed to GitHub — catches the kind of corruption that's easy to introduce
 * with a manual edit (wrong nominee count, bad weight, typo'd owner, etc.)
 *
 * Usage:
 *   node validate-wheel-state.js path/to/wheel-state.json
 *
 * Exits with code 0 and prints "PASSED" if everything checks out.
 * Exits with code 1 and prints every problem found if something's wrong.
 */

const fs = require('fs');

const VALID_OWNERS = ['Baxter', 'Chris', 'Erik'];
const EXPECTED_NOMINEE_COUNT = 6;

function fail(errors) {
  console.error(`\n✗ FAILED — ${errors.length} problem(s) found:\n`);
  errors.forEach((e, i) => console.error(`  ${i + 1}. ${e}`));
  console.error('');
  process.exit(1);
}

function pass(warnings) {
  if (warnings.length) {
    console.log(`\n⚠ Passed, but with ${warnings.length} warning(s):\n`);
    warnings.forEach((w, i) => console.log(`  ${i + 1}. ${w}`));
  }
  console.log('\n✓ PASSED — file structure looks good.\n');
  process.exit(0);
}

function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: node validate-wheel-state.js path/to/wheel-state.json');
    process.exit(1);
  }

  const errors = [];
  const warnings = [];

  // ── Load & parse ──────────────────────────────────────────────────
  let raw;
  try {
    raw = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    fail([`Could not read file: ${e.message}`]);
    return;
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    fail([`File is not valid JSON: ${e.message}`]);
    return;
  }

  // ── Top-level shape ───────────────────────────────────────────────
  if (typeof data.round !== 'number' || !Number.isInteger(data.round) || data.round < 1) {
    errors.push(`"round" must be a whole number ≥ 1 (got: ${JSON.stringify(data.round)})`);
  }

  if (!Array.isArray(data.nominees)) {
    errors.push('"nominees" must be an array');
  } else if (data.nominees.length !== EXPECTED_NOMINEE_COUNT) {
    errors.push(`Expected exactly ${EXPECTED_NOMINEE_COUNT} nominees, found ${data.nominees.length}`);
  }

  if (!Array.isArray(data.chronicle)) {
    errors.push('"chronicle" must be an array');
  }

  // Stop early if the basic shape is broken — nothing below is safe to check
  if (errors.length) {
    fail(errors);
    return;
  }

  // ── Each nominee ──────────────────────────────────────────────────
  const seenSeats = [];
  data.nominees.forEach((n, i) => {
    const label = `Nominee ${i + 1}`;

    if (typeof n.owner !== 'string' || !VALID_OWNERS.includes(n.owner)) {
      errors.push(`${label}: "owner" must be one of ${VALID_OWNERS.join('/')} (got: ${JSON.stringify(n.owner)})`);
    }

    if (typeof n.weight !== 'number' || !Number.isInteger(n.weight) || n.weight < 1) {
      errors.push(`${label}: "weight" must be a whole number ≥ 1 (got: ${JSON.stringify(n.weight)})`);
    }

    if (typeof n.sealed !== 'boolean') {
      errors.push(`${label}: "sealed" must be true or false (got: ${JSON.stringify(n.sealed)})`);
    }

    if (typeof n.artist !== 'string' || typeof n.album !== 'string') {
      errors.push(`${label}: "artist" and "album" must both be text fields`);
    } else if (n.sealed && (n.artist.trim() === '' || n.album.trim() === '')) {
      errors.push(`${label}: is marked sealed but has an empty artist or album`);
    } else if (!n.sealed && (n.artist.trim() !== '' || n.album.trim() !== '') && (n.artist.trim() === '' || n.album.trim() === '')) {
      warnings.push(`${label}: has one field filled in but not the other (${JSON.stringify(n.artist)} / ${JSON.stringify(n.album)})`);
    }

    if (n.artUrl !== null && n.artUrl !== undefined) {
      warnings.push(`${label}: "artUrl" should normally be null when saved (cover art is always re-fetched) — found a value instead`);
    }

    if (n.sealed && n.artist && n.album) {
      const key = (n.artist + '|||' + n.album).toLowerCase();
      if (seenSeats.includes(key)) {
        warnings.push(`${label}: duplicate of another sealed nominee — "${n.artist} – ${n.album}" appears twice`);
      }
      seenSeats.push(key);
    }
  });

  // ── Chronicle entries ─────────────────────────────────────────────
  data.chronicle.forEach((e, i) => {
    const label = `Chronicle entry ${i + 1} (Tournament ${e.round})`;

    if (typeof e.round !== 'number' || !Number.isInteger(e.round) || e.round < 1) {
      errors.push(`${label}: "round" must be a whole number ≥ 1`);
    }
    if (typeof e.album !== 'string' || e.album.trim() === '') {
      errors.push(`${label}: "album" must not be empty`);
    }
    if (typeof e.owner !== 'string' || !VALID_OWNERS.includes(e.owner)) {
      errors.push(`${label}: "owner" must be one of ${VALID_OWNERS.join('/')}`);
    }
    if (typeof e.rounds !== 'number' || !Number.isInteger(e.rounds) || e.rounds < 0) {
      errors.push(`${label}: "rounds" (tourneys survived) must be a whole number ≥ 0`);
    }
  });

  // Chronicle rounds shouldn't skip or repeat
  const chronicleRounds = data.chronicle.map(e => e.round).sort((a, b) => a - b);
  chronicleRounds.forEach((r, i) => {
    if (i > 0 && r === chronicleRounds[i - 1]) {
      errors.push(`Chronicle has two entries for the same round (${r})`);
    }
  });

  // The current round should be one ahead of the most recent chronicle entry
  if (chronicleRounds.length) {
    const mostRecent = chronicleRounds[chronicleRounds.length - 1];
    if (data.round !== mostRecent + 1) {
      warnings.push(`Current round is ${data.round}, but the most recent chronicle entry is round ${mostRecent} — expected current round to be ${mostRecent + 1}`);
    }
  }

  if (errors.length) fail(errors);
  else pass(warnings);
}

main();

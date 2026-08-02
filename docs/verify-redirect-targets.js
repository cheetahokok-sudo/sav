#!/usr/bin/env node
// Verify every target in savthai-redirects.csv resolves to a real page in the
// static export. A redirect map pointing at 404s is worse than no map: it
// turns recoverable link equity into soft-404 signals.
//
//   npm run build && node docs/verify-redirect-targets.js
//
// Re-run this whenever a category slug or product model changes. Slugs in
// app/lib/series.ts are permanent URLs for exactly this reason.

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "out");
const CSV = path.join(__dirname, "savthai-redirects.csv");
const ORIGIN = "https://savautomation.com";

if (!fs.existsSync(OUT)) {
  console.error("out/ not found — run `npm run build` first.");
  process.exit(1);
}

const rows = fs
  .readFileSync(CSV, "utf8")
  .split(/\r?\n/)
  .slice(1)
  .filter(Boolean)
  .map((line) => {
    // Only the last 5 fields are fixed-width; source/target may not contain
    // commas in practice, but split from the right to be safe.
    const parts = line.split(",");
    const tail = parts.slice(-5);
    const [source, target] = parts.slice(0, parts.length - 5);
    return { source, target, status: tail[0] };
  });

let bad = 0;
const seen = new Set();

for (const { source, target, status } of rows) {
  if (seen.has(source)) {
    console.log(`DUPLICATE SOURCE  ${source}`);
    bad++;
  }
  seen.add(source);

  if (status !== "301") {
    console.log(`NOT 301           ${source} (${status})`);
    bad++;
  }

  if (!target.startsWith(ORIGIN + "/")) {
    console.log(`FOREIGN TARGET    ${target}`);
    bad++;
    continue;
  }

  const rel = decodeURIComponent(target.slice(ORIGIN.length));
  const file = path.join(OUT, rel, "index.html");
  if (!fs.existsSync(file)) {
    console.log(`TARGET 404        ${target}`);
    bad++;
  }
}

// ---------------------------------------------------------------------------
// The Worker map must agree with the CSV. Two copies of a redirect table drift
// the moment one is edited alone, and the drift is invisible until traffic is
// already going to the wrong place.
// ---------------------------------------------------------------------------
const workerSrc = fs.readFileSync(path.join(__dirname, "savthai-redirect-worker.js"), "utf8");
const workerPairs = new Map();
const mapBody = workerSrc.slice(
  workerSrc.indexOf("const MAP = {"),
  workerSrc.indexOf("const FALLBACK")
);
for (const m of mapBody.matchAll(/"([^"]+)":\s*\n?\s*"([^"]+)"/g)) {
  workerPairs.set(m[1], m[2]);
}

let drift = 0;
for (const { source, target } of rows) {
  const p = source.replace(/^savthai\.com/, "").toLowerCase();
  const expected = target.replace(ORIGIN, "");
  const got = workerPairs.get(p);
  if (got === undefined) {
    console.log(`WORKER MISSING    ${p}`);
    drift++;
  } else if (decodeURIComponent(got) !== decodeURIComponent(expected)) {
    console.log(`WORKER MISMATCH   ${p}\n                  csv=${expected}\n                  wkr=${got}`);
    drift++;
  }
}
for (const key of workerPairs.keys()) {
  const inCsv = rows.some(
    (r) => r.source.replace(/^savthai\.com/, "").toLowerCase() === key
  );
  if (!inCsv) {
    console.log(`CSV MISSING       ${key}`);
    drift++;
  }
}

console.log(
  `\n${rows.length} redirects checked, ${bad} target problem(s), ` +
    `${workerPairs.size} worker entries, ${drift} csv/worker drift.`
);
process.exit(bad + drift ? 1 : 0);

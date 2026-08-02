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

console.log(`\n${rows.length} redirects checked, ${bad} problem(s).`);
process.exit(bad ? 1 : 0);

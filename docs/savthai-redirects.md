# savthai.com → savautomation.com redirects

> **Not published.** This directory is `docs/` at the repo root, not
> `public/docs/`. Next.js only serves `public/`, so nothing here reaches the
> website. Do not move these files into `public/docs/`.

## Why this exists

`savthai.com` is SAV's previous WordPress site. Its hosting is gone, but the
domain is still owned by SAV (registrar PORAR, registrant *S A V MECHANICAL
SERVICES AND SUPPLIES LTD., PART.*, expiry 2029) and **it still holds whatever
search presence the company has**.

As of 2026-08-02, searching for SAV's brand or for Thai commercial terms like
*EOCR ตัวแทนจำหน่าย* returns `savthai.com` and does **not** return
`savautomation.com` at all. Redirecting the old domain properly is therefore
the single highest-value SEO action available — higher than any on-page work,
because it transfers an existing position rather than building a new one.

The map below was recovered from the Wayback Machine (243 archived URLs, 35
worth mapping). Five old product URLs map exactly onto models still in the
catalogue.

## Current state — registrar forwarding is not sufficient

PORAR's "ส่งต่อเว็บไซต์" forwarding was switched on 2026-08-02. Measured
behaviour:

| URL form | Result |
|---|---|
| `http://savthai.com/` | 302 → `https://savautomation.com/` |
| `https://savthai.com/` | TLS handshake fails — no certificate |
| `www.savthai.com` (any scheme) | NXDOMAIN — no `www` record exists |
| `http://savthai.com/<any path>` | 404 — paths are not forwarded |

The URLs actually indexed by Google are `https://www.savthai.com/product/...`,
which fail on **both** the missing `www` record and the missing certificate. So
the registrar forwarding currently rescues only someone hand-typing
`savthai.com` without a scheme. It recovers none of the indexed pages.

Three defects, all fixed by moving back to Cloudflare:

1. **302, not 301.** Temporary redirects do not reliably pass ranking signals
   and keep the old URL in the index.
2. **No HTTPS and no `www`.** Fatal — a crawler cannot follow a redirect it
   cannot complete a TLS handshake to.
3. **No path preservation.** Every deep URL 404s instead of redirecting.

## Why PORAR's own forwarding cannot do this

PORAR's "ส่งต่อเว็บไซต์" forwards the **apex only, to a single URL**. Measured
2026-08-02: it emits a 302 (not 301), serves no certificate for
`https://savthai.com/`, has no `www` record at all, and 404s every path.

The URLs Google actually has are `https://www.savthai.com/product/...`. Those
fail twice over — no `www` DNS record, no TLS certificate — so the forwarding
rescues nothing that ranks. No amount of configuring PORAR fixes this; the
feature does not do per-path redirects or issue certificates.

## Moving nameservers is not transferring the domain

This is the point that usually causes hesitation. Pointing the nameservers at
Cloudflare **leaves the domain registered at PORAR**. There is no transfer, no
auth/EPP code, no registrar fee, and no 60-day transfer lock. Two fields change
in the PORAR panel (the เนมเซิร์ฟเวอร์ tab) and everything else about the
registration stays exactly as it is. It is reversible at any time.

**Checked before recommending it:** `savthai.com` has **no MX and no TXT
records** (verified 2026-08-02). Nothing is relying on the current DNS — no
mail, no domain-verification records — so moving the zone breaks nothing. The
company's email is on `@hotmail.com`, not on this domain.

If any of that changes, re-check before moving, because changing nameservers
moves *all* DNS for the domain, not just the web records.

## Setup

Cloudflare Redirect Rules and Workers run at the edge *before* any origin
fetch, so this needs **no server** — which is the point, since the old host is
unrecoverable.

1. **Nameservers.** At PORAR (เนมเซิร์ฟเวอร์ tab) set them back to the
   Cloudflare pair the zone previously used:
   `DAVID.NS.CLOUDFLARE.COM` / `JADE.NS.CLOUDFLARE.COM`.
   If that Cloudflare account is also lost, create a new one, add
   `savthai.com` as a zone, and use whichever nameserver pair it assigns.

2. **DNS.** Add two **proxied** (orange cloud) `A` records:

   | Name | Content | Proxy |
   |---|---|---|
   | `@` | `192.0.2.1` | Proxied |
   | `www` | `192.0.2.1` | Proxied |

   `192.0.2.1` is the RFC 5737 documentation-reserved address. Nothing ever
   connects to it — the redirect rules fire first. The record exists only so
   Cloudflare has something to proxy.

3. **Wait for Universal SSL** (usually minutes, occasionally up to 24h). Do not
   proceed until this returns a certificate:

   ```bash
   curl -sI https://www.savthai.com/ | head -1
   ```

4. **The redirects themselves — use the Worker.**

   Deploy `savthai-redirect-worker.js` (same directory) with a route of
   `*savthai.com/*`:

   ```bash
   npx wrangler deploy docs/savthai-redirect-worker.js --name savthai-redirect
   ```

   Then in the Cloudflare dashboard add the route `*savthai.com/*` to that
   Worker. Free plan covers this comfortably — the limit is 100,000 requests a
   day and a dead domain's residual traffic is a tiny fraction of that.

   **Why not Bulk Redirects:** Cloudflare's Free plan advertises 10,000
   bulk-redirect URLs, but as of 2026 it is still capped at **20 items** in
   practice — a known, unfixed issue. This map has 37. Splitting it across a
   truncated bulk list plus a catch-all would work but silently drops 17
   mappings, and nothing would tell you which.

   The Worker also keeps the map in the repo, version-controlled, and checked
   by `verify-redirect-targets.js` against the CSV so the two cannot drift.

   *If you would rather not deploy a Worker:* import the first 20 rows of
   `savthai-redirects.csv` as Bulk Redirects (301, `include_subdomains` **on**,
   `subpath_matching` **off**, `preserve_query_string` **off**) and let step 5's
   catch-all take the rest. Prioritise the rows for URLs known to rank —
   `/product-list/` and `/product/eocr-ss-schneider-samwha/` are the two
   confirmed to appear in search results.

5. **Catch-all.** The Worker already does this — its `FALLBACK` sends anything
   unmapped to `/products/`, so no extra rule is needed.

   Only if you took the Bulk Redirects route instead, add one Redirect Rule
   evaluated after the bulk list:

   - Expression: `(http.host eq "savthai.com" or http.host eq "www.savthai.com")`
   - Target: `https://savautomation.com/products/`
   - Status: **301**

   Either way the remainder goes to `/products/`, **not** the homepage. Google
   treats a large number of unrelated URLs collapsing onto one homepage as
   soft-404 and discards the signal; landing on the catalogue matches intent.

6. **Turn off the PORAR forwarding** once Cloudflare is live, or the two
   mechanisms will conflict.

## Verifying

```bash
curl -sI https://www.savthai.com/product/eocr-ss-schneider-samwha/ | head -3
```

Expect `HTTP/2 301` and a `location:` on `savautomation.com`. Spot-check five
rows from the CSV, including one Thai percent-encoded article URL.

Check that every target still exists in the built site:

```bash
npm run build && node docs/verify-redirect-targets.js
```

That script fails if a target 404s, if a row is not a 301, if a source is
duplicated, **or if the CSV and the Worker map disagree**. Run it whenever a
category slug or model number changes — the slugs in
[`app/lib/series.ts`](../app/lib/series.ts) are permanent URLs partly because
this map depends on them.

Current state: 37 redirects, 0 target problems, 37 worker entries, 0 drift.

## Open item — product lines with no home

The old site sold three categories that are **not** in the current catalogue:

- `/product/24kv-current-limiting-fuses/`
- `/product/24kv-load-break-switch-lbs/`
- `/product-category/power-fuse-link-3-3kv-24kv/`
- `/product-category/medium-voltage-equipment/`
- `/product-category/automatic-transfer-switch/`

These currently point at `/products/` as a holding position. If SAV still
sells medium-voltage equipment, they deserve real category pages and these
rows should be repointed. Owner said detail would follow — until then the
holding position stands, and it is deliberately recorded here rather than
left as an undocumented guess.

## Aftercare

- Keep the redirects **permanently**. Do not let the domain lapse in 2029.
- In Google Search Console, add `savthai.com` as a property and use the
  Change of Address tool once the 301s are confirmed live.
- Expect the transfer to take weeks, not days. The success signal is
  `savautomation.com` displacing `savthai.com` for brand and Thai commercial
  queries.

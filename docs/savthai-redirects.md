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

## Setup

Cloudflare Redirect Rules run at the edge *before* any origin fetch, so this
needs **no server** — which is the point, since the old host is unrecoverable.

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

4. **Bulk Redirects.** Import `savthai-redirects.csv` (same directory).
   Cloudflare's importer expects specific column headers and these have changed
   between dashboard revisions — download the template CSV from the Bulk
   Redirects UI and match its header row before uploading. With 35 rows,
   pasting them in by hand is also perfectly reasonable.

   Per-row settings that matter: **301**, `include_subdomains` **on** (so
   `www.savthai.com` matches the same rules), `subpath_matching` **off**,
   `preserve_query_string` **off**.

5. **Catch-all.** One Redirect Rule, evaluated after the bulk list:

   - Expression: `(http.host eq "savthai.com" or http.host eq "www.savthai.com")`
   - Target: `https://savautomation.com/products/`
   - Status: **301**

   Send the remainder to `/products/`, **not** the homepage. Google treats a
   large number of unrelated URLs collapsing onto one homepage as soft-404 and
   discards the signal; landing on the catalogue at least matches intent.

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

That script fails if a target 404s, if a row is not a 301, or if a source is
duplicated. Run it whenever a category slug or model number changes — the
slugs in [`app/lib/series.ts`](../app/lib/series.ts) are permanent URLs partly
because this map depends on them.

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

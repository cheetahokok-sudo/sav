# Verified standard citations

> **Not published.** Repo-root `docs/`, not `public/docs/` — Next.js serves only `public/`.

Every dated standard citation on the site is recorded here with the date it was checked against
the publisher's own webstore. **Never write an edition year from memory.** Standards move: three
of the editions assumed during the August 2026 review turned out to be stale.

## Why this file exists

During the CP2 audit on 2026-08-02, two citation URLs in freshly published articles were found
to point at completely unrelated standards:

| Bad URL | Assumed to be | Actually was |
|---|---|---|
| `webstore.iec.ch/en/publication/125` | IEC 60034-26 | **IEC 60034-22:2009** (AC generators for RIC engines — withdrawn 2023) |
| `webstore.iec.ch/en/publication/61163` | IEC 61000-2-2 | **IEC 62464-1:2018** (MRI equipment for medical imaging) |

IEC webstore publication IDs are opaque and **cannot be guessed or inferred**. A URL returning
HTTP 200 proves only that some page exists, not that it is the right standard. Fetch the page
and read the designation before pasting the link.

## Verification procedure

1. Search for the standard number; open the publisher's own page (`webstore.iec.ch`,
   `iso.org`, `standards.ieee.org`, `nema.org`).
2. Read back the **exact designation and edition** from that page.
3. Record the row below with today's date.
4. Only then write it into an article's `references:`.
5. If the correct publication URL cannot be confirmed, **cite without a URL**. The `Ref` type in
   [app/lib/knowledge.ts](../app/lib/knowledge.ts) makes `url` optional for exactly this reason.
   A citation with no link is honest; a citation pointing at the wrong standard is not.

## Verified — IEC

| Standard | Edition / year | URL | Verified | Used in |
|---|---|---|---|---|
| IEC 60947-4-1 | 2023, Ed. 5.0 (corrected version Mar 2026) | `webstore.iec.ch/en/publication/74487` | 2026-08-02 | 18 articles |
| IEC 60255-151 | 2009, Ed. 1.0 | `webstore.iec.ch/en/publication/1166` | 2026-08-02 | 7 articles |
| IEC 61869-2 | 2012, Ed. 1.0 | `webstore.iec.ch/en/publication/6050` | 2026-08-02 | 2 articles (URL not yet used in frontmatter) |
| IEC 61000-4-30 | 2015 + AMD1:2021, Ed. 3.1 | `webstore.iec.ch/en/publication/68642` | 2026-08-02 | voltage-sag-swell-factory |
| IEC 60034-26 | **2026, Ed. 2.0** (replaces 2006) | `webstore.iec.ch/en/publication/95874` | 2026-08-02 | voltage-current-unbalance-motor |
| IEC 61000-2-2 | 2002 + AMD1:2017 + AMD2:2018, Ed. 2.2 | *publication ID not confirmed — cite without URL* | 2026-08-02 | 2 articles |

## Verified — other bodies

| Standard | Edition / year | URL | Verified |
|---|---|---|---|
| IEEE Std 1159 | Recommended Practice for Monitoring Electric Power Quality | `standards.ieee.org/ieee/1159/7168/` | 2026-08-02 (URL resolves; designation not re-read) |
| NEMA MG 1 | Motors and Generators | `nema.org/standards/view/american-national-standard-motors-and-generators` | 2026-08-02 (redirects — recheck when next cited) |

## Verified — driven-equipment (load-types) library

Checked 2026-08-02 while writing the four load-type articles.

| Standard | Edition / year | URL | Used in |
|---|---|---|---|
| ISO 9906 | **2012, Ed. 2** — Grades 1, 2 and 3 (cancels ISO 9906:1999). Covers centrifugal, **mixed-flow and axial** pumps | `iso.org/standard/41202.html` | centrifugal-pump, axial-propeller-pump |
| ANSI/HI 9.6.3 | Guideline for Operating Regions (POR / AOR). Current edition **2024** | `pumps.org/product/ansi-hi-9-6-3-rotodynamic-pumps-guideline-for-operating-regions/` | centrifugal-pump, axial-propeller-pump |
| ANSI/HI 9.6.1 | Guideline for NPSH Margin. Current edition **2024** | `pumps.org/product/ansi-hi-9-6-1-rotodynamic-pumps-guideline-for-npsh-margin/` | centrifugal-pump |
| AMCA Publication 201 | **201-23** — Fans and Systems (origin of the System Effect Factor) | `webstore.ansi.org/standards/amca/amca20123` | fan-blower |
| ISO 5048 | **1989, Ed. 2** — belt conveyors with carrying idlers; the 1979 edition is **withdrawn** | `iso.org/standard/11069.html` | belt-conveyor |
| ISO 13850 | **2015, Ed. 3** — emergency stop function (revises 2006) | `iso.org/standard/59970.html` | belt-conveyor |
| ISO 20816-1 | **2016** — supersedes ISO 10816-1:1995; merges casing (10816) and shaft (7919) vibration | `iso.org/standard/63180.html` | fan-blower |
| CEMA, Belt Conveyors for Bulk Materials | **7th ed., Second Printing (Aug 2020)** — there is no 8th edition | `cemanet.org/resources/publications/` | belt-conveyor |

Two deliberate choices in the rows above:

- **The two Hydraulic Institute links are the publisher's undated product pages, not edition-stamped
  webstore listings.** HI revised both 9.6.1 and 9.6.3 in 2024, and the resellers disagree about
  which edition that supersedes (one says 2018, another says 2017). An undated publisher page
  always resolves to the current edition, so it cannot rot the way a pinned edition URL does.
- **ANSI/AMCA 210 is cited undated and without a URL.** Sources returned both `210-16` and a page
  headed `210-25`; the edition could not be settled, and rule 5 above applies.

### Also relied on, cited undated by design

`IEC 60034-5` (IP code for rotating machines — submersible pump motors) and `ISO 20816-3`
(industrial machines above 15 kW). Both are named in prose without an edition year or URL.

## Editions confirmed current for the upcoming library

Checked while planning the Motor · Load · Industry library. Re-verify at write time; these were
correct on 2026-08-02.

| Standard | Edition / year | Note |
|---|---|---|
| IEC 60034-1 | **2026, Ed. 15.0** (pub. 13 Mar 2026) | Now defines converter duty directly and **deletes the reference to IEC TS 60034-25** — route VFD-fed motor content here, not to 60034-25 |
| IEC 60034-30-1 | **2025, Ed. 2.0** (pub. Dec 2025) | IE1–IE5 for line-operated AC motors |
| IEC 60079-10-2 | **2026** (supersedes 2015) | Was at FDIS with voting closing May 2026 — confirm published status before citing |

## Undated citations — deliberate

These appear in prose without an edition year and should stay that way unless verified:
IEC 60364-5-52 · IEC 60227 · IEC 60947-2 · IEC 60034 (series references).

Adding a plausible year to an undated mention is the failure this file exists to prevent.

## Re-audit trigger

Re-run this audit when: a new article cites a standard not listed above; an existing citation is
edited; or annually. Command to list every dated citation on the site:

```bash
grep -ohE "(IEC|ISO|IEEE|NEMA)[ /]?[A-Z0-9 .-]+:[0-9]{4}" content/knowledge/*.mdx | sort | uniq -c | sort -rn
```

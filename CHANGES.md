# SAV Website Revision — 2026-07-05

Extract this zip into the root of `sav-website2026` (it mirrors the repo
structure), review the diff, then:

```
git add app/
git commit -m "Thai-first EOCR hero, quote basket, stock badges, company constants"
git push
```

GitHub Actions will build and deploy as usual. Verified locally:
`npx tsc --noEmit` clean, `next build` static export succeeds (6 routes).

## New files

| File | Purpose |
|---|---|
| `app/lib/company.ts` | **Single source of truth** for name, address, phones, email, Tax ID, hours, map. Header, footer, contact section, and JSON-LD all import from here. To change a phone number, edit this one file. |
| `app/components/ContactBar.tsx` | Mobile-only fixed bottom bar: โทร · LINE/WhatsApp · ขอใบเสนอราคา. Shown on both pages. |
| `app/components/QuoteForm.tsx` | Contact form now composes a real message and opens WhatsApp / email prefilled (plus copy button). Replaces the dead Formspree placeholder — works with zero backend. |

## Changed files

### `app/page.tsx` (homepage)
- **Hero rewritten Thai-first**: H1 is now "EOCR รีเลย์ป้องกันมอเตอร์ / สต็อกในไทย พร้อมส่งทันที" — the keyword buyers search now leads the page. English subline kept for international.
- **Verifiable facts replace vague claims**: "จดทะเบียน พ.ศ. 2530 (1987) · Tax ID" instead of "30+ years"; trust strip now shows direct-import, Thai stock, full VAT invoice (ใบกำกับภาษี), free engineer consult.
- **Categories reordered to the real catalog**: EOCR featured first with Best Seller tag; added EOCR-i3 and EOCR-iF (they're 42 of your 68 SKUs); every card links to a prefiltered `/products/?q=...` search with a stock badge.
- **Series cards updated**: EOCR-SS, 3DE/3EZ, i3/iF, EUCR — each with stock badge and "ดูรุ่นทั้งหมด + ขอราคา" into the catalog. The "?" card now invites sending a photo of the old relay via LINE (replacement-sales motion).
- **Brand strip made honest**: Samwha featured as "Direct Import · ตัวแทนนำเข้าโดยตรง"; other brands moved under "จัดหาให้ได้ตามสั่ง — sourcing on request". No more implied distributorships.
- **"Latest Project" fabricated stats (18%/99.9%/1.2y) removed** → replaced with ขั้นตอนการสั่งซื้อ (How to order): quote → confirm → payment + ใบกำกับภาษีเต็มรูป → nationwide delivery. This answers the questions Thai B2B buyers actually ask.
- **One-red-CTA rule**: CTA banner is now ink-colored with a single red LINE/WhatsApp button; secondary actions are outlined.
- All contact info now comes from `company.ts`. Primary CTA number everywhere is +66 94 924 9829 (call/LINE/WhatsApp); office landline kept as secondary.
- Nav trimmed and pointed at real destinations (Products, EOCR Series, About, How to Order, Contact).

### `app/products/page.tsx` (catalog)
- **Stock badges** on every card, driven by `in_stock` in `public/products/index.json`:
  - `true` → ● พร้อมส่ง (green) · `false` → ◐ สั่งล่วงหน้า (amber) · `null` → สอบถามสต็อก (gray)
  - All 68 SKUs are currently `true` — edit per-SKU in the JSON as real stock changes. (Recommended next step: have `build_product_folders.py` read a small `stock_overrides.json` so the pipeline doesn't overwrite your edits.)
- **Series filter** dropdown grouping cryptic model numbers into buyer-readable series (EOCR-SS/SE2, 3D/3E, PFZ/PMZ, i3, iF, EUCR, iSEM) + "เฉพาะพร้อมส่ง" toggle.
- **Quote basket (RFQ)**: "＋ ใส่ใบเสนอราคา" on every product; basket persists in localStorage across visits; quantity steppers; submits via **WhatsApp deep link with the model list prefilled**, email fallback, and copy button. No backend needed.
- `?q=` URL prefill supported — homepage category/series links land on a filtered list.
- Empty search result now offers "สอบถามรุ่นนี้ทาง LINE/WA" with the query prefilled, so a missed search still becomes a lead.

### `app/layout.tsx`
- JSON-LD Organization now imports from `company.ts`; primary contactPoint corrected to +66-94-924-9829 (was the outdated +66-85-212-0255), landline kept, `foundingDate: 1987` added.

## Things only you can do (from the roadmap, unchanged)
1. **Photo day** — replace the hero/solutions AI images with real photos (stock shelves, packed EOCR boxes, panel installs). The hero currently reuses your factory image as a placeholder.
2. **LINE Official Account** — when created, paste the `lin.ee/...` URL into `lineOfficialUrl` in `company.ts`; every LINE button on the site switches to it automatically. Until then buttons use WhatsApp (same number).
3. **Google Business Profile** — claim/update with the exact Samutprakarn address from `company.ts`.
4. **Stock accuracy** — mark SKUs you don't actually shelf-stock as `false` or `null` in `index.json`; an all-green catalog that can't deliver hurts more than honest amber.

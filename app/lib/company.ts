// ============================================================================
// SINGLE SOURCE OF TRUTH for company facts.
// Every page (header, hero, contact section, footer, JSON-LD) imports from
// here. Edit contact details in THIS FILE ONLY — never hardcode a phone
// number, address, or email inside a page again. Inconsistent contact info
// (NAP) hurts both customer trust and Google Business ranking.
// ============================================================================

/**
 * Canonical origin, no trailing slash. Every absolute URL in metadata, JSON-LD,
 * the sitemap and robots.txt is built from this — it used to be hardcoded in
 * five separate files, which is exactly how a domain migration goes wrong.
 */
export const SITE_URL = "https://savautomation.com";

export const COMPANY = {
  nameEn: "SAV Mechanical Services & Supplies Ltd., Part.",
  nameTh: "หจก. เอส เอ วี เมคคานิคคอล เซอร์วิสส์ แอนด์ ซัพพลายส์",
  taxId: "0113530000263",
  // Tax ID prefix 011-2530-... encodes the B.E. 2530 (1987) registration —
  // a verifiable fact, stronger than a vague "30+ years" claim.
  registeredYearBE: 2530,
  registeredYearAD: 1987,

  addressTh: "107/58 หมู่ 8 ต.บางเมือง อ.เมือง จ.สมุทรปราการ 10270",
  addressLines: ["107/58 หมู่ 8 ต.บางเมือง อ.เมือง", "จ.สมุทรปราการ 10270"],

  // ---- Phones ----
  officePhoneDisplay: "02-702-8801",
  officePhoneHref: "tel:+6627028801",
  mobilePhoneDisplay: "084-770-2261",
  mobilePhoneHref: "tel:+66847702261",
  fax: "02-395-1002",

  // Mr. Cheetah — the number that answers LINE & WhatsApp. This is the
  // primary CTA number on the site.
  intlPhoneDisplay: "+66 94 924 9829",
  intlPhoneHref: "tel:+66949249829",

  // ---- Messaging ----
  // LINE is the primary channel — Thai B2B buyers live there. Every messaging
  // button points here via messagingLink() below. WhatsApp is kept only as an
  // automatic fallback (see messagingLink) and for the number that also answers
  // WhatsApp; prefill text is appended by helpers.
  whatsappBase: "https://wa.me/66949249829",
  // Personal LINE add-by-ID link (~ prefix = add by LINE ID). Requires the ID
  // to exist AND "Allow adding by ID" enabled in LINE privacy settings.
  // To upgrade to a LINE Official Account later, swap this ONE value for the
  // OA's "https://lin.ee/XXXXXXX" link — every button follows automatically.
  lineOfficialUrl: "https://line.me/ti/p/~cheetahok",

  email: "sav-545@hotmail.com",

  hoursTh: "จ–ศ 8.30 – 17.30 น.",
  hoursEn: "Mon–Fri: 8.30 AM – 5.30 PM",

  mapsEmbed:
    "https://maps.google.com/maps?q=13.5909269,100.6159041&hl=th&z=17&output=embed",

  // Same coordinates as mapsEmbed above, split out for LocalBusiness JSON-LD.
  latitude: 13.5909269,
  longitude: 100.6159041,

  /**
   * Profiles that are demonstrably the same business, for schema.org `sameAs`.
   * This is how Google and LLMs confirm "this website = this real company", so
   * it earns its keep — but ONLY with URLs that actually resolve to SAV. Adding
   * a plausible-looking profile that isn't ours is worse than an empty list.
   *
   * TODO (owner): append the Google Business Profile URL once created, plus
   * Facebook page and any manufacturer distributor-listing page.
   */
  sameAs: ["https://line.me/ti/p/~cheetahok"] as string[],
} as const;

/** WhatsApp link with prefilled message. */
export function whatsappLink(text: string): string {
  return `${COMPANY.whatsappBase}?text=${encodeURIComponent(text)}`;
}

/**
 * LINE add-friend link. LINE cannot carry a prefilled message the way WhatsApp
 * can — this opens the chat/add-friend screen only. For flows that need to send
 * details (quote form, product quote), copy the text to the clipboard first,
 * then open this so the customer can paste into LINE.
 */
export function lineLink(): string {
  return COMPANY.lineOfficialUrl;
}

/**
 * Primary messaging link: LINE when configured, WhatsApp as a graceful fallback
 * (so buttons never point at a broken ~link if lineOfficialUrl is ever blanked).
 * The `text` is used only by the WhatsApp fallback — LINE ignores it.
 */
export function messagingLink(text: string): string {
  return COMPANY.lineOfficialUrl || whatsappLink(text);
}

/** mailto: link with prefilled subject + body. */
export function mailtoLink(subject: string, body: string): string {
  return `mailto:${COMPANY.email}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
}

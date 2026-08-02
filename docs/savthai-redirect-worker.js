/**
 * savthai.com → savautomation.com redirect worker
 *
 * Deploy on Cloudflare Workers (free plan) with a route of `*savthai.com/*`.
 * Nothing else is needed — no origin server, no hosting. The old savthai.com
 * host is gone and this never tries to reach it.
 *
 * Why a Worker instead of Bulk Redirects: Cloudflare's Free plan advertises
 * 10,000 bulk-redirect URLs but in practice is still capped at 20 items as of
 * 2026. The map below has more than that, and keeping it in the repo means it
 * is version-controlled and checked by docs/verify-redirect-targets.js.
 *
 * To update: edit MAP, then `npx wrangler deploy`. Keep it in sync with
 * docs/savthai-redirects.csv (same pairs, same order).
 */

const DEST = "https://savautomation.com";

/** Exact old path → new path. Keys are lower-cased, trailing slash included. */
const MAP = {
  "/": "/",

  // catalogue landing pages
  "/product-list/": "/products/",
  "/shop/": "/products/",
  "/home/product/": "/products/",
  "/home/promotion/": "/products/",
  "/product-category/all-products/": "/products/",
  "/uncategorized/table-all-product-price-list/": "/products/",

  // categories
  "/product-category/motor-protection-system/": "/products/series/eocr-ss-se2/",
  "/product-category/current-voltage-transformer/": "/products/series/zct-ct/",
  "/product-category/medium-voltage-equipment/": "/products/series/mv-fuse-24kv/",
  "/product-category/power-fuse-link-3-3kv-24kv/": "/products/series/mv-fuse-24kv/",
  "/product-category/automatic-transfer-switch/": "/products/",

  // products — these five land on the exact model still in the catalogue
  "/product/doucr/": "/products/DOUCR/",
  "/product/dsp-aol-10z7/": "/products/DSP-AOL-10Z7/",
  "/product/dsp-aom-n/": "/products/DSP-AOM-N/",
  "/uncategorized/dsp-aom-n/": "/products/DSP-AOM-N/",
  "/product/dsp-vip-pm/": "/products/DSP-PM-1Z7/",
  "/product/dsp-vip-rtm-70z7/": "/products/DSP-VIP-RTM-70Z7/",
  "/dsp-vip-rtm-70z7/": "/products/DSP-VIP-RTM-70Z7/",
  "/dsp-vip-rtm-70z7-2/": "/products/DSP-VIP-RTM-70Z7/",
  "/product/24kv-current-limiting-fuses/": "/products/HVCLF-24/",
  "/product/24kv-load-break-switch-lbs/": "/products/series/mv-fuse-24kv/",

  // product families → category pages
  "/product/eocr-ss-schneider-samwha/": "/products/series/eocr-ss-se2/",
  "/product/eocr-s-w-schneider-samwha/": "/products/series/eocr-ss-se2/",
  "/product/eocr-3de-schneider-samwha/": "/products/series/eocr-3d-3e/",
  "/eocr_3de/": "/products/series/eocr-3d-3e/",
  "/product/current-transformer-ct-zct-overview/": "/products/series/zct-ct/",

  // articles
  "/article/492-introduction-to-protection-electronic-relay/":
    "/learn/what-is-motor-protection-relay/",
  "/article/%e0%b8%81%e0%b8%b2%e0%b8%a3%e0%b9%80%e0%b8%8b%e0%b8%95%e0%b8%84%e0%b9%88%e0%b8%b2%e0%b9%82%e0%b8%ad%e0%b9%80%e0%b8%a7%e0%b8%ad%e0%b8%a3%e0%b9%8c%e0%b9%82%e0%b8%ab%e0%b8%a5%e0%b8%94/":
    "/learn/eocr-nuisance-trip-settings/",
  "/article/%e0%b8%a7%e0%b8%b4%e0%b8%98%e0%b8%b5%e0%b8%95%e0%b8%b4%e0%b8%94%e0%b8%95%e0%b8%b1%e0%b9%89%e0%b8%87-overload-%e0%b8%97%e0%b8%b5%e0%b9%88%e0%b8%96%e0%b8%b9%e0%b8%81%e0%b8%95%e0%b9%89%e0%b8%ad%e0%b8%87/":
    "/learn/eocr-first-time-setup/",
  "/category/article/": "/learn/",
  "/category/firmware-update/": "/learn/",
  "/firmware-update/90/": "/learn/",

  // shop/account pages with no equivalent
  "/contact-sav/": "/contact/",
  "/my-account/": "/contact/",
  "/cart/": "/contact/",
  "/payment/": "/contact/",
};

/**
 * Anything unmapped goes to the catalogue, not the homepage. Google reads a
 * large number of unrelated URLs collapsing onto one homepage as soft-404 and
 * discards the signal; landing on the catalogue at least matches intent.
 */
const FALLBACK = "/products/";

export default {
  fetch(request) {
    const url = new URL(request.url);

    // Normalise: lower-case, and ensure a single trailing slash so
    // /product/doucr and /product/doucr/ both match one map key.
    let path = url.pathname.toLowerCase();
    if (!path.endsWith("/")) path += "/";

    const target = MAP[path] ?? FALLBACK;

    // 301, not 302. A temporary redirect does not reliably pass ranking
    // signals and keeps the old URL in the index — which is the entire
    // problem this is here to solve.
    return Response.redirect(DEST + target, 301);
  },
};

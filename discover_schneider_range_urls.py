"""
SAV catalog discovery — finds every individual product URL listed under a
Schneider Electric product-range or filtered listing page, so you don't
have to copy/paste each model's link by hand.

WHY THIS NEEDS A REAL BROWSER:
  Schneider's listing pages load their product grid via JavaScript after
  the page loads — the raw HTML has no product links in it at all.
  Playwright runs an actual (headless) Chromium browser, lets that
  JavaScript execute, then reads the links that appear.

HOW PAGINATION IS HANDLED:
  Schneider's listings use classic faceted-search URL parameters:
    No   = starting offset (0, 12, 24, 36, ...)
    Nrpp = number of results per page
  e.g. ...?No=0&Nrpp=12 is page 1, ...?No=12&Nrpp=12 is page 2, etc.
  This script builds those URLs directly and navigates to each one in
  turn -- far more reliable than trying to click a "next page" button,
  which this site doesn't seem to expose in a clickable way anyway.

  It stops automatically once a page adds zero new products, or after
  --max-pages (default 20).

USAGE:
    pip install playwright
    playwright install chromium      <- one-time, downloads the browser (~150MB)

    python discover_schneider_range_urls.py <listing-url> [--max-pages N] [--page-size N]

  If the URL you give it already has a "Nrpp=" in it, that page size is
  used automatically. Otherwise it defaults to 12 (confirmed working).

  Writes one product URL per line to range_urls.txt (appends, deduped).
  Feed that file straight into scrape_schneider_product.py afterwards:

    python scrape_schneider_product.py $(cat range_urls.txt)   # Mac/Linux/Git Bash
    Get-Content range_urls.txt | ForEach-Object { python scrape_schneider_product.py $_ }   # PowerShell, one at a time
"""

import sys
import re
from urllib.parse import urlsplit, urlunsplit, parse_qs, urlencode

from playwright.sync_api import sync_playwright

OUTPUT_FILE = "range_urls.txt"
DEFAULT_MAX_PAGES = 20
DEFAULT_PAGE_SIZE = 12

# Buttons Schneider's site might show to reveal more products within a
# single page load (Korean/English/Thai variants seen on their sites).
# Harmless to check for even though pagination is now URL-driven -- some
# listings may still have one of these on top of that.
LOAD_MORE_TEXTS = ["더 보기", "Load more", "Show more", "See more", "ดูเพิ่มเติม", "View all"]


def _build_paged_url(base_url: str, offset: int, page_size: int) -> str:
    parts = urlsplit(base_url)
    query = parse_qs(parts.query, keep_blank_values=True)
    query["No"] = [str(offset)]
    query["Nrpp"] = [str(page_size)]
    query.setdefault("uniqueCacheKey", ["v1"])
    new_query = urlencode(query, doseq=True)
    path = parts.path if parts.path.endswith("/") else parts.path + "/"
    return urlunsplit((parts.scheme, parts.netloc, path, new_query, "products"))


def _click_load_more_repeatedly(page):
    for _ in range(10):  # safety cap per page
        clicked = False
        for text in LOAD_MORE_TEXTS:
            btn = page.get_by_text(text, exact=False).first
            try:
                if btn.is_visible(timeout=500):
                    btn.click(timeout=2000)
                    page.wait_for_timeout(1200)
                    clicked = True
                    break
            except Exception:
                continue
        if not clicked:
            break


def _wait_for_stable_grid(page, max_checks: int = 18, poll_interval_ms: int = 700):
    """Polls the count of product links until it stops changing (seen the
    same count twice in a row), rather than just waiting for the first one
    to appear -- the grid renders progressively, so checking only once
    right after the first link shows up can catch it mid-load."""
    previous_count = -1
    for _ in range(max_checks):
        page.wait_for_timeout(poll_interval_ms)
        try:
            current_count = page.eval_on_selector_all(
                "a[href*='/product/']", "els => els.length"
            )
        except Exception:
            current_count = 0
        if current_count == previous_count and current_count > 0:
            return
        previous_count = current_count


def _extract_product_links(page) -> dict[str, str]:
    """Returns {sku: url}. Dedupes by SKU since the same product sometimes
    appears twice with different link-text slugs on the same page."""
    hrefs = page.eval_on_selector_all(
        "a[href*='/product/']", "els => els.map(e => e.href)"
    )
    sku_to_url: dict[str, str] = {}
    for href in hrefs:
        clean = href.split("?")[0]  # strip tracking params
        m = re.search(r"/product/([^/]+)/", clean)
        if not m:
            continue
        sku = m.group(1)
        if sku.lower() == "download-pdf":
            continue  # this is a document link, not a product page
        sku_to_url.setdefault(sku, clean)
    return sku_to_url


def discover(listing_url: str, max_pages: int = DEFAULT_MAX_PAGES, page_size: int = DEFAULT_PAGE_SIZE) -> list[str]:
    # If the URL already specifies Nrpp, respect it instead of the default.
    existing_query = parse_qs(urlsplit(listing_url).query)
    if "Nrpp" in existing_query:
        try:
            page_size = int(existing_query["Nrpp"][0])
        except ValueError:
            pass

    sku_to_url: dict[str, str] = {}

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        for page_num in range(max_pages):
            offset = page_num * page_size
            page_url = _build_paged_url(listing_url, offset, page_size)

            loaded = False
            for attempt in range(2):  # try twice before giving up on this page
                try:
                    page.goto(page_url, wait_until="domcontentloaded", timeout=30000)
                    page.wait_for_selector("a[href*='/product/']", timeout=15000)
                    _wait_for_stable_grid(page)
                    loaded = True
                    break
                except Exception as e:
                    print(f"  page {page_num + 1}: attempt {attempt + 1} failed ({e.__class__.__name__}), retrying..." if attempt == 0 else f"  page {page_num + 1}: failed twice, skipping ({e.__class__.__name__})")

            if not loaded:
                continue  # couldn't load this page after retrying -- move on rather than crash

            _click_load_more_repeatedly(page)

            page_links = _extract_product_links(page)
            raw_count = len(page_links)
            before = len(sku_to_url)
            sku_to_url.update(page_links)
            added = len(sku_to_url) - before
            print(f"  page {page_num + 1} (No={offset}): {raw_count} found on page, +{added} new, {len(sku_to_url)} total so far")

            if added == 0:
                break  # this page added nothing new -- we've reached the end

        browser.close()

    return sorted(sku_to_url.values())


def main(listing_url: str, max_pages: int, page_size: int):
    urls = discover(listing_url, max_pages=max_pages, page_size=page_size)
    if not urls:
        print(
            "No product links found. The page may need more time to load, or "
            "the site structure may differ from what this script expects — "
            "send me what you see and I'll adjust it."
        )
        return

    existing = set()
    try:
        with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
            existing = set(line.strip() for line in f if line.strip())
    except FileNotFoundError:
        pass

    new_urls = [u for u in urls if u not in existing]
    with open(OUTPUT_FILE, "a", encoding="utf-8") as f:
        for u in new_urls:
            f.write(u + "\n")

    print(f"\nFound {len(urls)} product URLs across all pages.")
    print(f"{len(new_urls)} new ones written to {OUTPUT_FILE} (skipped {len(urls) - len(new_urls)} duplicates).")


if __name__ == "__main__":
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        sys.exit(1)
    max_pages = DEFAULT_MAX_PAGES
    page_size = DEFAULT_PAGE_SIZE
    if "--max-pages" in args:
        idx = args.index("--max-pages")
        max_pages = int(args[idx + 1])
        del args[idx:idx + 2]
    if "--page-size" in args:
        idx = args.index("--page-size")
        page_size = int(args[idx + 1])
        del args[idx:idx + 2]
    url_arg = next((a for a in args if not a.startswith("--")), None)
    if not url_arg:
        print(__doc__)
        sys.exit(1)
    main(url_arg, max_pages, page_size)

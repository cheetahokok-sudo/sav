"""
SAV catalog discovery — finds every individual product URL listed under a
Schneider Electric product-RANGE page (e.g. the EOCR range), so you don't
have to copy/paste each model's link by hand.

WHY THIS NEEDS A REAL BROWSER:
  Schneider's range pages (like the EOCR listing) load their product grid
  via JavaScript after the page loads — the raw HTML has no product links
  in it at all. Playwright runs an actual (headless) Chromium browser, lets
  that JavaScript execute, then reads the links that appear — same as a
  human opening the page and scrolling through it.

USAGE:
    pip install playwright
    playwright install chromium      <- one-time, downloads the browser (~150MB)

    python discover_schneider_range_urls.py <range-url>

  Writes one product URL per line to range_urls.txt (appends, deduped).
  Feed that file straight into scrape_schneider_product.py afterwards:

    python scrape_schneider_product.py $(cat range_urls.txt)   # Mac/Linux/Git Bash
    Get-Content range_urls.txt | ForEach-Object { python scrape_schneider_product.py $_ }   # PowerShell, one at a time
"""

import sys
import re
import time

from playwright.sync_api import sync_playwright

OUTPUT_FILE = "range_urls.txt"

# Buttons Schneider's site might show to reveal more products (Korean/English/
# Thai variants seen on their sites). We click these repeatedly if present.
LOAD_MORE_TEXTS = ["더 보기", "Load more", "Show more", "See more", "ดูเพิ่มเติม", "View all"]


def discover(range_url: str) -> list[str]:
    found: set[str] = set()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(range_url, wait_until="networkidle", timeout=30000)

        # Give the product grid a moment to render after network idle
        page.wait_for_timeout(2000)

        # Click any "load more" style button repeatedly, in case the range
        # has more SKUs than fit on one screen (safety cap: 30 clicks)
        for _ in range(30):
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

        # Collect every link that looks like an individual product page
        hrefs = page.eval_on_selector_all(
            "a[href*='/product/']", "els => els.map(e => e.href)"
        )
        for href in hrefs:
            # Filter out the range/category links themselves, keep only
            # actual product detail pages (they have a SKU segment after /product/)
            if re.search(r"/product/[^/]+/", href):
                found.add(href.split("?")[0])  # strip tracking params

        browser.close()

    return sorted(found)


def main(range_url: str):
    urls = discover(range_url)
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

    print(f"Found {len(urls)} product URLs on this range page.")
    print(f"{len(new_urls)} new ones written to {OUTPUT_FILE} (skipped {len(urls) - len(new_urls)} duplicates).")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(__doc__)
        sys.exit(1)
    main(sys.argv[1])

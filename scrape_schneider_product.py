"""
SAV product archiver — pulls FACTUAL product data + official document LINKS
from a Schneider Electric (se.com) product page, into a JSON record you can
feed into your Supabase `products` table.

WHAT THIS DOES:
  - Extracts model number, product name, range, short description
  - Extracts the "end of sale" notice if present (this is exactly the info
    that disappears when Schneider eventually pulls the page)
  - Extracts LINKS to the official datasheet/user-guide/catalog PDFs and the
    product photo — it does NOT download and rehost copies of those files.

WHY IT WORKS THIS WAY:
  The numbers/facts above aren't copyrightable, so storing them on your own
  site is safe. The PDFs/photos themselves are Schneider's copyrighted files
  (the page literally tags them "LicenseRef-Proprietary") — rehosting copies
  without permission is the part to get sorted with Schneider directly
  (their distributor/partner support can usually just hand you a bulk asset
  pack with explicit reuse rights — that's both safer and higher quality
  than scraping the public photo anyway).

USAGE:
    pip install curl_cffi beautifulsoup4
    python scrape_schneider_product.py <product-url> [<product-url> ...]

  Outputs one JSON object per line (JSONL) to products_extracted.jsonl,
  appending so you can run it across your whole catalog over multiple
  sessions without losing earlier results.

  NOTE: se.com runs bot-protection that blocks plain Python `requests`
  traffic by its network fingerprint, regardless of headers. curl_cffi
  mimics a real Chrome browser's TLS/HTTP fingerprint to get past it.

  Most pages are server-rendered and curl_cffi alone is enough — but some
  product pages on se.com only render their content (image/docs) via
  JavaScript, same as the range listing pages. When that happens (detected
  as an empty result: no documents AND no image found), this script
  automatically retries that one page with a real headless browser
  (Playwright) instead. That needs:
    pip install playwright
    playwright install chromium
  (skip this if you've already set it up for discover_schneider_range_urls.py)
"""

import sys
import json
import re
import time
from datetime import datetime, timezone

from curl_cffi import requests
from bs4 import BeautifulSoup

OUTPUT_FILE = "products_extracted.jsonl"

# Playwright browser is started lazily, only the first time a page actually
# needs the JS-render fallback (most pages won't), and reused after that.
_pw_ctx = None
_pw_browser = None


def _get_browser():
    global _pw_ctx, _pw_browser
    if _pw_browser is None:
        from playwright.sync_api import sync_playwright

        _pw_ctx = sync_playwright().start()
        _pw_browser = _pw_ctx.chromium.launch(headless=True)
    return _pw_browser


def _fetch_rendered_html(url: str) -> str:
    page = _get_browser().new_page()
    try:
        page.goto(url, wait_until="networkidle", timeout=30000)
        page.wait_for_timeout(1500)
        return page.content()
    finally:
        page.close()


def shutdown_browser():
    global _pw_ctx, _pw_browser
    if _pw_browser is not None:
        _pw_browser.close()
        _pw_ctx.stop()
        _pw_browser = None
        _pw_ctx = None


def get_meta(soup: BeautifulSoup, *names: str) -> str | None:
    """Look for a <meta> tag by any of several possible name/property attrs."""
    for name in names:
        tag = soup.find("meta", attrs={"name": name}) or soup.find(
            "meta", attrs={"property": name}
        )
        if tag and tag.get("content"):
            return tag["content"].strip()
    return None


def _parse_html(url: str, html: str) -> dict:
    soup = BeautifulSoup(html, "html.parser")

    record = {
        "source_url": url,
        "scraped_at": datetime.now(timezone.utc).isoformat(),
        "model_number": get_meta(soup, "product-id", "og:product-id"),
        "title": get_meta(soup, "title", "og:title"),
        "range_name": get_meta(soup, "range-name"),
        "range_short_desc": get_meta(soup, "range-shortdesc"),
        "description": get_meta(soup, "description", "og:description"),
        "end_of_sale": None,
        "documents": [],  # list of {"label": ..., "url": ...} -- LINKS only
        "product_image_url": None,  # LINK only, not downloaded
    }

    # --- End-of-sale notice (Thai/Korean/English sites phrase this a few
    # different ways, so check a couple of common patterns in the page text)
    page_text = soup.get_text(" ", strip=True)
    label_match = re.search(
        r"End of [Ss]ale|판매\s*중단일|วันที่หยุดจำหน่าย", page_text
    )
    if label_match:
        window = page_text[label_match.end(): label_match.end() + 60]
        date_match = re.search(r"\d[\d.\-/\s]{2,25}\d\.?", window)
        if date_match:
            record["end_of_sale"] = date_match.group(0).strip()

    # --- Document links (datasheet, user guide, catalog, CAD)
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if "download-pdf" in href or "download.schneider-electric.com/files" in href:
            label = a.get_text(strip=True) or "Document"
            label = re.sub(r"action_download_stroke", "", label).strip()
            full_url = href if href.startswith("http") else f"https://www.se.com{href}"
            record["documents"].append({"label": label, "url": full_url})

    # --- Main product image (link only). Schneider explicitly shows a
    # "NoImageAvailable.png" placeholder when a product genuinely has no
    # photo -- treat that as a confirmed absence, not a parsing failure,
    # so we don't waste a browser-render retry on it.
    record["product_image_url"] = None
    image_confirmed_unavailable = False
    img = soup.find("img", alt=re.compile(r"Product picture", re.I))
    if img is None:  # fallback selector in case alt text differs by locale
        img = soup.find("img", src=re.compile(r"download\.schneider-electric\.com/files.*rendition"))
    if img and img.get("src"):
        src = img["src"]
        if "NoImageAvailable" in src:
            image_confirmed_unavailable = True
        else:
            record["product_image_url"] = src
    record["image_confirmed_unavailable"] = image_confirmed_unavailable

    return record


def extract_product(url: str) -> dict:
    resp = requests.get(url, impersonate="chrome124", timeout=20)
    resp.raise_for_status()
    record = _parse_html(url, resp.text)

    # If documents came back empty, OR the image is missing and we don't
    # already know it's confirmed unavailable (vs. a JS-shell parsing miss),
    # retry once with a real browser to be sure.
    needs_fallback = not record["documents"] or (
        not record["product_image_url"] and not record["image_confirmed_unavailable"]
    )
    if needs_fallback:
        try:
            rendered_html = _fetch_rendered_html(url)
            retried = _parse_html(url, rendered_html)
            retried["rendered_fallback_used"] = True
            return retried
        except Exception as e:
            record["rendered_fallback_used"] = False
            record["rendered_fallback_error"] = str(e)

    return record


def main(urls: list[str]):
    try:
        with open(OUTPUT_FILE, "a", encoding="utf-8") as f:
            for i, url in enumerate(urls):
                try:
                    record = extract_product(url)
                    f.write(json.dumps(record, ensure_ascii=False) + "\n")
                    tag = " (used browser fallback)" if record.get("rendered_fallback_used") else ""
                    print(f"[{i+1}/{len(urls)}] OK  -> {record.get('model_number') or url}{tag}")
                except Exception as e:
                    print(f"[{i+1}/{len(urls)}] FAIL -> {url}  ({e})")
                time.sleep(1.5)  # be polite, don't hammer their server
    finally:
        shutdown_browser()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    main(sys.argv[1:])

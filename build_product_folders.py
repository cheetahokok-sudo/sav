"""
Turns products_extracted.jsonl into a self-contained folder-per-product
structure under public/products/ -- pure static files, no database, no
external service. Drop the whole public/ folder into any static host
(GitHub Pages, Vercel, Netlify, a plain web server, anything) and it just
works, forever, with zero migration effort.

FOLDER LAYOUT PRODUCED:
    public/products/
      I3MS-WRDUWZ/
        data.json          <- all the facts/links for this product
                              (documents[].local_path points into ../../docs/)
      ...
      index.json           <- combined list of ALL products, for building a
                               simple client-side search/filter page without
                               needing any backend at all

    public/docs/
      <hash>_datasheet.pdf  <- only created if you pass --download.
      <hash>_catalog.pdf       Shared files (e.g. a catalog PDF that covers
      ...                      many models) are downloaded ONCE and reused
                               across every product that links to it --
                               not duplicated into every product's folder.

USAGE:
    # Step 1 (always safe): build the metadata folders + index
    python build_product_folders.py products_extracted.jsonl

    # Step 2 (optional, separate, on purpose): also download copies of the
    # actual photos/PDFs into public/docs/. Only run this once you're
    # comfortable with the copyright side (see README / our earlier
    # conversation) -- e.g. after Schneider's partner support confirms
    # you're fine to host their datasheets/photos directly.
    python build_product_folders.py products_extracted.jsonl --download

  Safe to re-run any time (e.g. after scraping more products): existing
  downloaded files on disk are reused, not re-downloaded.
"""

import sys
import json
import re
import hashlib
from pathlib import Path

PRODUCTS_DIR = Path("public/products")
DOCS_DIR = Path("public/docs")

# Schneider doesn't maintain English versions of the per-model datasheets for
# this Korea-origin range, but they do maintain ONE general English catalog
# covering the whole Samwha EOCR digital i-Series/DM-Series lineup. We add it
# to every product as a supplementary resource (clearly labeled as a general
# catalog, not a model-specific datasheet) so customers get *something* in
# English rather than nothing. Source: Schneider Electric India FAQ FA386399,
# still actively maintained as of Jan 2026.
SUPPLEMENTARY_DOCS = [
    {
        "label": "EOCR Catalog (English)",
        "url": "https://download.schneider-electric.com/files?p_enDocType=Catalog&p_File_Name=EOCR+catalog_EN.pdf&p_Doc_Ref=1588-2630",
    },
]

# Cache of source URL -> local absolute path (e.g. "/docs/ab12cd34_catalog.pdf"),
# shared across the whole run so a file referenced by many products is only
# ever downloaded once.
_download_cache: dict[str, str] = {}


def slugify_filename(label: str, url: str) -> str:
    """Turn a document label into a safe filename, falling back to the
    original filename in the URL if the label is empty/generic."""
    base = re.sub(r"[^\w\-]+", "_", label.strip()).strip("_").lower()
    if not base or base == "document":
        base = Path(url.split("?")[0]).stem or "document"
    return base


def _get_or_download(session, url: str, label_hint: str, default_ext: str = ".pdf") -> str | None:
    """Returns the local absolute path (e.g. "/docs/<hash>_name.pdf") for a
    given source URL, downloading it into the shared public/docs/ folder
    only if it hasn't already been fetched (this run OR a previous run)."""
    if not url:
        return None
    if url in _download_cache:
        return _download_cache[url]

    DOCS_DIR.mkdir(parents=True, exist_ok=True)
    url_hash = hashlib.sha1(url.encode()).hexdigest()[:10]
    ext = Path(url.split("?")[0]).suffix
    ext = ext if ext and len(ext) <= 5 else default_ext
    filename = f"{url_hash}_{slugify_filename(label_hint, url)}{ext}"
    dest = DOCS_DIR / filename
    local_path = f"/docs/{filename}"

    if dest.exists():
        _download_cache[url] = local_path  # already downloaded in a prior run
        return local_path

    try:
        resp = session.get(url, impersonate="chrome124", timeout=30)
        resp.raise_for_status()
        dest.write_bytes(resp.content)
        _download_cache[url] = local_path
        return local_path
    except Exception as e:
        print(f"    ! failed to download {url} -> {e}")
        return None


def build_folders(records: list[dict], download: bool):
    PRODUCTS_DIR.mkdir(parents=True, exist_ok=True)
    index = []

    # Only import curl_cffi if we're actually downloading -- keeps step 1
    # dependency-free (no curl_cffi needed just to build folders/JSON).
    session = None
    if download:
        from curl_cffi import requests as cf_requests
        session = cf_requests

    reused = 0
    fetched = 0

    for record in records:
        model = record.get("model_number")
        if not model:
            continue
        folder = PRODUCTS_DIR / model
        folder.mkdir(parents=True, exist_ok=True)

        local_documents = []
        all_docs = list(record.get("documents", [])) + SUPPLEMENTARY_DOCS
        for doc in all_docs:
            local_path = None
            if download and doc.get("url"):
                was_cached = doc["url"] in _download_cache or (
                    DOCS_DIR / f"{hashlib.sha1(doc['url'].encode()).hexdigest()[:10]}_{slugify_filename(doc.get('label', ''), doc['url'])}{Path(doc['url'].split('?')[0]).suffix or '.pdf'}"
                ).exists()
                local_path = _get_or_download(session, doc["url"], doc.get("label", "document"))
                if local_path:
                    if was_cached:
                        reused += 1
                    else:
                        fetched += 1
            local_documents.append({
                "label": doc.get("label"),
                "official_url": doc.get("url"),
                "local_path": local_path,
            })

        local_photo_path = None
        if download and record.get("product_image_url"):
            local_photo_path = _get_or_download(
                session, record["product_image_url"], "photo", default_ext=".jpg"
            )

        data = {
            "model_number": model,
            "title": record.get("title"),
            "range_name": record.get("range_name"),
            "range_short_desc": record.get("range_short_desc"),
            "description": record.get("description"),
            "end_of_sale": record.get("end_of_sale"),
            "official_image_url": record.get("product_image_url"),
            "local_photo_path": local_photo_path,
            "image_confirmed_unavailable": record.get("image_confirmed_unavailable", False),
            "documents": local_documents,
            "source_url": record.get("source_url"),
            "scraped_at": record.get("scraped_at"),

            # Fill these in yourself -- the scraper doesn't know them:
            "category": None,
            "in_stock": True,
            "your_price": None,
            "your_notes": None,
        }

        with open(folder / "data.json", "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

        index.append(data)
        print(f"  {model}: folder ready" + (" (files linked)" if download else ""))

    with open(PRODUCTS_DIR / "index.json", "w", encoding="utf-8") as f:
        json.dump(index, f, indent=2, ensure_ascii=False)

    print(f"\n{len(index)} product folders written to {PRODUCTS_DIR}/")
    print(f"Combined index written to {PRODUCTS_DIR}/index.json")
    if download:
        print(f"Documents: {fetched} newly downloaded, {reused} reused (already had them / shared across products)")


def main(jsonl_path: str, download: bool):
    records = []
    with open(jsonl_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                records.append(json.loads(line))

    if download:
        print(
            "Downloading actual photo/PDF copies into public/docs/ (shared, deduped by URL).\n"
            "(Make sure you're comfortable with hosting Schneider's copyrighted "
            "files directly -- see the note at the top of this script.)\n"
        )
    build_folders(records, download)


if __name__ == "__main__":
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        sys.exit(1)
    download_flag = "--download" in args
    jsonl_arg = next((a for a in args if not a.startswith("--")), None)
    if not jsonl_arg:
        print(__doc__)
        sys.exit(1)
    main(jsonl_arg, download_flag)

"""
Turns products_extracted.jsonl into a self-contained folder-per-product
structure under public/products/ -- pure static files, no database, no
external service. Drop the whole public/products/ folder into any static
host (GitHub Pages, Vercel, Netlify, a plain web server, anything) and it
just works, forever, with zero migration effort.

FOLDER LAYOUT PRODUCED:
    public/products/
      I3MS-WRDUWZ/
        data.json          <- all the facts/links for this product
      I3MS-WRDUWZ/photo.jpg        )  only created if you pass --download
      I3MS-WRDUWZ/datasheet.pdf    )  (see the warning below)
      ...
      index.json           <- combined list of ALL products, for building a
                               simple client-side search/filter page without
                               needing any backend at all

USAGE:
    # Step 1 (always safe): build the metadata folders + index
    python build_product_folders.py products_extracted.jsonl

    # Step 2 (optional, separate, on purpose): also download copies of the
    # actual photos/PDFs into each folder. Only run this once you're
    # comfortable with the copyright side (see README / our earlier
    # conversation) -- e.g. after Schneider's partner support confirms
    # you're fine to host their datasheets/photos directly.
    python build_product_folders.py products_extracted.jsonl --download
"""

import sys
import json
import re
from pathlib import Path

OUTPUT_DIR = Path("public/products")


def slugify_filename(label: str, url: str) -> str:
    """Turn a document label into a safe filename, falling back to the
    original filename in the URL if the label is empty/generic."""
    base = re.sub(r"[^\w\-]+", "_", label.strip()).strip("_").lower()
    if not base or base == "document":
        base = Path(url.split("?")[0]).stem or "document"
    return base + ".pdf"


def build_folders(records: list[dict], download: bool):
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    index = []

    # Only import requests if we're actually downloading -- keeps step 1
    # dependency-free (no curl_cffi needed just to build folders/JSON).
    session = None
    if download:
        from curl_cffi import requests as cf_requests
        session = cf_requests

    for record in records:
        model = record.get("model_number")
        if not model:
            continue
        folder = OUTPUT_DIR / model
        folder.mkdir(parents=True, exist_ok=True)

        local_documents = []
        for doc in record.get("documents", []):
            filename = slugify_filename(doc.get("label", ""), doc.get("url", ""))
            local_documents.append({
                "label": doc.get("label"),
                "official_url": doc.get("url"),
                "local_path": f"/products/{model}/{filename}" if download else None,
            })
            if download and doc.get("url"):
                _download(session, doc["url"], folder / filename)

        local_photo_path = None
        if record.get("product_image_url"):
            ext = Path(record["product_image_url"].split("?")[0]).suffix or ".jpg"
            ext = ext if len(ext) <= 5 else ".jpg"
            if download:
                local_photo_path = f"/products/{model}/photo{ext}"
                _download(session, record["product_image_url"], folder / f"photo{ext}")

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
        print(f"  {model}: folder ready" + (" (files downloaded)" if download else ""))

    with open(OUTPUT_DIR / "index.json", "w", encoding="utf-8") as f:
        json.dump(index, f, indent=2, ensure_ascii=False)

    print(f"\n{len(index)} product folders written to {OUTPUT_DIR}/")
    print(f"Combined index written to {OUTPUT_DIR}/index.json")


def _download(session, url: str, dest: Path):
    try:
        resp = session.get(url, impersonate="chrome124", timeout=30)
        resp.raise_for_status()
        dest.write_bytes(resp.content)
    except Exception as e:
        print(f"    ! failed to download {url} -> {e}")


def main(jsonl_path: str, download: bool):
    records = []
    with open(jsonl_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                records.append(json.loads(line))

    if download:
        print(
            "Downloading actual photo/PDF copies into each folder.\n"
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

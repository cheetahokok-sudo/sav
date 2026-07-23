# ============================================================================
# Schneider EG English datasheet enrichment for savautomation.com
#
# For every EOCR-range model in public/products/index.json, downloads the
# GENERATED English per-SKU datasheet from Schneider Egypt:
#     https://www.se.com/eg/en/product/download-pdf/<SKU>
# rehosts it in public/docs/ (owner is a direct importer — same treatment as
# every other doc on the site), and inserts it as the FIRST document of the
# entry with the label "Product Datasheet (English, PDF)". Idempotent:
# existing files are kept, a prior entry with the same label is replaced.
#
# For EUCR-05S it additionally parses the owner-supplied EG product page for
# extra English doc links (user guide / instruction sheet).
#
# se.com blocks plain HTTP clients by TLS fingerprint; curl_cffi with
# impersonate="chrome124" is the proven bypass (see scrape_schneider_product.py).
#
# Run:  python enrich_schneider_eg.py
# ============================================================================
import hashlib
import io
import json
import os
import re
import sys
import time
from html import unescape

from curl_cffi import requests

ROOT = os.path.dirname(os.path.abspath(__file__))
DOCS = os.path.join(ROOT, "public", "docs")
PROD = os.path.join(ROOT, "public", "products")
INDEX = os.path.join(PROD, "index.json")

DS_LABEL = "Product Datasheet (English, PDF)"
EUCR05S_PAGE = ("https://www.se.com/eg/en/product/EUCR-05S/"
                "electronic-undercurrent-relay-eocr-digital-0-5-to-6a-24-to-240vac-dc-standard/")


def sha10(s):
    return hashlib.sha1(s.encode("utf-8")).hexdigest()[:10]


def get(url, timeout=60):
    return requests.get(url, impersonate="chrome124", timeout=timeout)


def fetch_datasheet(model):
    """Download the generated English datasheet; returns local_path or None."""
    fname = f"{sha10(model + '-eg-datasheet')}_{model}_Datasheet_EN.pdf"
    out = os.path.join(DOCS, fname)
    if os.path.exists(out) and os.path.getsize(out) > 1000:
        return f"/docs/{fname}", "cached"
    url = f"https://www.se.com/eg/en/product/download-pdf/{model}"
    note = "?"
    for attempt in (1, 2):
        try:
            r = get(url, timeout=90)
            if r.status_code == 200 and r.content[:5] == b"%PDF-" and len(r.content) > 20000:
                with open(out, "wb") as f:
                    f.write(r.content)
                return f"/docs/{fname}", f"{len(r.content)} B"
            note = f"HTTP {r.status_code}, {len(r.content)} B, pdf={r.content[:5] == b'%PDF-'}"
        except Exception as e:  # noqa: BLE001 — report, don't crash the batch
            note = str(e)
        if attempt == 1:
            time.sleep(4)
    return None, note


def main():
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    idx = json.load(io.open(INDEX, encoding="utf-8"))
    eocr = [e for e in idx if e.get("range_name") != "DSP"]
    print(f"{len(eocr)} EOCR models", flush=True)

    # Generation time varies wildly per SKU (4s to >60s) — a serial loop
    # takes hours in the worst case. A small pool keeps wall-clock sane
    # without hammering the server.
    from concurrent.futures import ThreadPoolExecutor

    ok, failed = 0, []
    with ThreadPoolExecutor(max_workers=4) as pool:
        results = pool.map(lambda e: (e, *fetch_datasheet(e["model_number"])), eocr)
        for e, local, note in results:
            model = e["model_number"]
            if local:
                ok += 1
                doc = {
                    "label": DS_LABEL,
                    "official_url": f"https://www.se.com/eg/en/product/download-pdf/{model}",
                    "local_path": local,
                }
                e["documents"] = [doc] + [d for d in e["documents"] if d.get("label") != DS_LABEL]
                print(f"  {model}: {note}", flush=True)
            else:
                failed.append((model, note))
                print(f"  !! {model}: {note}", flush=True)

    # EUCR-05S: extra English docs from the owner-supplied EG page
    try:
        page = get(EUCR05S_PAGE).text
        e05 = next(x for x in idx if x["model_number"] == "EUCR-05S")
        added = 0
        for m in re.finditer(
            r'href="(https://download\.schneider-electric\.com/files[^"]+|/eg/en/download/document/[^"]+)"[^>]*>([^<]{3,60})<',
            page,
        ):
            url, label = unescape(m.group(1)), m.group(2).strip()
            if url.startswith("/"):
                url = "https://www.se.com" + url
            if any(d.get("official_url") == url for d in e05["documents"]):
                continue
            safe = re.sub(r"[^A-Za-z0-9._-]+", "_", label)[:40].strip("_") or "document"
            fname = f"{sha10(url)}_EUCR-05S_{safe}.pdf"
            out = os.path.join(DOCS, fname)
            try:
                r = get(url, timeout=120)
                if r.status_code == 200 and r.content[:5] == b"%PDF-":
                    with open(out, "wb") as f:
                        f.write(r.content)
                    e05["documents"].append({
                        "label": f"{label} (English)",
                        "official_url": url,
                        "local_path": f"/docs/{fname}",
                    })
                    added += 1
                    print(f"  EUCR-05S extra doc: {label!r} ({len(r.content)} B)")
            except Exception as ex:  # noqa: BLE001
                print(f"  !! EUCR-05S extra doc {label!r}: {ex}")
            time.sleep(1.0)
        print(f"EUCR-05S extra docs added: {added}")
    except Exception as ex:  # noqa: BLE001
        print(f"!! EUCR-05S page parse failed: {ex}")

    io.open(INDEX, "w", encoding="utf-8").write(json.dumps(idx, ensure_ascii=False, indent=1))
    n = 0
    for e in idx:
        dp = os.path.join(PROD, e["model_number"], "data.json")
        if os.path.exists(os.path.dirname(dp)):
            io.open(dp, "w", encoding="utf-8").write(json.dumps(e, ensure_ascii=False, indent=1))
            n += 1
    print(f"\ndatasheets: {ok}/{len(eocr)} | failed: {failed or 'none'} | data.json mirrored: {n}")


if __name__ == "__main__":
    main()

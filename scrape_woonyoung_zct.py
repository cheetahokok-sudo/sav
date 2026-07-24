# ============================================================================
# Woonyoung ZCT catalog builder for savautomation.com
#
# Adds the Woonyoung Zero-Current Transformer (ZCT) category: the 16 WYZR
# Round (cable-through) models SAV sells, presented as TWO series entries
# (owner decision 2026-07-25):
#   WYZR-N : WYZR-030N..200N  output 200mA / 1.5mA   (detail idx=448)
#   WYZR   : WYZR-030..200    output 200mA / 100mV   (detail idx=176)
#
# Sources on woonyoung.com (recon-verified 2026-07-25): per-TYPE detail pages
# carry the product photo, a dimension drawing, and 3 feature bullets; the
# gnuboard document boards carry the spec PDF + certificate (direct
# /data/file/ links) and the CAD DWG / 3D STEP files (download.php, which
# requires a session cookie from first visiting the board page).
#
# No-guess rule: specs below are only what the pages publish (rating/input/
# output/type + member model list). Per-model dimensions stay in the rehosted
# dimension drawing + datasheet PDF — not transcribed.
#
# Run:  python scrape_woonyoung_zct.py
# Re-runnable: docs are hash-named and cached; entries replaced by
# model_number; EOCR/DSP entries never touched.
# ============================================================================
import hashlib
import http.cookiejar
import io
import json
import os
import re
import time
import urllib.parse
import urllib.request

BASE = "https://woonyoung.com"
HDRS = {"User-Agent": "Mozilla/5.0 (compatible; SAV-catalog-build)"}
ROOT = os.path.dirname(os.path.abspath(__file__))
DOCS = os.path.join(ROOT, "public", "docs")
PROD = os.path.join(ROOT, "public", "products")
INDEX = os.path.join(PROD, "index.json")

# one opener with a cookie jar — gnuboard's download.php rejects requests
# ("잘못된 접근입니다") unless the session previously viewed the board page
JAR = http.cookiejar.CookieJar()
OPENER = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(JAR))


def get(url, referer=None):
    h = dict(HDRS)
    if referer:
        h["Referer"] = referer
    req = urllib.request.Request(urllib.parse.quote(url, safe=":/?&=%+"), headers=h)
    data = OPENER.open(req, timeout=120).read()
    time.sleep(0.4)
    return data


def sha10(s):
    return hashlib.sha1(s.encode("utf-8")).hexdigest()[:10]


def rehost(name, url, referer, min_bytes=1000, magic=None):
    """Download url -> public/docs/<sha10(name)>_<safe>; returns /docs/ path."""
    # sanitize, truncating the STEM only so the extension always survives
    stem, dot, ext = name.rpartition(".")
    if not dot:
        stem, ext = name, ""
    stem = re.sub(r"[^A-Za-z0-9._-]+", "_", stem)[:56].strip("_")
    safe = f"{stem}.{ext}" if ext else stem
    fname = f"{sha10(name)}_{safe}"
    path = os.path.join(DOCS, fname)
    if os.path.exists(path) and os.path.getsize(path) > min_bytes:
        print(f"  cached  {name}")
        return f"/docs/{fname}"
    data = get(url, referer)
    if len(data) < min_bytes:
        raise RuntimeError(f"too small ({len(data)} B)")
    if magic and not data.startswith(magic):
        raise RuntimeError(f"bad magic {data[:8]!r}")
    if data[:9].lower().startswith(b"<!doctype") or data[:5].lower() == b"<html":
        raise RuntimeError("got HTML instead of a file (session/permission?)")
    with open(path, "wb") as f:
        f.write(data)
    print(f"  fetched {name} ({len(data)} B)")
    return f"/docs/{fname}"


def board_files(bo_table, wr_id):
    """Return [(filename, download_url, board_url)] for a gnuboard post.
    Prefers direct /data/file/ links; falls back to download.php links
    (which need the session established by this very board-page visit)."""
    board_url = f"{BASE}/bbs/board.php?bo_table={bo_table}&wr_id={wr_id}"
    html = get(board_url).decode("utf-8", "replace")
    out = []
    # anchor blocks: <a href="..."><strong>NAME</strong> ...
    for m in re.finditer(
        r'<a href="([^"]+)"[^>]*class="view_file_download"[^>]*>\s*'
        r"<strong>([^<]+)</strong>",
        html,
    ):
        href, name = m.group(1), m.group(2).strip()
        href = href.replace("&amp;", "&")
        if href.startswith("/"):
            href = BASE + href
        out.append((name, href, board_url))
    return out


SERIES = [
    {
        "model_number": "WYZR-N",
        "members": ["WYZR-030N", "WYZR-050N", "WYZR-065N", "WYZR-080N",
                    "WYZR-100N", "WYZR-120N", "WYZR-150N", "WYZR-200N"],
        "output": "1.5 mA",
        "detail": f"{BASE}/eng/page/s0201_view.php?ocatecode=1337921354&idx=448"
                  "&gcname=x&gnsub=x&ogcname=Zero-Current+Trans",
        "photo": f"{BASE}/data/item/2943611486_JZrGW1vL_"
                 "7cde499d06ad16773bab88d04aa53ef423b6bf65.jpg",
        "dim": f"{BASE}/data/ckeditor_img/2943611486_aabc078d_zct+dim.jpg",
        "boards": [("specification", 545, "Specification / Datasheet"),
                   ("certificate", 65, "Certificate"),
                   ("cad", 493, "CAD drawing"),
                   ("3Dcad", 320, "3D model")],
    },
    {
        "model_number": "WYZR",
        "members": ["WYZR-030", "WYZR-050", "WYZR-065", "WYZR-080",
                    "WYZR-100", "WYZR-120", "WYZR-150", "WYZR-200"],
        "output": "100 mV",
        "detail": f"{BASE}/eng/page/s0201_view.php?ocatecode=1337921354&idx=176"
                  "&gcname=x&gnsub=x&ogcname=Zero-Current+Trans",
        "photo": f"{BASE}/data/item/2943611486_4EgZfniG_"
                 "8815e233328fa6561238e913beb916895742e95e.jpg",
        "dim": f"{BASE}/data/ckeditor_img/2943611486_1347b1de_zct+dim.jpg",
        "boards": [("specification", 543, "Specification / Datasheet"),
                   ("cad", 493, "CAD drawing"),
                   ("3Dcad", 320, "3D model")],
    },
]

# feature text as published on both detail pages (verified identical)
FEATURES = [
    "ABS flame proof resin for self-extinguish stability",
    "Light weighted structure without using filler inside",
    "Terminal cover for safety",
]


def ext_label(name, kind):
    ext = name.rsplit(".", 1)[-1].upper() if "." in name else ""
    stem = name.rsplit(".", 1)[0]
    return f"{kind} {stem} ({ext})" if kind in ("CAD drawing", "3D model") \
        else f"{kind} ({ext})"


def build_entry(s):
    members = ", ".join(s["members"])
    rng = f"{s['members'][0]}–{s['members'][-1]}"
    print(f"\n== {s['model_number']} ({rng}) ==")

    docs = []
    # photo + dimension drawing
    photo_local = None
    try:
        photo_local = rehost(f"{s['model_number']}_photo.jpg", s["photo"], s["detail"])
    except Exception as e:
        print(f"  !! photo failed: {e}")
    try:
        p = rehost(f"{s['model_number']}_dimensions.jpg", s["dim"], s["detail"])
        docs.append({"label": "Dimension drawing (JPG)",
                     "official_url": s["dim"], "local_path": p})
    except Exception as e:
        print(f"  !! dim drawing failed: {e}")

    # board documents
    for bo, wr, kind in s["boards"]:
        try:
            files = board_files(bo, wr)
        except Exception as e:
            print(f"  !! board {bo}/{wr} failed: {e}")
            continue
        if not files:
            print(f"  (board {bo}/{wr}: no files found)")
        for name, url, referer in files:
            try:
                p = rehost(name, url, referer)
                docs.append({"label": ext_label(name, kind),
                             "official_url": url, "local_path": p})
            except Exception as e:
                print(f"  !! {name}: {e}")

    return {
        "model_number": s["model_number"],
        "title": f"{rng} - Zero-Current Transformer (ZCT), "
                 f"Round type, 200mA / {s['output']}",
        "range_name": "ZCT",
        "brand": "Woonyoung",
        "series": "Zero-Current Transformer (Round type)",
        "base_model": "WYZR",
        "range_short_desc": "Woonyoung zero-phase current transformers (ZCT)",
        "description": (
            f"Woonyoung zero-phase current transformer (ZCT), round "
            f"cable-through type, output 200 mA / {s['output']}. Series "
            f"models: {members}. Rating AC 600 V or below, 50/60 Hz. "
            f"Per-model dimensions are in the dimension drawing and datasheet."),
        "feature_groups": [{"title": "Main Feature", "items": FEATURES}],
        # NOTE: spec rows are STRINGS "label : value" — the detail page's
        # splitRow() regex-splits each row into two cells
        "specs": [
            {"group": "Rating (as published)", "rows": [
                "Type : Round (cable-through)",
                "Rated voltage : AC 600 V or below",
                "Frequency : 50/60 Hz",
                "Input : 200 mA",
                f"Output : {s['output']}",
            ]},
            {"group": "Models in this series", "rows": [
                f"{m} : dimensions per drawing & datasheet" for m in s["members"]
            ]},
        ],
        "oem": False,
        "needs_review": False,
        "end_of_sale": None,
        "official_image_url": s["photo"],
        "local_photo_path": photo_local,
        "image_confirmed_unavailable": photo_local is None,
        "documents": docs,
        "source_url": s["detail"],
        "scraped_at": time.strftime("%Y-%m-%dT%H:%M:%S+00:00", time.gmtime()),
        "category": None,
        "in_stock": True,
        "your_price": None,
        "your_notes": "ใช้คู่กับรีเลย์ earth-leakage (EOCR/DSP รุ่นที่รับ ZCT)",
    }


def main():
    os.makedirs(DOCS, exist_ok=True)
    entries = [build_entry(s) for s in SERIES]

    ours = {e["model_number"] for e in entries}
    idx = json.load(io.open(INDEX, encoding="utf-8"))
    keep = [e for e in idx if e["model_number"] not in ours]
    merged = keep + entries
    io.open(INDEX, "w", encoding="utf-8").write(
        json.dumps(merged, ensure_ascii=False, indent=1))
    print(f"\nindex.json: {len(keep)} kept + {len(entries)} ZCT = {len(merged)}")

    for e in entries:
        d = os.path.join(PROD, e["model_number"])
        os.makedirs(d, exist_ok=True)
        io.open(os.path.join(d, "data.json"), "w", encoding="utf-8").write(
            json.dumps(e, ensure_ascii=False, indent=1))
    print("per-model data.json written")

    for e in entries:
        n_ok = sum(1 for x in e["documents"] if x["local_path"])
        print(f"{e['model_number']}: {n_ok} docs rehosted, "
              f"photo={'OK' if e['local_photo_path'] else 'MISSING'}")


if __name__ == "__main__":
    import sys
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    main()

# ============================================================================
# Samwha DSP catalog builder for savautomation.com
#
# Scrapes the series detail pages on samwhadsp.com for the DSP models SAV
# actually sells (MODEL_MAP below, owner-supplied 2026-07-23), extracts the
# Main Feature list + Technical Specification tree AS PUBLISHED (no-guess
# rule: nothing is added that isn't in the source text), downloads datasheet/
# CAD/catalog files for local rehosting (SAV is a direct importer — same
# treatment as the Schneider EOCR docs), and merges entries into
# public/products/index.json + per-model public/products/<MODEL>/data.json.
#
# Run:  python scrape_samwha_dsp.py            (uses/refreshes .samwha_cache/)
#       python scrape_samwha_dsp.py --dry-run  (print the model->page map only)
#
# Re-runnable: existing docs are kept (hash-named), entries are replaced by
# model_number, EOCR entries are never touched.
# ============================================================================
import hashlib
import io
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request
from html import unescape

BASE = "https://www.samwhadsp.com"
HDRS = {"User-Agent": "Mozilla/5.0 (compatible; SAV-catalog-build)"}
ROOT = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(ROOT, ".samwha_cache")
DOCS = os.path.join(ROOT, "public", "docs")
PROD = os.path.join(ROOT, "public", "products")
INDEX = os.path.join(PROD, "index.json")

# ---------------------------------------------------------------------------
# Owner's 36 models -> Samwha series detail page. Page IDs verified 2026-07-23
# by crawling /eng/products/126..132 to closure and reading each page's own
# heading. `review` marks mappings inferred from naming that the owner should
# eyeball once (easy to re-point + re-run).
# ---------------------------------------------------------------------------
M = lambda page, note=None, oem=False, review=False, series=None: {
    "page": page, "note": note, "oem": oem, "review": review, "series": series}

MODEL_MAP = {
    "DSP-AOM-10Z7":      M("D93RP00168", note="รุ่นขายดีที่สุดของ SAV (best seller)"),
    "DSP-AOM-70Z7-ZCT":  M("D93RP00168", note="รุ่นยอดนิยม งบประมาณคุ้มค่า พร้อม ZCT ในตัว (embedded ZCT)"),
    "DSP-AOL-10Z7":      M("D93RP00169"),
    "DSP-AOL-10Z7-ZCT":  M("D93RP00169", note="พร้อม ZCT ในตัว (embedded ZCT)"),
    "DSP-AOM-N":         M("D93RP00167"),
    "DSP-CCL-10Z7":      M("D93RP00180"),
    "DSP-CCM-10Z7":      M("D93RP00179"),
    "DSP-CSL-10Z7":      M("D93RP00178"),
    "DSP-CSM-10Z7":      M("D93RP00177"),
    "DSP-CTM-10Z7":      M("D93RP00181"),
    "DSP-COM-10Z7":      M("D93RP00183"),
    "DSP-COM-70Z7":      M("D93RP00183"),
    "DSP-PCM-10Z7":      M("D93RP00186"),
    "DSP-PCM-10Z7-CT3000": M("D93RP00186", oem=True,
                             note="รุ่น OEM — รายละเอียดเพิ่มเติมติดต่อ SAV"),
    "DSP-PTL-10Z7":      M("D93RP00189"),
    "DSP-PTM-10Z7-CT3000": M("D93RP00188", oem=True,
                             note="รุ่น OEM — รายละเอียดเพิ่มเติมติดต่อ SAV"),
    "DSP-5TM-70Z7":      M("D93RP00195", series="DSP-VIP-5 Series"),
    "DSP-VIP-5CM-70Z7":  M("D93RP00193"),
    "DSP-VIP-5CL-70Z7":  M("D93RP00194"),
    "DSP-VIP-5TL-70Z7":  M("D93RP00196"),
    "DSP-VIP-5EM-70Z7":  M("D93RP00197"),
    "DSP-VIP-5EL-70Z7":  M("D93RP00198"),
    "DSP-VIP-4EM50Z7":   M("D93RP00197", review=True,
                           note="แมปกับหน้า 5EM series — รอยืนยันรุ่น 4EM"),
    "DSP-VIP-RTM-1Z7":   M("D93RP00199"),
    "DSP-VIP-RTM-70Z7":  M("D93RP00199"),
    "DSP-VIP-RTM-70Z7-FASCIO-PT3": M("D93RP00199", oem=True,
                                     note="รุ่น OEM — รายละเอียดเพิ่มเติมติดต่อ SAV"),
    "DSP-VIP-CM-1Z7":    M("D93RP00201", review=True,
                           note="แมปกับหน้า VIP-RM — รอยืนยันรุ่น VIP-CM"),
    "DSP-VIP-CM-3Z7":    M("D93RP00201", review=True,
                           note="แมปกับหน้า VIP-RM — รอยืนยันรุ่น VIP-CM"),
    "DSP-VIP-CM-7Z7":    M("D93RP00201", review=True,
                           note="แมปกับหน้า VIP-RM — รอยืนยันรุ่น VIP-CM"),
    "DSP-PM-1Z7":        M("D93RP00203", review=True,
                           note="แมปกับหน้า VIP-PM (power type) — รอยืนยัน"),
    "DSP-PM-3Z7":        M("D93RP00203", review=True,
                           note="แมปกับหน้า VIP-PM (power type) — รอยืนยัน"),
    "DSP-PM-70Z7":       M("D93RP00203", review=True,
                           note="แมปกับหน้า VIP-PM (power type) — รอยืนยัน"),
    "DSP-RTM":           M("D93RP00013", review=True, series="Motor Working Recorder",
                           note="แมปกับหน้า Motor Working Recorder — รอยืนยัน"),
    "DSP-CM44":          M("D93RP00014", note="โมดูลสื่อสาร RS485 สำหรับรุ่น RTM"),
    "DSP-DGFR-A":        M("D93RP00144", review=True,
                           note="แมปกับหน้า DSP-DGFR — รอยืนยันรุ่น -A"),
    "DSP-SDTR":          M("D93RP00150", series="Digital Shut Down Turn-over Relay"),
}

# ---------------------------------------------------------------------------
def fetch(url, cache_name):
    os.makedirs(CACHE, exist_ok=True)
    p = os.path.join(CACHE, cache_name)
    if os.path.exists(p) and os.path.getsize(p) > 5000:
        return io.open(p, encoding="utf-8", errors="replace").read()
    req = urllib.request.Request(url, headers=HDRS)
    html = urllib.request.urlopen(req, timeout=30).read().decode("utf-8", "replace")
    io.open(p, "w", encoding="utf-8", errors="replace").write(html)
    time.sleep(0.5)
    return html


def dl_file(url, referer, out_path):
    if os.path.exists(out_path) and os.path.getsize(out_path) > 1000:
        return "cached"
    # percent-encode non-ASCII (Korean filenames in name=) — urllib requires
    # an ASCII-only URL and errors otherwise
    url = urllib.parse.quote(url, safe=":/?&=%+")
    req = urllib.request.Request(url, headers={**HDRS, "Referer": referer})
    data = urllib.request.urlopen(req, timeout=120).read()
    if len(data) < 500:
        raise RuntimeError(f"suspiciously small download ({len(data)} B)")
    with open(out_path, "wb") as f:
        f.write(data)
    time.sleep(0.4)
    return f"{len(data)} B"


def sha10(s):
    return hashlib.sha1(s.encode("utf-8")).hexdigest()[:10]


def clean_text(t):
    t = unescape(t)
    t = t.replace("\xa0", " ")
    return re.sub(r"\s+", " ", t).strip()


# --- section parsing --------------------------------------------------------
def content_sections(html):
    """Yield (heading, inner_html) for each <div class="section content"> block."""
    out = []
    for m in re.finditer(
        r'<div class="section content">\s*<div class="title">\s*<span>\s*([^<]+?)\s*</span>\s*</div>\s*<div class="content">([\s\S]*?)</div>\s*</div>',
        html,
    ):
        out.append((clean_text(m.group(1)), m.group(2)))
    return out


def parse_li_tree(inner_html):
    """Parse the top-level <li> items of the first <ul>; each item is
    (text, [child texts...]) with one nesting level flattened below it."""
    items = []
    # split on top-level <li> — the markup is regular enough for a simple pass
    for li in re.finditer(r"<li>([\s\S]*?)</li>(?![\s\S]{0,40}</ul>\s*</li>)", inner_html):
        pass  # (unused — replaced by the tokenizer below)
    # tokenizer: walk tags, tracking depth
    tokens = re.split(r"(<[^>]+>)", inner_html)
    depth, cur, top, children = 0, None, [], []
    buf = ""
    for tok in tokens:
        if not tok:
            continue
        if tok.startswith("<ul"):
            if depth == 1 and buf.strip():
                cur = clean_text(re.sub(r"<[^>]+>", " ", buf)); buf = ""
            depth += 1
        elif tok.startswith("</ul"):
            depth -= 1
            if depth == 1 and cur is not None:
                top.append((cur, children)); cur, children = None, []
        elif tok.startswith("<li"):
            buf = ""
        elif tok.startswith("</li"):
            text = clean_text(re.sub(r"<[^>]+>", " ", buf))
            if text:
                if depth == 1:
                    if cur is None:
                        top.append((text, []))
                    # a li closing at depth 1 while cur set = the group's own li
                elif depth >= 2 and cur is not None:
                    children.append(text)
                elif depth >= 2:
                    children.append(text)
            buf = ""
        elif not tok.startswith("<"):
            buf += tok
        # other tags: keep text flowing
    return top


def parse_page(pid):
    html = fetch(f"{BASE}/eng/products/detail/{pid}?", f"detail_{pid}.html")
    # page-own model + series (heading block above 'Main Feature' in text)
    body = re.sub(r"<script[\s\S]*?</script>|<style[\s\S]*?</style>", " ", html)
    text = re.sub(r"<[^>]+>", "\n", body)
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    idx = next((i for i, l in enumerate(lines) if l in ("Main Feature", "Feature", "Mortor is working", "Specification", "Technical Specification")), 20)
    head = lines[max(0, idx - 12):idx]
    own = next((l for l in reversed(head) if re.fullmatch(r"(DSP|MWR|CM)[A-Za-z0-9/,. &;-]{0,50}", l)), None)
    series_line = head[-1] if head else ""

    feature_groups, specs = [], []
    for heading, inner in content_sections(html):
        h = heading.lower()
        if "specification" in h:
            for label, kids in parse_li_tree(inner):
                specs.append({"group": label, "rows": kids})
        else:
            # every other titled section (Main Feature, Easy Handling,
            # Multi-complexed Function, Remote Control, ...) is a feature
            # group — skip Korean-only headings (nav artifacts)
            if not heading or all(ord(c) > 0x3000 or c.isspace() for c in heading):
                continue
            items = []
            for label, kids in parse_li_tree(inner):
                items.append(label)
                items.extend([f"– {k}" for k in kids])
            if items:
                feature_groups.append({"title": heading, "items": items})

    # downloads (board section = datasheet/CAD/catalog)
    docs = []
    for m in re.finditer(r'href="(/common/dialogue/file\.html\?section=board[^"]+)"', html):
        u = m.group(1)
        name = re.search(r"name=([^&\"]+)", u)
        fname = urllib.parse.unquote_plus(name.group(1)) if name else "file"
        docs.append({"url": BASE + unescape(u), "name": fname})
    # first product image, full-size
    img = re.search(r'file\.html\?section=product&folder=([^&]+)/thumb&file=([^&]+)&name=([^&"]+)&', html)
    photo = None
    if img:
        photo = f"{BASE}/common/dialogue/file.html?section=product&folder={img.group(1)}&file={img.group(2)}&name={img.group(3)}&"
    return {
        "own_model": own, "series_line": series_line,
        "feature_groups": feature_groups,
        "specs": specs, "docs": docs, "photo": photo,
        "url": f"{BASE}/eng/products/detail/{pid}",
    }


def doc_label(fname):
    f = fname.lower()
    if "카다로그" in fname or "catalog" in f:
        return "Samwha DSP Full Catalog (PDF)"
    if f.endswith(".dwg"):
        return "CAD Drawing (DWG)"
    if "치수" in fname or "dimensional" in f or "size" in f:
        return "Dimensional Drawing (PDF)"
    import re as _re
    if _re.fullmatch(r"dsp-[a-z0-9,._ -]+\.pdf", f):
        # bare model-name PDFs are the CAD/PDF dimensional export
        return "Dimensional Drawing (PDF)"
    if f.endswith(".pdf"):
        return "Datasheet / Manual (English, PDF)"
    if f.endswith(".docx") or f.endswith(".doc"):
        return "Technical Note (DOC)"
    return fname


def main():
    dry = "--dry-run" in sys.argv
    pages = {}
    for model, info in MODEL_MAP.items():
        pages.setdefault(info["page"], []).append(model)

    if dry:
        for pid, models in sorted(pages.items()):
            print(f"{pid}: {', '.join(models)}")
        return

    os.makedirs(DOCS, exist_ok=True)
    parsed = {}
    for pid in sorted(pages):
        print(f"parsing {pid} ...")
        parsed[pid] = parse_page(pid)

    # download files once per page (catalog dedupes by identical filename hash)
    for pid, page in parsed.items():
        local_docs = []
        for d in page["docs"]:
            safe = re.sub(r"[^A-Za-z0-9._-]+", "_", d["name"])[:60].strip("_")
            out = f"{sha10(d['name'])}_{safe}"
            path = os.path.join(DOCS, out)
            try:
                st = dl_file(d["url"], page["url"], path)
                print(f"  doc {d['name'][:50]!r}: {st}")
                local_docs.append({"label": doc_label(d["name"]),
                                   "official_url": d["url"],
                                   "local_path": f"/docs/{out}"})
            except Exception as e:
                print(f"  !! doc failed {d['name'][:50]!r}: {e}")
                local_docs.append({"label": doc_label(d["name"]),
                                   "official_url": d["url"], "local_path": None})
        page["local_docs"] = local_docs
        if page["photo"]:
            out = f"{sha10(page['photo'])}_photo.jpg"
            try:
                dl_file(page["photo"], page["url"], os.path.join(DOCS, out))
                page["local_photo"] = f"/docs/{out}"
            except Exception as e:
                print(f"  !! photo failed: {e}")
                page["local_photo"] = None

    # build entries
    entries = []
    for model, info in MODEL_MAP.items():
        page = parsed[info["page"]]
        series = info["series"] or page["series_line"] or page["own_model"] or "DSP"
        base_model = page["own_model"] or model
        title = f"{model} - {series}"
        desc = f"Samwha {base_model} series. {series}."
        entries.append({
            "model_number": model,
            "title": title,
            "range_name": "DSP",
            "brand": "Samwha DSP",
            "series": series,
            "base_model": base_model,
            "range_short_desc": "Samwha DSP digital protection relays",
            "description": desc,
            "feature_groups": page["feature_groups"],
            "specs": [] if info["oem"] else page["specs"],
            "oem": info["oem"],
            "needs_review": info["review"],
            "end_of_sale": None,
            "official_image_url": page["photo"],
            "local_photo_path": page.get("local_photo"),
            "image_confirmed_unavailable": page.get("local_photo") is None,
            "documents": page["local_docs"],
            "source_url": page["url"],
            "scraped_at": time.strftime("%Y-%m-%dT%H:%M:%S+00:00", time.gmtime()),
            "category": None,
            "in_stock": True,
            "your_price": None,
            "your_notes": info["note"],
        })

    # merge into index.json (replace-by-model, keep everything else)
    idx = json.load(io.open(INDEX, encoding="utf-8"))
    keep = [e for e in idx if e["model_number"] not in MODEL_MAP]
    merged = keep + entries
    io.open(INDEX, "w", encoding="utf-8").write(
        json.dumps(merged, ensure_ascii=False, indent=1))
    print(f"\nindex.json: {len(keep)} kept + {len(entries)} DSP = {len(merged)}")

    # per-model folders (mirrors the EOCR convention)
    for e in entries:
        d = os.path.join(PROD, e["model_number"])
        os.makedirs(d, exist_ok=True)
        io.open(os.path.join(d, "data.json"), "w", encoding="utf-8").write(
            json.dumps(e, ensure_ascii=False, indent=1))
    print("per-model data.json written")


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    main()

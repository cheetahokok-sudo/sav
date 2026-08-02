"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ContactBar from "../components/ContactBar";
import { COMPANY, lineLink, messagingLink, mailtoLink } from "../lib/company";

type ProductDoc = {
  label: string;
  official_url: string;
  local_path: string | null;
};

type Product = {
  model_number: string;
  title: string | null;
  range_name: string | null;
  range_short_desc: string | null;
  description: string | null;
  end_of_sale: string | null;
  official_image_url: string | null;
  local_photo_path: string | null;
  image_confirmed_unavailable: boolean;
  documents: ProductDoc[];
  source_url: string | null;
  category: string | null;
  // Stock states: true = in stock in Thailand (พร้อมส่ง),
  // false = pre-order / lead time (สั่งล่วงหน้า), null/undefined = ask.
  // Edit per-SKU in public/products/index.json (field: "in_stock").
  in_stock: boolean | null;
  your_price?: string | null;
};

type QuoteItem = { model: string; qty: number };

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";
const QUOTE_KEY = "sav_quote_v1";

// Document labels come straight from whatever language the source page was
// scraped in (mostly Korean). Translate the known ones for display.
const LABEL_TRANSLATIONS: Record<string, string> = {
  "제품 데이터 시트": "Datasheet",
  "사용자 가이드": "User Guide",
  "카탈로그": "Catalog",
  "제품 선택도구": "Product Selector",
};

function translateLabel(label: string): string {
  return LABEL_TRANSLATIONS[label.trim()] || label;
}

// Strip "MODEL - " prefix and "| Schneider Electric ..." suffix from scraped
// titles, leaving the clean spec description a customer actually reads.
function cleanDescription(title: string | null, model: string): string | null {
  if (!title) return title;
  let cleaned = title.replace(/\s*\|\s*Schneider Electric\s*\S*\s*$/, "").trim();
  const prefix = `${model} - `;
  if (cleaned.startsWith(prefix)) {
    cleaned = cleaned.slice(prefix.length);
  }
  return cleaned.trim();
}

// Group cryptic model numbers into series a buyer recognizes, so the filter
// dropdown reads like the catalog instead of like part-number soup.
function seriesOf(model: string): string {
  const m = model.toUpperCase();
  if (/^EOCR(SS|SSD|SE2)/.test(m)) return "EOCR-SS / SE2";
  if (/^(EOCR3|3DM2|3MZ2|FMZ2|FDM2)/.test(m)) return "EOCR-3D / 3E";
  if (/^EOCR(PFZ|PMZ)/.test(m)) return "EOCR-PFZ / PMZ";
  if (/^EOCR(FDE|FEZ)/.test(m)) return "EOCR-FDE / FEZ";
  if (/^EUCR/.test(m)) return "EUCR (Under Current)";
  if (/^U?DOUCR/.test(m)) return "DOUCR (Over & Under Current)";
  if (/^I3/.test(m)) return "EOCR-i3 (Digital)";
  if (/^IF/.test(m)) return "EOCR-iF (Ground Fault)";
  if (/^ISEM/.test(m)) return "iSEM (Communication)";
  if (/^DSP-VIP/.test(m)) return "DSP-VIP Series";
  if (/^DSP/.test(m)) return "Samwha DSP";
  if (/^WYZ/.test(m)) return "Woonyoung ZCT";
  // Deesys family stems — checked after DSP so "DSP-…" can never fall in here.
  if (/^DGF(-|$)/.test(m)) return "Deesys GFR (Ground Fault Relay)";
  if (/^(DR|DS)(-|$)/.test(m)) return "Deesys CT";
  // High-voltage ZCT kept in its own bucket so a 6.6 kV part can never be
  // mistaken for the 600 V class ZCTs sitting next to it.
  if (/^(HZR|HZS)(-|$)/.test(m)) return "Deesys ZCT (High Voltage)";
  if (/^(DZR|DZS|SZR|ZR)(-|$)/.test(m)) return "Deesys ZCT";
  return "Other";
}

// Series pinned above the alphabetical groups — SAV's core stock, which
// buyers come looking for first. Order here is the order on the page.
const PINNED_SERIES = ["EOCR-SS / SE2", "EUCR (Under Current)"];

function seriesRank(series: string): number {
  const i = PINNED_SERIES.indexOf(series);
  return i === -1 ? PINNED_SERIES.length : i;
}

// Inside the pinned EOCR bucket, lead with SS then SSD; SE2 follows.
// (SSD is tested first because /^EOCRSS/ would also match it.)
function modelRank(model: string): number {
  if (/^EOCRSSD/.test(model)) return 1;
  if (/^EOCRSS/.test(model)) return 0;
  if (/^EOCRSE2/.test(model)) return 2;
  return 3;
}

function StockBadge({ inStock }: { inStock: boolean | null }) {
  if (inStock === true)
    return (
      <span className="inline-flex items-center gap-1 font-display text-[10px] font-bold bg-green-50 text-green-700 rounded px-2 py-0.5">
        ● พร้อมส่ง
      </span>
    );
  if (inStock === false)
    return (
      <span className="inline-flex items-center gap-1 font-display text-[10px] font-bold bg-amber-50 text-amber-700 rounded px-2 py-0.5">
        ◐ สั่งล่วงหน้า
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 font-display text-[10px] font-bold bg-gray-100 text-gray-500 rounded px-2 py-0.5">
      สอบถามสต็อก
    </span>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [query, setQuery] = useState("");
  const [series, setSeries] = useState("all");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedDocs, setExpandedDocs] = useState<Set<string>>(new Set());
  const [quote, setQuote] = useState<QuoteItem[]>([]);
  const [basketOpen, setBasketOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load catalog + restore basket + read ?q= prefill (e.g. links from the
  // homepage category cards). window.location instead of useSearchParams so
  // the page stays compatible with `output: "export"` without a Suspense
  // boundary.
  useEffect(() => {
    // no-cache, not no-store: GitHub Pages serves the catalog with
    // Cache-Control: max-age=600, so for ten minutes after a deploy a
    // returning buyer would get the old catalog and a newly added product
    // would look missing. This revalidates against Last-Modified instead,
    // so an unchanged catalog still costs only a 304.
    fetch(`${BASE}/products/index.json`, { cache: "no-cache" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: Product[]) => setProducts(data))
      .catch((e) => setError(String(e)));

    try {
      const saved = localStorage.getItem(QUOTE_KEY);
      if (saved) setQuote(JSON.parse(saved));
    } catch {
      /* corrupted storage — start fresh */
    }

    const q = new URLSearchParams(window.location.search).get("q");
    if (q) setQuery(q);
  }, []);

  // Persist basket on every change.
  useEffect(() => {
    try {
      localStorage.setItem(QUOTE_KEY, JSON.stringify(quote));
    } catch {
      /* storage full/unavailable — basket still works in-memory */
    }
  }, [quote]);

  const seriesOptions = useMemo(() => {
    if (!products) return [];
    const set = new Set(products.map((p) => seriesOf(p.model_number)));
    return Array.from(set).sort();
  }, [products]);

  const filtered = useMemo(() => {
    if (!products) return [];
    const q = query.trim().toLowerCase();
    return products
      .filter((p) => {
        if (series !== "all" && seriesOf(p.model_number) !== series) return false;
        if (inStockOnly && p.in_stock !== true) return false;
        if (!q) return true;
        return [p.model_number, p.title, p.range_name, p.description]
          .filter(Boolean)
          .some((field) => field!.toLowerCase().includes(q));
      })
      // Pinned series first, then the rest grouped alphabetically by series,
      // so the catalog reads like a catalog. Without this the order is
      // whatever the scrape wrote to index.json, which buries anything
      // appended later at the bottom of the grid.
      .sort((a, b) => {
        const sa = seriesOf(a.model_number);
        const sb = seriesOf(b.model_number);
        const rank = seriesRank(sa) - seriesRank(sb);
        if (rank !== 0) return rank;
        const bySeries = sa.localeCompare(sb, "en");
        if (bySeries !== 0) return bySeries;
        const byModel = modelRank(a.model_number) - modelRank(b.model_number);
        if (byModel !== 0) return byModel;
        return a.model_number.localeCompare(b.model_number, "en");
      });
  }, [products, query, series, inStockOnly]);

  const toggleDocs = (model: string) => {
    setExpandedDocs((prev) => {
      const next = new Set(prev);
      if (next.has(model)) next.delete(model);
      else next.add(model);
      return next;
    });
  };

  const addToQuote = (model: string) => {
    setQuote((prev) => {
      const existing = prev.find((i) => i.model === model);
      if (existing) {
        return prev.map((i) =>
          i.model === model ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { model, qty: 1 }];
    });
    setBasketOpen(true);
  };

  const setQty = (model: string, qty: number) => {
    setQuote((prev) =>
      qty <= 0
        ? prev.filter((i) => i.model !== model)
        : prev.map((i) => (i.model === model ? { ...i, qty } : i))
    );
  };

  const quoteMessage = useMemo(
    () =>
      [
        "ขอใบเสนอราคา (จากเว็บไซต์ SAV)",
        ...quote.map((i) => `- ${i.model} x ${i.qty}`),
        "",
        "ชื่อ/บริษัท: ",
        "จังหวัดจัดส่ง: ",
      ].join("\n"),
    [quote]
  );

  const copyQuote = async () => {
    try {
      await navigator.clipboard.writeText(quoteMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  // LINE can't prefill: copy the basket, briefly confirm, then open LINE so
  // the customer pastes the model/qty list. Degrades to prefilled WhatsApp if
  // LINE isn't configured.
  const sendQuoteViaLine = async () => {
    if (!COMPANY.lineOfficialUrl) {
      window.open(messagingLink(quoteMessage), "_blank", "noopener");
      return;
    }
    try {
      await navigator.clipboard.writeText(quoteMessage);
    } catch {
      /* clipboard unavailable — customer can still paste manually */
    }
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      window.open(lineLink(), "_blank", "noopener");
    }, 700);
  };

  const totalItems = quote.reduce((s, i) => s + i.qty, 0);

  return (
    <main className="bg-gray-100 min-h-screen">
      {/* Top bar */}
      <nav className="sticky top-0 z-40 bg-white shadow-md flex items-center justify-between px-6 h-16 gap-4">
        <a href={`${BASE}/`} className="flex items-center gap-2 flex-shrink-0">
          <span className="bg-brand text-white font-display font-extrabold italic text-lg px-2.5 py-1 rounded-sm tracking-tight">
            SAV
          </span>
          <span className="hidden sm:flex flex-col leading-tight">
            <span className="font-display font-bold text-sm text-gray-700 tracking-wide">
              MECHANICAL
            </span>
            <span className="font-display font-medium text-[10px] text-gray-500 tracking-wider">
              SERVICES &amp; SUPPLIES
            </span>
          </span>
        </a>
        <button
          onClick={() => setBasketOpen((o) => !o)}
          className="relative font-display text-xs font-bold tracking-wider uppercase border-[1.5px] border-ink text-ink px-4 py-2.5 hover:border-brand hover:text-brand transition-colors"
        >
          🧾 ใบเสนอราคา
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-brand text-white text-[10px] rounded-full flex items-center justify-center font-bold">
              {totalItems}
            </span>
          )}
        </button>
      </nav>

      <div className="px-6 py-12 max-w-6xl mx-auto">
        <p className="text-center font-display text-[11px] font-extrabold tracking-[0.2em] uppercase text-brand mb-2">
          PRODUCT CATALOG
        </p>
        <h1 className="text-center font-display font-extrabold text-3xl sm:text-4xl text-ink mb-4">
          สินค้าทั้งหมด
        </h1>
        <div className="w-10 h-[3px] bg-brand rounded mx-auto mb-8" />

        {/* Search + filters */}
        <div className="max-w-3xl mx-auto mb-4 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหารุ่นสินค้า... (เช่น EOCRSS, i3, ground fault)"
            className="flex-1 bg-white border border-gray-200 rounded px-5 py-3 text-sm outline-none focus:border-brand shadow-sm"
          />
          <select
            value={series}
            onChange={(e) => setSeries(e.target.value)}
            className="bg-white border border-gray-200 rounded px-4 py-3 text-sm outline-none focus:border-brand shadow-sm"
          >
            <option value="all">ทุกซีรีส์</option>
            {seriesOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="max-w-3xl mx-auto mb-8 flex items-center justify-between flex-wrap gap-2">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="accent-[#cc1f1f] w-4 h-4"
            />
            แสดงเฉพาะพร้อมส่ง
          </label>
          {products && (
            <p className="text-sm text-gray-500">
              พบ {filtered.length} จาก {products.length} รายการ
            </p>
          )}
        </div>

        {error && (
          <p className="text-center text-red-600 text-sm mb-8">
            โหลดข้อมูลสินค้าไม่สำเร็จ: {error}
          </p>
        )}
        {!products && !error && (
          <p className="text-center text-gray-500">กำลังโหลดสินค้า...</p>
        )}

        {/* Product grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p) => {
            const imgSrc = p.local_photo_path || p.official_image_url;
            const isExpanded = expandedDocs.has(p.model_number);
            const description = cleanDescription(p.title, p.model_number);
            const inQuote = quote.find((i) => i.model === p.model_number);
            return (
              <div
                key={p.model_number}
                className="bg-white border border-gray-200 border-t-[3px] border-t-gray-300 hover:border-t-brand hover:shadow-lg transition-all rounded p-6 flex flex-col"
              >
                <div className="h-36 mb-4 bg-gray-50 rounded flex items-center justify-center overflow-hidden">
                  {imgSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imgSrc.startsWith("/") ? `${BASE}${imgSrc}` : imgSrc}
                      alt={p.model_number}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-3xl opacity-30">📦</span>
                  )}
                </div>

                <div className="flex items-start justify-between gap-2 mb-1">
                  <Link
                    href={`/products/${p.model_number}/`}
                    className="font-display font-bold text-ink hover:text-brand transition-colors"
                  >
                    {p.model_number} <span className="text-gray-300 font-normal">→</span>
                  </Link>
                  <StockBadge inStock={p.in_stock ?? null} />
                </div>
                <p className="font-display text-[10px] text-gray-400 uppercase tracking-wide mb-1.5">
                  {seriesOf(p.model_number)}
                </p>
                {description && (
                  <p className="font-light text-sm text-gray-700 mb-3 leading-snug">
                    {description}
                  </p>
                )}

                {p.end_of_sale && (
                  <p className="inline-flex self-start text-[10px] font-display font-bold uppercase tracking-wide bg-red-50 text-brand px-2 py-1 rounded mb-3">
                    End of sale: {p.end_of_sale}
                  </p>
                )}

                <button
                  onClick={() => addToQuote(p.model_number)}
                  className={`mt-auto text-center text-sm font-display font-bold rounded px-4 py-2.5 mb-3 transition-colors ${
                    inQuote
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-brand text-white hover:bg-brand-dark"
                  }`}
                >
                  {inQuote
                    ? `✓ อยู่ในใบเสนอราคา (${inQuote.qty}) — กดเพิ่ม`
                    : "＋ ใส่ใบเสนอราคา"}
                </button>

                <button
                  onClick={() => toggleDocs(p.model_number)}
                  className="flex items-center justify-center gap-2 text-sm font-display font-semibold text-blue-600 hover:text-blue-700 transition-colors py-1"
                >
                  📄 Documents <span>{isExpanded ? "▲" : "▼"}</span>
                </button>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-2 justify-center">
                    {p.documents.length === 0 && (
                      <span className="text-[11px] text-gray-400">
                        No documents yet
                      </span>
                    )}
                    {p.documents.map((doc) =>
                      doc.local_path ? (
                        <a
                          key={doc.label + doc.official_url}
                          href={`${BASE}${doc.local_path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-display font-semibold text-brand border border-brand/30 rounded px-2.5 py-1 hover:bg-brand hover:text-white hover:border-brand transition-colors"
                        >
                          {translateLabel(doc.label || "Document")}
                        </a>
                      ) : (
                        // Deliberately NOT linking to doc.official_url —
                        // documents must be hosted on our own server.
                        <span
                          key={doc.label + doc.official_url}
                          title="Not hosted on our server yet"
                          className="text-[11px] font-display font-semibold text-gray-400 border border-gray-200 rounded px-2.5 py-1 cursor-not-allowed"
                        >
                          {translateLabel(doc.label || "Document")} (pending)
                        </span>
                      )
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {products && filtered.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            <p className="mb-3">ไม่พบสินค้าที่ตรงกับคำค้นหา</p>
            <a
              href={messagingLink(
                `สวัสดีครับ หารุ่น "${query}" ไม่พบบนเว็บไซต์ รบกวนสอบถามครับ`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block font-display text-xs font-bold tracking-wider uppercase border-[1.5px] border-brand text-brand px-5 py-2.5 hover:bg-brand hover:text-white transition-colors"
            >
              💬 สอบถามรุ่นนี้ทาง LINE →
            </a>
          </div>
        )}
      </div>

      {/* QUOTE BASKET — persists in localStorage; submits through the
          channels SAV actually answers (LINE first). Static-site
          friendly: no backend required. */}
      {quote.length > 0 && (
        <div className="fixed bottom-14 lg:bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-ink shadow-[0_-4px_16px_rgba(0,0,0,0.12)]">
          <button
            onClick={() => setBasketOpen((o) => !o)}
            className="w-full flex items-center justify-between px-6 py-3"
          >
            <span className="font-display font-bold text-sm text-ink">
              🧾 ใบเสนอราคาของคุณ ({totalItems} ชิ้น · {quote.length} รุ่น)
            </span>
            <span className="font-display text-xs text-gray-500">
              {basketOpen ? "ซ่อน ▼" : "แสดง ▲"}
            </span>
          </button>

          {basketOpen && (
            <div className="px-6 pb-5 max-h-[45vh] overflow-y-auto">
              <div className="flex flex-col gap-2 mb-4">
                {quote.map((i) => (
                  <div
                    key={i.model}
                    className="flex items-center justify-between gap-3 bg-gray-50 rounded px-4 py-2"
                  >
                    <span className="font-display font-semibold text-sm text-ink">
                      {i.model}
                    </span>
                    <span className="flex items-center gap-2">
                      <button
                        onClick={() => setQty(i.model, i.qty - 1)}
                        className="w-7 h-7 border border-gray-300 rounded text-sm hover:border-brand hover:text-brand"
                        aria-label={`ลดจำนวน ${i.model}`}
                      >
                        −
                      </button>
                      <span className="font-display font-bold text-sm w-6 text-center">
                        {i.qty}
                      </span>
                      <button
                        onClick={() => setQty(i.model, i.qty + 1)}
                        className="w-7 h-7 border border-gray-300 rounded text-sm hover:border-brand hover:text-brand"
                        aria-label={`เพิ่มจำนวน ${i.model}`}
                      >
                        ＋
                      </button>
                      <button
                        onClick={() => setQty(i.model, 0)}
                        className="ml-2 text-gray-400 hover:text-brand text-sm"
                        aria-label={`ลบ ${i.model}`}
                      >
                        ✕
                      </button>
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={sendQuoteViaLine}
                  className="flex-1 min-w-[180px] text-center bg-brand text-white font-display text-xs font-bold tracking-wider uppercase py-3 hover:bg-brand-dark transition-colors"
                >
                  💬 คัดลอก &amp; ส่งขอราคาทาง LINE →
                </button>
                <a
                  href={mailtoLink("ขอใบเสนอราคา (SAV Website)", quoteMessage)}
                  className="text-center border border-gray-300 text-ink font-display text-xs font-bold tracking-wider uppercase px-5 py-3 hover:border-brand hover:text-brand transition-colors"
                >
                  ✉️ อีเมล
                </a>
                <button
                  onClick={copyQuote}
                  className="text-center border border-gray-300 text-ink font-display text-xs font-bold tracking-wider uppercase px-5 py-3 hover:border-brand hover:text-brand transition-colors"
                >
                  {copied ? "✓ คัดลอกแล้ว" : "คัดลอก"}
                </button>
              </div>
              <p className="text-[11px] text-gray-500 mt-3">
                รายการจะถูกบันทึกไว้ในเครื่องของคุณ — ทีมงานตอบกลับพร้อมราคาและสถานะสต็อกภายในวันทำการ ({COMPANY.hoursTh})
              </p>
            </div>
          )}
        </div>
      )}

      <ContactBar />
    </main>
  );
}

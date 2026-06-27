"use client";

import { useEffect, useMemo, useState } from "react";

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
  in_stock: boolean;
};

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

// Document labels come straight from whatever language the source page was
// scraped in (mostly Korean, since that's the only site with full content
// for this Korea-origin product line). Translate the known ones for display;
// anything not in this map (e.g. "CAD", or our own "EOCR Catalog (English)")
// is already fine as-is and passes through unchanged.
const LABEL_TRANSLATIONS: Record<string, string> = {
  "제품 데이터 시트": "Datasheet",
  "사용자 가이드": "User Guide",
  "카탈로그": "Catalog",
  "제품 선택도구": "Product Selector",
};

function translateLabel(label: string): string {
  return LABEL_TRANSLATIONS[label.trim()] || label;
}

// Scraped titles carry a trailing site-branding suffix in Korean (e.g.
// "... | Schneider Electric 대한민국") -- strip that for display, the
// model description itself is already in Latin characters.
function cleanTitle(title: string | null): string | null {
  if (!title) return title;
  return title.replace(/\s*\|\s*Schneider Electric\s*\S*\s*$/, "").trim();
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${BASE}/products/index.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: Product[]) => setProducts(data))
      .catch((e) => setError(String(e)));
  }, []);

  const filtered = useMemo(() => {
    if (!products) return [];
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) =>
      [p.model_number, p.title, p.range_name, p.description]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(q))
    );
  }, [products, query]);

  return (
    <main className="bg-gray-100 min-h-screen">
      {/* Simple top bar so this page isn't orphaned from the rest of the site */}
      <nav className="bg-white shadow-md flex items-center justify-between px-6 h-16">
        <a href={`${BASE}/`} className="flex items-center gap-2">
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
        <a
          href={`${BASE}/#contact`}
          className="font-display text-xs font-bold tracking-wider uppercase bg-brand text-white px-5 py-2.5 hover:bg-brand-dark transition-colors"
        >
          REQUEST QUOTATION
        </a>
      </nav>

      <div className="px-6 py-12 max-w-6xl mx-auto">
        <p className="text-center font-display text-[11px] font-extrabold tracking-[0.2em] uppercase text-brand mb-2">
          PRODUCT CATALOG
        </p>
        <h1 className="text-center font-display font-extrabold text-3xl sm:text-4xl text-ink mb-4">
          ค้นหาสินค้าทั้งหมด
        </h1>
        <div className="w-10 h-[3px] bg-brand rounded mx-auto mb-8" />

        <div className="max-w-xl mx-auto mb-10">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหารุ่นสินค้า... (model number, ชื่อ, รายละเอียด)"
            className="w-full bg-white border border-gray-200 rounded px-5 py-3 text-sm outline-none focus:border-brand shadow-sm"
          />
        </div>

        {error && (
          <p className="text-center text-red-600 text-sm mb-8">
            โหลดข้อมูลสินค้าไม่สำเร็จ: {error}
          </p>
        )}

        {!products && !error && (
          <p className="text-center text-gray-500">กำลังโหลดสินค้า...</p>
        )}

        {products && (
          <p className="text-center text-sm text-gray-500 mb-6">
            พบ {filtered.length} จาก {products.length} รายการ
          </p>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p) => {
            const imgSrc = p.local_photo_path || p.official_image_url;
            return (
              <div
                key={p.model_number}
                className="bg-white border border-gray-200 border-t-[3px] border-t-gray-300 hover:border-t-brand hover:shadow-lg hover:-translate-y-0.5 transition-all rounded p-6 flex flex-col"
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

                {p.range_name && (
                  <p className="font-display text-[10px] font-extrabold tracking-wider uppercase text-brand mb-1">
                    {p.range_name}
                  </p>
                )}
                <h3 className="font-display font-extrabold text-lg text-ink mb-1 leading-tight">
                  {p.model_number}
                </h3>
                {p.title && (
                  <p className="text-xs text-gray-500 mb-2 line-clamp-2">{cleanTitle(p.title)}</p>
                )}

                {p.end_of_sale && (
                  <p className="inline-flex self-start text-[10px] font-display font-bold uppercase tracking-wide bg-red-50 text-brand px-2 py-1 rounded mb-3">
                    End of sale: {p.end_of_sale}
                  </p>
                )}

                <div className="mt-auto flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                  {p.documents.slice(0, 3).map((doc) => (
                    <a
                      key={doc.label + doc.official_url}
                      href={doc.local_path ? `${BASE}${doc.local_path}` : doc.official_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-display font-semibold text-brand border border-brand/30 rounded px-2.5 py-1 hover:bg-brand hover:text-white hover:border-brand transition-colors"
                    >
                      {translateLabel(doc.label || "Document")}
                    </a>
                  ))}
                  {p.documents.length === 0 && (
                    <span className="text-[11px] text-gray-400">ไม่มีเอกสาร</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {products && filtered.length === 0 && (
          <p className="text-center text-gray-500 mt-10">ไม่พบสินค้าที่ตรงกับคำค้นหา</p>
        )}
      </div>
    </main>
  );
}

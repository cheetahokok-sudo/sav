import type { Metadata } from "next";
import Link from "next/link";
import ProductCatalog from "./ProductCatalog";
import { allProducts, toCatalogEntry } from "../lib/products";
import { seriesOf, seriesRank, modelRank, CATEGORIES } from "../lib/series";
import { SITE_URL, COMPANY } from "../lib/company";

// ============================================================================
// Catalog index. Server component: it loads the catalog at BUILD time and hands
// it to the client filter as a prop, so the exported HTML contains every
// product with a real href. The previous version fetched the catalog in the
// browser, which meant crawlers that do not run JavaScript — GPTBot, ClaudeBot,
// PerplexityBot — saw a loading message and zero products.
// ============================================================================

export const metadata: Metadata = {
  title: "สินค้าทั้งหมด — EOCR, Samwha DSP, ZCT",
  description:
    "แคตตาล็อกสินค้าทั้งหมดของ SAV — รีเลย์ป้องกันมอเตอร์ EOCR, มิเตอร์ Samwha DSP, ZCT และ CT พร้อมสถานะสต็อกและดาวน์โหลดดาต้าชีต",
  alternates: { canonical: "/products/" },
  openGraph: {
    title: "สินค้าทั้งหมด — EOCR, Samwha DSP, ZCT | SAV",
    description:
      "แคตตาล็อกสินค้าทั้งหมดของ SAV พร้อมสถานะสต็อกและดาวน์โหลดดาต้าชีต",
    url: "/products/",
    type: "website",
  },
};

export default function ProductsPage() {
  const products = allProducts()
    .map((p) => toCatalogEntry(p, seriesOf(p.model_number)))
    // Same ordering the client filter uses, so the server HTML and the first
    // client render agree and hydration is a no-op.
    .sort((a, b) => {
      const rank = seriesRank(a.series) - seriesRank(b.series);
      if (rank !== 0) return rank;
      const bySeries = a.series.localeCompare(b.series, "en");
      if (bySeries !== 0) return bySeries;
      const byModel = modelRank(a.model) - modelRank(b.model);
      if (byModel !== 0) return byModel;
      return a.model.localeCompare(b.model, "en");
    });

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}/products/#collection`,
        url: `${SITE_URL}/products/`,
        name: "สินค้าทั้งหมด — EOCR, Samwha DSP, ZCT",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#organization` },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: products.length,
          itemListElement: products.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: p.model,
            url: `${SITE_URL}/products/${p.model}/`,
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "หน้าแรก", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "สินค้า", item: `${SITE_URL}/products/` },
        ],
      },
    ],
  };

  return (
    <main className="bg-gray-100 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ProductCatalog products={products} />

      {/* Category hub, below the grid. These are the pages that can win
          "EOCR-SS ราคา"-shaped searches; the filter above cannot, because every
          filter state is the same URL. */}
      <section className="px-6 pb-16 max-w-6xl mx-auto">
        <h2 className="font-display font-extrabold text-xl text-ink mb-2">
          เลือกตามกลุ่มสินค้า
        </h2>
        <p className="text-sm text-gray-600 mb-5">
          แต่ละกลุ่มมีหน้าอธิบายว่าใช้ต่างกันอย่างไร และควรเลือกรุ่นไหนกับงานแบบใด
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/products/series/${c.slug}/`}
              className="block bg-white border border-gray-200 border-l-[3px] border-l-brand rounded p-5 hover:shadow-md transition-shadow"
            >
              <p className="font-display font-bold text-[15px] text-ink leading-snug mb-1">
                {c.title}
              </p>
              <p className="text-[12.5px] text-gray-600 leading-snug">{c.lede}</p>
            </Link>
          ))}
        </div>

        <p className="text-center text-[12px] text-gray-500 mt-10">
          จำหน่ายโดย {COMPANY.nameTh} —{" "}
          <Link href="/contact/" className="text-brand font-bold">
            ติดต่อ / ขอใบเสนอราคา
          </Link>
        </p>
      </section>
    </main>
  );
}

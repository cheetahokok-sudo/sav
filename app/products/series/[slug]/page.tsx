import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../../../components/SiteHeader";
import SiteFooter from "../../../components/SiteFooter";
import { allProducts, cleanDescription, type Product } from "../../../lib/products";
import {
  CATEGORIES,
  categoryBySlug,
  seriesOf,
  modelRank,
  type Category,
} from "../../../lib/series";
import { articlesBySlugs } from "../../../lib/knowledge";
import { SITE_URL, COMPANY } from "../../../lib/company";

// ============================================================================
// Series category pages.
//
// The catalog filter cannot rank: every filter state is the same URL, so
// "/products/?q=EOCRSS" has nothing of its own for a search engine to index.
// These pages give each product family a permanent URL with prose that
// explains what the family is for — which is what a buyer searching
// "EOCR-SS ราคา" or "ZCT คือ" is actually looking for.
// ============================================================================

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

function productsIn(category: Category): Product[] {
  const wanted = new Set(category.series);
  return allProducts()
    .filter((p) => wanted.has(seriesOf(p.model_number)))
    .sort((a, b) => {
      const byModel = modelRank(a.model_number) - modelRank(b.model_number);
      if (byModel !== 0) return byModel;
      return a.model_number.localeCompare(b.model_number, "en");
    });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = categoryBySlug(slug);
  if (!c) return {};
  const count = productsIn(c).length;
  const description = `${c.lede} — ${count} รุ่นในแคตตาล็อก SAV พร้อมสเปก ดาต้าชีต และสถานะสต็อก สอบถามราคาทาง LINE`;
  return {
    title: c.title,
    description,
    alternates: { canonical: `/products/series/${slug}/` },
    openGraph: {
      title: `${c.title} | SAV`,
      description,
      url: `/products/series/${slug}/`,
      type: "website",
    },
  };
}

function StockBadge({ inStock }: { inStock: boolean | null }) {
  if (inStock === true)
    return (
      <span className="font-display text-[10px] font-bold text-green-700 whitespace-nowrap">
        ● พร้อมส่ง
      </span>
    );
  if (inStock === false)
    return (
      <span className="font-display text-[10px] font-bold text-amber-700 whitespace-nowrap">
        ◐ สั่งล่วงหน้า
      </span>
    );
  return (
    <span className="font-display text-[10px] font-bold text-gray-400 whitespace-nowrap">
      สอบถามสต็อก
    </span>
  );
}

export default async function SeriesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = categoryBySlug(slug);
  if (!c) return null; // unreachable: params come from CATEGORIES

  const items = productsIn(c);
  const guides = articlesBySlugs(c.articles);
  const url = `${SITE_URL}/products/series/${c.slug}/`;
  const inStockCount = items.filter((p) => p.in_stock === true).length;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${url}#collection`,
        url,
        name: c.title,
        description: c.lede,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#organization` },
        inLanguage: "th",
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: items.length,
          itemListElement: items.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: p.model_number,
            url: `${SITE_URL}/products/${p.model_number}/`,
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "หน้าแรก", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "สินค้า", item: `${SITE_URL}/products/` },
          { "@type": "ListItem", position: 3, name: c.title, item: url },
        ],
      },
    ],
  };

  return (
    <main className="bg-gray-100 min-h-screen">
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-5xl mx-auto px-6 py-10">
        <nav className="text-[12.5px] text-gray-500 mb-4 flex flex-wrap gap-1.5">
          <Link href="/" className="hover:text-brand">
            หน้าแรก
          </Link>
          <span>/</span>
          <Link href="/products/" className="hover:text-brand">
            สินค้า
          </Link>
          <span>/</span>
          <span className="text-ink">{c.title}</span>
        </nav>

        <div className="bg-white border border-gray-200 border-t-[3px] border-t-brand rounded-lg p-7 sm:p-9 mb-6">
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-ink leading-tight mb-2">
            {c.title}
          </h1>
          <p className="text-[15px] text-gray-700 mb-5">{c.lede}</p>
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="font-display text-[11px] font-bold bg-gray-100 text-gray-600 rounded-full px-3 py-1">
              {items.length} รุ่นในแคตตาล็อก
            </span>
            {inStockCount > 0 && (
              <span className="font-display text-[11px] font-bold bg-green-50 text-green-700 rounded-full px-3 py-1">
                {inStockCount} รุ่นพร้อมส่ง
              </span>
            )}
          </div>
          <div className="space-y-3">
            {c.intro.map((para, i) => (
              <p key={i} className="text-[14.5px] text-gray-700 leading-relaxed">
                {para}
              </p>
            ))}
          </div>
        </div>

        {/* Model table. Plain links, server-rendered — this is the list a
            crawler follows to reach every part in the family. */}
        <div className="bg-white border border-gray-200 rounded-lg p-7 sm:p-9 mb-6">
          <h2 className="font-display font-extrabold text-lg text-ink mb-4 pb-3 border-b border-gray-200">
            รุ่นทั้งหมดในกลุ่มนี้
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-2 pr-4 font-display text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    รุ่น
                  </th>
                  <th className="py-2 pr-4 font-display text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    รายละเอียด
                  </th>
                  <th className="py-2 font-display text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    สต็อก
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.model_number} className="border-b border-gray-100">
                    <td className="py-3 pr-4 align-top">
                      <Link
                        href={`/products/${p.model_number}/`}
                        className="font-display font-bold text-[13.5px] text-ink hover:text-brand transition-colors whitespace-nowrap"
                      >
                        {p.model_number}
                      </Link>
                    </td>
                    <td className="py-3 pr-4 align-top text-[13px] text-gray-700 leading-snug">
                      {cleanDescription(p.title, p.model_number) ||
                        p.range_short_desc ||
                        "—"}
                      {p.end_of_sale && (
                        <span className="ml-2 font-display text-[10px] font-bold uppercase text-brand">
                          (End of sale {p.end_of_sale})
                        </span>
                      )}
                    </td>
                    <td className="py-3 align-top">
                      <StockBadge inStock={p.in_stock ?? null} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[12.5px] text-gray-500 mt-4">
            ราคาขึ้นกับจำนวนและรุ่น — ส่งรุ่นที่สนใจมาทาง{" "}
            <a
              href={COMPANY.lineOfficialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand font-semibold hover:underline"
            >
              LINE
            </a>{" "}
            หรือ{" "}
            <Link href="/contact/" className="text-brand font-semibold hover:underline">
              หน้าติดต่อ
            </Link>{" "}
            ทีมวิศวกรรมช่วยเทียบรุ่นให้ได้
          </p>
        </div>

        {guides.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-7 sm:p-9 mb-6">
            <h2 className="font-display font-extrabold text-lg text-ink mb-4 pb-3 border-b border-gray-200">
              บทความที่เกี่ยวข้อง
            </h2>
            <ul className="space-y-3">
              {guides.map((g) => (
                <li key={g.slug}>
                  <Link
                    href={`/learn/${g.slug}/`}
                    className="font-semibold text-[14px] text-ink hover:text-brand transition-colors"
                  >
                    {g.title}
                  </Link>
                  <p className="text-[12.5px] text-gray-600 leading-snug mt-0.5">
                    {g.description}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Sibling categories — lateral links so a buyer in the wrong family
            can cross over, and so link equity reaches every category page. */}
        <div className="bg-white border border-gray-200 rounded-lg p-7 sm:p-9">
          <h2 className="font-display font-extrabold text-lg text-ink mb-4 pb-3 border-b border-gray-200">
            กลุ่มสินค้าอื่น
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {CATEGORIES.filter((x) => x.slug !== c.slug).map((x) => (
              <Link
                key={x.slug}
                href={`/products/series/${x.slug}/`}
                className="block border border-gray-200 border-l-[3px] border-l-gray-300 hover:border-l-brand rounded px-4 py-3 transition-colors"
              >
                <p className="font-display font-bold text-[13.5px] text-ink leading-snug">
                  {x.title}
                </p>
                <p className="text-[12px] text-gray-600 leading-snug mt-0.5">{x.lede}</p>
              </Link>
            ))}
          </div>
          <p className="text-[12.5px] text-gray-600 mt-5">
            หรือดู{" "}
            <Link href="/products/" className="text-brand font-semibold hover:underline">
              แคตตาล็อกสินค้าทั้งหมด
            </Link>
          </p>
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}

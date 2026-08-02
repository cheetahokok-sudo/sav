import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import type { Metadata } from "next";
import DetailActions from "./DetailActions";

// ============================================================================
// Per-product page — the modern version of a manufacturer datasheet page.
// One static page per model at /products/<MODEL>/ so procurement can send an
// engineer a clean link; the engineer reviews specs and downloads the
// datasheet / CAD for project approval without leaving SAV's site.
// Data comes from public/products/index.json at BUILD time (static export).
// ============================================================================

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

type Doc = { label: string; official_url: string | null; local_path: string | null };
type SpecGroup = { group: string; rows: string[] };
type FeatureGroup = { title: string; items: string[] };
type Product = {
  model_number: string;
  title: string;
  range_name: string;
  brand?: string;
  series?: string;
  base_model?: string;
  description: string;
  feature_groups?: FeatureGroup[];
  specs?: SpecGroup[];
  oem?: boolean;
  local_photo_path: string | null;
  // Real photos of the stock SAV actually holds, shown under the catalog
  // render. A buyer trusts "here is the unit on our shelf" in a way a
  // manufacturer illustration cannot earn. Optional and additive: a product
  // with none behaves exactly as before.
  extra_photos?: { path: string; caption?: string | null }[];
  documents: Doc[];
  in_stock: boolean | null;
  your_notes: string | null;
};

// Every image of a product, catalog render first, real stock photos after.
function allPhotos(p: Product): string[] {
  const seen = new Set<string>();
  return [p.local_photo_path, ...(p.extra_photos ?? []).map((x) => x.path)]
    .filter((x): x is string => Boolean(x))
    // A product whose only image IS the stock photo would otherwise list it
    // twice in schema.org and the OG preview.
    .filter((x) => !seen.has(x) && seen.add(x));
}

function loadAll(): Product[] {
  const p = path.join(process.cwd(), "public", "products", "index.json");
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

export function generateStaticParams() {
  return loadAll().map((p) => ({ model: p.model_number }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ model: string }> }
): Promise<Metadata> {
  const { model } = await params;
  const p = loadAll().find((x) => x.model_number === model);
  if (!p) return {};
  const brand = p.brand || (p.range_name === "EOCR" ? "Schneider EOCR" : p.range_name);
  const title = `${p.model_number} — ${p.series || p.range_name}`;
  const description = `${brand} ${p.model_number}: specifications, datasheet and CAD download. จำหน่ายโดย SAV — สอบถาม/ขอใบเสนอราคาทาง LINE`;
  return {
    title,
    description,
    alternates: { canonical: `/products/${p.model_number}/` },
    openGraph: {
      title,
      description,
      url: `/products/${p.model_number}/`,
      type: "website",
      ...(allPhotos(p).length ? { images: allPhotos(p) } : {}),
    },
  };
}

// "label : value" rows split into two cells; anything else spans the row.
function splitRow(row: string): [string, string] | null {
  const m = row.match(/^(.{2,60}?)\s*:\s*(.+)$/);
  return m ? [m[1], m[2]] : null;
}

const docIcon = (label: string) =>
  label.includes("CAD") ? "📐" : label.includes("Catalog") ? "📚" : "📄";

export default async function ProductDetail(
  { params }: { params: Promise<{ model: string }> }
) {
  const { model } = await params;
  const all = loadAll();
  const p = all.find((x) => x.model_number === model);
  if (!p) return null; // unreachable: params come from the same file

  const brand = p.brand || (p.range_name === "EOCR" ? "Schneider EOCR" : p.range_name);
  const related = all
    .filter((x) => x.model_number !== p.model_number &&
      (x.base_model && p.base_model ? x.base_model === p.base_model : x.range_name === p.range_name))
    .slice(0, 6);

  // Deduplicate docs (series pages repeat the shared catalog)
  const seen = new Set<string>();
  const docs = p.documents.filter((d) => {
    const k = d.local_path || d.official_url || d.label;
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.model_number,
    mpn: p.model_number,
    brand: { "@type": "Brand", name: brand },
    description: p.description,
    ...(allPhotos(p).length
      ? { image: allPhotos(p).map((x) => `https://savautomation.com${x}`) }
      : {}),
    offers: {
      "@type": "Offer",
      // Least-claim rule: only assert availability when the owner has
      // explicitly marked the SKU as stocked; "ask" SKUs claim nothing.
      ...(p.in_stock === true
        ? { availability: "https://schema.org/InStock" }
        : {}),
      priceCurrency: "THB",
      seller: { "@type": "Organization", name: "SAV Mechanical Services & Supplies" },
    },
  };

  return (
    <main className="bg-gray-100 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* top bar */}
      <div className="bg-ink px-6 py-3 flex items-center justify-between">
        <Link href="/" className="font-display font-extrabold text-white text-sm tracking-wide">
          SAV <span className="text-white/50 font-semibold">| Mechanical Services &amp; Supplies</span>
        </Link>
        <Link
          href="/products/"
          className="font-display text-[11px] font-bold tracking-wider uppercase text-white/80 hover:text-white transition-colors"
        >
          ← All products
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* breadcrumb */}
        <p className="font-display text-[11px] font-bold tracking-wider uppercase text-gray-500 mb-6">
          <Link href="/products/" className="hover:text-brand">Products</Link>
          <span className="mx-2 text-gray-300">/</span>
          <span className="text-ink">{p.model_number}</span>
        </p>

        {/* hero card */}
        <div className="bg-white border border-gray-200 border-t-[3px] border-t-brand rounded p-8 mb-6">
          <div className="grid md:grid-cols-[280px_1fr] gap-8 items-start">
            <div>
              <div className="bg-gray-50 border border-gray-100 rounded flex items-center justify-center p-4">
                {p.local_photo_path ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`${BASE}${p.local_photo_path}`}
                    alt={p.model_number}
                    className="max-h-[240px] w-auto object-contain"
                  />
                ) : (
                  <span className="text-6xl opacity-20 py-16">⚙️</span>
                )}
              </div>
              {/* Real stock photos. Plain links to the full-size file rather
                  than a JS lightbox — the reason to open one is to read the
                  rating label, and the browser's own image viewer zooms
                  better than anything worth writing here. */}
              {p.extra_photos && p.extra_photos.length > 0 && (
                <div className="mt-3">
                  <p className="font-display text-[10px] font-bold tracking-[0.15em] uppercase text-gray-500 mb-2">
                    ภาพสินค้าจริง
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {p.extra_photos.map((ph) => (
                      <a
                        key={ph.path}
                        href={`${BASE}${ph.path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-gray-50 border border-gray-200 rounded overflow-hidden hover:border-brand transition-colors"
                        title={ph.caption || `${p.model_number} — ภาพสินค้าจริง`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`${BASE}${ph.path}`}
                          alt={ph.caption || `${p.model_number} ภาพสินค้าจริง`}
                          loading="lazy"
                          className="w-full h-16 object-cover"
                        />
                      </a>
                    ))}
                  </div>
                  {p.extra_photos.some((ph) => ph.caption) && (
                    <p className="text-[11px] text-gray-500 mt-2 leading-snug">
                      {p.extra_photos.find((ph) => ph.caption)?.caption}
                    </p>
                  )}
                </div>
              )}
            </div>
            <div>
              <p className="font-display text-[11px] font-extrabold tracking-[0.2em] uppercase text-brand mb-1">
                {brand}
              </p>
              <h1 className="font-display font-extrabold text-3xl text-ink leading-tight mb-2">
                {p.model_number}
              </h1>
              <p className="text-sm text-gray-600 mb-3">{p.series || p.description}</p>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {p.in_stock === true ? (
                  <span className="inline-block bg-green-50 text-green-700 border border-green-200 font-display text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full">
                    ● มีสต็อกในไทย
                  </span>
                ) : p.in_stock === false ? (
                  <span className="inline-block bg-amber-50 text-amber-700 border border-amber-200 font-display text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full">
                    ◐ สั่งล่วงหน้า
                  </span>
                ) : (
                  <span className="inline-block bg-gray-50 text-gray-500 border border-gray-200 font-display text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full">
                    สอบถามสต็อก
                  </span>
                )}
                {p.oem && (
                  <span className="inline-block bg-amber-50 text-amber-700 border border-amber-200 font-display text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full">
                    OEM model
                  </span>
                )}
              </div>
              {p.your_notes && (
                <p className="text-[13px] text-gray-700 bg-gray-50 border-l-2 border-brand px-3 py-2 mb-5 rounded-r">
                  {p.your_notes}
                </p>
              )}
              {docs.length > 0 && (
                <a
                  href="#downloads"
                  className="group inline-flex items-center gap-1.5 mb-3 text-brand font-display text-sm font-bold hover:underline underline-offset-2"
                >
                  <span aria-hidden className="transition-transform group-hover:translate-y-0.5">↓</span>
                  ดาวน์โหลดเอกสาร
                  <span className="text-[10px] font-bold tracking-[0.14em] text-gray-400">DOWNLOAD</span>
                </a>
              )}
              <DetailActions model={p.model_number} />
            </div>
          </div>
        </div>

        {p.oem && (
          <div className="bg-amber-50 border border-amber-200 rounded p-5 mb-6 text-sm text-amber-900">
            รุ่น OEM ตามข้อกำหนดเฉพาะโครงการ — สเปกละเอียดและเอกสารเฉพาะรุ่น
            กรุณาติดต่อ SAV โดยตรง (เอกสารของซีรีส์พื้นฐานอยู่ด้านล่าง)
          </div>
        )}

        {/* features */}
        {(p.feature_groups || []).map((g) => (
          <div key={g.title} className="bg-white border border-gray-200 rounded p-8 mb-6">
            <h2 className="font-display font-extrabold text-lg text-ink mb-4 pb-3 border-b border-gray-200">
              {g.title}
            </h2>
            <ul className="space-y-1.5">
              {g.items.map((it, i) => (
                <li key={i} className={`text-sm leading-relaxed ${it.startsWith("–") ? "pl-5 text-gray-500" : "text-gray-700"}`}>
                  {it.startsWith("–") ? it : <>▪ {it}</>}
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* specs */}
        {!p.oem && (p.specs || []).length > 0 && (
          <div className="bg-white border border-gray-200 rounded p-8 mb-6">
            <h2 className="font-display font-extrabold text-lg text-ink mb-4 pb-3 border-b border-gray-200">
              Technical Specification
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <tbody>
                  {(p.specs || []).map((g) => (
                    <SpecRows key={g.group} group={g} />
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-gray-400 mt-3">
              ข้อมูลตามเอกสารผู้ผลิต ({brand}) — รายละเอียดฉบับเต็มดูจาก Datasheet ด้านล่าง
            </p>
          </div>
        )}

        {/* downloads */}
        {docs.length > 0 && (
          <div id="downloads" className="bg-white border border-gray-200 rounded p-8 mb-6 scroll-mt-24">
            <h2 className="font-display font-extrabold text-lg text-brand mb-4 pb-3 border-b border-gray-200">
              📥 Downloads — เอกสารสำหรับขออนุมัติโครงการ
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {docs.map((d, i) =>
                d.local_path ? (
                  <a
                    key={i}
                    href={`${BASE}${d.local_path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 border border-gray-200 rounded px-4 py-3 hover:border-brand hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-xl">{docIcon(d.label)}</span>
                    <span className="font-display text-xs font-bold text-ink">{d.label}</span>
                    <span className="ml-auto text-brand text-sm">↓</span>
                  </a>
                ) : null
              )}
            </div>
          </div>
        )}

        {/* related */}
        {related.length > 0 && (
          <div className="bg-white border border-gray-200 rounded p-8 mb-6">
            <h2 className="font-display font-extrabold text-lg text-ink mb-4 pb-3 border-b border-gray-200">
              รุ่นที่เกี่ยวข้อง
            </h2>
            <div className="flex flex-wrap gap-2">
              {related.map((r) => (
                <Link
                  key={r.model_number}
                  href={`/products/${r.model_number}/`}
                  className="font-display text-xs font-bold border border-gray-300 text-ink px-4 py-2 rounded-sm hover:border-brand hover:text-brand transition-colors"
                >
                  {r.model_number}
                </Link>
              ))}
            </div>
          </div>
        )}

        <p className="text-center text-[12px] text-gray-500 pb-8">
          จำหน่ายโดย หจก. เอส เอ วี เมคคานิคคอล เซอร์วิสส์ แอนด์ ซัพพลายส์ —
          สอบถาม/ขอใบเสนอราคา: <Link href="/#contact" className="text-brand font-bold">ติดต่อเรา</Link>
        </p>
      </div>
    </main>
  );
}

function SpecRows({ group }: { group: SpecGroup }) {
  if (group.rows.length === 0) {
    // the group label itself carries the value ("Screw Torque : Max 0.6N.m")
    const kv = splitRow(group.group);
    return (
      <tr className="border-b border-gray-100">
        <td className="py-2.5 pr-4 font-semibold text-ink align-top w-[38%]">{kv ? kv[0] : group.group}</td>
        <td className="py-2.5 text-gray-700" colSpan={2}>{kv ? kv[1] : ""}</td>
      </tr>
    );
  }
  return (
    <>
      <tr className="border-b border-gray-200 bg-gray-50">
        <td colSpan={3} className="py-2 px-3 font-display text-[11px] font-extrabold tracking-wider uppercase text-gray-600">
          {group.group}
        </td>
      </tr>
      {group.rows.map((row, i) => {
        const kv = splitRow(row);
        return (
          <tr key={i} className="border-b border-gray-100">
            {kv ? (
              <>
                <td className="py-2.5 pr-4 pl-3 font-medium text-ink align-top w-[38%]">{kv[0]}</td>
                <td className="py-2.5 text-gray-700" colSpan={2}>{kv[1]}</td>
              </>
            ) : (
              <td colSpan={3} className="py-2.5 pl-3 text-gray-700">{row}</td>
            )}
          </tr>
        );
      })}
    </>
  );
}

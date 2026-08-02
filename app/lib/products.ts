import fs from "node:fs";
import path from "node:path";

// ============================================================================
// Catalog loading, server side only.
//
// public/products/index.json is the built catalog; every page that needs the
// whole list reads it through here. It used to be re-parsed with a slightly
// different local Product type in each page, which is how the detail page and
// the sitemap can silently disagree about which products exist.
// ============================================================================

export type ProductDoc = {
  label: string;
  official_url: string | null;
  local_path: string | null;
};

export type SpecGroup = { group: string; rows: string[] };
export type FeatureGroup = { title: string; items: string[] };

export type Product = {
  model_number: string;
  title: string | null;
  range_name: string | null;
  range_short_desc?: string | null;
  brand?: string | null;
  series?: string | null;
  base_model?: string | null;
  description: string | null;
  feature_groups?: FeatureGroup[];
  specs?: SpecGroup[];
  oem?: boolean;
  needs_review?: boolean;
  end_of_sale: string | null;
  official_image_url: string | null;
  local_photo_path: string | null;
  image_confirmed_unavailable: boolean;
  /**
   * Real photos of the stock SAV actually holds, shown under the catalog
   * render. A buyer trusts "here is the unit on our shelf" in a way a
   * manufacturer illustration cannot earn. Optional and additive.
   */
  extra_photos?: { path: string; caption?: string | null }[];
  documents: ProductDoc[];
  source_url: string | null;
  category: string | null;
  /**
   * Stock states: true = in stock in Thailand (พร้อมส่ง),
   * false = pre-order / lead time (สั่งล่วงหน้า), null/undefined = ask.
   * Edit per-SKU in public/products/index.json (field: "in_stock").
   */
  in_stock: boolean | null;
  your_price?: string | null;
  your_notes?: string | null;
};

let cache: Product[] | null = null;

/** Every product, parsed once per build. Throws if the catalog is unreadable. */
export function allProducts(): Product[] {
  if (!cache) {
    const p = path.join(process.cwd(), "public", "products", "index.json");
    cache = JSON.parse(fs.readFileSync(p, "utf-8")) as Product[];
  }
  return cache;
}

export function productByModel(model: string): Product | undefined {
  return allProducts().find((x) => x.model_number === model);
}

/**
 * Strip "MODEL - " prefix and "| Schneider Electric ..." suffix from scraped
 * titles, leaving the clean spec description a customer actually reads.
 */
export function cleanDescription(
  title: string | null | undefined,
  model: string
): string | null {
  if (!title) return null;
  let cleaned = title.replace(/\s*\|\s*Schneider Electric\s*\S*\s*$/, "").trim();
  const prefix = `${model} - `;
  if (cleaned.startsWith(prefix)) cleaned = cleaned.slice(prefix.length);
  return cleaned.trim();
}

// Document labels come straight from whatever language the source page was
// scraped in (mostly Korean). Translate the known ones for display.
const LABEL_TRANSLATIONS: Record<string, string> = {
  "제품 데이터 시트": "Datasheet",
  "사용자 가이드": "User Guide",
  카탈로그: "Catalog",
  "제품 선택도구": "Product Selector",
};

export function translateLabel(label: string): string {
  return LABEL_TRANSLATIONS[label.trim()] || label;
}

/**
 * What a catalog card actually renders — nothing more.
 *
 * The full catalog is ~440 KB of JSON; the cards use ~52 KB of it. The client
 * grid is fed this projection so every product can be baked into the server
 * HTML (which is the entire point: crawlers that do not run JavaScript were
 * seeing an empty catalog) without shipping specs and feature lists that only
 * the detail pages read.
 */
export type CatalogEntry = {
  model: string;
  series: string;
  /** Cleaned scraped title, already stripped of vendor boilerplate. */
  description: string | null;
  image: string | null;
  inStock: boolean | null;
  endOfSale: string | null;
  docs: { label: string; path: string | null }[];
};

export function toCatalogEntry(
  p: Product,
  series: string
): CatalogEntry {
  return {
    model: p.model_number,
    series,
    description: cleanDescription(p.title, p.model_number),
    image: p.local_photo_path || p.official_image_url,
    inStock: p.in_stock ?? null,
    endOfSale: p.end_of_sale,
    docs: (p.documents ?? []).map((d) => ({
      label: translateLabel(d.label || "Document"),
      path: d.local_path,
    })),
  };
}

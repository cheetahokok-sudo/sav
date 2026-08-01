import type { MetadataRoute } from "next";
import fs from "node:fs";
import path from "node:path";
import { allArticles } from "./lib/knowledge";
import { TOOLS } from "./components/knowledge/toolsList";

export const dynamic = "force-static";

function productSlugs(): string[] {
  try {
    const p = path.join(process.cwd(), "public", "products", "index.json");
    const rows = JSON.parse(fs.readFileSync(p, "utf-8")) as { model_number: string }[];
    return rows.map((r) => r.model_number);
  } catch {
    return [];
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://savautomation.com";
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/products/`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/learn/`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    // calculator tools — derived from the TOOLS registry so the sitemap can't drift
    ...TOOLS.map((t) => ({
      url: `${base}${t.href}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];

  const products: MetadataRoute.Sitemap = productSlugs().map((m) => ({
    url: `${base}/products/${m}/`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const articles: MetadataRoute.Sitemap = allArticles().map((a) => ({
    url: `${base}/learn/${a.slug}/`,
    lastModified: new Date(a.updated),
    changeFrequency: "monthly",
    priority: a.pillar ? 0.8 : 0.7,
  }));

  return [...staticPages, ...products, ...articles];
}

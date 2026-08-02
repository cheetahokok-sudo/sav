import type { MetadataRoute } from "next";
import { allArticles } from "./lib/knowledge";
import { TOOLS } from "./components/knowledge/toolsList";
import { allProducts } from "./lib/products";
import { CATEGORIES } from "./lib/series";
import { SITE_URL } from "./lib/company";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL;
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/products/`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/learn/`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/about/`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/contact/`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    // calculator tools — derived from the TOOLS registry so the sitemap can't drift
    ...TOOLS.map((t) => ({
      url: `${base}${t.href}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];

  // Category pages sit above individual models: they are the pages that can win
  // "EOCR-SS ราคา"-shaped searches, where a single part number cannot.
  const categories: MetadataRoute.Sitemap = CATEGORIES.map((c) => ({
    url: `${base}/products/series/${c.slug}/`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  const products: MetadataRoute.Sitemap = allProducts().map((p) => ({
    url: `${base}/products/${p.model_number}/`,
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

  return [...staticPages, ...categories, ...products, ...articles];
}

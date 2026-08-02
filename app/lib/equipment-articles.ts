import { allArticles, type ArticleMeta } from "./knowledge";
import { DRIVEN_EQUIPMENT, type DrivenEquipment } from "./driven-equipment";

// ============================================================================
// Joins the driven-equipment dataset to the articles that exist on disk.
//
// SERVER ONLY. allArticles() reads content/knowledge from the filesystem, so a
// "use client" component must never import this — the Selector takes the join
// as props from its page instead. driven-equipment.ts itself stays free of any
// fs access for exactly that reason, which is also why this check cannot live
// alongside the other integrity checks in that file.
// ============================================================================

const BY_SLUG = new Map(allArticles().map((a) => [a.slug, a]));

// Build-time. An articleSlug pointing at nothing would send the Selector and
// every "read the full guide" link to a 404 — the same class of silent dead
// link the checks in driven-equipment.ts exist to catch.
for (const e of DRIVEN_EQUIPMENT) {
  if (e.articleSlug && !BY_SLUG.has(e.articleSlug)) {
    throw new Error(
      `equipment-articles: "${e.id}" has articleSlug "${e.articleSlug}" but content/knowledge/${e.articleSlug}.mdx does not exist`
    );
  }
}

/** The L-page for this equipment, once it has been published. */
export function articleFor(e: DrivenEquipment): ArticleMeta | undefined {
  return e.articleSlug ? BY_SLUG.get(e.articleSlug) : undefined;
}

/**
 * Industry articles that reference this equipment.
 *
 * Deliberately forgiving, matching articlesBySlugs() in knowledge.ts: the
 * dataset names industry articles before they are written, so an unwritten
 * slug drops out quietly rather than rendering a link to a 404.
 */
export function industryArticlesFor(e: DrivenEquipment): ArticleMeta[] {
  return e.industries
    .map((slug) => BY_SLUG.get(slug))
    .filter((a): a is ArticleMeta => Boolean(a));
}

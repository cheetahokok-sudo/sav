import type { MetadataRoute } from "next";
import { SITE_URL } from "./lib/company";

export const dynamic = "force-static";

/**
 * `User-agent: *` already permits everything, so these named rules change no
 * behaviour — they record the decision. AI crawlers split into two kinds and
 * the distinction is easy to get wrong later:
 *
 *   search/citation — OAI-SearchBot, Claude-SearchBot, Claude-User,
 *                     PerplexityBot. Blocking these removes SAV from ChatGPT,
 *                     Claude and Perplexity answers.
 *   model training  — GPTBot, ClaudeBot. Blocking these does NOT remove SAV
 *                     from those products' search results.
 *
 * Both are allowed here deliberately: a public parts catalogue has nothing to
 * protect, and the goal is to be found.
 */
const AI_AGENTS = [
  "OAI-SearchBot",
  "ChatGPT-User",
  "GPTBot",
  "Claude-SearchBot",
  "Claude-User",
  "ClaudeBot",
  "PerplexityBot",
  "Google-Extended",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      ...AI_AGENTS.map((userAgent) => ({ userAgent, allow: "/" })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

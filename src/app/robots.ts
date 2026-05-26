import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/site";

/**
 * Permissive robots policy — allow all crawlers (including AI/LLM bots)
 * to read public pages, but block private surfaces (admin, API).
 *
 * Named AI agents are listed explicitly so future policy changes
 * (block training, allow answers, etc.) are a single-line edit.
 */
const AI_USER_AGENTS = [
  "GPTBot",            // OpenAI training & ChatGPT browsing
  "OAI-SearchBot",     // OpenAI SearchGPT
  "ChatGPT-User",      // ChatGPT browsing on user request
  "ClaudeBot",         // Anthropic crawler
  "anthropic-ai",      // Legacy Anthropic UA
  "Claude-Web",        // Anthropic web fetcher
  "PerplexityBot",     // Perplexity indexing
  "Perplexity-User",   // Perplexity on-demand
  "Google-Extended",   // Google Gemini / Bard opt-in
  "GoogleOther",       // Google research crawlers
  "Applebot-Extended", // Apple Intelligence opt-in
  "CCBot",             // Common Crawl (used by many LLMs)
  "Bytespider",        // ByteDance / Doubao
  "Amazonbot",         // Amazon Alexa / search
  "DuckAssistBot",     // DuckDuckGo AI
  "Meta-ExternalAgent",// Meta AI
  "cohere-ai",         // Cohere
  "Diffbot",           // Diffbot / Knowledge Graph
  "YouBot",            // You.com
];

export default function robots(): MetadataRoute.Robots {
  const disallow = ["/admin", "/api"];

  return {
    rules: [
      { userAgent: "*",                 allow: "/", disallow },
      ...AI_USER_AGENTS.map((ua) => ({ userAgent: ua, allow: "/", disallow })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

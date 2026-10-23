/**
 * Bekannte Crawler – eine Liste für robots.txt (Zugriffsregeln) und den Proxy (Crawl-Protokoll).
 *
 * Kategorien:
 * - search:       klassische Suchmaschinen-Indexierung (Google, Bing, Apple, DuckDuckGo).
 * - ai-search:    Index für KI-Suchen, die mit Link zitieren (ChatGPT Search, Perplexity, Claude).
 * - ai-assistant: Abruf einer Seite, wenn jemand einen KI-Assistenten konkret danach fragt.
 * - ai-training:  Trainingsdaten für Sprachmodelle.
 * - social:       Link-Vorschauen (WhatsApp, LinkedIn, Facebook, X) – nur fürs Protokoll.
 *
 * Alle dürfen die öffentlichen Seiten lesen: Für ein lokales Unternehmen zählt jede Erwähnung in
 * Suchergebnissen und KI-Antworten. Soll die Website nicht mehr in KI-Trainingsdaten einfließen,
 * `AI_TRAINING_ALLOWED` auf false setzen – Suche und KI-Suche bleiben davon unberührt.
 */
export const AI_TRAINING_ALLOWED = true;

export type CrawlerCategory = "search" | "ai-search" | "ai-assistant" | "ai-training" | "social";

export interface Crawler {
  /** User-Agent-Token im robots.txt und Name im Protokoll. */
  name: string;
  category: CrawlerCategory;
  /** Erkennung am User-Agent – fehlt bei reinen robots.txt-Tokens (Google-Extended, Applebot-Extended). */
  pattern?: RegExp;
}

export const crawlers: Crawler[] = [
  { name: "Googlebot", category: "search", pattern: /Googlebot|Google-InspectionTool|GoogleOther/i },
  { name: "Bingbot", category: "search", pattern: /bingbot/i },
  { name: "Applebot", category: "search", pattern: /Applebot/i },
  { name: "DuckDuckBot", category: "search", pattern: /DuckDuckBot/i },

  { name: "OAI-SearchBot", category: "ai-search", pattern: /OAI-SearchBot/i },
  { name: "PerplexityBot", category: "ai-search", pattern: /PerplexityBot/i },
  { name: "Claude-SearchBot", category: "ai-search", pattern: /Claude-SearchBot/i },

  { name: "ChatGPT-User", category: "ai-assistant", pattern: /ChatGPT-User/i },
  { name: "Perplexity-User", category: "ai-assistant", pattern: /Perplexity-User/i },
  { name: "Claude-User", category: "ai-assistant", pattern: /Claude-User/i },
  { name: "MistralAI-User", category: "ai-assistant", pattern: /MistralAI-User/i },

  { name: "GPTBot", category: "ai-training", pattern: /GPTBot/i },
  { name: "ClaudeBot", category: "ai-training", pattern: /ClaudeBot/i },
  { name: "Google-Extended", category: "ai-training" },
  { name: "Applebot-Extended", category: "ai-training" },
  { name: "CCBot", category: "ai-training", pattern: /CCBot/i },
  { name: "meta-externalagent", category: "ai-training", pattern: /meta-externalagent/i },

  { name: "facebookexternalhit", category: "social", pattern: /facebookexternalhit|facebookcatalog/i },
  { name: "LinkedInBot", category: "social", pattern: /LinkedInBot/i },
  { name: "Twitterbot", category: "social", pattern: /Twitterbot/i },
  { name: "WhatsApp", category: "social", pattern: /WhatsApp/i },
];

/** Crawler anhand des User-Agents – null für normale Browser. Prüft den Text, nicht die Herkunft (keine DNS-Verifizierung). */
export function detectCrawler(userAgent: string | null): Crawler | null {
  if (!userAgent) return null;
  return crawlers.find((crawler) => crawler.pattern?.test(userAgent)) ?? null;
}

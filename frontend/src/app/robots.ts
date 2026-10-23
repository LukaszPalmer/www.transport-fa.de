import type { MetadataRoute } from "next";
import { company } from "@/content/company";
import { AI_TRAINING_ALLOWED, crawlers, type CrawlerCategory } from "@/lib/crawlers";

/** Nie crawlen: Admin-Bereich (Login, interne Daten) und API-Endpunkte. Das Kundenportal bleibt erreichbar – es trägt noindex. */
const DISALLOW = ["/admin", "/api/"];

const names = (category: CrawlerCategory) => crawlers.filter((crawler) => crawler.category === category).map((crawler) => crawler.name);

/**
 * Suchmaschinen und KI-Crawler sind ausdrücklich genannt (eigene Gruppen ersetzen für sie die *-Regel) –
 * so lässt sich der Zugriff je Gruppe steuern, ohne die anderen zu berühren. Liste: src/lib/crawlers.ts.
 */
export default function robots(): MetadataRoute.Robots {
  const open = { allow: "/", disallow: DISALLOW };
  return {
    rules: [
      { userAgent: "*", ...open },
      { userAgent: names("search"), ...open },
      { userAgent: [...names("ai-search"), ...names("ai-assistant")], ...open },
      { userAgent: names("ai-training"), ...(AI_TRAINING_ALLOWED ? open : { disallow: "/" }) },
    ],
    sitemap: `${company.siteUrl}/sitemap.xml`,
  };
}

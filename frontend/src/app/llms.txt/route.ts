import { blogHref, sortedPosts } from "@/content/blog";
import { company } from "@/content/company";
import { routes } from "@/content/navigation";
import { getServices, serviceHref, services } from "@/content/services";
import { companyFacts, markdownResponse } from "@/lib/llms";
import { absoluteUrl } from "@/lib/seo";

/**
 * /llms.txt (llmstxt.org) – kompakte Übersicht für KI-Suchen (ChatGPT, Perplexity, Gemini, Claude):
 * wer wir sind, was wir anbieten, wo die Details stehen. Gespeist aus denselben Quellen wie Website
 * und Sitemap, beim Build erzeugt. Alle Inhalte am Stück: /llms-full.txt.
 */
export const dynamic = "force-static";

export function GET() {
  return markdownResponse([
    `# ${company.legalName}`,
    "",
    `> ${company.name} ist ein Umzugs- und Transportunternehmen aus ${company.address.city}: Umzüge, Entrümpelungen, Haushaltsauflösungen und Transporte zum verbindlichen Festpreis – im Raum ${company.address.city} (${company.serviceArea.slice(1).join(", ")}) sowie deutschland- und europaweit.`,
    "",
    "## Unternehmen",
    "",
    ...companyFacts(),
    `- Kostenloses Angebot: ${absoluteUrl(routes.contact)}`,
    "",
    "## Leistungen",
    "",
    ...services.map((service) => `- [${service.name}](${absoluteUrl(serviceHref(service.slug))}): ${service.teaser}`),
    "",
    "## Ratgeber",
    "",
    ...sortedPosts().map((post) => `- [${post.title}](${absoluteUrl(blogHref(post.slug))}): ${post.excerpt}`),
    "",
    "## English",
    "",
    `- [Home](${absoluteUrl("/", "en")}): ${company.descriptions.en}`,
    ...getServices("en").map((service) => `- [${service.name}](${absoluteUrl(serviceHref(service.slug), "en")}): ${service.teaser}`),
    `- [Contact & free quote](${absoluteUrl(routes.contact, "en")})`,
    "",
    "## Optional",
    "",
    `- [Alle Inhalte als Text (Leistungen, FAQ, Ratgeber)](${company.siteUrl}/llms-full.txt)`,
    `- [Karriere](${absoluteUrl(routes.careers)})`,
    `- [Impressum](${absoluteUrl("/impressum")})`,
    `- [Datenschutz](${absoluteUrl("/datenschutz")})`,
  ]);
}

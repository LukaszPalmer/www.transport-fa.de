import { sortedPosts } from "@/content/blog";
import { company } from "@/content/company";
import { routes } from "@/content/navigation";
import { services } from "@/content/services";
import { companyFacts, markdownResponse, postToMarkdown, serviceToMarkdown } from "@/lib/llms";
import { absoluteUrl } from "@/lib/seo";

/**
 * /llms-full.txt – alle Inhalte der Website (Leistungen mit Umfang, Ablauf und FAQ, alle Ratgeber im
 * Volltext) als ein Markdown-Dokument. Für KI-Systeme, die eine Quelle komplett einlesen (RAG), statt
 * HTML-Seiten einzeln zu zerlegen. Deutsch; die englische Website liegt unter /en.
 */
export const dynamic = "force-static";

export function GET() {
  return markdownResponse([
    `# ${company.legalName} – Leistungen und Ratgeber`,
    "",
    `> ${company.descriptions.de} Sitz in ${company.address.city}, im Einsatz in ${company.serviceArea.join(", ")} und Umgebung – Transporte deutschland- und europaweit.`,
    "",
    "## Unternehmen",
    "",
    ...companyFacts(),
    `- Kostenloses Angebot: ${absoluteUrl(routes.contact)}`,
    "",
    "## Leistungen",
    "",
    ...services.flatMap((service) => [serviceToMarkdown(service), ""]),
    "## Ratgeber",
    "",
    ...sortedPosts().flatMap((post) => [postToMarkdown(post), "---", ""]),
  ]);
}

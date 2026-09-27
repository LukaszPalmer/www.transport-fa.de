import { COMPANY, formattedVatId, hasRegisterEntry, ownerTitle } from "@fa/shared";
import { blogHref, sortedPosts } from "@/content/blog";
import { company } from "@/content/company";
import { routes } from "@/content/navigation";
import { serviceHref, services } from "@/content/services";

/**
 * /llms.txt (llmstxt.org) – kompakte Firmenübersicht für KI-Suchen (ChatGPT, Perplexity,
 * Gemini, Claude). Gespeist aus denselben Quellen wie Website und Sitemap, beim Build erzeugt.
 */
export const dynamic = "force-static";

export function GET() {
  const url = (path: string) => `${company.siteUrl}${path === "/" ? "" : path}`;
  const { address, contact } = company;

  const lines = [
    `# ${company.legalName}`,
    "",
    `> ${company.descriptions.de} Sitz in ${address.city}-Gerresheim, im Einsatz in ${company.serviceArea.join(", ")} und Umgebung – Transporte deutschland- und europaweit.`,
    "",
    "## Unternehmen",
    "",
    `- Anschrift: ${address.street}, ${address.postalCode} ${address.city}`,
    `- Telefon: ${contact.phone}`,
    `- E-Mail: ${contact.email}`,
    `- Erreichbarkeit: ${contact.hours}`,
    `- ${ownerTitle()}: ${company.owner}`,
    hasRegisterEntry() ? `- Handelsregister: ${COMPANY.register.court}, ${COMPANY.register.number}` : undefined,
    `- USt-IdNr.: ${formattedVatId()}`,
    `- Angebot anfragen: ${url(routes.contact)}`,
    "",
    "## Leistungen",
    "",
    ...services.map((service) => `- [${service.name}](${url(serviceHref(service.slug))}): ${service.teaser}`),
    "",
    "## Ratgeber",
    "",
    ...sortedPosts().map((post) => `- [${post.title}](${url(blogHref(post.slug))}): ${post.excerpt}`),
    "",
    "## Weitere Seiten",
    "",
    `- [Kontakt und kostenloses Angebot](${url(routes.contact)})`,
    `- [Karriere](${url(routes.careers)})`,
    `- [Impressum](${url("/impressum")})`,
    `- [Datenschutz](${url("/datenschutz")})`,
  ];

  return new Response(`${lines.filter((line) => line !== undefined).join("\n")}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

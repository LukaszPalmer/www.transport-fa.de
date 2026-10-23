import { COMPANY, formattedVatId, hasRegisterEntry, ownerTitle } from "@fa/shared";
import type { ServiceArea } from "@/types/content";
import { blogHref, formatPostDate, getCategory, type BlogBlock, type BlogPost } from "@/content/blog";
import { company } from "@/content/company";
import { serviceHref } from "@/content/services";
import { absoluteUrl } from "@/lib/seo";

/**
 * Markdown-Bausteine für /llms.txt und /llms-full.txt (llmstxt.org): Inhalte der Website als
 * schlanker Text für KI-Suchen und RAG-Systeme – gleiche Quellen wie die Seiten, daher immer aktuell.
 */

/** Kerndaten des Unternehmens als Liste – zitierfähig, ohne Marketing-Sprache. */
export function companyFacts(): string[] {
  const { address, contact } = company;
  return [
    `- Firma: ${company.legalName}`,
    `- Anschrift: ${address.street}, ${address.postalCode} ${address.city} (Stadtteil Gerresheim), ${address.country}`,
    `- Telefon: ${contact.phone} (international ${contact.phoneHref.replace("tel:", "")})`,
    `- E-Mail: ${contact.email}`,
    `- Erreichbarkeit: ${contact.hours}`,
    `- Einsatzgebiet: ${company.serviceArea.join(", ")}; Fern- und Auslandstransporte deutschland- und europaweit`,
    `- ${ownerTitle()}: ${company.owner}`,
    hasRegisterEntry() ? `- Handelsregister: ${COMPANY.register.court}, ${COMPANY.register.number}` : undefined,
    `- USt-IdNr.: ${formattedVatId()}`,
    `- Website: ${company.siteUrl} (Englisch: ${absoluteUrl("/", "en")})`,
  ].filter((line): line is string => line !== undefined);
}

const absolute = (href: string) => (href.startsWith("/") ? `${company.siteUrl}${href}` : href);

/** Ein Textblock eines Beitrags als Markdown (Überschriften eine Ebene unter dem Beitragstitel). */
function blockToMarkdown(block: BlogBlock): string {
  switch (block.type) {
    case "paragraph":
      return block.text;
    case "heading":
      return `#### ${block.text}`;
    case "subheading":
      return `##### ${block.text}`;
    case "list":
      return block.items.map((item, index) => (block.ordered ? `${index + 1}. ${item}` : `- ${item}`)).join("\n");
    case "checklist":
      return [block.title && `**${block.title}**`, ...block.items.map((item) => `- ${item}`)].filter(Boolean).join("\n");
    case "table":
      return [
        `**${block.caption}**`,
        "",
        `| ${block.head.join(" | ")} |`,
        `| ${block.head.map(() => "---").join(" | ")} |`,
        ...block.rows.map((row) => `| ${row.join(" | ")} |`),
        ...(block.note ? ["", `_${block.note}_`] : []),
      ].join("\n");
    case "tip":
      return `> **${block.title}:** ${block.text}`;
    case "quote":
      return `> „${block.text}“${block.cite ? ` – ${block.cite}` : ""}`;
    case "image":
      return `![${block.alt}](${absolute(block.src)})${block.caption ? `\n_${block.caption}_` : ""}`;
    case "link":
      return `→ [${block.label}](${absolute(block.href)})${block.text ? `: ${block.text}` : ""}`;
  }
}

export function serviceToMarkdown(service: ServiceArea): string {
  return [
    `### ${service.name}`,
    "",
    `URL: ${absoluteUrl(serviceHref(service.slug))} · Stand: ${formatPostDate(service.updatedAt)}`,
    "",
    service.hero.subheadline,
    "",
    `**${service.hero.factsTitle}:**`,
    ...service.hero.facts.map((fact) => `- ${fact}`),
    "",
    `#### ${service.scope.title}`,
    "",
    service.scope.description,
    "",
    ...service.scope.items.map((item) => `- **${item.title}:** ${item.description} (${item.highlights.join(", ")})`),
    "",
    `#### ${service.processTitle}`,
    "",
    ...service.process.map((step, index) => `${index + 1}. **${step.title}:** ${step.description}`),
    "",
    "#### Häufige Fragen",
    "",
    ...service.faqs.flatMap((faq) => [`**${faq.question}**`, faq.answer, ""]),
  ].join("\n");
}

export function postToMarkdown(post: BlogPost): string {
  const category = getCategory(post.category);
  const dates = post.updatedAt
    ? `Veröffentlicht ${formatPostDate(post.publishedAt)}, aktualisiert ${formatPostDate(post.updatedAt)}`
    : `Veröffentlicht ${formatPostDate(post.publishedAt)}`;
  return [
    `### ${post.title}`,
    "",
    `URL: ${absoluteUrl(blogHref(post.slug))} · ${dates}${category ? ` · Thema: ${category.name}` : ""}`,
    "",
    `_${post.excerpt}_`,
    "",
    ...post.body.flatMap((block) => [blockToMarkdown(block), ""]),
    ...(post.faqs?.length ? ["#### Häufige Fragen", "", ...post.faqs.flatMap((faq) => [`**${faq.question}**`, faq.answer, ""])] : []),
  ].join("\n");
}

/** Antwort als Klartext (UTF-8) – die Routen sind statisch und werden bis zum nächsten Deploy aus dem CDN geliefert. */
export function markdownResponse(lines: string[]): Response {
  return new Response(`${lines.join("\n").trim()}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

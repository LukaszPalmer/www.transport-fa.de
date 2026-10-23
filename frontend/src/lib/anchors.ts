import { headingId } from "@/content/blog-utils";

/**
 * Feste Anker-ID einer FAQ-Frage („#faq-was-kostet-ein-umzug") – gleich in Seite und JSON-LD,
 * damit Suchmaschinen und KI-Antworten direkt auf die Antwort verlinken können.
 */
export const faqAnchor = (question: string) => `faq-${headingId(question)}`;

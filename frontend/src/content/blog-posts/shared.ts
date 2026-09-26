import type { BlogPost } from "../blog";

/**
 * Gemeinsame Angaben der Blogbeiträge. Liegt bewusst nicht in blog.ts: blog.ts importiert
 * die Beiträge – ein Wert-Import in die Gegenrichtung wäre ein Zirkelbezug.
 */

/** Autorenangabe für Beiträge, die das Team gemeinsam verantwortet. */
export const editorialTeam: BlogPost["author"] = {
  name: "Redaktion FA Transport",
  role: "Team Umzug, Räumung & Logistik",
  team: true,
};

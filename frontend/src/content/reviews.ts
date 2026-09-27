import type { Review, ReviewSource } from "@/types/content";

/**
 * Kundenbewertungen
 * -----------------
 * Es werden ausschließlich echte Bewertungen angezeigt – mit Quelle, Datum und Link zum Original.
 * Erfundene oder gekaufte Bewertungen sind unzulässig (§ 3 Abs. 3 UWG i. V. m. Anhang Nr. 23b/23c).
 *
 * Auswahlregel (neutral, § 5b Abs. 3 UWG): die jeweils neuesten Bewertungen mit Text – unabhängig
 * von der Sternezahl. Die Gesamtbewertung kommt unverändert von der Plattform und umfasst alle
 * Bewertungen, auch die kritischen. Texte werden nicht verändert (inkl. Emojis und Tippfehlern),
 * Namen kürzen wir auf Vorname + Initial.
 *
 * Pflege: neue Bewertungen oben ergänzen, `rating` der Plattform und `asOf` aktualisieren.
 * Über `service` erscheint eine Bewertung automatisch auf der passenden Leistungsseite.
 * Ohne Bewertungen zeigt die Website einen Einladungs-Zustand statt einer leeren Liste.
 *
 * Google: Das Unternehmensprofil ist noch nicht verifiziert (Bestätigung per Post/Video steht aus).
 * Solange erscheint Google nur als „folgt in Kürze" – danach `available: true`, Place-ID eintragen.
 */

export interface ReviewPlatform {
  name: string;
  /** false = Profil noch nicht öffentlich (kein Link, Hinweis „folgt in Kürze"). */
  available: boolean;
  profileUrl: string;
  writeReviewUrl: string;
  note: string;
  noteEn: string;
  /** Gesamtbewertung laut Plattform (alle Bewertungen) – mit Stand. */
  rating?: { value: number; count: number; asOf: string };
  /** Originallogo der Plattform (unverändert, public/brands/). */
  logo: { src: string; width: number; height: number };
}

export const reviewPlatforms: Record<ReviewSource, ReviewPlatform> = {
  google: {
    name: "Google",
    available: false,
    profileUrl: "https://www.google.com/maps/search/?api=1&query=FA+Transport",
    // Nach der Verifizierung: https://search.google.com/local/writereview?placeid=<PLACE_ID>
    writeReviewUrl: "",
    note: "Unternehmensprofil in Vorbereitung",
    noteEn: "Business profile coming soon",
    logo: { src: "/brands/google-logo.svg", width: 272, height: 92 },
  },
};

/** Echte Kundenbewertungen – unverändert, mit Quelle und Link zum Original. */
export const reviews: Review[] = [];

/** Pflichthinweis zur Echtheit und Auswahl von Bewertungen (§ 5b Abs. 3 UWG) – englische Fassung. */
export const reviewAuthenticityNoteEn =
  "Note on authenticity: the reviews shown are taken unchanged from the platform stated with each review and link to the original. We show the most recent reviews with text – regardless of the star rating; the overall rating comes from the platform and includes all reviews, including critical ones. We abbreviate names.";

/** Pflichthinweis zur Echtheit und Auswahl von Bewertungen (§ 5b Abs. 3 UWG). */
export const reviewAuthenticityNote =
  "Hinweis zur Echtheit: Die angezeigten Bewertungen stammen unverändert von der jeweils genannten Plattform und sind dort im Original verlinkt. Wir zeigen die jeweils neuesten Bewertungen mit Text – unabhängig von der Sternezahl; die Gesamtnote kommt von der Plattform und umfasst alle Bewertungen, auch kritische. Namen kürzen wir ab.";

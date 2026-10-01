import type { Review, ReviewSource } from "@/types/content";

/**
 * Kundenbewertungen
 * -----------------
 * Es werden ausschließlich echte Bewertungen angezeigt – mit Quelle, Datum und Link zum Original.
 * Erfundene oder gekaufte Bewertungen sind unzulässig (§ 3 Abs. 3 UWG i. V. m. Anhang Nr. 23b/23c).
 *
 * Auswahlregel (neutral, § 5b Abs. 3 UWG): die jeweils neuesten Bewertungen mit Text – unabhängig
 * von der Sternezahl. Die Gesamtbewertung kommt unverändert von der Plattform und umfasst alle
 * Bewertungen, auch die kritischen. Texte werden nicht verändert (inkl. Emojis und Tippfehlern).
 *
 * Google: Bewertungen und Gesamtnote werden live über die Places API geladen (src/lib/google-reviews.ts,
 * alle 6 Stunden aktualisiert). Dafür braucht es `placeId` unten und GOOGLE_PLACES_API_KEY in der Umgebung.
 * Fehlt eins davon, zeigt die Website den Einladungs-Zustand mit Link zum Profil.
 *
 * `reviews` unten bleibt für Bewertungen anderer Plattformen (von Hand gepflegt, neue oben ergänzen).
 * Über `service` erscheint eine Bewertung automatisch auf der passenden Leistungsseite.
 */

export interface ReviewPlatform {
  name: string;
  /** false = Profil noch nicht öffentlich (wird nicht angezeigt). */
  available: boolean;
  profileUrl: string;
  writeReviewUrl: string;
  note: string;
  noteEn: string;
  /** Gesamtbewertung laut Plattform (alle Bewertungen) – mit Stand. Bei Google live geladen. */
  rating?: { value: number; count: number; asOf: string };
  /** Originallogo der Plattform (unverändert, public/brands/). */
  logo: { src: string; width: number; height: number };
}

/**
 * Place-ID des Google-Unternehmensprofils „FA Transport GmbH" (öffentlich, kein Geheimnis).
 * Ermitteln: https://developers.google.com/maps/documentation/places/web-service/place-id → „FA Transport GmbH Düsseldorf".
 */
export const googlePlaceId = "ChIJ202y2__JuEcRhwZYpAbd3zg";

/**
 * Bewertungen dieser Verfasser werden nicht angezeigt: Bewertungen aus dem eigenen Unternehmen
 * (Inhaber, Familie, Mitarbeitende) sind keine Kundenstimmen und dürfen nicht als solche erscheinen.
 * Ein Eintrag passt, wenn alle seine Wörter im Namen vorkommen – „Fakih" trifft also jeden
 * Verfasser mit diesem Nachnamen (Geschäftsführer Reda Fakih und Familie), „Ali Ftouni" nur ihn.
 */
export const excludedReviewAuthors = ["Ali Ftouni", "Fakih"];

const googleProfileUrl = googlePlaceId
  ? `https://www.google.com/maps/place/?q=place_id:${googlePlaceId}`
  : "https://www.google.com/maps/search/?api=1&query=FA+Transport+GmbH+Torfbruchstra%C3%9Fe+46+D%C3%BCsseldorf";

export const reviewPlatforms: Record<ReviewSource, ReviewPlatform> = {
  google: {
    name: "Google",
    available: true,
    profileUrl: googleProfileUrl,
    writeReviewUrl: googlePlaceId ? `https://search.google.com/local/writereview?placeid=${googlePlaceId}` : googleProfileUrl,
    note: "Bewertungen auf unserem Google-Unternehmensprofil",
    noteEn: "Reviews on our Google business profile",
    logo: { src: "/brands/google-logo.svg", width: 272, height: 92 },
  },
};

/** Von Hand gepflegte Bewertungen anderer Plattformen – unverändert, mit Quelle und Link zum Original. */
export const reviews: Review[] = [];

/** Pflichthinweis zur Echtheit und Auswahl von Bewertungen (§ 5b Abs. 3 UWG) – englische Fassung. */
export const reviewAuthenticityNoteEn =
  "Note on authenticity: the reviews shown are taken unchanged and automatically from the platform stated with each review and link to the original. We show the most recent reviews with text – regardless of the star rating; reviews by our own staff are not shown. The overall rating comes from the platform and includes all reviews, including critical ones.";

/** Pflichthinweis zur Echtheit und Auswahl von Bewertungen (§ 5b Abs. 3 UWG). */
export const reviewAuthenticityNote =
  "Hinweis zur Echtheit: Die angezeigten Bewertungen werden unverändert und automatisch von der jeweils genannten Plattform übernommen und sind dort im Original verlinkt. Wir zeigen die jeweils neuesten Bewertungen mit Text – unabhängig von der Sternezahl; Bewertungen eigener Mitarbeitender zeigen wir nicht. Die Gesamtnote kommt von der Plattform und umfasst alle Bewertungen, auch kritische.";

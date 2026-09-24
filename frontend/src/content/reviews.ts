import type { Review, ReviewSource } from "@/types/content";

/**
 * Kundenbewertungen
 * -----------------
 * Es werden ausschließlich echte Bewertungen von Google und MyHammer
 * angezeigt – mit Quelle, Datum und Link zum Original. Erfundene oder
 * gekaufte Bewertungen sind unzulässig (§ 3 Abs. 3 UWG i. V. m. Anhang Nr. 23b/23c).
 *
 * Pflege: Neue Bewertungen hier eintragen (Text unverändert übernehmen).
 * Über `service` erscheint eine Bewertung automatisch auf der passenden
 * Leistungsseite; ohne `service` nur auf der Startseite.
 *
 * TODO(Inhalt): Google-Place-ID und MyHammer-Profil-URL eintragen.
 */
export const reviewPlatforms: Record<
  ReviewSource,
  {
    name: string;
    profileUrl: string;
    writeReviewUrl: string;
    note: string;
    /** Originallogo der Plattform (unverändert, public/brands/). */
    logo: { src: string; width: number; height: number };
  }
> = {
  google: {
    name: "Google",
    profileUrl: "https://www.google.com/maps/search/?api=1&query=FA+Transport",
    // Format: https://search.google.com/local/writereview?placeid=<PLACE_ID>
    writeReviewUrl: "https://search.google.com/local/writereview?placeid=PLACE_ID_EINTRAGEN",
    note: "Google-Unternehmensprofil",
    logo: { src: "/brands/google-logo.svg", width: 272, height: 92 },
  },
  myhammer: {
    name: "MyHammer",
    profileUrl: "https://www.my-hammer.de/",
    writeReviewUrl: "https://www.my-hammer.de/",
    note: "Verifizierte Auftraggeber",
    logo: { src: "/brands/myhammer-logo.svg", width: 237, height: 32 },
  },
};

export const reviews: Review[] = [
  // Beispiel-Eintrag (nach Freigabe echter Bewertung aktivieren):
  // {
  //   id: "google-2026-001",
  //   source: "google",
  //   author: "Vorname N.",
  //   rating: 5,
  //   date: "2026-10-01",
  //   text: "Originaltext der Bewertung …",
  //   service: "umzuege",
  //   url: "https://maps.app.goo.gl/…",
  // },
];

/** Ab dieser Anzahl wird eine Durchschnittsbewertung angezeigt (aussagekräftig statt „5,0 aus 1“). */
export const MIN_REVIEWS_FOR_AVERAGE = 5;

/** Pflichthinweis zur Echtheit von Bewertungen (§ 5b Abs. 3 UWG). */
export const reviewAuthenticityNote =
  "Hinweis zur Echtheit: Die angezeigten Bewertungen stammen unverändert aus unserem Google-Unternehmensprofil und von MyHammer. Bei MyHammer können nur Auftraggeber bewerten, die über die Plattform einen Auftrag vergeben haben. Google-Bewertungen werden von uns nicht auf einen tatsächlichen Auftrag geprüft. Wir zeigen alle Bewertungen – unabhängig von der Sternezahl.";

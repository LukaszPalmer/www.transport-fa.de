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
 *
 * Google: Das Unternehmensprofil ist noch nicht verifiziert (Bestätigung per Post/Video steht aus).
 * Solange erscheint Google nur als „folgt in Kürze" – danach `available: true`, Place-ID eintragen.
 */

const MYHAMMER_PROFILE = "https://www.my-hammer.de/auftragnehmer/fa-transporte-dienstleistungen";

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
  myhammer: {
    name: "MyHammer",
    available: true,
    profileUrl: `${MYHAMMER_PROFILE}?profileTabSelected=reviews`,
    writeReviewUrl: `${MYHAMMER_PROFILE}?profileTabSelected=reviews`,
    note: "Nur Auftraggeber über MyHammer können bewerten",
    noteEn: "Only clients who hired us via MyHammer can review",
    rating: { value: 4.7, count: 118, asOf: "2026-09-27" },
    logo: { src: "/brands/myhammer-logo.svg", width: 237, height: 32 },
  },
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

const review = (entry: Omit<Review, "source" | "url">): Review => ({ ...entry, source: "myhammer", url: `${MYHAMMER_PROFILE}?profileTabSelected=reviews` });

/** Stand 27.09.2026 – die zwölf neuesten MyHammer-Bewertungen mit Text, unverändert. */
export const reviews: Review[] = [
  review({
    id: "myhammer-1224803",
    author: "Gabriele S.",
    location: "Langenfeld",
    rating: 5,
    date: "2026-09-25",
    text: "Sehr pünktlich, super nett, zuverlässig. Die Jungs haben sehr gute Arbeit geleistet 👌\n6 ⭐⭐⭐⭐⭐⭐",
    service: "umzuege",
  }),
  review({
    id: "myhammer-1224668",
    author: "Anonym",
    location: "Hagen",
    rating: 5,
    date: "2026-09-25",
    text: "Pünktlich zur vereinbarten Uhrzeit vor Ort. Sehr fleißige und umsichtige Mitarbeiter. Gerne wieder.",
    service: "umzuege",
  }),
  review({
    id: "myhammer-1222312",
    author: "Athanasios D.",
    location: "Geilenkirchen",
    rating: 5,
    date: "2026-09-19",
    text: "Ich bin sehr zufrieden mit dem Umzug unseres 120 qm großen Haushalts. Die Mitarbeiter waren pünktlich, sehr höflich, fleißig und sind sehr vorsichtig mit unseren Sachen umgegangen. Sie haben den Umzug in 5 Stunden erledigt, Probleme selbstständig gelöst und der endgültige Preis entsprach genau dem Angebot.",
    service: "umzuege",
  }),
  review({
    id: "myhammer-1219206",
    author: "Damla",
    location: "Heiligenhaus",
    rating: 5,
    date: "2026-09-12",
    text: "Super Leistung.",
    service: "umzuege",
  }),
  review({
    id: "myhammer-1218667",
    author: "Katja E.",
    location: "Hilden",
    rating: 5,
    date: "2026-09-11",
    text: "Ganz eine tolle Erfahrung! Super zuverlässig, schnell, nett. Einfach nur unglaublich! Vielen Dank!",
    service: "umzuege",
  }),
  review({
    id: "myhammer-1217422",
    author: "Georg",
    location: "Gelsenkirchen",
    rating: 5,
    date: "2026-09-08",
    text: "sind vorher zur Abschätzung des Umzugs gekommen (als einziger), mit ausreichend Personal und LKW absolut pünktlich gekommen,  und alles sehr zügig verpackt, transportiert und aufgebaut",
    service: "umzuege",
  }),
  review({
    id: "myhammer-1215736",
    author: "Bauer",
    location: "Düsseldorf",
    rating: 5,
    date: "2026-09-04",
    text: "Ich bin begeistern von der Schnelligkeit und Flexibilität der Jungs. Super Team, ordentlich gearbeitet und würde Sie immer wieder wählen.\nIch werde sie auf jeden Fall weiterempfehlen!",
    service: "transport",
  }),
  review({
    id: "myhammer-1215481",
    author: "Jennifer L.",
    location: "Köln",
    rating: 4,
    date: "2026-09-04",
    text: "Zuverlässiger Service. Alles wurde ordentlich ab- und anmontiert. Kommunikation vorab war sehr gut.\nEin Stern Abzug, da eine Halteverbotszone nicht eingerichtet wurde. Glücklicherweise hat FA Transport schnell reagiert und einen Parkplatz gefunden. Wir würden FA Transport jederzeit empfehlen.",
    service: "umzuege",
  }),
  review({
    id: "myhammer-1215108",
    author: "Christian P.",
    location: "Düsseldorf",
    rating: 5,
    date: "2026-09-03",
    text: "Es hat alles super geklappt. Der Preis war fair, der Ablauf reibungslos und die Mitarbeiter super freundlich und fleißig. \nWenn ich noch mal umziehen sollte, würde ich die Firma wieder beauftragen 👍",
    service: "umzuege",
  }),
  review({
    id: "myhammer-1214005",
    author: "Anonym",
    location: "Bedburg",
    rating: 5,
    date: "2026-09-01",
    text: "Pünktlich, effizient und schnell!!!",
    service: "umzuege",
  }),
  review({
    id: "myhammer-1209498",
    author: "Anonym",
    location: "Kaarst",
    rating: 5,
    date: "2026-08-21",
    text: "Tolles Team, sehr sorgsam mit Möbeln und Wänden umgegangen! Gerne wieder",
    service: "umzuege",
  }),
  review({
    id: "myhammer-1206516",
    author: "Familie Langer",
    location: "Jülich",
    rating: 5,
    date: "2026-08-14",
    text: "Von der Planung bis zum Umzug selbst sehr zufrieden. Familie mit 3 Kindern und grösserem Haushalt. \n\nNach erster Kontaktaufnahme wurde schnell ein Begehungstermin vereinbart, woraufhin das Angebot auch gesendet wurde. Der Kontakt war immer zuverlässig, schnell und freundlich. \nWie vereinbart kamen die Umzugshelfer am Umzugstag selbst pünktlich morgens und legten sofort los mit der Arbeit. Man merkte schnell, dass viel Erfahrung dabei ist. Selbstständig wurde alles durchgeführt nach einer kurzen Einweisung. Es waren ca. 150 Kisten, Möbel zum Ab- und Aufbau, mehrere Etagen ohne Aufzug. \n\nAlle haben bis zum Ende sehr gut gearbeitet, waren freundlich und vorsichtig. \n\nInsgesamt: sehr zu empfehlen.",
    service: "umzuege",
  }),
];

/** Pflichthinweis zur Echtheit und Auswahl von Bewertungen (§ 5b Abs. 3 UWG) – englische Fassung. */
export const reviewAuthenticityNoteEn =
  "Note on authenticity: the reviews shown are taken unchanged from MyHammer (as of 27 Sep 2026) and appear in their original language (German). We show the most recent reviews with text – regardless of the star rating; the overall rating includes all reviews on MyHammer, including critical ones. On MyHammer, only clients who placed a job through the platform can leave a review. We abbreviate names.";

/** Pflichthinweis zur Echtheit und Auswahl von Bewertungen (§ 5b Abs. 3 UWG). */
export const reviewAuthenticityNote =
  "Hinweis zur Echtheit: Die angezeigten Bewertungen stammen unverändert von MyHammer (Stand: 27.09.2026). Wir zeigen die jeweils neuesten Bewertungen mit Text – unabhängig von der Sternezahl; die Gesamtnote umfasst alle Bewertungen auf MyHammer, auch kritische. Bei MyHammer können nur Auftraggeber bewerten, die über die Plattform einen Auftrag vergeben haben. Namen kürzen wir ab.";

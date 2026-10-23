/**
 * Bildnachweise der Fotos unter public/media/stock/ – Quelle für das Impressum („Bildnachweise")
 * und die Foto-Angabe unter Blog-Titelbildern. Details zur Lizenz: frontend/docs/bildlizenzen.md.
 *
 * Alle Fotos stammen von Pexels und stehen unter der Pexels-Lizenz (https://www.pexels.com/license/):
 * kostenlose kommerzielle Nutzung, Bearbeitung erlaubt, Namensnennung nicht erforderlich (wird hier
 * trotzdem angegeben). Nicht erlaubt: abgebildete Personen in schlechtem Licht zeigen, eine Empfehlung
 * durch sie suggerieren oder die Fotos unverändert weiterverkaufen. Die Personen auf den Fotos sind
 * keine Mitarbeiter von FA Transport – Symbolbilder.
 *
 * Die Hero-Videos und ihre Standbilder (public/media/<leistung>/) sind eigenes Material und hier
 * deshalb nicht aufgeführt.
 */

export interface ImageCredit {
  src: string;
  /** Motiv (Deutsch). */
  subject: string;
  subjectEn: string;
  photographer: string;
  sourceUrl: string;
  license: "Pexels-Lizenz";
  /** Abgerufen am (ISO-Datum). */
  retrieved: string;
  /** Pixelmaße der Datei – für Open Graph und ImageObject im JSON-LD. */
  width: number;
  height: number;
}

const PEXELS = "Pexels-Lizenz" as const;
const RETRIEVED = "2026-09-27";
/** Querformat 3:2 bzw. 16:9 in 1920 px Breite (so liegen die Dateien unter public/media/stock/). */
const LANDSCAPE = { width: 1920, height: 1280 } as const;
const WIDESCREEN = { width: 1920, height: 1080 } as const;

export const imageCredits: ImageCredit[] = [
  {
    src: "/media/stock/umzug-team-kartons.jpg",
    ...LANDSCAPE,
    subject: "Umzugshelfer tragen Kartons",
    subjectEn: "Movers carrying boxes",
    photographer: "RDNE Stock project",
    sourceUrl: "https://www.pexels.com/photo/two-men-standing-carrying-cardboard-boxes-7464703/",
    license: PEXELS,
    retrieved: RETRIEVED,
  },
  {
    src: "/media/stock/umzug-kartons-beschriftet.jpg",
    ...LANDSCAPE,
    subject: "Beschriftete Umzugskartons",
    subjectEn: "Labelled moving boxes",
    photographer: "Ketut Subiyanto",
    sourceUrl: "https://www.pexels.com/photo/empty-apartment-with-packed-carton-boxes-before-moving-4246119/",
    license: PEXELS,
    retrieved: RETRIEVED,
  },
  {
    src: "/media/stock/umzug-transporter-beladen.jpg",
    ...LANDSCAPE,
    subject: "Transporter wird mit Kartons beladen",
    subjectEn: "Van being loaded with boxes",
    photographer: "Artem Podrez",
    sourceUrl: "https://www.pexels.com/photo/man-stacking-boxes-in-a-van-5025665/",
    license: PEXELS,
    retrieved: RETRIEVED,
  },
  {
    src: "/media/stock/entruempelung-besenrein.jpg",
    ...LANDSCAPE,
    subject: "Leere, besenreine Wohnung",
    subjectEn: "Empty flat, swept clean",
    photographer: "Gustavo Galeano Maz",
    sourceUrl: "https://www.pexels.com/photo/empty-interior-with-white-walls-and-wooden-floor-7865621/",
    license: PEXELS,
    retrieved: RETRIEVED,
  },
  {
    src: "/media/stock/entruempelung-sortieren.jpg",
    ...LANDSCAPE,
    subject: "Sortieren in Kartons zum Behalten und Spenden",
    subjectEn: "Sorting into boxes to keep and donate",
    photographer: "RDNE Stock project",
    sourceUrl: "https://www.pexels.com/photo/a-woman-sitting-in-front-of-cardboard-boxes-8580802/",
    license: PEXELS,
    retrieved: RETRIEVED,
  },
  {
    src: "/media/stock/entruempelung-sofa-tragen.jpg",
    ...LANDSCAPE,
    subject: "Zwei Helfer tragen ein Sofa",
    subjectEn: "Two helpers carrying a sofa",
    photographer: "RDNE Stock project",
    sourceUrl: "https://www.pexels.com/photo/close-up-shot-of-men-carrying-a-couch-7464662/",
    license: PEXELS,
    retrieved: RETRIEVED,
  },
  {
    src: "/media/stock/haushaltsaufloesung-wohnzimmer.jpg",
    ...LANDSCAPE,
    subject: "Wohnzimmer mit Familienfotos",
    subjectEn: "Living room with family photos",
    photographer: "Rachel Claire",
    sourceUrl: "https://www.pexels.com/photo/old-photos-hanging-on-wall-near-armchair-5490182/",
    license: PEXELS,
    retrieved: RETRIEVED,
  },
  {
    src: "/media/stock/haushaltsaufloesung-erinnerungen.jpg",
    ...LANDSCAPE,
    subject: "Alte Familienfotos in einer Schachtel",
    subjectEn: "Old family photos in a box",
    photographer: "fish socks",
    sourceUrl: "https://www.pexels.com/photo/discovering-nostalgic-family-memories-in-photos-34384408/",
    license: PEXELS,
    retrieved: RETRIEVED,
  },
  {
    src: "/media/stock/haushaltsaufloesung-sessel.jpg",
    ...LANDSCAPE,
    subject: "Antiker Sessel in einem Wohnzimmer",
    subjectEn: "Antique armchair in a living room",
    photographer: "Gül Işık",
    sourceUrl: "https://www.pexels.com/photo/a-classic-design-of-living-room-2332913/",
    license: PEXELS,
    retrieved: RETRIEVED,
  },
  {
    src: "/media/stock/transport-sattelzug.jpg",
    ...LANDSCAPE,
    subject: "Sattelzug auf der Landstraße",
    subjectEn: "Articulated truck on a country road",
    photographer: "Ahmet Polat",
    sourceUrl: "https://www.pexels.com/photo/a-trailer-truck-on-the-road-5410923/",
    license: PEXELS,
    retrieved: RETRIEVED,
  },
  {
    src: "/media/stock/transport-verladung.jpg",
    ...LANDSCAPE,
    subject: "Palettenverladung mit Gabelstapler",
    subjectEn: "Pallet loading with a forklift",
    photographer: "Caleb Oquendo",
    sourceUrl: "https://www.pexels.com/photo/forklift-operators-loading-pallets-on-truck-34585120/",
    license: PEXELS,
    retrieved: RETRIEVED,
  },
  {
    src: "/media/stock/transport-lkw-fahrer.jpg",
    ...LANDSCAPE,
    subject: "Lkw-Fahrer im Führerhaus",
    subjectEn: "Truck driver in the cab",
    photographer: "Alex Surd",
    sourceUrl: "https://www.pexels.com/photo/a-white-truck-on-the-road-10963747/",
    license: PEXELS,
    retrieved: RETRIEVED,
  },
  {
    src: "/media/stock/portal-transporter.jpg",
    ...WIDESCREEN,
    subject: "Transporter wird vor einem Wohnhaus entladen",
    subjectEn: "Van being unloaded outside a house",
    photographer: "Artem Podrez",
    sourceUrl: "https://www.pexels.com/photo/man-carrying-boxes-beside-a-van-5025669/",
    license: PEXELS,
    retrieved: RETRIEVED,
  },
  {
    src: "/media/stock/flotte-fahrzeuge.jpg",
    ...LANDSCAPE,
    subject: "Transporter, Lkw und Autotransporter auf einem Rastplatz",
    subjectEn: "Van, lorries and car transporter at a rest area",
    photographer: "Malte Luk",
    sourceUrl: "https://www.pexels.com/photo/motor-vehicles-parked-on-the-road-1606957/",
    license: PEXELS,
    retrieved: "2026-09-28",
  },
];

export function creditFor(src: string): ImageCredit | undefined {
  return imageCredits.find((credit) => credit.src === src);
}

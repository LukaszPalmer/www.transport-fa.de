import type { BlogPost } from "../blog";
import { editorialTeam } from "./shared";

/** Kategorie „Transport“ – B2B-Suchintention: Fachbegriffe, Kalkulation, Pflichten als Versender. */
export const transportPosts: BlogPost[] = [
  {
    slug: "komplettladung-teilladung-stueckgut",
    title: "Komplettladung oder Teilladung? FTL & LTL erklärt",
    excerpt:
      "Stückgut, Teilladung (LTL) oder Komplettladung (FTL)? Unterschiede, Lademeter berechnen, Paletten pro Lkw – und wann sich welche Versandart lohnt.",
    category: "transport",
    publishedAt: "2026-09-26",
    author: editorialTeam,
    cover: { src: "/media/stock/transport-sattelzug.jpg", alt: "Sattelzug mit Plane auf einer Landstraße in der Abenddämmerung" },
    keywords: [
      "Komplettladung",
      "Teilladung",
      "Stückgut",
      "FTL LTL Unterschied",
      "Lademeter berechnen",
      "Europaletten Lkw",
      "Spedition Düsseldorf",
    ],
    body: [
      {
        type: "paragraph",
        text: "Stückgut, Teilladung und Komplettladung unterscheiden sich vor allem in der Sendungsgröße und im Transportweg: Stückgut sind einzelne Paletten, die über Umschlaglager mit anderen Sendungen gebündelt werden. Eine Teilladung (LTL, Less than Truckload) belegt einen Teil des Lkw und fährt meist direkt. Eine Komplettladung (FTL, Full Truckload) nutzt den ganzen Lkw exklusiv – bis zu 13,6 Lademeter, 33 Europaletten und rund 24 Tonnen.",
      },
      {
        type: "checklist",
        title: "Das Wichtigste in Kürze",
        items: [
          "Stückgut: kleine Sendungen, günstig, aber mit Umschlag und längerer Laufzeit",
          "Teilladung (LTL): mittlere Mengen, meist ohne Umschlag, schneller als Stückgut",
          "Komplettladung (FTL): exklusiver Lkw, Direktfahrt, planbarste Laufzeit",
          "Lademeter = Länge × Breite der Ladung ÷ 2,4 m – eine Europalette entspricht 0,4 Lademetern",
          "Ab etwa 6 bis 8 Lademetern lohnt sich oft der Preisvergleich mit einer Komplettladung",
        ],
      },
      { type: "heading", text: "Stückgut, Teilladung und Komplettladung im Vergleich" },
      {
        type: "table",
        caption: "Versandarten im Straßengüterverkehr",
        head: ["Versandart", "Typische Menge", "Transportweg", "Geeignet für"],
        rows: [
          ["Stückgut (Sammelgut)", "1 bis wenige Paletten, bis ca. 2,5 t", "Über Umschlaglager (Hub), gebündelt", "Kleine, nicht zeitkritische Sendungen"],
          ["Teilladung (LTL)", "ca. 2,5 bis 15 t bzw. einige Lademeter", "Meist direkt, Laderaum wird geteilt", "Mittlere Mengen mit festem Zeitfenster"],
          ["Komplettladung (FTL)", "Ganzer Lkw: 13,6 ldm, 33 Europaletten, ca. 24 t", "Direktfahrt, exklusiv", "Große, zeitkritische oder empfindliche Ladungen"],
        ],
        note: "Die Grenzen sind fließend und unterscheiden sich je nach Spedition. Entscheidend ist oft nicht das Gewicht, sondern der benötigte Platz.",
      },
      { type: "heading", text: "Was ist ein Lademeter und wie berechnet man ihn?" },
      {
        type: "paragraph",
        text: "Der Lademeter (ldm) ist die wichtigste Maßeinheit für die Frachtberechnung. Er beschreibt einen Meter Ladefläche über die volle Breite eines Sattelaufliegers von rund 2,4 Metern. Die Formel lautet: Lademeter = Länge der Ladung (m) × Breite der Ladung (m) ÷ 2,4. Stapelbare Güter benötigen entsprechend weniger Lademeter.",
      },
      {
        type: "table",
        caption: "Lademeter gängiger Ladungsträger",
        head: ["Ladungsträger", "Maße", "Lademeter", "Pro Sattelzug (13,6 m)"],
        rows: [
          ["Europalette (EPAL)", "1,20 × 0,80 m", "0,4 ldm", "33 Stück"],
          ["Industriepalette", "1,20 × 1,00 m", "0,5 ldm", "26 Stück"],
          ["Halbe Palette", "0,80 × 0,60 m", "0,2 ldm", "je nach Beladung"],
        ],
        note: "Werte für nicht gestapelte Paletten. Beispiel: 12 Europaletten ergeben 12 × 0,4 = 4,8 Lademeter.",
      },
      {
        type: "paragraph",
        text: "Viele Speditionen rechnen pro Lademeter mit einem Mindestgewicht, häufig im Bereich von 1.500 bis 2.000 kg. Abgerechnet wird dann der höhere Wert aus tatsächlichem Gewicht und Lademetergewicht. Leichte, aber sperrige Güter werden so fair nach ihrem Platzbedarf berechnet.",
      },
      { type: "heading", text: "Wann lohnt sich eine Komplettladung?" },
      {
        type: "list",
        items: [
          "Ihre Sendung belegt mehr als etwa 6 bis 8 Lademeter oder 15 Europaletten.",
          "Die Ware ist zeitkritisch und muss in einem festen Zeitfenster ankommen.",
          "Die Güter sind empfindlich oder hochwertig – ohne Umschlag sinkt das Schadensrisiko.",
          "Sie brauchen besondere Bedingungen, etwa Temperaturführung oder Seitenbeladung.",
          "Die Strecke ist lang, und Sie möchten Laufzeiten sicher planen.",
        ],
      },
      {
        type: "tip",
        title: "Unser Tipp: Direktfahrt statt Umschlag",
        text: "Auch bei einer Teilladung lohnt sich die Frage nach einer Direktfahrt ohne Umladen. Jeder Umschlag kostet Zeit und erhöht das Risiko von Beschädigungen – gerade bei empfindlichen Gütern.",
      },
      { type: "heading", text: "Was kostet ein Lkw-Transport?" },
      {
        type: "paragraph",
        text: "Die Frachtkosten ergeben sich aus Entfernung, Lademetern beziehungsweise Gewicht, Maut, Fahrzeugtyp und Zusatzleistungen. Seit Dezember 2023 enthält die Lkw-Maut in Deutschland einen CO₂-Aufschlag, seit Juli 2024 gilt sie auch für Fahrzeuge ab 3,5 Tonnen. Hinzu kommen je nach Auftrag Zuschläge für Hebebühne, Avisierung, Express oder Wochenendzustellung. Ein verlässliches Angebot erhalten Sie deshalb nur mit vollständigen Sendungsdaten.",
      },
      {
        type: "link",
        label: "Spedition beauftragen: Checkliste für Versender",
        href: "/blog/spedition-beauftragen-checkliste",
        text: "Welche Angaben die Spedition braucht, wer haftet und welche Papiere Sie benötigen.",
      },
      { type: "heading", text: "Transporte ab Düsseldorf: kurze Wege nach ganz Europa" },
      {
        type: "paragraph",
        text: "Düsseldorf liegt mitten im Rhein-Ruhr-Gebiet und an wichtigen Autobahnen wie A3, A44, A46, A52 und A57. Die Seehäfen Rotterdam und Antwerpen sind nur rund 200 bis 230 Kilometer entfernt, die Häfen in Düsseldorf und Neuss direkt vor der Tür. FA Transport übernimmt Teil- und Komplettladungen sowie Direktfahrten ab Düsseldorf – deutschlandweit und europaweit, mit festem Ansprechpartner und Disposition rund um die Uhr.",
      },
    ],
    faqs: [
      {
        question: "Was ist der Unterschied zwischen FTL und LTL?",
        answer:
          "FTL (Full Truckload) ist eine Komplettladung: Der ganze Lkw fährt exklusiv für einen Auftraggeber. LTL (Less than Truckload) ist eine Teilladung: Die Sendung belegt nur einen Teil des Laderaums, den Rest nutzen andere Sendungen.",
      },
      {
        question: "Wie viele Europaletten passen auf einen Lkw?",
        answer:
          "Auf einen Standard-Sattelauflieger mit 13,6 Metern Ladelänge passen 33 Europaletten (1,20 × 0,80 m) oder 26 Industriepaletten (1,20 × 1,00 m), jeweils ungestapelt.",
      },
      {
        question: "Wie berechnet man Lademeter?",
        answer:
          "Lademeter = Länge der Ladung in Metern × Breite in Metern ÷ 2,4. Eine Europalette entspricht damit 0,4 Lademetern, eine Industriepalette 0,5 Lademetern.",
      },
      {
        question: "Was ist Stückgut?",
        answer:
          "Stückgut sind einzelne, verpackte Sendungen wie Paletten oder Kisten, die zusammen mit anderen Sendungen über Umschlaglager transportiert werden. Das ist bei kleinen Mengen günstig, dauert aber länger als eine Direktfahrt.",
      },
      {
        question: "Ab wann lohnt sich eine Komplettladung?",
        answer:
          "Als Faustregel ab etwa 6 bis 8 Lademetern beziehungsweise 15 Europaletten – oder immer dann, wenn die Ware zeitkritisch, empfindlich oder besonders wertvoll ist.",
      },
    ],
  },
  {
    slug: "spedition-beauftragen-checkliste",
    title: "Spedition beauftragen: Checkliste für Versender",
    excerpt:
      "Spedition beauftragen: welche Sendungsdaten nötig sind, wer die Ladung sichert, wie Spediteure nach HGB und CMR haften und welche Papiere Sie brauchen.",
    category: "transport",
    publishedAt: "2026-09-26",
    author: editorialTeam,
    cover: { src: "/media/stock/transport-verladung.jpg", alt: "Gabelstapler verlädt eine Palette auf einen Lkw-Auflieger" },
    keywords: [
      "Spedition beauftragen",
      "Spedition Düsseldorf",
      "CMR-Frachtbrief",
      "Haftung Spedition HGB",
      "Ladungssicherung Verantwortung",
      "Lkw-Transport Kosten",
      "Transportversicherung",
    ],
    body: [
      {
        type: "paragraph",
        text: "Wer eine Spedition beauftragt, sollte vorab fünf Dinge klären: vollständige Sendungsdaten, Lade- und Entladebedingungen, Termine, die Dokumente und die Versicherung der Ware. Denn die gesetzliche Haftung von Frachtführern ist begrenzt – nach HGB und CMR auf 8,33 Sonderziehungsrechte, also grob rund 10 € pro Kilogramm. Diese Checkliste hilft Ihnen, Transporte sicher und ohne Nachforderungen zu planen.",
      },
      {
        type: "checklist",
        title: "Das Wichtigste in Kürze",
        items: [
          "Maße, Gewicht, Stapelbarkeit und Warenart vollständig angeben",
          "Zeitfenster, Rampe oder Hebebühne und Öffnungszeiten vorab klären",
          "Für die beförderungssichere Verladung ist der Absender verantwortlich (§ 412 HGB)",
          "Die gesetzliche Haftung ist begrenzt – für wertvolle Güter eine Warenversicherung abschließen",
          "International ist ein CMR-Frachtbrief Standard, außerhalb der EU kommen Zolldokumente hinzu",
        ],
      },
      { type: "heading", text: "Welche Angaben braucht die Spedition?" },
      {
        type: "checklist",
        title: "Sendungsdaten",
        items: [
          "Anzahl und Art der Packstücke (z. B. Europaletten, Gitterboxen, Kisten)",
          "Maße und Gewicht je Packstück sowie Gesamtgewicht",
          "Stapelbar ja oder nein",
          "Warenart und Warenwert",
          "Gefahrgut nach ADR mit UN-Nummer, falls zutreffend",
          "Besondere Anforderungen: Temperatur, Feuchtigkeit, Stoßempfindlichkeit",
        ],
      },
      {
        type: "checklist",
        title: "Lade- und Entladestelle",
        items: [
          "Vollständige Adressen und Ansprechpartner vor Ort",
          "Rampe vorhanden oder Hebebühne nötig?",
          "Zeitfenster, Öffnungszeiten, Slotbuchung oder Avisierung",
          "Zufahrtsbeschränkungen, etwa für Sattelzüge in Innenstädten",
          "Palettentausch vereinbart oder nicht",
        ],
      },
      { type: "heading", text: "Wer ist für die Ladungssicherung verantwortlich?" },
      {
        type: "paragraph",
        text: "Die Verantwortung ist geteilt. Nach § 412 HGB muss der Absender das Gut beförderungssicher laden, stauen und befestigen – es sei denn, etwas anderes ist vereinbart. Der Frachtführer ist für die betriebssichere Verladung zuständig, also dafür, dass das Fahrzeug durch die Ladung nicht unsicher wird. Zusätzlich verpflichten die Straßenverkehrs-Ordnung und die Straßenverkehrs-Zulassungs-Ordnung Fahrer und Halter zur sicheren Ladung. In der Praxis heißt das: Klären Sie vorab schriftlich, wer lädt und sichert, und stellen Sie geeignete Ladungsträger bereit.",
      },
      {
        type: "table",
        caption: "Pflichten im Überblick",
        head: ["Aufgabe", "Absender / Verlader", "Frachtführer / Fahrer"],
        rows: [
          ["Verpackung der Ware", "Ja", "–"],
          ["Beförderungssicher laden und sichern", "Ja (§ 412 HGB)", "Prüft auf Betriebssicherheit"],
          ["Betriebssichere Verladung", "–", "Ja"],
          ["Frachtbrief und Begleitpapiere", "Angaben liefern", "Mitführen, Übergabe quittieren"],
          ["Sichtbare Schäden bei Ablieferung", "Empfänger vermerkt sie auf dem Frachtbrief", "Fahrer bestätigt den Vermerk"],
        ],
      },
      { type: "heading", text: "Wie haftet eine Spedition für Schäden?" },
      {
        type: "paragraph",
        text: "Bei nationalen Transporten haftet der Frachtführer nach § 431 HGB, bei grenzüberschreitenden Straßentransporten nach Artikel 23 der CMR – jeweils grundsätzlich bis zu 8,33 Sonderziehungsrechte (SZR) je Kilogramm Rohgewicht. Das entspricht grob rund 10 € pro Kilogramm. Ein Rechenbeispiel: Für eine 500 kg schwere Palette mit Elektronik im Wert von 50.000 € haftet der Frachtführer im Schadensfall nur mit rund 5.000 €. Für hochwertige Güter lohnt sich deshalb eine separate Warentransportversicherung.",
      },
      {
        type: "tip",
        title: "Schäden sofort dokumentieren",
        text: "Äußerlich erkennbare Schäden müssen bei der Ablieferung auf dem Frachtbrief oder Lieferschein vermerkt werden. Verdeckte Schäden sollten Sie schnellstmöglich schriftlich melden – nach HGB innerhalb von sieben Tagen. Fotos von Ware und Verpackung erleichtern die Regulierung erheblich.",
      },
      { type: "heading", text: "Welche Papiere brauche ich für einen Transport?" },
      {
        type: "list",
        items: [
          "Lieferschein: Grundlage für die Warenübergabe beim Empfänger.",
          "Frachtbrief: national üblich, bei grenzüberschreitenden Straßentransporten als CMR-Frachtbrief Standard.",
          "Zolldokumente: für Nicht-EU-Länder wie die Schweiz oder Großbritannien, etwa die Ausfuhranmeldung.",
          "Gefahrgutpapiere: Beförderungspapier nach ADR bei gefährlichen Gütern.",
          "Incoterms: legen fest, wer Kosten und Risiko trägt – etwa DAP oder FCA.",
        ],
      },
      { type: "heading", text: "Wie setzen sich die Transportkosten zusammen?" },
      {
        type: "list",
        items: [
          "Entfernung und Route, inklusive Maut – seit Dezember 2023 mit CO₂-Aufschlag, seit Juli 2024 schon ab 3,5 Tonnen.",
          "Lademeter oder Gewicht, je nachdem, welcher Wert höher ist.",
          "Fahrzeugtyp: Plane, Koffer, Kühlfahrzeug oder Hebebühne.",
          "Standzeiten: Wartezeit über die vereinbarte Frist hinaus wird als Standgeld berechnet.",
          "Zuschläge für Express, Avisierung, Wochenende oder Gefahrgut.",
        ],
      },
      {
        type: "link",
        label: "Komplettladung oder Teilladung? FTL & LTL erklärt",
        href: "/blog/komplettladung-teilladung-stueckgut",
        text: "So berechnen Sie Lademeter und finden die günstigste Versandart.",
      },
      { type: "heading", text: "Woran erkennen Sie eine zuverlässige Spedition?" },
      {
        type: "checklist",
        items: [
          "Erlaubnis nach dem Güterkraftverkehrsgesetz bzw. EU-Lizenz für den gewerblichen Güterverkehr",
          "Nachweis einer Verkehrshaftungsversicherung",
          "Transparentes Angebot mit allen Zuschlägen",
          "Fester Ansprechpartner und erreichbare Disposition",
          "Proaktive Information bei Verzögerungen",
        ],
      },
      {
        type: "paragraph",
        text: "FA Transport übernimmt Teil- und Komplettladungen sowie Express-Direktfahrten ab Düsseldorf – mit Angebot innerhalb von 24 Stunden, festem Ansprechpartner und Disposition rund um die Uhr.",
      },
    ],
    faqs: [
      {
        question: "Was muss ich einer Spedition für ein Angebot mitteilen?",
        answer:
          "Anzahl, Art, Maße und Gewicht der Packstücke, Stapelbarkeit, Warenart und -wert, Lade- und Entladeadresse, Zeitfenster sowie Besonderheiten wie Hebebühne, Temperaturführung oder Gefahrgut.",
      },
      {
        question: "Wer haftet bei Transportschäden?",
        answer:
          "Der Frachtführer – allerdings begrenzt auf 8,33 Sonderziehungsrechte je Kilogramm, bei nationalen Transporten nach § 431 HGB, international nach Artikel 23 CMR. Das sind grob rund 10 € pro Kilogramm. Höhere Warenwerte sichern Sie über eine Transportversicherung ab.",
      },
      {
        question: "Was ist ein CMR-Frachtbrief?",
        answer:
          "Der CMR-Frachtbrief ist das Standarddokument für grenzüberschreitende Straßentransporte. Er dokumentiert Absender, Empfänger, Ware und Übernahme und ist Grundlage für die Haftung nach dem CMR-Übereinkommen.",
      },
      {
        question: "Wer ist für die Ladungssicherung verantwortlich?",
        answer:
          "Der Absender ist nach § 412 HGB für die beförderungssichere Verladung verantwortlich, der Frachtführer für die betriebssichere. Fahrer und Halter haften zusätzlich nach Straßenverkehrsrecht. Wer lädt und sichert, sollte vorab schriftlich vereinbart werden.",
      },
      {
        question: "Was kostet ein Lkw-Transport?",
        answer:
          "Das hängt von Entfernung, Lademetern oder Gewicht, Maut, Fahrzeugtyp und Zuschlägen ab. Ein verbindliches Angebot erhalten Sie mit vollständigen Sendungsdaten – bei FA Transport in der Regel innerhalb von 24 Stunden.",
      },
    ],
  },
];

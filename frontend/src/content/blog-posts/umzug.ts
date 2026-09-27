import type { BlogPost } from "../blog";
import { editorialTeam } from "./shared";

/** Kategorie „Umzug“ – Suchintention: Kosten (kommerziell) und Planung (informativ). */
export const umzugPosts: BlogPost[] = [
  {
    slug: "umzugskosten-duesseldorf",
    title: "Umzugskosten Düsseldorf 2026: Was kostet ein Umzug?",
    excerpt:
      "Was kostet ein Umzug in Düsseldorf? Richtwerte nach Wohnungsgröße, alle Kostenfaktoren, Preise für Zusatzleistungen und 7 Spartipps für Ihren Umzug.",
    category: "umzug",
    publishedAt: "2026-09-26",
    author: editorialTeam,
    cover: { src: "/media/stock/umzug-team-kartons.jpg", alt: "Zwei Umzugshelfer tragen Umzugskartons durch eine helle Wohnung" },
    featured: true,
    keywords: [
      "Umzugskosten Düsseldorf",
      "Umzug Düsseldorf Kosten",
      "Umzugsunternehmen Düsseldorf",
      "Was kostet ein Umzug",
      "Umzug 2-Zimmer-Wohnung Kosten",
      "Umzugsfirma Festpreis",
      "Umzugskosten absetzen",
    ],
    body: [
      {
        type: "paragraph",
        text: "Ein Umzug mit Umzugsunternehmen kostet in Düsseldorf je nach Wohnungsgröße meist zwischen rund 400 € für eine kleine 1-Zimmer-Wohnung und 4.000 € für ein Haus mit vier oder mehr Zimmern. Den Preis bestimmen vor allem fünf Faktoren: das Umzugsvolumen in Kubikmetern, Etagen und Laufwege, die Entfernung, der Termin und die gewünschten Zusatzleistungen wie Einpackservice oder Küchenmontage.",
      },
      {
        type: "checklist",
        title: "Das Wichtigste in Kürze",
        items: [
          "Richtwert innerhalb Düsseldorfs: ca. 800–1.500 € für eine 2-Zimmer-Wohnung mit Profi-Team",
          "Faustregel für das Volumen: 0,3 bis 0,5 m³ Umzugsgut pro Quadratmeter Wohnfläche",
          "Größte Preistreiber: viele Etagen ohne Aufzug, lange Laufwege, Termin am Monatsende",
          "Verbindlich ist nur ein Festpreis nach Besichtigung – kein Pauschalpreis am Telefon",
          "20 % der Arbeitskosten sind als haushaltsnahe Dienstleistung steuerlich absetzbar (§ 35a EStG)",
        ],
      },
      { type: "heading", text: "Was kostet ein Umzug in Düsseldorf? Richtwerte nach Wohnungsgröße" },
      {
        type: "paragraph",
        text: "Die folgenden Werte sind marktübliche Richtwerte für einen Umzug innerhalb Düsseldorfs mit professionellem Umzugsteam und LKW – ohne Zusatzleistungen. Sie helfen bei der ersten Einordnung und beim Vergleich von Angeboten.",
      },
      {
        type: "table",
        caption: "Umzugskosten in Düsseldorf – Richtwerte 2026",
        head: ["Wohnung", "Volumen (ca.)", "Team & Dauer", "Richtwert"],
        rows: [
          ["1 Zimmer (bis 40 m²)", "15–20 m³", "2 Helfer, 3–5 Std.", "400–800 €"],
          ["2 Zimmer (ca. 60 m²)", "25–35 m³", "3 Helfer, 5–7 Std.", "800–1.500 €"],
          ["3 Zimmer (ca. 80 m²)", "35–50 m³", "3–4 Helfer, 1 Tag", "1.300–2.400 €"],
          ["4+ Zimmer / Haus", "50–80 m³", "4–5 Helfer, 1–2 Tage", "2.000–4.000 €"],
        ],
        note: "Innerstädtischer Umzug, ohne Einpackservice, Küchenmontage und Halteverbotszone. Etage, Aufzug und Laufwege verschieben den Preis deutlich – verbindlich ist nur das Festpreisangebot nach Besichtigung.",
      },
      {
        type: "paragraph",
        text: "Für Umzüge ins Umland – etwa nach Neuss, Ratingen, Meerbusch, Hilden oder Erkrath – kommen meist nur geringe Fahrtkosten hinzu. Bei Fernumzügen nach Hamburg, Berlin oder München steigen die Kosten durch Fahrzeit, Maut und gegebenenfalls eine Übernachtung des Teams spürbar.",
      },
      { type: "heading", text: "Welche Faktoren bestimmen die Umzugskosten?" },
      {
        type: "list",
        items: [
          "Umzugsvolumen: Je mehr Kubikmeter, desto größer Fahrzeug und Team. Eine Möbelliste oder eine Besichtigung liefert die genaue Zahl.",
          "Etagen und Aufzug: In Altbauten in Pempelfort, Flingern, Bilk oder Unterbilk fehlt oft ein Aufzug – jede Etage kostet Tragezeit.",
          "Laufwege: Liegen zwischen Haustür und LKW mehr als 20 bis 30 Meter, wird es aufwendiger. Eine Halteverbotszone verkürzt den Weg.",
          "Entfernung: Innerhalb Düsseldorfs spielt sie kaum eine Rolle, bei Fernumzügen zählen Kilometer, Maut und Fahrzeit.",
          "Termin: Monatsenden, Freitage und die Sommermonate sind stark gefragt – mitten im Monat und unter der Woche ist es oft günstiger.",
          "Zusatzleistungen: Einpacken, Möbel- und Küchenmontage, Möbellift, Einlagerung oder Entsorgung alter Möbel.",
        ],
      },
      { type: "heading", text: "Was kosten Zusatzleistungen beim Umzug?" },
      {
        type: "table",
        caption: "Zusatzleistungen – typische Richtwerte",
        head: ["Leistung", "Richtwert"],
        rows: [
          ["Halteverbotszone inkl. Genehmigung & Beschilderung", "ca. 100–250 € je Stelle"],
          ["Küche ab- und aufbauen", "ca. 300–900 €"],
          ["Ein- und Auspackservice", "nach Aufwand, ca. 35–55 € je Helferstunde"],
          ["Möbellift / Außenaufzug", "ca. 150–400 €"],
          ["Umzugskartons (Kauf)", "ca. 2–4 € pro Stück"],
          ["Entsorgung alter Möbel", "nach Menge, oft ab ca. 50 € je m³"],
        ],
        note: "Marktübliche Richtwerte. Viele Leistungen lassen sich im Festpreis bündeln – das ist meist günstiger als eine Abrechnung nach Stunden.",
      },
      { type: "heading", text: "Festpreis oder Stundenlohn – was ist günstiger?" },
      {
        type: "paragraph",
        text: "Ein Festpreis schützt Sie vor bösen Überraschungen: Dauert der Umzug länger als geplant, trägt das Risiko das Umzugsunternehmen. Beim Stundenlohn zahlen Sie jede zusätzliche Viertelstunde – etwa wenn der Aufzug blockiert ist oder Kartons noch nicht gepackt sind. Seriöse Anbieter kalkulieren den Festpreis nach einer kostenlosen Besichtigung vor Ort oder per Video und halten alle Leistungen schriftlich fest.",
      },
      {
        type: "tip",
        title: "So vergleichen Sie Angebote richtig",
        text: "Achten Sie darauf, dass alle Angebote dasselbe Volumen und dieselben Leistungen enthalten: Kartons, Montage, Halteverbotszone, Versicherung und An- und Abfahrt. Ein auffällig günstiger Preis ohne Besichtigung wird am Umzugstag oft teurer.",
      },
      { type: "heading", text: "7 Tipps: So sparen Sie beim Umzug in Düsseldorf" },
      {
        type: "list",
        ordered: true,
        items: [
          "Vor dem Umzug ausmisten – jeder Kubikmeter weniger senkt den Preis.",
          "Einen Termin mitten im Monat und unter der Woche wählen.",
          "Kartons selbst packen und das Team nur für Tragen, Transport und Montage buchen.",
          "Die Halteverbotszone rechtzeitig beantragen, damit das Team kurze Wege hat.",
          "Mehrere Festpreisangebote auf Basis einer Besichtigung vergleichen.",
          "Gut erhaltene Möbel verkaufen oder spenden statt mitnehmen.",
          "Rechnung aufbewahren und per Überweisung zahlen – so bleibt die Steuerermäßigung erhalten.",
        ],
      },
      {
        type: "link",
        label: "Wohnung entrümpeln: Checkliste & Entsorgungsregeln",
        href: "/blog/wohnung-entruempeln-checkliste",
        text: "Weniger Umzugsgut, niedrigerer Preis – so misten Sie vor dem Umzug richtig aus.",
      },
      { type: "heading", text: "Kann man Umzugskosten von der Steuer absetzen?" },
      {
        type: "paragraph",
        text: "Ja. Bei einem privat veranlassten Umzug können Sie 20 % der Arbeitskosten als haushaltsnahe Dienstleistung nach § 35a EStG von der Steuerschuld abziehen – insgesamt bis zu 4.000 € Steuerermäßigung pro Jahr für alle haushaltsnahen Dienstleistungen. Voraussetzung sind eine Rechnung mit ausgewiesenem Arbeitskostenanteil und die Zahlung per Überweisung. Ist der Umzug beruflich veranlasst, etwa wegen eines neuen Arbeitsplatzes, können Sie die Kosten als Werbungskosten ansetzen. Die Details klären Sie am besten mit Ihrer Steuerberatung.",
      },
      { type: "heading", text: "Fazit: Umzugskosten realistisch planen" },
      {
        type: "paragraph",
        text: "Wer die Größe seines Haushalts kennt, kann die Umzugskosten gut einschätzen. Für eine verlässliche Planung führt aber kein Weg an einer Besichtigung vorbei: Erst dann stehen Volumen, Laufwege und Zusatzleistungen fest. Bei FA Transport erhalten Sie nach der kostenlosen Besichtigung einen verbindlichen Festpreis – für Umzüge innerhalb Düsseldorfs, ins Umland und deutschlandweit.",
      },
      {
        type: "link",
        label: "Umzugscheckliste: Der Zeitplan für Ihren Umzug",
        href: "/blog/umzugscheckliste",
        text: "Von der Kündigung bis zur Ummeldung – alle Aufgaben in der richtigen Reihenfolge.",
      },
    ],
    faqs: [
      {
        question: "Was kostet ein Umzug einer 2-Zimmer-Wohnung in Düsseldorf?",
        answer:
          "Für einen Umzug innerhalb Düsseldorfs mit Profi-Team liegt der Richtwert bei etwa 800 bis 1.500 €. Das Volumen beträgt meist 25 bis 35 m³. Etage, Aufzug, Laufwege und Zusatzleistungen wie Küchenmontage verändern den Preis.",
      },
      {
        question: "Wie viele Umzugshelfer brauche ich?",
        answer:
          "Als Faustregel reichen zwei Helfer für eine 1-Zimmer-Wohnung, drei für zwei bis drei Zimmer und vier bis fünf für größere Wohnungen oder Häuser. Ohne Aufzug oder mit langen Laufwegen plant man eine Person mehr ein.",
      },
      {
        question: "Wann ist ein Umzug am günstigsten?",
        answer:
          "Unter der Woche und in der Monatsmitte. Monatsenden, Freitage, Samstage und die Sommerferien sind am stärksten gefragt – dann sind Termine knapp und oft teurer.",
      },
      {
        question: "Sind Umzugskosten steuerlich absetzbar?",
        answer:
          "Bei privaten Umzügen können 20 % der Arbeitskosten als haushaltsnahe Dienstleistung nach § 35a EStG abgezogen werden, bei beruflich veranlassten Umzügen die Kosten als Werbungskosten. Wichtig sind eine Rechnung mit ausgewiesenem Arbeitsanteil und die Zahlung per Überweisung.",
      },
      {
        question: "Ist ein Festpreis beim Umzug sinnvoll?",
        answer:
          "Ja. Ein Festpreis nach Besichtigung macht die Kosten planbar: Verzögerungen am Umzugstag gehen nicht zu Ihren Lasten. Beim Stundenlohn zahlen Sie jede Mehrstunde zusätzlich.",
      },
    ],
  },
  {
    slug: "umzugscheckliste",
    title: "Umzugscheckliste: Der Zeitplan für Ihren Umzug",
    excerpt:
      "Die Umzugscheckliste zum Abhaken: was Sie 3 Monate, 6 Wochen und 1 Woche vorher und nach dem Umzug erledigen müssen – inkl. Fristen und Ummeldung.",
    category: "umzug",
    publishedAt: "2026-09-26",
    author: editorialTeam,
    cover: { src: "/media/stock/umzug-kartons-beschriftet.jpg", alt: "Beschriftete Umzugskartons und Klebeband stehen bereit für den Umzug" },
    keywords: [
      "Umzugscheckliste",
      "Umzug Checkliste",
      "Umzug planen",
      "Umzug Zeitplan",
      "Ummelden Düsseldorf",
      "Halteverbotszone Düsseldorf",
      "Wohnungsgeberbestätigung",
    ],
    body: [
      {
        type: "paragraph",
        text: "Ein Umzug gelingt am besten mit einem Vorlauf von etwa drei Monaten. In dieser Zeit kündigen Sie die alte Wohnung, holen Angebote ein, beantragen die Halteverbotszone, packen Schritt für Schritt und melden sich nach dem Einzug innerhalb von zwei Wochen um. Diese Umzugscheckliste zeigt Ihnen alle Aufgaben in der richtigen Reihenfolge – zum Abhaken.",
      },
      {
        type: "checklist",
        title: "Das Wichtigste in Kürze",
        items: [
          "Mietvertrag: Die gesetzliche Kündigungsfrist für Mieter beträgt drei Monate",
          "Umzugsunternehmen: 6 bis 8 Wochen vorher buchen, zum Monatsende früher",
          "Halteverbotszone: 2 bis 3 Wochen vorher beantragen, Schilder müssen 72 Stunden vorher stehen",
          "Ummeldung: innerhalb von zwei Wochen nach dem Einzug beim Bürgerbüro",
          "Am Umzugstag: Zählerstände fotografieren und ein Übergabeprotokoll erstellen",
        ],
      },
      { type: "heading", text: "3 Monate vor dem Umzug: Kündigen und planen" },
      {
        type: "checklist",
        items: [
          "Mietvertrag schriftlich kündigen – die Kündigung muss spätestens am dritten Werktag eines Monats beim Vermieter sein, damit der Monat zählt",
          "Umzugstermin festlegen und Urlaub beantragen",
          "Angebote von Umzugsunternehmen einholen – am besten mit Besichtigung",
          "Kita- oder Schulwechsel anmelden",
          "Renovierungspflichten laut Mietvertrag prüfen (Schönheitsreparaturen)",
          "Budget festlegen – siehe unsere Übersicht zu den Umzugskosten",
        ],
      },
      {
        type: "link",
        label: "Umzugskosten Düsseldorf 2026: Was kostet ein Umzug?",
        href: "/blog/umzugskosten-duesseldorf",
        text: "Richtwerte nach Wohnungsgröße, Zusatzleistungen und Spartipps.",
      },
      { type: "heading", text: "6 bis 8 Wochen vorher: Umzugsfirma und Halteverbot" },
      {
        type: "checklist",
        items: [
          "Umzugsunternehmen verbindlich beauftragen – Festpreis und Leistungen schriftlich festhalten",
          "Halteverbotszone für alte und neue Adresse beantragen oder beauftragen",
          "Ausmisten: Was nicht mit soll, verkaufen, spenden oder entsorgen",
          "Sperrmüll anmelden oder eine Entrümpelung einplanen",
          "Umzugskartons, Klebeband und Polstermaterial besorgen",
          "Termin für die Wohnungsübergabe mit dem Vermieter vereinbaren",
        ],
      },
      {
        type: "subheading",
        text: "Halteverbotszone in Düsseldorf: Das müssen Sie wissen",
      },
      {
        type: "paragraph",
        text: "Gerade in dicht bebauten Vierteln wie Pempelfort, Flingern, Oberkassel oder der Carlstadt ist eine Halteverbotszone fast immer nötig. Sie wird bei der Straßenverkehrsbehörde der Stadt Düsseldorf beantragt. Planen Sie zwei bis drei Wochen Vorlauf ein. Die Schilder müssen mindestens drei volle Tage – also 72 Stunden – vor dem Umzug aufgestellt sein, sonst können Falschparker nicht kostenpflichtig abgeschleppt werden. Viele Umzugsunternehmen übernehmen Antrag und Beschilderung für Sie.",
      },
      { type: "heading", text: "4 Wochen vorher: Verträge und Adressen" },
      {
        type: "checklist",
        items: [
          "Strom- und Gasanbieter über den Umzug informieren",
          "Internet- und Telefonanschluss umziehen – wird Ihr Tarif am neuen Ort nicht angeboten, haben Sie ein Sonderkündigungsrecht",
          "Nachsendeauftrag bei der Deutschen Post einrichten",
          "Hausratversicherung, Bank, Krankenkasse und Arbeitgeber informieren",
          "Rundfunkbeitrag ummelden",
          "Zeitschriften-Abos und Vereine informieren",
        ],
      },
      { type: "heading", text: "2 Wochen vorher: Richtig packen" },
      {
        type: "list",
        items: [
          "Mit Dingen beginnen, die Sie selten brauchen: Bücher, Deko, Saisonkleidung.",
          "Schwere Gegenstände in kleine Kartons, leichte in große – kein Karton sollte mehr als 20 bis 25 kg wiegen.",
          "Jeden Karton mit Zielraum und Inhalt beschriften, zerbrechliche Kartons deutlich markieren.",
          "Schrauben von Möbeln in beschrifteten Beuteln direkt am Möbelstück befestigen.",
          "Betreuung für Kinder und Haustiere am Umzugstag organisieren.",
        ],
      },
      { type: "heading", text: "1 Woche vor dem Umzug" },
      {
        type: "checklist",
        items: [
          "Kühlschrank und Gefriertruhe spätestens 24 Stunden vorher abtauen",
          "Eine „Erste-Nacht-Kiste“ packen: Bettwäsche, Handtücher, Ladekabel, Medikamente, Werkzeug, Snacks",
          "Wichtige Unterlagen, Schmuck und Bargeld separat und selbst transportieren",
          "Halteverbotsschilder kontrollieren",
          "Treppenhaus und Böden vorbereiten – Schutz übernimmt meist das Umzugsteam",
        ],
      },
      { type: "heading", text: "Am Umzugstag" },
      {
        type: "checklist",
        items: [
          "Zählerstände für Strom, Gas und Wasser ablesen und fotografieren – in alter und neuer Wohnung",
          "Mit dem Teamleiter den Ablauf und besonders empfindliche Stücke durchgehen",
          "Alte Wohnung mit Übergabeprotokoll und allen Schlüsseln an den Vermieter übergeben",
          "Neue Wohnung auf Mängel prüfen und diese dokumentieren",
        ],
      },
      { type: "heading", text: "Nach dem Umzug: Ummelden und Adressen ändern" },
      {
        type: "paragraph",
        text: "Nach dem Bundesmeldegesetz müssen Sie sich innerhalb von zwei Wochen nach dem Einzug bei der Meldebehörde anmelden – in Düsseldorf in einem der Bürgerbüros, in der Regel mit Termin. Mitbringen müssen Sie Ihren Personalausweis oder Reisepass und die Wohnungsgeberbestätigung Ihres Vermieters. Wer die Frist versäumt, riskiert ein Bußgeld.",
      },
      {
        type: "checklist",
        items: [
          "Wohnsitz im Bürgerbüro anmelden (Frist: zwei Wochen)",
          "Adresse in der Zulassungsbescheinigung Teil I ändern lassen – Ihr Kennzeichen dürfen Sie behalten",
          "Hund bei der Hundesteuer der neuen Gemeinde anmelden",
          "Adresse bei Finanzamt, Versicherungen, Online-Shops und Ärzten aktualisieren",
          "Kaution der alten Wohnung zurückfordern",
        ],
      },
      {
        type: "tip",
        title: "Unser Tipp aus der Praxis",
        text: "Legen Sie für den Umzug einen einzigen Ordner an – digital oder auf Papier – mit Mietverträgen, Angeboten, Genehmigungen und Übergabeprotokollen. So finden Sie am Umzugstag und bei der Steuererklärung alles sofort wieder.",
      },
    ],
    faqs: [
      {
        question: "Wie lange vorher sollte man einen Umzug planen?",
        answer:
          "Ideal sind etwa drei Monate. Das entspricht der gesetzlichen Kündigungsfrist für Mieter und lässt genug Zeit für Angebote, Halteverbotszone und Packen. Umzugsunternehmen sollten Sie sechs bis acht Wochen vorher buchen.",
      },
      {
        question: "Wann muss ich mich in Düsseldorf ummelden?",
        answer:
          "Innerhalb von zwei Wochen nach dem Einzug in einem Bürgerbüro der Stadt Düsseldorf. Sie brauchen Ihren Ausweis und die Wohnungsgeberbestätigung des Vermieters.",
      },
      {
        question: "Brauche ich für meinen Umzug eine Halteverbotszone?",
        answer:
          "In den meisten Düsseldorfer Stadtteilen ja, weil freie Parkplätze vor der Haustür selten sind. Die Zone verkürzt die Laufwege und spart damit Zeit und Geld. Die Schilder müssen 72 Stunden vorher stehen.",
      },
      {
        question: "Was gehört in die Erste-Nacht-Kiste?",
        answer:
          "Alles, was Sie am ersten Abend brauchen: Bettwäsche, Handtücher, Hygieneartikel, Medikamente, Ladekabel, Werkzeug, Leuchtmittel, Toilettenpapier, Getränke und Snacks.",
      },
    ],
  },
];

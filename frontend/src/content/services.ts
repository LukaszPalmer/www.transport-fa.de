import type { ServiceArea, ServiceSlug } from "@/types/content";
import { heroMedia } from "./media";

/**
 * Leistungsbereiche – Single Source of Truth für Header-Dropdown, Startseite,
 * Leistungsseiten (/leistungen/[slug]), Kontaktformular, Sitemap und JSON-LD.
 *
 * TODO(Inhalt): Kennzahlen, Versprechen und FAQ-Antworten fachlich prüfen.
 */
export const services: ServiceArea[] = [
  /* ------------------------------------------------------------------------
     Umzüge
     ------------------------------------------------------------------------ */
  {
    slug: "umzuege",
    name: "Umzüge",
    icon: "sofa",
    showTrackingApp: true,
    teaser: "Privat- und Firmenumzüge zum Festpreis – inklusive Verpackung, Montage und Halteverbotszone.",
    highlights: ["Kostenlose Besichtigung", "Verbindlicher Festpreis", "Montage & Einpackservice"],
    seo: {
      title: "Umzüge zum Festpreis – Privat- & Firmenumzug",
      description:
        "Privat-, Firmen- und Fernumzüge mit festem Umzugsteam: kostenlose Besichtigung, verbindlicher Festpreis, Möbelmontage, Einpackservice und Halteverbotszone.",
    },
    hero: {
      eyebrow: "Umzüge · Privat & Gewerbe",
      headline: ["Ihr Umzug.", "Sorgfältig geplant."],
      headlineAccent: "Stressfrei erledigt.",
      subheadline:
        "Vom Einpackservice bis zur Küchenmontage: Unser festes Umzugsteam bringt Ihr Zuhause oder Büro sicher an den neuen Standort – zum verbindlichen Festpreis nach kostenloser Besichtigung.",
      media: heroMedia("umzuege"),
      factsTitle: "Ihr Umzug inklusive",
      facts: [
        "Kostenlose Besichtigung – vor Ort oder per Video",
        "Verbindliches Festpreis-Angebot",
        "Halteverbotszone & Genehmigungen",
        "Möbel-De- und Remontage",
        "Transportversicherung inklusive",
      ],
    },
    stats: [
      { value: "Festpreis", label: "Verbindliches Angebot", detail: "Keine versteckten Kosten" },
      { value: "24 h", label: "Angebot nach Besichtigung", detail: "Schriftlich & transparent" },
      { value: "100 %", label: "Eigene Umzugsteams", detail: "Geschult & festangestellt" },
      { value: "Versichert", label: "Rundum geschützt", detail: "Haftung nach HGB" },
    ],
    scope: {
      eyebrow: "Leistungsumfang",
      title: "Alles für Ihren Umzug – aus einer Hand",
      description:
        "Sie entscheiden, wie viel wir übernehmen: vom reinen Transport bis zum Rundum-sorglos-Umzug mit Ein- und Auspackservice.",
      items: [
        {
          icon: "house",
          title: "Privatumzug",
          description: "Wohnung oder Haus – wir planen jedes Detail und behandeln Ihr Zuhause mit größter Sorgfalt.",
          highlights: ["Schutzdecken & Kantenschutz", "Umzugskartons gestellt", "Termingenaue Durchführung"],
        },
        {
          icon: "building",
          title: "Firmen- & Büroumzug",
          description: "Minimale Ausfallzeiten dank Planung außerhalb Ihrer Geschäftszeiten – auch am Wochenende.",
          highlights: ["IT- & Aktenumzug", "Etagen- & Standortwechsel", "Fester Projektleiter"],
        },
        {
          icon: "globe",
          title: "Fern- & Auslandsumzug",
          description: "Deutschlandweit und in ganz Europa – mit eigener Flotte und klaren Zeitfenstern.",
          highlights: ["Direktfahrt ohne Umladen", "Zoll & Dokumente (Nicht-EU)", "Live-Status im Portal"],
        },
        {
          icon: "wrench",
          title: "Möbel- & Küchenmontage",
          description: "Fachgerechter Ab- und Aufbau von Möbeln, Einbauküchen und Lampen durch geschulte Monteure.",
          highlights: ["Küchenanpassung", "Lampen & Elektrogeräte", "Wandmontage"],
        },
        {
          icon: "package",
          title: "Ein- & Auspackservice",
          description: "Wir verpacken Ihr Hab und Gut bruchsicher – und packen am neuen Ort auf Wunsch wieder aus.",
          highlights: ["Spezialverpackung für Glas", "Kleiderboxen", "Entsorgung des Materials"],
        },
        {
          icon: "warehouse",
          title: "Einlagerung",
          description: "Sichere, trockene Lagerflächen für die Zwischenzeit – kurzfristig oder langfristig.",
          highlights: ["Videoüberwacht", "Flexible Laufzeiten", "Zustellung auf Abruf"],
        },
      ],
    },
    processTitle: "So läuft Ihr Umzug ab",
    process: [
      { title: "Anfrage & Besichtigung", description: "Sie schildern Ihr Vorhaben – wir besichtigen kostenlos vor Ort oder per Videocall." },
      { title: "Festpreis-Angebot", description: "Innerhalb von 24 Stunden erhalten Sie ein verbindliches, transparentes Angebot." },
      { title: "Planung & Vorbereitung", description: "Wir kümmern uns um Halteverbotszone, Kartons und einen genauen Ablaufplan." },
      { title: "Umzugstag & Übergabe", description: "Unser Team transportiert, montiert und übergibt – Sie kontrollieren mit uns gemeinsam." },
    ],
    faqs: [
      {
        question: "Was kostet ein Umzug?",
        answer:
          "Der Preis hängt vom Umzugsvolumen, der Entfernung, den Etagen und den gewünschten Zusatzleistungen ab. Nach der kostenlosen Besichtigung erhalten Sie einen verbindlichen Festpreis – ohne Nachforderungen.",
      },
      {
        question: "Wie früh sollte ich meinen Umzug buchen?",
        answer:
          "Idealerweise vier bis sechs Wochen im Voraus, zum Monatsende und in den Sommermonaten gern früher. Kurzfristige Umzüge ermöglichen wir, sofern Kapazitäten frei sind.",
      },
      {
        question: "Stellen Sie Umzugskartons und Verpackungsmaterial?",
        answer:
          "Ja. Wir liefern Kartons, Kleiderboxen und Spezialverpackungen rechtzeitig vor dem Umzug und holen das Material danach wieder ab.",
      },
      {
        question: "Sind meine Möbel während des Umzugs versichert?",
        answer:
          "Ja, wir haften im Rahmen der gesetzlichen Bestimmungen für Umzugsgut (HGB). Für besonders wertvolle Gegenstände bieten wir eine erweiterte Transportversicherung an.",
      },
      {
        question: "Kann ich die Umzugskosten steuerlich absetzen?",
        answer:
          "Privat veranlasste Umzüge können häufig als haushaltsnahe Dienstleistung (§ 35a EStG) berücksichtigt werden, beruflich veranlasste als Werbungskosten. Sie erhalten von uns eine Rechnung mit ausgewiesenem Arbeitskostenanteil – bitte stimmen Sie die Details mit Ihrer Steuerberatung ab.",
      },
    ],
  },

  /* ------------------------------------------------------------------------
     Entrümpelungen
     ------------------------------------------------------------------------ */
  {
    slug: "entruempelungen",
    name: "Entrümpelungen",
    icon: "recycle",
    teaser: "Keller, Dachboden, Wohnung oder Gewerbe – besenrein geräumt, fachgerecht entsorgt, mit Wertanrechnung.",
    highlights: ["Kurzfristige Termine", "Fachgerechte Entsorgung", "Besenreine Übergabe"],
    seo: {
      title: "Entrümpelung – schnell, diskret & besenrein",
      description:
        "Entrümpelung von Wohnung, Keller, Dachboden und Gewerbeflächen: Festpreis nach Besichtigung, fachgerechte Entsorgung, Wertanrechnung und besenreine Übergabe.",
    },
    hero: {
      eyebrow: "Entrümpelungen · schnell & diskret",
      headline: ["Platz schaffen.", "Schnell. Diskret."],
      headlineAccent: "Besenrein übergeben.",
      subheadline:
        "Wir räumen Keller, Dachböden, Wohnungen und Gewerbeflächen vollständig – inklusive fachgerechter Entsorgung und Recycling. Verwertbares rechnen wir transparent auf den Preis an.",
      media: heroMedia("entruempelungen"),
      factsTitle: "Ihre Entrümpelung inklusive",
      facts: [
        "Kostenlose Besichtigung & Festpreis",
        "Fachgerechte Entsorgung mit Nachweis",
        "Wertanrechnung verwertbarer Gegenstände",
        "Besenreine Übergabe",
        "Diskret – auch ohne Ihre Anwesenheit",
      ],
    },
    stats: [
      { value: "48 h", label: "Kurzfristige Termine", detail: "Nach Verfügbarkeit" },
      { value: "Festpreis", label: "Nach Besichtigung", detail: "Inklusive Entsorgung" },
      { value: "Recycling", label: "Fachgerecht getrennt", detail: "Mit Entsorgungsnachweis" },
      { value: "Besenrein", label: "Übergabe garantiert", detail: "Bereit für Nachmieter" },
    ],
    scope: {
      eyebrow: "Leistungsumfang",
      title: "Wir räumen – Sie gewinnen Raum",
      description:
        "Ob einzelner Kellerraum oder komplettes Gewerbeobjekt: Wir übernehmen Räumung, Abtransport und Entsorgung vollständig.",
      items: [
        {
          icon: "house",
          title: "Wohnungsentrümpelung",
          description: "Komplette oder teilweise Räumung von Wohnungen und Häusern – termingerecht zur Übergabe.",
          highlights: ["Möbel & Hausrat", "Demontage inklusive", "Besenreine Übergabe"],
        },
        {
          icon: "boxes",
          title: "Keller, Dachboden & Garage",
          description: "Schluss mit vollgestellten Nebenräumen – wir schaffen in wenigen Stunden wieder Platz.",
          highlights: ["Auch enge Zugänge", "Sperrmüll & Altmetall", "Kurzfristig möglich"],
        },
        {
          icon: "building",
          title: "Gewerbe- & Büroräumung",
          description: "Räumung von Büros, Lagern, Praxen und Ladenflächen – planbar und mit minimaler Störung.",
          highlights: ["Aktenvernichtung (DIN 66399)", "Mobiliar & IT-Geräte", "Wochenendeinsätze"],
        },
        {
          icon: "heart-handshake",
          title: "Sonder- & Messieräumung",
          description: "Einfühlsame, diskrete Räumung auch in schwierigen Situationen – mit neutralen Fahrzeugen.",
          highlights: ["Absolute Diskretion", "Schutzausrüstung", "Desinfektion auf Wunsch"],
        },
        {
          icon: "recycle",
          title: "Entsorgung & Recycling",
          description: "Sortenreine Trennung und Entsorgung über zertifizierte Fachbetriebe – nachvollziehbar dokumentiert.",
          highlights: ["Elektroschrott & Sondermüll", "Entsorgungsnachweis", "Hohe Verwertungsquote"],
        },
        {
          icon: "coins",
          title: "Wertanrechnung",
          description: "Verwertbare Möbel, Antiquitäten und Geräte rechnen wir fair auf Ihre Kosten an.",
          highlights: ["Transparente Bewertung", "Senkt den Festpreis", "Spenden an soziale Träger"],
        },
      ],
    },
    processTitle: "So läuft Ihre Entrümpelung ab",
    process: [
      { title: "Anfrage & Besichtigung", description: "Kostenlose Besichtigung vor Ort oder anhand Ihrer Fotos und Videos." },
      { title: "Festpreis mit Wertanrechnung", description: "Sie erhalten einen verbindlichen Preis – verwertbare Gegenstände sind bereits angerechnet." },
      { title: "Räumung & Entsorgung", description: "Unser Team räumt zügig, trennt sortenrein und entsorgt fachgerecht." },
      { title: "Besenreine Übergabe", description: "Wir übergeben die Räume besenrein – auf Wunsch direkt an Vermieter oder Hausverwaltung." },
    ],
    faqs: [
      {
        question: "Was kostet eine Entrümpelung?",
        answer:
          "Entscheidend sind Menge und Art des Räumguts, die Zugänglichkeit (Etage, Aufzug, Laufwege) und der Entsorgungsaufwand. Nach der Besichtigung erhalten Sie einen Festpreis inklusive Entsorgung – verwertbare Gegenstände werden angerechnet.",
      },
      {
        question: "Muss ich bei der Entrümpelung anwesend sein?",
        answer:
          "Nein. Nach Schlüsselübergabe arbeiten wir selbstständig und dokumentieren das Ergebnis mit Fotos. Die Abnahme kann auch durch Vermieter oder Hausverwaltung erfolgen.",
      },
      {
        question: "Was passiert mit noch brauchbaren Gegenständen?",
        answer:
          "Verwertbares wird auf den Preis angerechnet, gut erhaltene Möbel und Haushaltswaren geben wir – wenn möglich – an soziale Einrichtungen weiter.",
      },
      {
        question: "Wie wird entsorgt?",
        answer:
          "Wir trennen sortenrein und entsorgen über zertifizierte Fachbetriebe. Auf Wunsch erhalten Sie einen Entsorgungsnachweis, zum Beispiel für Gewerbeobjekte.",
      },
      {
        question: "Wie schnell können Sie entrümpeln?",
        answer:
          "In der Regel innerhalb weniger Tage, in dringenden Fällen oft innerhalb von 48 Stunden. Eine durchschnittliche Wohnung räumen wir meist an einem Arbeitstag.",
      },
    ],
  },

  /* ------------------------------------------------------------------------
     Haushaltsauflösungen
     ------------------------------------------------------------------------ */
  {
    slug: "haushaltsaufloesungen",
    name: "Haushaltsauflösungen",
    icon: "house",
    teaser: "Einfühlsame Komplettauflösung – im Erbfall, bei Umzug ins Pflegeheim oder bei Wohnungsaufgabe.",
    highlights: ["Persönlicher Ansprechpartner", "Wertanrechnung", "Übergabe an Vermieter"],
    seo: {
      title: "Haushaltsauflösung – einfühlsam & komplett",
      description:
        "Haushaltsauflösung im Erbfall, bei Umzug ins Pflegeheim oder Wohnungsaufgabe: Festpreis, Wertanrechnung, Sicherung von Dokumenten und besenreine Übergabe.",
    },
    hero: {
      eyebrow: "Haushaltsauflösungen · einfühlsam & komplett",
      headline: ["Mit Respekt.", "Mit Sorgfalt."],
      headlineAccent: "Komplett aus einer Hand.",
      subheadline:
        "Ob im Trauerfall, beim Umzug ins Pflegeheim oder bei einer Wohnungsaufgabe: Wir lösen Haushalte vollständig auf – mit Taktgefühl, fairer Wertanrechnung und besenreiner Übergabe.",
      media: heroMedia("haushaltsaufloesungen"),
      factsTitle: "Ihre Haushaltsauflösung inklusive",
      facts: [
        "Persönlicher Ansprechpartner",
        "Wertanrechnung von Möbeln & Antiquitäten",
        "Sicherung von Dokumenten & Erinnerungsstücken",
        "Renovierung & Endreinigung auf Wunsch",
        "Schlüsselübergabe an den Vermieter",
      ],
    },
    stats: [
      { value: "Diskret", label: "Einfühlsame Abwicklung", detail: "Neutrale Fahrzeuge auf Wunsch" },
      { value: "Festpreis", label: "Nach Besichtigung", detail: "Inklusive Entsorgung" },
      { value: "Anrechnung", label: "Wert senkt Ihre Kosten", detail: "Faire, transparente Bewertung" },
      { value: "Übergabe", label: "Besenrein & termingerecht", detail: "Mit Übergabeprotokoll" },
    ],
    scope: {
      eyebrow: "Leistungsumfang",
      title: "Wir kümmern uns um alles – in Ihrem Tempo",
      description:
        "Eine Haushaltsauflösung ist oft emotional. Wir nehmen Ihnen Organisation und Arbeit ab und gehen mit jedem Gegenstand respektvoll um.",
      items: [
        {
          icon: "house",
          title: "Komplette Auflösung",
          description: "Vom Keller bis zum Dachboden – wir lösen den gesamten Haushalt auf und übergeben die Räume leer.",
          highlights: ["Alle Räume & Nebenflächen", "Demontage & Abtransport", "Besenreine Übergabe"],
        },
        {
          icon: "heart-handshake",
          title: "Nachlass & Erbfall",
          description: "Wir unterstützen Erbengemeinschaften und Nachlassverwalter mit Ruhe, Diskretion und klarer Abstimmung.",
          highlights: ["Abstimmung mit allen Erben", "Dokumentation per Foto", "Auch überregional"],
        },
        {
          icon: "sofa",
          title: "Seniorenumzug & Pflegeheim",
          description: "Wir bringen ausgewählte Möbel ins neue Zuhause und lösen den bisherigen Haushalt behutsam auf.",
          highlights: ["Umzug & Auflösung kombiniert", "Aufbau im neuen Zimmer", "Viel Zeit & Geduld"],
        },
        {
          icon: "coins",
          title: "Wertschätzung & Ankauf",
          description: "Antiquitäten, Sammlerstücke und gut erhaltene Möbel bewerten wir fair und rechnen sie an.",
          highlights: ["Transparente Bewertung", "Direkter Ankauf möglich", "Reduziert den Festpreis"],
        },
        {
          icon: "sparkles",
          title: "Renovierung & Endreinigung",
          description: "Auf Wunsch übernehmen wir Tapeten- und Bodenentfernung, Malerarbeiten und die Endreinigung.",
          highlights: ["Schönheitsreparaturen", "Bodenbeläge entfernen", "Grundreinigung"],
        },
        {
          icon: "key",
          title: "Übergabe an Vermieter",
          description: "Wir koordinieren den Termin mit Vermieter oder Hausverwaltung und erstellen ein Übergabeprotokoll.",
          highlights: ["Terminkoordination", "Übergabeprotokoll", "Schlüsselmanagement"],
        },
      ],
    },
    processTitle: "So läuft Ihre Haushaltsauflösung ab",
    process: [
      { title: "Persönliches Erstgespräch", description: "Wir hören zu, klären Ihre Wünsche und vereinbaren eine kostenlose Besichtigung." },
      { title: "Festpreis mit Wertanrechnung", description: "Sie erhalten ein verbindliches Angebot, in dem verwertbare Gegenstände bereits angerechnet sind." },
      { title: "Sortieren & Sichern", description: "Dokumente, Fotos und Erinnerungsstücke legen wir für Sie beiseite – nichts geht verloren." },
      { title: "Räumung & Übergabe", description: "Wir räumen, entsorgen fachgerecht und übergeben die Wohnung besenrein." },
    ],
    faqs: [
      {
        question: "Was kostet eine Haushaltsauflösung?",
        answer:
          "Die Kosten richten sich nach Wohnfläche, Menge des Hausrats, Zugänglichkeit und Entsorgungsaufwand. Verwertbare Gegenstände werden angerechnet – im besten Fall reduziert sich der Preis deutlich.",
      },
      {
        question: "Was passiert mit persönlichen Dokumenten und Fotos?",
        answer:
          "Wir sichten sorgfältig und stellen Dokumente, Fotos, Wertsachen und Erinnerungsstücke für Sie zusammen. Was vorher gesichert werden soll, besprechen wir gemeinsam.",
      },
      {
        question: "Übernehmen Sie auch die Übergabe an den Vermieter?",
        answer:
          "Ja. Wir koordinieren den Übergabetermin, erstellen ein Protokoll und übergeben die Schlüssel – auf Wunsch ohne dass Sie vor Ort sein müssen.",
      },
      {
        question: "Wie lange dauert eine Haushaltsauflösung?",
        answer:
          "Eine durchschnittliche Wohnung lösen wir meist in ein bis zwei Arbeitstagen auf. Den Zeitplan stimmen wir flexibel mit Ihnen und dem Vermieter ab.",
      },
      {
        question: "Arbeiten Sie auch mit Nachlassverwaltern und Betreuern zusammen?",
        answer:
          "Ja, regelmäßig. Wir stimmen uns mit Erben, gesetzlichen Betreuern, Nachlassgerichten und Hausverwaltungen ab und dokumentieren jeden Schritt nachvollziehbar.",
      },
    ],
  },

  /* ------------------------------------------------------------------------
     Transport & Logistik (B2B)
     ------------------------------------------------------------------------ */
  {
    slug: "transport-logistik",
    name: "Transport & Logistik",
    icon: "truck",
    showTrackingApp: true,
    teaser: "Spedition, Schwerlast, Kontraktlogistik und Express – termintreu in ganz Europa.",
    highlights: ["FTL & LTL europaweit", "Echtzeit-Tracking", "Disposition 24/7"],
    seo: {
      title: "Transport & Logistik – Spedition, Schwerlast, Express",
      description:
        "Spedition, Schwertransporte, Kontraktlogistik und Express-Direktfahrten: termintreu in ganz Europa, mit Euro-6-Flotte, Echtzeit-Tracking und Disposition rund um die Uhr.",
    },
    hero: {
      eyebrow: "Transport & Logistik · B2B",
      headline: ["Ihre Fracht.", "Europaweit."],
      headlineAccent: "Termintreu geliefert.",
      subheadline:
        "Komplett- und Teilladungen, Schwertransporte, Lagerlogistik und zeitkritische Direktfahrten: Wir planen, steuern und verantworten Ihre Transporte aus einer Hand – mit moderner Flotte und Echtzeit-Tracking.",
      media: heroMedia("transport-logistik"),
      factsTitle: "Ihr Logistikpartner",
      facts: [
        "Echtzeit-Tracking im Kundenportal",
        "100 % Euro-6-Flotte",
        "Disposition rund um die Uhr",
        "ISO 9001 & 14001 zertifiziert",
        "Angebot innerhalb von 2 Stunden",
      ],
    },
    stats: [
      { value: "99,8 %", label: "Termintreue", detail: "Über alle Sendungen 2025" },
      { value: "180+", label: "Eigene Fahrzeuge", detail: "Ø jünger als 3 Jahre" },
      { value: "24/7", label: "Disposition", detail: "Persönliche Ansprechpartner" },
      { value: "EU-weit", label: "Netzwerk", detail: "Tägliche Linienverkehre" },
    ],
    scope: {
      eyebrow: "Leistungsumfang",
      title: "Logistiklösungen, die mit Ihrem Geschäft skalieren",
      description:
        "Vom einzelnen Stückgut bis zur komplexen Supply Chain: Wir planen, steuern und verantworten Ihre Transporte aus einer Hand.",
      items: [
        {
          icon: "truck",
          title: "Spedition",
          description:
            "Komplett- und Teilladungen im europäischen Straßengüterverkehr – mit festen Linienverkehren und flexiblen Kapazitäten.",
          highlights: ["FTL & LTL europaweit", "Tägliche Linienverkehre", "Zoll- & Dokumentenabwicklung"],
        },
        {
          icon: "weight",
          title: "Schwerlast",
          description:
            "Großraum- und Schwertransporte inklusive Streckenprüfung, Genehmigungen und Begleitschutz – sicher bis ans Ziel.",
          highlights: ["Bis 120 t Nutzlast", "Genehmigungsmanagement", "BF3/BF4-Begleitfahrzeuge"],
        },
        {
          icon: "warehouse",
          title: "Kontraktlogistik",
          description:
            "Maßgeschneiderte Lager- und Distributionslösungen, nahtlos in Ihre Systeme integriert – von Beschaffung bis Auslieferung.",
          highlights: ["45.000 m² Lagerfläche", "Value-Added Services", "WMS-Anbindung via EDI/API"],
        },
        {
          icon: "zap",
          title: "Express-Transporte",
          description:
            "Zeitkritische Sendungen per Direktfahrt – rund um die Uhr disponiert, ohne Umschlag und mit garantierter Zustellzeit.",
          highlights: ["Direktfahrten in 24 h", "Sonderfahrten 24/7", "Live-Status per Portal & SMS"],
        },
      ],
    },
    processTitle: "So läuft Ihr Transport ab",
    process: [
      { title: "Anfrage", description: "Sendungsdaten per Formular, E-Mail, Telefon oder direkt über das Kundenportal übermitteln." },
      { title: "Angebot in 2 Stunden", description: "Sie erhalten ein transparentes Angebot mit fester Laufzeit und Ansprechpartner." },
      { title: "Disposition & Tracking", description: "Wir disponieren, informieren proaktiv und Sie verfolgen jede Sendung live." },
      { title: "Zustellung & ePOD", description: "Zustellung im Zeitfenster – der digitale Abliefernachweis liegt sofort im Portal." },
    ],
    faqs: [
      {
        question: "Welche Sendungsgrößen transportieren Sie?",
        answer:
          "Vom einzelnen Stückgut über Teil- und Komplettladungen bis hin zu Schwertransporten mit bis zu 120 Tonnen – national und international.",
      },
      {
        question: "Kann ich meine Sendungen live verfolgen?",
        answer:
          "Ja. Im Kundenportal sehen Sie Position, ETA-Prognose und Status jeder Sendung. Auf Wunsch binden wir die Daten per API oder EDI direkt in Ihr ERP ein.",
      },
      {
        question: "Wie schnell erhalte ich ein Angebot?",
        answer:
          "Für Standardtransporte in der Regel innerhalb von zwei Stunden während unserer Geschäftszeiten. Komplexe Projekte kalkulieren wir nach Abstimmung individuell.",
      },
      {
        question: "Übernehmen Sie auch Zoll und Dokumente?",
        answer:
          "Ja, wir kümmern uns um Zollabwicklung, Frachtpapiere und Genehmigungen – auch für Transporte in Nicht-EU-Länder wie die Schweiz oder Großbritannien.",
      },
    ],
  },
];

export function getService(slug: string): ServiceArea | undefined {
  return services.find((service) => service.slug === slug);
}

export const serviceHref = (slug: ServiceSlug) => `/leistungen/${slug}`;

/** Deep-Link ins Kontaktformular mit vorausgewählter Leistung. */
export const serviceContactHref = (slug: ServiceSlug) => `/kontakt?leistung=${slug}#anfrage`;

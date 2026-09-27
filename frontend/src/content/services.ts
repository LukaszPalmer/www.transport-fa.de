import type { ServiceArea, ServiceSlug } from "@/types/content";
import type { Locale } from "@/i18n/config";
import { servicesEn } from "./en/services";
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
          highlights: ["Direktfahrt ohne Umladen", "Zoll & Dokumente (Nicht-EU)", "Fester Ansprechpartner"],
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
     Transport (privat & gewerblich) – keine Lager- oder Kontraktlogistik
     ------------------------------------------------------------------------ */
  {
    slug: "transport",
    name: "Transport",
    icon: "truck",
    showTrackingApp: true,
    teaser: "Möbel-, Einzel- und Gewerbetransporte, Lieferung & Abholung – regional, deutschlandweit und in Europa.",
    highlights: ["Vom Einzelstück bis zur Ladung", "Fester Ansprechpartner", "Deutschland- & europaweit"],
    seo: {
      title: "Transporte – Möbel, Einzelstücke & Gewerbe",
      description:
        "Möbel- und Einzeltransporte, Lieferung & Abholung, gewerbliche Transporte und Direktfahrten: sicher verladen, termintreu zugestellt – regional, deutschlandweit und in Europa. Festpreis-Angebot innerhalb von 24 Stunden.",
    },
    hero: {
      eyebrow: "Transport · Privat & Gewerbe",
      headline: ["Ihre Ladung.", "Sicher bewegt."],
      headlineAccent: "Termintreu geliefert.",
      subheadline:
        "Vom einzelnen Möbelstück über die Lieferung aus dem Möbelhaus bis zur Palette für Ihr Unternehmen: Wir holen ab, verladen fachgerecht und liefern pünktlich – mit festem Ansprechpartner und transparentem Festpreis.",
      media: heroMedia("transport"),
      factsTitle: "Ihr Transport inklusive",
      facts: [
        "Fester Ansprechpartner je Auftrag",
        "Fachgerechte Ladungssicherung",
        "Schutzdecken, Gurte & Verpackung",
        "Haftung nach HGB & CMR",
        "Festpreis-Angebot innerhalb von 24 Stunden",
      ],
    },
    stats: [
      { value: "Festpreis", label: "Verbindliches Angebot", detail: "Keine versteckten Kosten" },
      { value: "24 h", label: "Angebot", detail: "Schriftlich & transparent" },
      { value: "Direkt", label: "Ohne Umladen", detail: "Von Tür zu Tür" },
      { value: "EU-weit", label: "Einsatzgebiet", detail: "Deutschland & Europa" },
    ],
    scope: {
      eyebrow: "Leistungsumfang",
      title: "Transporte für jeden Anlass",
      description:
        "Ob einzelnes Sofa, komplette Büroausstattung oder Ware für Ihre Kunden: Wir übernehmen Abholung, Verladung und Zustellung – zuverlässig und aus einer Hand.",
      items: [
        {
          icon: "sofa",
          title: "Möbel- & Einzeltransporte",
          description: "Sofa, Schrank, Waschmaschine oder der Kauf aus der Kleinanzeige – wir holen ab und liefern sicher verpackt.",
          highlights: ["Schutzdecken & Gurte", "Tragen bis in die Wohnung", "Auf Wunsch mit Montage"],
        },
        {
          icon: "package",
          title: "Lieferung & Abholung",
          description: "Abholung aus Möbelhaus, Baumarkt oder Lager und Zustellung zu Ihnen – auch als Lieferservice für Ihre Kunden.",
          highlights: ["Möbelhaus- & Online-Käufe", "Termin nach Wunsch", "Auf- und Abbau möglich"],
        },
        {
          icon: "building",
          title: "Gewerbliche Transporte",
          description: "Büroausstattung, Paletten, Messe- und Ladenbau: planbare Transporte für Unternehmen mit festem Ansprechpartner.",
          highlights: ["Paletten & Stückgut", "Messe- & Ladenbau", "E-Rechnung (ZUGFeRD/XRechnung)"],
        },
        {
          icon: "zap",
          title: "Direkt- & Expressfahrten",
          description: "Eilige Sendungen fahren wir direkt – ohne Umladen, auf kürzestem Weg und mit Rückmeldung bei Zustellung.",
          highlights: ["Direktfahrt ohne Umschlag", "Deutschland- & europaweit", "Zustellnachweis"],
        },
      ],
    },
    processTitle: "So läuft Ihr Transport ab",
    process: [
      { title: "Anfrage", description: "Was, von wo, wohin und wann – per Formular, E-Mail, Telefon oder direkt im Kundenportal." },
      { title: "Angebot innerhalb von 24 Stunden", description: "Sie erhalten ein verbindliches Festpreis-Angebot mit Abhol- und Lieferzeitfenster." },
      { title: "Abholung & Verladung", description: "Wir holen pünktlich ab, verpacken bei Bedarf und sichern die Ladung fachgerecht." },
      { title: "Zustellung & Nachweis", description: "Zustellung im vereinbarten Zeitfenster – auf Wunsch bis in den Raum, mit Abliefernachweis." },
    ],
    faqs: [
      {
        question: "Welche Transporte übernehmen Sie?",
        answer:
          "Einzelne Möbel und Geräte, Lieferungen aus Möbelhaus oder Lager, gewerbliche Transporte wie Büroausstattung und Paletten sowie Direktfahrten – regional, deutschlandweit und in Europa. Lagerung und Logistikdienstleistungen bieten wir nicht an.",
      },
      {
        question: "Kann ich meinen Transport live verfolgen?",
        answer:
          "Im Kundenportal sehen Sie Status, Fahrer und – während der Fahrt – die Position Ihres Transports. Die FA Tracking App für iOS und Android folgt in Kürze. Zusätzlich informiert Sie Ihr fester Ansprechpartner über jeden wichtigen Schritt.",
      },
      {
        question: "Wie schnell erhalte ich ein Angebot?",
        answer: "In der Regel innerhalb von 24 Stunden – bei einfachen Transporten oft noch am selben Tag.",
      },
      {
        question: "Sind die Güter während des Transports versichert?",
        answer:
          "Ja. Wir haften nach HGB, bei grenzüberschreitenden Transporten nach CMR. Für besonders wertvolle Güter bieten wir auf Wunsch eine erweiterte Transportversicherung an.",
      },
    ],
  },
];

const servicesByLocale: Record<Locale, ServiceArea[]> = { de: services, en: servicesEn };

/** Leistungen in der gewünschten Sprache (Deutsch ist Standard, z. B. für Admin und Sitemap). */
export function getServices(locale: Locale = "de"): ServiceArea[] {
  return servicesByLocale[locale];
}

export function getService(slug: string, locale: Locale = "de"): ServiceArea | undefined {
  return getServices(locale).find((service) => service.slug === slug);
}

export const serviceHref = (slug: ServiceSlug) => `/leistungen/${slug}`;

/** Deep-Link ins Kontaktformular mit vorausgewählter Leistung. */
export const serviceContactHref = (slug: ServiceSlug) => `/kontakt?leistung=${slug}#anfrage`;

import type { BlogPost } from "../blog";
import { editorialTeam } from "./shared";

/** Kategorie „Entrümpelung“ – Suchintention: Kosten/Anbieter (kommerziell) und Anleitung (informativ). */
export const entruempelungPosts: BlogPost[] = [
  {
    slug: "entruempelung-kosten-duesseldorf",
    title: "Entrümpelung Düsseldorf: Kosten, Ablauf & Spartipps",
    excerpt:
      "Was kostet eine Entrümpelung in Düsseldorf? Preise pro m³, Richtwerte für Keller, Dachboden und Wohnung – und woran Sie seriöse Anbieter erkennen.",
    category: "entruempelung",
    publishedAt: "2026-09-26",
    author: editorialTeam,
    cover: { src: "/media/stock/entruempelung-besenrein.jpg", alt: "Leere, besenrein übergebene Wohnung nach einer Entrümpelung" },
    keywords: [
      "Entrümpelung Düsseldorf",
      "Entrümpelung Kosten",
      "Entrümpelung Preis pro m³",
      "Wohnung entrümpeln Kosten",
      "Keller entrümpeln Düsseldorf",
      "Entrümpelungsfirma Düsseldorf",
      "Messie-Wohnung entrümpeln",
    ],
    body: [
      {
        type: "paragraph",
        text: "Eine professionelle Entrümpelung kostet in Düsseldorf meist etwa 35 bis 70 € pro Kubikmeter Räumgut – inklusive Arbeitszeit, Abtransport und Entsorgung. Ein einzelner Kellerraum ist damit oft schon für 250 bis 600 € geräumt, eine 2-Zimmer-Wohnung kostet in der Regel 1.000 bis 2.500 €. Verwertbare Möbel und Geräte können den Preis durch Wertanrechnung senken.",
      },
      {
        type: "checklist",
        title: "Das Wichtigste in Kürze",
        items: [
          "Richtwert: ca. 35–70 € pro m³ Räumgut, inklusive Entsorgung",
          "Preistreiber: Etage ohne Aufzug, Sondermüll, Demontage und kurzfristige Termine",
          "Wertanrechnung: Verkäufliche Gegenstände werden mit dem Preis verrechnet",
          "Seriös ist ein schriftlicher Festpreis nach Besichtigung – mit Entsorgungsnachweis",
          "Als Abfallbesitzer bleiben Sie verantwortlich, bis alles ordnungsgemäß entsorgt ist",
        ],
      },
      { type: "heading", text: "Was kostet eine Entrümpelung? Richtwerte für Düsseldorf" },
      {
        type: "table",
        caption: "Entrümpelung in Düsseldorf – Richtwerte 2026",
        head: ["Objekt", "Menge (ca.)", "Richtwert"],
        rows: [
          ["Kellerraum (ca. 10 m²)", "5–10 m³", "250–600 €"],
          ["Dachboden", "5–15 m³", "300–900 €"],
          ["Garage", "5–12 m³", "250–700 €"],
          ["2-Zimmer-Wohnung (ca. 60 m²)", "20–35 m³", "1.000–2.500 €"],
          ["3–4-Zimmer-Wohnung / Haus", "35–70 m³", "2.000–5.000 €"],
          ["Messie- oder Sonderräumung", "stark unterschiedlich", "individuell nach Besichtigung"],
        ],
        note: "Marktübliche Richtwerte inklusive Arbeitszeit, Transport und Entsorgung, vor Wertanrechnung. Sondermüll, Bauschutt und aufwendige Demontagen kosten extra.",
      },
      { type: "heading", text: "Wovon hängt der Preis einer Entrümpelung ab?" },
      {
        type: "list",
        items: [
          "Menge und Art des Räumguts: Möbel und Hausrat sind günstiger zu entsorgen als Bauschutt, Altreifen oder Sondermüll.",
          "Zugänglichkeit: Obere Etagen ohne Aufzug, enge Kellertreppen und weite Wege zum Fahrzeug erhöhen die Arbeitszeit.",
          "Demontage: Einbauküchen, Einbauschränke, Teppichböden oder Lampen müssen erst abgebaut werden.",
          "Entsorgungskosten: Die Gebühren der Entsorgungsanlagen werden nach Gewicht und Abfallart berechnet.",
          "Termin: Sehr kurzfristige Einsätze, etwa kurz vor einer Wohnungsübergabe, erfordern zusätzliche Teams.",
          "Zusatzleistungen: Endreinigung, Renovierung oder Aktenvernichtung nach DIN 66399.",
        ],
      },
      { type: "heading", text: "Wie funktioniert die Wertanrechnung?" },
      {
        type: "paragraph",
        text: "Bei der Wertanrechnung prüft der Entrümpler, welche Gegenstände sich noch verkaufen lassen – etwa Designermöbel, Antiquitäten, hochwertiges Werkzeug oder neuwertige Elektrogeräte. Deren Wert wird direkt vom Festpreis abgezogen. Ehrlich gesagt: Die meisten gebrauchten Möbel wie Schrankwände oder ältere Polstermöbel haben heute kaum noch Marktwert. Eine kostenlose Entrümpelung ist deshalb die Ausnahme, eine spürbare Ersparnis bei gut erhaltenem Inventar aber durchaus möglich.",
      },
      { type: "heading", text: "Ablauf: So läuft eine Entrümpelung ab" },
      {
        type: "list",
        ordered: true,
        items: [
          "Anfrage mit Fotos oder Video – so lässt sich die Menge schon grob einschätzen.",
          "Kostenlose Besichtigung vor Ort und schriftlicher Festpreis inklusive Wertanrechnung.",
          "Terminvereinbarung – auch ohne Ihre Anwesenheit nach Schlüsselübergabe.",
          "Räumung, Demontage und sortenreine Trennung für Recycling und Entsorgung.",
          "Besenreine Übergabe mit Fotodokumentation, auf Wunsch direkt an Vermieter oder Hausverwaltung.",
        ],
      },
      { type: "heading", text: "Entrümpelung selbst machen oder Profis beauftragen?" },
      {
        type: "paragraph",
        text: "Einen kleinen Kellerraum mit Hausrat können Sie gut selbst räumen: Die Sperrmüllabfuhr der Stadt Düsseldorf (AWISTA) holt haushaltsübliche Mengen nach Anmeldung ab, Elektrogeräte und Schadstoffe nehmen die Recyclinghöfe an. Bei ganzen Wohnungen, festen Übergabeterminen, schweren Möbeln, gemischten Abfällen oder einer Messie-Situation lohnt sich ein Entrümpelungsdienst meist – auch weil Transporter, Entsorgungsgebühren und mehrere Arbeitstage schnell ins Geld gehen.",
      },
      {
        type: "link",
        label: "Wohnung entrümpeln: Checkliste & Entsorgungsregeln",
        href: "/blog/wohnung-entruempeln-checkliste",
        text: "Wenn Sie selbst anpacken: Was wohin gehört und wie Sie Raum für Raum vorgehen.",
      },
      { type: "heading", text: "Woran erkennen Sie eine seriöse Entrümpelungsfirma?" },
      {
        type: "checklist",
        items: [
          "Besichtigung vor dem Angebot statt Pauschalpreis am Telefon",
          "Schriftlicher Festpreis mit allen Leistungen und der Wertanrechnung",
          "Entsorgung über zugelassene Fachbetriebe – auf Wunsch mit Nachweis",
          "Vollständiges Impressum mit Adresse und Betriebshaftpflichtversicherung",
          "Keine Barzahlung im Voraus",
        ],
      },
      {
        type: "tip",
        title: "Vorsicht bei „kostenloser Entrümpelung“",
        text: "Angebote ohne Kosten und ohne Besichtigung enden oft in illegal abgeladenem Sperrmüll. Nach dem Kreislaufwirtschaftsgesetz bleiben Sie als Abfallbesitzer mitverantwortlich, bis Ihre Abfälle ordnungsgemäß entsorgt sind. Lassen Sie sich die fachgerechte Entsorgung deshalb bestätigen.",
      },
      { type: "heading", text: "Kann man die Kosten einer Entrümpelung absetzen?" },
      {
        type: "paragraph",
        text: "Die Arbeitskosten einer Entrümpelung im Privathaushalt können unter Umständen als haushaltsnahe Dienstleistung nach § 35a EStG berücksichtigt werden. Wichtig sind eine Rechnung mit getrennt ausgewiesenen Arbeitskosten und die Zahlung per Überweisung. Ob es in Ihrem Fall greift, klären Sie mit Ihrer Steuerberatung.",
      },
      {
        type: "paragraph",
        text: "FA Transport entrümpelt Keller, Dachböden, Wohnungen und Gewerbeflächen in Düsseldorf und Umgebung – von Neuss und Meerbusch bis Ratingen, Hilden und Erkrath. Sie erhalten nach der kostenlosen Besichtigung einen Festpreis inklusive Entsorgung und Wertanrechnung.",
      },
    ],
    faqs: [
      {
        question: "Was kostet eine Entrümpelung pro Kubikmeter?",
        answer:
          "Als Richtwert rund 35 bis 70 € pro Kubikmeter, inklusive Arbeitszeit, Transport und Entsorgung. Sondermüll, Bauschutt, Demontagen und schwer zugängliche Räume erhöhen den Preis.",
      },
      {
        question: "Was kostet es, einen Keller entrümpeln zu lassen?",
        answer:
          "Ein durchschnittlicher Kellerraum mit 5 bis 10 m³ Räumgut kostet meist 250 bis 600 €. Enge Treppen, Feuchtigkeit oder Farbreste und Chemikalien können den Aufwand erhöhen.",
      },
      {
        question: "Muss ich bei der Entrümpelung anwesend sein?",
        answer:
          "Nein. Nach der Schlüsselübergabe kann das Team selbstständig arbeiten und das Ergebnis mit Fotos dokumentieren. Die Abnahme kann auch durch Vermieter oder Hausverwaltung erfolgen.",
      },
      {
        question: "Wie schnell ist eine Wohnung entrümpelt?",
        answer:
          "Eine durchschnittliche Wohnung ist meist an einem Arbeitstag geräumt. Größere Häuser, Messie-Wohnungen oder aufwendige Demontagen können zwei bis drei Tage dauern.",
      },
      {
        question: "Ist eine kostenlose Entrümpelung möglich?",
        answer:
          "Nur in Ausnahmefällen, wenn der Wert der verkäuflichen Gegenstände die Kosten deckt. Bei Angeboten ohne Besichtigung ist Vorsicht geboten – als Abfallbesitzer haften Sie für eine illegale Entsorgung mit.",
      },
    ],
  },
  {
    slug: "wohnung-entruempeln-checkliste",
    title: "Wohnung entrümpeln: Checkliste & Entsorgungsregeln",
    excerpt:
      "Wohnung, Keller & Dachboden entrümpeln: Schritt-für-Schritt-Checkliste, 4-Kisten-Methode und was in Sperrmüll, Recyclinghof und Sondermüll gehört.",
    category: "entruempelung",
    publishedAt: "2026-09-26",
    author: editorialTeam,
    cover: { src: "/media/stock/entruempelung-sortieren.jpg", alt: "Beim Entrümpeln wird Kleidung in Kartons zum Behalten und Spenden sortiert" },
    keywords: [
      "Wohnung entrümpeln",
      "Entrümpeln Checkliste",
      "Keller entrümpeln",
      "Dachboden entrümpeln",
      "Sperrmüll Düsseldorf",
      "Was darf in den Sperrmüll",
      "Ausmisten Tipps",
    ],
    body: [
      {
        type: "paragraph",
        text: "Eine Wohnung entrümpeln Sie am schnellsten, wenn Sie Raum für Raum vorgehen und jeden Gegenstand sofort einer von vier Kategorien zuordnen: behalten, verkaufen, spenden oder entsorgen. Entscheidend ist, dass Sperrmüll, Elektrogeräte und Schadstoffe getrennt und richtig entsorgt werden. Diese Checkliste führt Sie Schritt für Schritt durch Wohnung, Keller und Dachboden.",
      },
      {
        type: "checklist",
        title: "Das Wichtigste in Kürze",
        items: [
          "Vorher Ziel, Termin und Entsorgungswege festlegen",
          "Mit dem am wenigsten emotionalen Raum beginnen – meist Keller oder Abstellraum",
          "4-Kisten-Methode: behalten, verkaufen, spenden, entsorgen",
          "Elektrogeräte, Batterien und Chemikalien nie in den Sperr- oder Restmüll",
          "Arbeitsschutz: Handschuhe, feste Schuhe und im Keller eine FFP2-Maske",
        ],
      },
      { type: "heading", text: "Schritt 1: Vorbereitung – bevor Sie den ersten Karton füllen" },
      {
        type: "checklist",
        items: [
          "Ziel festlegen: Platz schaffen, Umzug vorbereiten oder Wohnung übergabefertig machen",
          "Termin und Zeitpuffer planen – eine volle Wohnung braucht allein oft mehrere Wochenenden",
          "Sperrmülltermin anmelden oder Recyclinghof-Öffnungszeiten prüfen",
          "Kartons, stabile Müllsäcke, Klebeband und Werkzeug bereitstellen",
          "Bei großen Mengen: Container oder Transporter organisieren – ggf. mit Halteverbotszone",
        ],
      },
      { type: "heading", text: "Schritt 2: Die 4-Kisten-Methode" },
      {
        type: "paragraph",
        text: "Stellen Sie in jedem Raum vier Kisten oder markierte Flächen auf. Jeder Gegenstand wird genau einmal in die Hand genommen und sofort entschieden. Hilfreich ist die Ein-Jahres-Regel: Was Sie ein Jahr lang nicht benutzt haben, brauchen Sie meist auch künftig nicht.",
      },
      {
        type: "table",
        caption: "Die 4-Kisten-Methode",
        head: ["Kiste", "Was hinein gehört", "Wohin damit"],
        rows: [
          ["Behalten", "Täglich oder saisonal Genutztes, Erinnerungsstücke", "Direkt an den festen Platz"],
          ["Verkaufen", "Gut erhaltene Möbel, Markengeräte, Sammlerstücke", "Kleinanzeigen, Flohmarkt, Ankauf"],
          ["Spenden", "Intakte Kleidung, Hausrat, Bücher, Spielzeug", "Sozialkaufhaus, Kleiderkammer"],
          ["Entsorgen", "Defektes, Verschlissenes, Abgelaufenes", "Sperrmüll, Recyclinghof, Schadstoffsammlung"],
        ],
      },
      { type: "heading", text: "Schritt 3: Raum für Raum vorgehen" },
      { type: "subheading", text: "Keller" },
      {
        type: "paragraph",
        text: "Im Keller sammeln sich oft Farbeimer, Reinigungsmittel und alte Elektrogeräte – also genau die Dinge, die nicht in den Sperrmüll dürfen. Achten Sie auf Feuchtigkeit und Schimmel: Befallene Kartons und Textilien entsorgen Sie am besten direkt, beim Arbeiten schützt eine FFP2-Maske.",
      },
      { type: "subheading", text: "Dachboden" },
      {
        type: "paragraph",
        text: "Auf dem Dachboden sind Staub, Hitze im Sommer und schmale Treppen die größten Hürden. Tragen Sie schwere Stücke nie allein. Alte Dämmung aus Mineralwolle, die vor 1996 verbaut wurde, kann gesundheitsgefährdend sein – bauen Sie sie nicht selbst aus, sondern beauftragen Sie einen Fachbetrieb.",
      },
      { type: "subheading", text: "Garage und Abstellraum" },
      {
        type: "paragraph",
        text: "Altöl, Autobatterien und Reifen gehören zu Händlern oder Werkstätten, die zur Rücknahme verpflichtet sind oder sie gegen eine Gebühr annehmen. Werkzeug in gutem Zustand lässt sich meist gut verkaufen.",
      },
      { type: "heading", text: "Was gehört wohin? Entsorgungsregeln im Überblick" },
      {
        type: "table",
        caption: "Richtig entsorgen – die wichtigsten Abfallarten",
        head: ["Abfallart", "Beispiele", "Richtige Entsorgung"],
        rows: [
          ["Sperrmüll", "Möbel, Matratzen, Teppiche", "Sperrmüllabfuhr (in Düsseldorf: AWISTA) oder Recyclinghof"],
          ["Elektroaltgeräte", "Kühlschrank, Fernseher, Kabel", "Recyclinghof oder Rücknahme im Handel – nie in Sperr- oder Restmüll"],
          ["Batterien & Akkus", "Gerätebatterien, Powerbanks", "Sammelboxen im Handel, Recyclinghof"],
          ["Schadstoffe", "Farben, Lacke, Lösungsmittel, Pflanzenschutz", "Schadstoffsammlung"],
          ["Bauschutt", "Fliesen, Steine, Mörtel", "Container oder Recyclinghof (gebührenpflichtig)"],
          ["Textilien", "Kleidung, Schuhe, Bettwäsche", "Altkleidercontainer oder Spende"],
          ["Akten & Datenträger", "Kontoauszüge, Festplatten", "Datenschutzkonform vernichten (DIN 66399)"],
          ["Gefährliche Baustoffe", "Asbest, alte Mineralwolle", "Nur durch einen Fachbetrieb"],
        ],
        note: "Details wie Mengen, Termine und Gebühren regelt jede Kommune selbst – für Düsseldorf informiert der städtische Entsorger AWISTA.",
      },
      {
        type: "tip",
        title: "Datenschutz nicht vergessen",
        text: "Alte Handys, Laptops und Festplatten enthalten oft persönliche Daten. Setzen Sie Geräte vor der Abgabe zurück oder lassen Sie Datenträger zertifiziert vernichten. Dasselbe gilt für Ordner mit Kontoauszügen, Verträgen und Steuerunterlagen.",
      },
      { type: "heading", text: "Wann lohnt sich ein Entrümpelungsdienst?" },
      {
        type: "list",
        items: [
          "Die ganze Wohnung oder ein Haus muss geräumt werden.",
          "Es gibt einen festen Termin, etwa die Übergabe an den Vermieter.",
          "Schwere Möbel, Einbauküchen oder enge Treppenhäuser erschweren die Arbeit.",
          "Es fallen gemischte Abfälle oder Schadstoffe an.",
          "Die Situation ist emotional belastend, zum Beispiel nach einem Todesfall.",
        ],
      },
      {
        type: "link",
        label: "Entrümpelung Düsseldorf: Kosten, Ablauf & Spartipps",
        href: "/blog/entruempelung-kosten-duesseldorf",
        text: "Was ein Entrümpelungsdienst kostet und woran Sie seriöse Anbieter erkennen.",
      },
      {
        type: "link",
        label: "Haushaltsauflösung im Todesfall: Leitfaden für Erben",
        href: "/blog/haushaltsaufloesung-todesfall",
        text: "Fristen, Mietvertrag und was Sie vor der Räumung sichern sollten.",
      },
    ],
    faqs: [
      {
        question: "Was darf in den Sperrmüll?",
        answer:
          "Sperrige Gegenstände aus dem Haushalt, die nicht in die Mülltonne passen: Möbel, Matratzen, Teppiche und große Haushaltsgegenstände. Elektrogeräte, Batterien, Bauschutt und Schadstoffe gehören nicht dazu.",
      },
      {
        question: "Wo fange ich beim Entrümpeln an?",
        answer:
          "Mit dem Raum, an dem Sie emotional am wenigsten hängen – meist Keller, Abstellraum oder Garage. Dort gewinnen Sie schnell Platz und Routine für die schwierigeren Räume.",
      },
      {
        question: "Wie lange dauert es, eine Wohnung zu entrümpeln?",
        answer:
          "In Eigenregie brauchen Sie für eine volle Wohnung oft mehrere Wochenenden. Ein professionelles Team räumt eine durchschnittliche Wohnung meist an einem Arbeitstag.",
      },
      {
        question: "Wohin mit alten Elektrogeräten?",
        answer:
          "Zum Recyclinghof oder zurück in den Handel: Größere Händler sind nach dem Elektro- und Elektronikgerätegesetz zur Rücknahme verpflichtet. In den Sperrmüll oder die Restmülltonne dürfen Elektrogeräte nicht.",
      },
    ],
  },
];

import type { BlogPost } from "../blog";
import { editorialTeam } from "./shared";

/** Kategorie „Haushaltsauflösung“ – Suchintention: Kosten (kommerziell) und Erbfall (informativ, sensibel). */
export const haushaltsaufloesungPosts: BlogPost[] = [
  {
    slug: "haushaltsaufloesung-kosten-duesseldorf",
    title: "Haushaltsauflösung Düsseldorf: Kosten & Ablauf",
    excerpt:
      "Was kostet eine Haushaltsauflösung in Düsseldorf? Richtwerte nach Wohnungsgröße, wie die Wertanrechnung den Preis senkt und wer die Kosten trägt.",
    category: "haushaltsaufloesung",
    publishedAt: "2026-09-26",
    author: editorialTeam,
    cover: { src: "/media/stock/haushaltsaufloesung-wohnzimmer.jpg", alt: "Wohnzimmer mit Ledersessel und gerahmten Familienfotos an der Holzwand" },
    keywords: [
      "Haushaltsauflösung Düsseldorf",
      "Haushaltsauflösung Kosten",
      "Wohnungsauflösung Kosten",
      "Wertanrechnung Haushaltsauflösung",
      "Wohnungsauflösung Düsseldorf",
      "Haushaltsauflösung Pflegeheim",
    ],
    body: [
      {
        type: "paragraph",
        text: "Eine Haushaltsauflösung kostet in Düsseldorf für eine 2- bis 3-Zimmer-Wohnung meist zwischen etwa 1.500 und 3.500 € – vor Abzug der Wertanrechnung. Der Preis hängt von Wohnfläche, Menge des Hausrats, Etage und Entsorgungsaufwand ab. Anders als bei einer reinen Entrümpelung gehören das Sichten von Dokumenten, die Wertanrechnung und die Übergabe an den Vermieter meist mit dazu.",
      },
      {
        type: "checklist",
        title: "Das Wichtigste in Kürze",
        items: [
          "Richtwert 2–3 Zimmer: ca. 1.500–3.500 € vor Wertanrechnung",
          "Wertanrechnung senkt den Preis – deckt ihn aber selten vollständig",
          "Dokumente, Fotos und Wertsachen vorher sichern oder sichern lassen",
          "Im Erbfall tragen die Erben die Kosten aus dem Nachlass",
          "Ein Festpreis nach Besichtigung schützt vor Nachforderungen",
        ],
      },
      { type: "heading", text: "Was kostet eine Haushaltsauflösung? Richtwerte 2026" },
      {
        type: "table",
        caption: "Haushaltsauflösung in Düsseldorf – Richtwerte vor Wertanrechnung",
        head: ["Objekt", "Dauer (ca.)", "Richtwert"],
        rows: [
          ["1–2 Zimmer (bis 50 m²)", "1 Tag", "900–2.000 €"],
          ["2–3 Zimmer (50–80 m²)", "1–2 Tage", "1.500–3.500 €"],
          ["4 Zimmer (80–110 m²)", "2 Tage", "2.500–5.000 €"],
          ["Einfamilienhaus mit Keller & Dachboden", "2–4 Tage", "4.000–9.000 €"],
        ],
        note: "Marktübliche Richtwerte inklusive Räumung, Transport und Entsorgung. Renovierung, Endreinigung, Sondermüll und Demontage von Einbauten werden zusätzlich berechnet.",
      },
      { type: "heading", text: "Welche Faktoren beeinflussen die Kosten?" },
      {
        type: "list",
        items: [
          "Wohnfläche und Füllgrad: Eine vollständig möblierte Wohnung mit Keller und Dachboden verursacht deutlich mehr Aufwand.",
          "Etage und Zugang: Ohne Aufzug steigt die Tragezeit, lange Wege zum Fahrzeug kosten zusätzlich.",
          "Art des Hausrats: Elektrogeräte, Schadstoffe und Bauschutt sind teurer zu entsorgen als Möbel.",
          "Einbauten: Einbauküchen, Wandschränke, Teppichböden und Lampen müssen demontiert werden.",
          "Zusatzleistungen: Renovierung, Endreinigung, Übergabe an den Vermieter, Aktenvernichtung.",
          "Wertanrechnung: Verkäufliche Gegenstände reduzieren den Endpreis.",
        ],
      },
      { type: "heading", text: "Wertanrechnung: Was ist der Hausrat noch wert?" },
      {
        type: "paragraph",
        text: "Bei der Wertanrechnung bewertet der Dienstleister verkäufliche Gegenstände und zieht ihren Wert vom Festpreis ab. Gute Chancen haben Antiquitäten, Designer- und Markenmöbel, hochwertiges Porzellan, Werkzeug, Fahrräder sowie neuwertige Elektrogeräte. Massenware wie Schrankwände, ältere Polstermöbel oder Einbauküchen ohne Markennamen erzielt heute kaum noch einen Preis. Für besonders wertvolle Einzelstücke wie Gemälde oder Schmuck lohnt sich vorab ein unabhängiges Gutachten.",
      },
      {
        type: "tip",
        title: "Vorsicht bei „kostenloser Haushaltsauflösung“",
        text: "Eine kostenlose Auflösung ist nur möglich, wenn der verwertbare Bestand die Kosten vollständig deckt – das ist selten. Lassen Sie sich immer einen schriftlichen Festpreis mit ausgewiesener Wertanrechnung geben.",
      },
      { type: "heading", text: "Ablauf einer Haushaltsauflösung Schritt für Schritt" },
      {
        type: "list",
        ordered: true,
        items: [
          "Persönliches Erstgespräch: Anlass, Zeitrahmen und Wünsche klären – etwa, was Angehörige behalten möchten.",
          "Kostenlose Besichtigung und Festpreisangebot mit Wertanrechnung.",
          "Sichten und Sichern: Dokumente, Fotos, Wertsachen und Erinnerungsstücke werden zusammengestellt.",
          "Räumung und Demontage, sortenreine Trennung, fachgerechte Entsorgung und Spende brauchbarer Dinge.",
          "Renovierung und Endreinigung auf Wunsch.",
          "Besenreine Übergabe an Vermieter oder Hausverwaltung mit Übergabeprotokoll.",
        ],
      },
      { type: "heading", text: "Haushaltsauflösung beim Umzug ins Pflegeheim" },
      {
        type: "paragraph",
        text: "Zieht ein Angehöriger in eine Pflegeeinrichtung oder in betreutes Wohnen, lassen sich Seniorenumzug und Haushaltsauflösung verbinden: Ausgewählte Möbel und Erinnerungsstücke kommen ins neue Zimmer und werden dort aufgebaut, der restliche Haushalt wird aufgelöst. Planen Sie dafür ausreichend Zeit ein und beziehen Sie die betroffene Person so weit wie möglich in die Entscheidungen ein.",
      },
      { type: "heading", text: "Wer trägt die Kosten einer Haushaltsauflösung?" },
      {
        type: "paragraph",
        text: "Grundsätzlich zahlt, wer den Auftrag erteilt. Im Erbfall sind das in der Regel die Erben, die die Kosten aus dem Nachlass begleichen können. Bei einer Erbengemeinschaft sollten alle Miterben dem Auftrag zustimmen. Ob sich die Kosten steuerlich berücksichtigen lassen, etwa bei der Erbschaftsteuer, klärt Ihre Steuerberatung.",
      },
      {
        type: "link",
        label: "Haushaltsauflösung im Todesfall: Leitfaden für Erben",
        href: "/blog/haushaltsaufloesung-todesfall",
        text: "Fristen, Mietvertrag, Erbschein – und warum Sie vor der Räumung nichts verkaufen sollten.",
      },
      {
        type: "paragraph",
        text: "FA Transport löst Haushalte in Düsseldorf und Umgebung einfühlsam und vollständig auf – mit persönlichem Ansprechpartner, fairer Wertanrechnung und Übergabe an den Vermieter, auf Wunsch mit neutralen Fahrzeugen.",
      },
    ],
    faqs: [
      {
        question: "Was kostet eine Haushaltsauflösung einer 3-Zimmer-Wohnung?",
        answer:
          "Als Richtwert etwa 1.500 bis 3.500 € vor Wertanrechnung, je nach Füllgrad, Etage und Entsorgungsaufwand. Renovierung und Endreinigung kommen gegebenenfalls hinzu.",
      },
      {
        question: "Was ist der Unterschied zwischen Entrümpelung und Haushaltsauflösung?",
        answer:
          "Bei einer Entrümpelung werden Räume geleert und Gegenstände entsorgt. Eine Haushaltsauflösung umfasst zusätzlich das Sichten und Sichern von Dokumenten und Wertsachen, die Wertanrechnung und oft die Übergabe der Wohnung an den Vermieter.",
      },
      {
        question: "Wie lange dauert eine Haushaltsauflösung?",
        answer:
          "Eine durchschnittliche Wohnung ist meist in ein bis zwei Arbeitstagen aufgelöst. Häuser mit Keller, Dachboden und Garage brauchen zwei bis vier Tage.",
      },
      {
        question: "Was passiert mit Möbeln, die niemand haben möchte?",
        answer:
          "Verkäufliches wird angerechnet, gut Erhaltenes wird nach Möglichkeit an soziale Einrichtungen gespendet. Der Rest wird sortenrein getrennt und fachgerecht entsorgt.",
      },
    ],
  },
  {
    slug: "haushaltsaufloesung-todesfall",
    title: "Haushaltsauflösung im Todesfall: Leitfaden für Erben",
    excerpt:
      "Haushaltsauflösung nach einem Todesfall: wann Sie beginnen dürfen, welche Fristen gelten, was mit dem Mietvertrag passiert und was Sie sichern sollten.",
    category: "haushaltsaufloesung",
    publishedAt: "2026-09-26",
    author: editorialTeam,
    cover: { src: "/media/stock/haushaltsaufloesung-erinnerungen.jpg", alt: "Alte Familienfotos werden bei einer Haushaltsauflösung sorgsam gesichtet" },
    keywords: [
      "Haushaltsauflösung Todesfall",
      "Haushaltsauflösung Erbfall",
      "Wohnung Verstorbener auflösen",
      "Mietvertrag Todesfall kündigen",
      "Erbe ausschlagen Frist",
      "Nachlass Wohnung räumen",
    ],
    body: [
      {
        type: "paragraph",
        text: "Nach einem Todesfall sollten Angehörige mit der Haushaltsauflösung erst beginnen, wenn feststeht, wer erbt und ob das Erbe angenommen wird. Die Frist zur Ausschlagung beträgt in der Regel sechs Wochen. Bis dahin gilt: Wohnung sichern, wichtige Dokumente sammeln – aber nichts verkaufen oder verschenken. Dieser Leitfaden zeigt, welche Schritte in welcher Reihenfolge anstehen.",
      },
      {
        type: "checklist",
        title: "Das Wichtigste in Kürze",
        items: [
          "Ausschlagungsfrist: in der Regel sechs Wochen ab Kenntnis vom Erbfall (§ 1944 BGB)",
          "Vor der Klärung nichts verkaufen oder verschenken – das kann als Annahme des Erbes gelten",
          "Mietvertrag: Erben können mit dreimonatiger Frist kündigen, innerhalb eines Monats nach Kenntnis",
          "Dokumente, Wertsachen und Erinnerungsstücke vor der Räumung sichern",
          "In der Erbengemeinschaft Entscheidungen gemeinsam treffen und dokumentieren",
        ],
      },
      {
        type: "quote",
        text: "Eine Haushaltsauflösung ist nie nur Arbeit. Nehmen Sie sich die Zeit, die Sie brauchen – die Organisation können Sie abgeben.",
        cite: "Team FA Transport",
      },
      { type: "heading", text: "Erste Schritte nach dem Todesfall" },
      {
        type: "checklist",
        items: [
          "Sterbeurkunde beim Standesamt beantragen – mehrere Exemplare anfordern",
          "Ein handschriftliches Testament unverzüglich beim Nachlassgericht abgeben (Pflicht nach § 2259 BGB)",
          "Wohnung sichern: Fenster schließen, Heizung auf Frostschutz, Kühlschrank leeren",
          "Post sichern oder umleiten lassen",
          "Vermieter über den Todesfall informieren",
        ],
      },
      { type: "heading", text: "Erbe annehmen oder ausschlagen?" },
      {
        type: "paragraph",
        text: "Erben können das Erbe innerhalb von sechs Wochen ausschlagen, nachdem sie vom Erbfall und ihrer Berufung als Erbe erfahren haben. Hatte die verstorbene Person ihren letzten Wohnsitz im Ausland, beträgt die Frist sechs Monate. Eine Ausschlagung ist vor allem dann sinnvoll, wenn der Nachlass überschuldet ist. Verschaffen Sie sich deshalb zuerst einen Überblick über Konten, Kredite und offene Rechnungen.",
      },
      {
        type: "tip",
        title: "Sichern ja – verwerten erst später",
        text: "Wer Gegenstände aus dem Nachlass verkauft, verschenkt oder entsorgen lässt, kann damit das Erbe schlüssig annehmen – und verliert so unter Umständen die Möglichkeit zur Ausschlagung. Sichern Sie bis zur Klärung nur Dokumente und Wertsachen und lassen Sie sich im Zweifel rechtlich beraten.",
      },
      { type: "heading", text: "Was passiert mit dem Mietvertrag?" },
      {
        type: "paragraph",
        text: "Lebten Ehe- oder Lebenspartner, Kinder oder andere Haushaltsangehörige mit in der Wohnung, treten sie nach § 563 BGB in den Mietvertrag ein. Andernfalls wird das Mietverhältnis mit den Erben fortgesetzt (§ 564 BGB). Erben und Vermieter können es dann außerordentlich mit der gesetzlichen Frist von drei Monaten kündigen – allerdings nur innerhalb eines Monats, nachdem sie vom Tod und davon erfahren haben, dass niemand in den Mietvertrag eintritt. Bis zum Ende der Kündigungsfrist ist die Miete aus dem Nachlass weiterzuzahlen. Diese drei Monate sind in der Regel auch der Zeitrahmen für die Haushaltsauflösung.",
      },
      { type: "heading", text: "Welche Nachweise brauchen Erben?" },
      {
        type: "paragraph",
        text: "Vermieter, Banken und Versicherungen verlangen häufig einen Nachweis, dass Sie Erbe sind. Das ist in der Regel der Erbschein vom Nachlassgericht oder ein notarielles Testament zusammen mit dem Eröffnungsprotokoll. Beantragen Sie den Erbschein frühzeitig, denn die Bearbeitung kann einige Wochen dauern.",
      },
      { type: "heading", text: "Diese Dokumente vor der Räumung sichern" },
      {
        type: "checklist",
        items: [
          "Testament, Erbvertrag und Vollmachten",
          "Personalausweis, Geburts- und Heiratsurkunde, Familienstammbuch",
          "Kontoauszüge, Sparbücher, Depotunterlagen und Kreditverträge",
          "Versicherungspolicen, insbesondere Lebens- und Sterbegeldversicherungen",
          "Renten- und Steuerbescheide – Erben müssen ggf. noch eine Steuererklärung abgeben",
          "Grundbuchauszüge, Miet- und Kaufverträge",
          "Schlüssel, Bargeld, Schmuck und Wertgegenstände",
          "Fotos, Briefe und persönliche Erinnerungsstücke",
        ],
      },
      { type: "heading", text: "Verträge kündigen und Stellen informieren" },
      {
        type: "list",
        items: [
          "Strom, Gas, Telefon, Internet und Rundfunkbeitrag kündigen oder abmelden.",
          "Renten- und Krankenversicherung sowie private Versicherungen informieren.",
          "Abonnements, Mitgliedschaften und Vereine kündigen.",
          "E-Mail- und Social-Media-Konten schließen oder in einen Gedenkzustand versetzen.",
          "Banken informieren – Daueraufträge prüfen, Konten nicht voreilig auflösen.",
        ],
      },
      { type: "heading", text: "Haushaltsauflösung in der Erbengemeinschaft" },
      {
        type: "paragraph",
        text: "Gibt es mehrere Erben, verwalten sie den Nachlass gemeinsam. Stimmen Sie deshalb vorab ab, wer welche Erinnerungsstücke erhält, wer Ansprechpartner für den Dienstleister ist und wie Kosten und Erlöse verteilt werden. Eine Fotodokumentation und eine einfache Inventarliste beugen späteren Missverständnissen vor – gerade wenn nicht alle Erben in Düsseldorf wohnen.",
      },
      { type: "heading", text: "Die Haushaltsauflösung beauftragen" },
      {
        type: "paragraph",
        text: "Sind Erbe und Mietvertrag geklärt, kann die eigentliche Auflösung beginnen. Ein erfahrenes Team sichtet sorgfältig, legt Dokumente und Erinnerungsstücke für Sie beiseite, rechnet verwertbare Gegenstände an und übergibt die Wohnung besenrein an den Vermieter – auf Wunsch, ohne dass Sie vor Ort sein müssen. FA Transport arbeitet dabei diskret, auf Wunsch mit neutralen Fahrzeugen, und dokumentiert jeden Schritt mit Fotos.",
      },
      {
        type: "link",
        label: "Haushaltsauflösung Düsseldorf: Kosten & Ablauf",
        href: "/blog/haushaltsaufloesung-kosten-duesseldorf",
        text: "Richtwerte nach Wohnungsgröße und wie die Wertanrechnung den Preis senkt.",
      },
      {
        type: "paragraph",
        text: "Hinweis: Dieser Beitrag gibt einen allgemeinen Überblick und ersetzt keine Rechtsberatung. Bei Fragen zu Erbe, Ausschlagung oder Steuern wenden Sie sich an das Nachlassgericht, eine Notarin oder einen Anwalt für Erbrecht.",
      },
    ],
    faqs: [
      {
        question: "Wann darf man mit der Haushaltsauflösung nach einem Todesfall beginnen?",
        answer:
          "Sobald feststeht, wer erbt und dass das Erbe angenommen wird – spätestens nach Ablauf der sechswöchigen Ausschlagungsfrist. Dokumente und Wertsachen dürfen und sollten Sie vorher sichern, verkaufen oder entsorgen sollten Sie aber noch nichts.",
      },
      {
        question: "Wer muss die Wohnung eines Verstorbenen räumen?",
        answer:
          "Die Erben. Sie treten in den Mietvertrag ein und müssen die Wohnung bei Mietende geräumt übergeben. Schlagen alle Erben aus, kann das Nachlassgericht einen Nachlasspfleger bestellen, der sich um die Wohnung kümmert.",
      },
      {
        question: "Wie kündigt man den Mietvertrag eines Verstorbenen?",
        answer:
          "Erben können das Mietverhältnis außerordentlich mit einer Frist von drei Monaten kündigen. Die Kündigung muss innerhalb eines Monats erfolgen, nachdem sie vom Tod und davon erfahren haben, dass niemand in den Mietvertrag eintritt.",
      },
      {
        question: "Wer bezahlt die Haushaltsauflösung im Erbfall?",
        answer:
          "Die Erben – in der Regel aus dem Nachlass. In einer Erbengemeinschaft sollten alle Miterben dem Auftrag zustimmen. Verwertbare Gegenstände können die Kosten durch Wertanrechnung senken.",
      },
      {
        question: "Muss ich bei der Haushaltsauflösung dabei sein?",
        answer:
          "Nein. Nach Schlüsselübergabe und Absprache, was gesichert werden soll, kann das Team selbstständig arbeiten und die Wohnung direkt an den Vermieter übergeben. Sie erhalten eine Fotodokumentation.",
      },
    ],
  },
];

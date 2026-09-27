import type { BlogPost } from "../../blog";
import { editorialTeamEn } from "./shared";

/** English version of the "Transport" posts – same slugs as the German originals. */
export const transportPostsEn: BlogPost[] = [
  {
    slug: "komplettladung-teilladung-stueckgut",
    title: "Full load or part load? FTL & LTL explained",
    excerpt:
      "Groupage, part load (LTL) or full load (FTL)? The differences, how to calculate loading metres, pallets per truck – and when each shipping method pays off.",
    category: "transport",
    publishedAt: "2026-09-26",
    author: editorialTeamEn,
    cover: { src: "/media/stock/transport-sattelzug.jpg", alt: "Tarpaulin articulated truck on a country road at dusk" },
    keywords: ["full truckload", "part load", "groupage", "FTL LTL difference", "calculate loading metres", "euro pallets per truck", "haulier Düsseldorf"],
    body: [
      {
        type: "paragraph",
        text: "Groupage, part loads and full loads differ mainly in shipment size and transport route: groupage consists of individual pallets that are bundled with other shipments via transhipment depots. A part load (LTL, less than truckload) occupies part of the truck and usually travels direct. A full load (FTL, full truckload) uses the whole truck exclusively – up to 13.6 loading metres, 33 euro pallets and around 24 tonnes.",
      },
      {
        type: "checklist",
        title: "Key facts at a glance",
        items: [
          "Groupage: small shipments, cheap, but with transhipment and longer transit times",
          "Part load (LTL): medium quantities, usually without transhipment, faster than groupage",
          "Full load (FTL): exclusive truck, direct trip, the most predictable transit time",
          "Loading metres = length × width of the load ÷ 2.4 m – one euro pallet equals 0.4 loading metres",
          "From about 6 to 8 loading metres it often pays to compare prices with a full load",
        ],
      },
      { type: "heading", text: "Groupage, part load and full load compared" },
      {
        type: "table",
        caption: "Shipping methods in road freight",
        head: ["Method", "Typical quantity", "Route", "Suitable for"],
        rows: [
          ["Groupage", "1 to a few pallets, up to approx. 2.5 t", "Via transhipment hub, bundled", "Small, non-time-critical shipments"],
          ["Part load (LTL)", "approx. 2.5 to 15 t or a few loading metres", "Mostly direct, shared cargo space", "Medium quantities with a fixed time window"],
          ["Full load (FTL)", "Whole truck: 13.6 ldm, 33 euro pallets, approx. 24 t", "Direct trip, exclusive", "Large, time-critical or sensitive loads"],
        ],
        note: "The boundaries are fluid and differ between carriers. Often it's not the weight that matters but the space required.",
      },
      { type: "heading", text: "What is a loading metre and how do you calculate it?" },
      {
        type: "paragraph",
        text: "The loading metre (ldm) is the most important unit for calculating freight. It describes one metre of loading area across the full width of a semi-trailer of around 2.4 metres. The formula is: loading metres = length of the load (m) × width of the load (m) ÷ 2.4. Stackable goods need correspondingly fewer loading metres.",
      },
      {
        type: "table",
        caption: "Loading metres of common load carriers",
        head: ["Load carrier", "Dimensions", "Loading metres", "Per articulated truck (13.6 m)"],
        rows: [
          ["Euro pallet (EPAL)", "1.20 × 0.80 m", "0.4 ldm", "33"],
          ["Industrial pallet", "1.20 × 1.00 m", "0.5 ldm", "26"],
          ["Half pallet", "0.80 × 0.60 m", "0.2 ldm", "depending on loading"],
        ],
        note: "Values for non-stacked pallets. Example: 12 euro pallets result in 12 × 0.4 = 4.8 loading metres.",
      },
      {
        type: "paragraph",
        text: "Many carriers charge a minimum weight per loading metre, often in the range of 1,500 to 2,000 kg. They then invoice the higher of the actual weight and the loading-metre weight. This way, light but bulky goods are charged fairly according to the space they need.",
      },
      { type: "heading", text: "When does a full load pay off?" },
      {
        type: "list",
        items: [
          "Your shipment takes up more than about 6 to 8 loading metres or 15 euro pallets.",
          "The goods are time-critical and must arrive within a fixed time window.",
          "The goods are sensitive or valuable – without transhipment the risk of damage falls.",
          "You need special conditions, such as temperature control or side loading.",
          "The route is long and you want to plan transit times reliably.",
        ],
      },
      {
        type: "tip",
        title: "Our tip: direct trip instead of transhipment",
        text: "Even with a part load it's worth asking for a direct trip without reloading. Every transhipment costs time and increases the risk of damage – especially for sensitive goods.",
      },
      { type: "heading", text: "How much does truck transport cost?" },
      {
        type: "paragraph",
        text: "Freight costs depend on distance, loading metres or weight, tolls, vehicle type and extra services. Since December 2023 the German truck toll has included a CO₂ surcharge, and since July 2024 it has also applied to vehicles from 3.5 tonnes. Depending on the job, there are surcharges for tail lifts, delivery notification, express or weekend delivery. You will therefore only get a reliable quote with complete shipment data.",
      },
      {
        type: "link",
        label: "Hiring a haulier: checklist for shippers",
        href: "/blog/spedition-beauftragen-checkliste",
        text: "Which details the haulier needs, who is liable and which documents you need.",
      },
      { type: "heading", text: "Transport from Düsseldorf: short routes to all of Europe" },
      {
        type: "paragraph",
        text: "Düsseldorf lies in the heart of the Rhine-Ruhr region and on major motorways such as the A3, A44, A46, A52 and A57. The seaports of Rotterdam and Antwerp are only around 200 to 230 kilometres away, and the ports of Düsseldorf and Neuss are right on the doorstep. FA Transport handles part and full loads as well as direct trips from Düsseldorf – across Germany and Europe, with one contact person and dispatch around the clock.",
      },
    ],
    faqs: [
      {
        question: "What is the difference between FTL and LTL?",
        answer:
          "FTL (full truckload) is a full load: the whole truck travels exclusively for one customer. LTL (less than truckload) is a part load: the shipment only takes up part of the cargo space, the rest is used by other shipments.",
      },
      {
        question: "How many euro pallets fit on a truck?",
        answer: "A standard semi-trailer with a loading length of 13.6 metres takes 33 euro pallets (1.20 × 0.80 m) or 26 industrial pallets (1.20 × 1.00 m), unstacked.",
      },
      {
        question: "How do you calculate loading metres?",
        answer: "Loading metres = length of the load in metres × width in metres ÷ 2.4. One euro pallet therefore equals 0.4 loading metres, an industrial pallet 0.5 loading metres.",
      },
      {
        question: "What is groupage?",
        answer:
          "Groupage consists of individual, packaged shipments such as pallets or crates that are transported together with other shipments via transhipment depots. It's cheap for small quantities but takes longer than a direct trip.",
      },
      {
        question: "When does a full load pay off?",
        answer: "As a rule of thumb from about 6 to 8 loading metres or 15 euro pallets – or whenever the goods are time-critical, sensitive or particularly valuable.",
      },
    ],
  },
  {
    slug: "spedition-beauftragen-checkliste",
    title: "Hiring a haulier: checklist for shippers",
    excerpt:
      "Hiring a haulier: which shipment data is needed, who secures the load, how carriers are liable under HGB and CMR and which documents you need.",
    category: "transport",
    publishedAt: "2026-09-26",
    author: editorialTeamEn,
    cover: { src: "/media/stock/transport-verladung.jpg", alt: "Forklift loading a pallet onto a truck trailer" },
    keywords: ["hire a haulier", "haulier Düsseldorf", "CMR consignment note", "carrier liability HGB", "load securing responsibility", "truck transport cost", "cargo insurance"],
    body: [
      {
        type: "paragraph",
        text: "Anyone hiring a haulier should clarify five things in advance: complete shipment data, loading and unloading conditions, dates, documents and insurance of the goods. Because the statutory liability of carriers is limited – under the German Commercial Code (HGB) and the CMR convention to 8.33 special drawing rights, roughly €10 per kilogram. This checklist helps you plan transport safely and without extra charges.",
      },
      {
        type: "checklist",
        title: "Key facts at a glance",
        items: [
          "Give complete dimensions, weight, stackability and type of goods",
          "Clarify time windows, ramp or tail lift and opening hours in advance",
          "The shipper is responsible for loading the goods safely for transport (§ 412 HGB)",
          "Statutory liability is limited – take out cargo insurance for valuable goods",
          "A CMR consignment note is standard internationally; outside the EU customs documents are added",
        ],
      },
      { type: "heading", text: "What details does the haulier need?" },
      {
        type: "checklist",
        title: "Shipment data",
        items: [
          "Number and type of packages (e.g. euro pallets, mesh boxes, crates)",
          "Dimensions and weight per package and total weight",
          "Stackable yes or no",
          "Type and value of goods",
          "Dangerous goods under ADR with UN number, if applicable",
          "Special requirements: temperature, humidity, shock sensitivity",
        ],
      },
      {
        type: "checklist",
        title: "Loading and unloading point",
        items: [
          "Complete addresses and contact persons on site",
          "Ramp available or tail lift needed?",
          "Time windows, opening hours, slot booking or delivery notification",
          "Access restrictions, for example for articulated trucks in city centres",
          "Pallet exchange agreed or not",
        ],
      },
      { type: "heading", text: "Who is responsible for securing the load?" },
      {
        type: "paragraph",
        text: "Responsibility is shared. Under § 412 HGB the shipper must load, stow and secure the goods safely for transport – unless otherwise agreed. The carrier is responsible for loading that keeps the vehicle roadworthy, i.e. that the load doesn't make the vehicle unsafe. In addition, German road traffic regulations oblige drivers and vehicle owners to secure loads. In practice: agree in writing in advance who loads and secures, and provide suitable load carriers.",
      },
      {
        type: "table",
        caption: "Obligations at a glance",
        head: ["Task", "Shipper / loader", "Carrier / driver"],
        rows: [
          ["Packaging the goods", "Yes", "–"],
          ["Loading and securing safely for transport", "Yes (§ 412 HGB)", "Checks roadworthiness"],
          ["Loading that keeps the vehicle roadworthy", "–", "Yes"],
          ["Consignment note and accompanying documents", "Provides the details", "Carries them, confirms handover"],
          ["Visible damage on delivery", "Recipient notes it on the consignment note", "Driver confirms the note"],
        ],
      },
      { type: "heading", text: "How is a haulier liable for damage?" },
      {
        type: "paragraph",
        text: "For national transport the carrier is liable under § 431 HGB, for cross-border road transport under Article 23 of the CMR – in both cases generally up to 8.33 special drawing rights (SDR) per kilogram of gross weight. That's roughly €10 per kilogram. An example: for a 500 kg pallet of electronics worth €50,000, the carrier is only liable for around €5,000 in the event of damage. For valuable goods, separate cargo insurance is therefore worthwhile.",
      },
      {
        type: "tip",
        title: "Document damage immediately",
        text: "Externally visible damage must be noted on the consignment note or delivery note on delivery. Report hidden damage in writing as soon as possible – under HGB within seven days. Photos of the goods and packaging make settlement much easier.",
      },
      { type: "heading", text: "Which documents do I need for transport?" },
      {
        type: "list",
        items: [
          "Delivery note: the basis for handing over the goods to the recipient.",
          "Consignment note: common nationally; for cross-border road transport the CMR consignment note is standard.",
          "Customs documents: for non-EU countries such as Switzerland or the UK, for example the export declaration.",
          "Dangerous goods documents: transport document under ADR for dangerous goods.",
          "Incoterms: define who bears costs and risk – for example DAP or FCA.",
        ],
      },
      { type: "heading", text: "How are transport costs made up?" },
      {
        type: "list",
        items: [
          "Distance and route, including tolls – with a CO₂ surcharge since December 2023, from 3.5 tonnes since July 2024.",
          "Loading metres or weight, whichever is higher.",
          "Vehicle type: tarpaulin, box body, refrigerated vehicle or tail lift.",
          "Waiting times: waiting beyond the agreed period is charged as demurrage.",
          "Surcharges for express, delivery notification, weekends or dangerous goods.",
        ],
      },
      {
        type: "link",
        label: "Full load or part load? FTL & LTL explained",
        href: "/blog/komplettladung-teilladung-stueckgut",
        text: "How to calculate loading metres and find the cheapest shipping method.",
      },
      { type: "heading", text: "How do you recognise a reliable haulier?" },
      {
        type: "checklist",
        items: [
          "Licence under the German Road Haulage Act or an EU licence for commercial road haulage",
          "Proof of carrier's liability insurance",
          "A transparent quote with all surcharges",
          "One contact person and reachable dispatch",
          "Proactive information in case of delays",
        ],
      },
      {
        type: "paragraph",
        text: "FA Transport handles part and full loads as well as express direct trips from Düsseldorf – with a quote within 24 hours, one contact person and dispatch around the clock.",
      },
    ],
    faqs: [
      {
        question: "What do I need to tell a haulier for a quote?",
        answer:
          "Number, type, dimensions and weight of the packages, stackability, type and value of goods, loading and unloading address, time windows and special features such as tail lift, temperature control or dangerous goods.",
      },
      {
        question: "Who is liable for transport damage?",
        answer:
          "The carrier – but limited to 8.33 special drawing rights per kilogram, under § 431 HGB for national transport and under Article 23 CMR internationally. That's roughly €10 per kilogram. You cover higher values with cargo insurance.",
      },
      {
        question: "What is a CMR consignment note?",
        answer:
          "The CMR consignment note is the standard document for cross-border road transport. It documents shipper, recipient, goods and takeover and is the basis for liability under the CMR convention.",
      },
      {
        question: "Who is responsible for securing the load?",
        answer:
          "Under § 412 HGB the shipper is responsible for loading safely for transport, the carrier for keeping the vehicle roadworthy. Drivers and vehicle owners are also liable under road traffic law. Who loads and secures should be agreed in writing in advance.",
      },
      {
        question: "How much does truck transport cost?",
        answer:
          "It depends on distance, loading metres or weight, tolls, vehicle type and surcharges. You get a binding quote with complete shipment data – at FA Transport usually within 24 hours.",
      },
    ],
  },
];

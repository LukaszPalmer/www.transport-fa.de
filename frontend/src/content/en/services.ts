import type { ServiceArea } from "@/types/content";
import { heroMedia } from "../media";

/**
 * English version of the service areas – same structure and order as ../services.ts.
 * Slugs stay German; the English pages live under /en/… (e.g. /en/leistungen/umzuege).
 */
export const servicesEn: ServiceArea[] = [
  /* ------------------------------------------------------------------------
     Removals
     ------------------------------------------------------------------------ */
  {
    slug: "umzuege",
    name: "Removals",
    icon: "sofa",
    showTrackingApp: true,
    teaser: "Private and office removals at a fixed price – including packing, furniture assembly and parking permits.",
    highlights: ["Free survey", "Binding fixed price", "Assembly & packing service"],
    seo: {
      title: "Removal Company Düsseldorf – Fixed Prices",
      description:
        "Your removal company in Düsseldorf: private, office and long-distance moves with a permanent crew – free survey, fixed price, furniture assembly and parking zone.",
    },
    updatedAt: "2026-10-23",
    hero: {
      eyebrow: "Removal company in Düsseldorf · private & business",
      headline: ["Your move in Düsseldorf.", "Carefully planned."],
      headlineAccent: "Stress-free.",
      subheadline:
        "From packing to kitchen assembly: our permanent moving crew takes your home or office safely to its new location – at a binding fixed price after a free survey.",
      media: heroMedia("umzuege"),
      mediaAlt: "Two movers carrying an upholstered chair down a stairwell and outside",
      factsTitle: "Your move includes",
      facts: [
        "Free survey – on site or by video",
        "Binding fixed-price quote",
        "No-parking zone & permits",
        "Furniture dismantling and reassembly",
        "Transit insurance included",
      ],
    },
    stats: [
      { value: "Fixed price", label: "Binding quote", detail: "No hidden costs" },
      { value: "24 h", label: "Quote after survey", detail: "In writing & transparent" },
      { value: "100 %", label: "Own moving crews", detail: "Trained & permanently employed" },
      { value: "Insured", label: "Fully protected", detail: "Liability under German law (HGB)" },
    ],
    scope: {
      eyebrow: "What we do",
      title: "Everything for your move – from one source",
      description: "You decide how much we take on: from transport only to a full-service move with packing and unpacking.",
      items: [
        {
          icon: "house",
          title: "Private removals",
          description: "Flat or house – we plan every detail and treat your home with the greatest care.",
          highlights: ["Protective blankets & edge guards", "Moving boxes provided", "On schedule"],
        },
        {
          icon: "building",
          title: "Office & business removals",
          description: "Minimal downtime thanks to planning outside your business hours – weekends included.",
          highlights: ["IT & file relocation", "Floor & site changes", "Dedicated project lead"],
        },
        {
          icon: "globe",
          title: "Long-distance & international",
          description: "Across Germany and throughout Europe – with our own fleet and clear time windows.",
          highlights: ["Direct trip, no reloading", "Customs & documents (non-EU)", "One contact person"],
        },
        {
          icon: "wrench",
          title: "Furniture & kitchen assembly",
          description: "Professional dismantling and assembly of furniture, fitted kitchens and lamps by trained fitters.",
          highlights: ["Kitchen adjustments", "Lamps & appliances", "Wall mounting"],
        },
        {
          icon: "package",
          title: "Packing & unpacking",
          description: "We pack your belongings securely – and unpack them at the new place if you wish.",
          highlights: ["Special packaging for glass", "Wardrobe boxes", "Packaging disposal"],
        },
        {
          icon: "warehouse",
          title: "Storage",
          description: "Safe, dry storage space for the time in between – short or long term.",
          highlights: ["Video surveillance", "Flexible terms", "Delivery on request"],
        },
      ],
    },
    processTitle: "How your move works",
    process: [
      { title: "Enquiry & survey", description: "Tell us about your plans – we survey free of charge on site or by video call." },
      { title: "Fixed-price quote", description: "Within 24 hours you receive a binding, transparent quote." },
      { title: "Planning & preparation", description: "We take care of the no-parking zone, boxes and a detailed schedule." },
      { title: "Moving day & handover", description: "Our team transports, assembles and hands over – and we check everything together." },
    ],
    faqs: [
      {
        question: "How much does a move cost?",
        answer:
          "The price depends on the volume, the distance, the floors and the additional services you need. After the free survey you receive a binding fixed price – no extra charges.",
      },
      {
        question: "How early should I book my move?",
        answer:
          "Ideally four to six weeks in advance, earlier for the end of the month and the summer months. Short-notice moves are possible when we have capacity.",
      },
      {
        question: "Do you provide moving boxes and packing material?",
        answer: "Yes. We deliver boxes, wardrobe boxes and special packaging in good time before the move and collect the material afterwards.",
      },
      {
        question: "Is my furniture insured during the move?",
        answer:
          "Yes, we are liable for your belongings within the statutory provisions (German Commercial Code, HGB). For particularly valuable items we offer extended transit insurance.",
      },
      {
        question: "Where do you carry out removals?",
        answer:
          "Our focus is Düsseldorf and all its districts as well as Neuss, Meerbusch, Ratingen, Hilden and Erkrath. We handle long-distance and international moves across Germany and Europe – as direct runs without reloading.",
      },
      {
        question: "Can I deduct moving costs from my taxes?",
        answer:
          "In Germany, private moves can often be claimed as household-related services (§ 35a EStG) and job-related moves as income-related expenses. Our invoice shows the labour cost share separately – please check the details with your tax adviser.",
      },
    ],
  },

  /* ------------------------------------------------------------------------
     Clearances
     ------------------------------------------------------------------------ */
  {
    slug: "entruempelungen",
    name: "Clearances",
    icon: "recycle",
    teaser: "Cellar, attic, flat or business premises – swept clean, disposed of properly, with credit for valuables.",
    highlights: ["Short-notice appointments", "Proper disposal", "Swept-clean handover"],
    seo: {
      title: "Clearances in Düsseldorf – Fast & Swept Clean",
      description:
        "Clearances in Düsseldorf and the surrounding area: flats, cellars, attics and commercial premises – fixed price after survey, proper disposal, swept-clean handover.",
    },
    updatedAt: "2026-10-23",
    hero: {
      eyebrow: "Clearances in Düsseldorf · fast & discreet",
      headline: ["Clearances in Düsseldorf.", "Fast. Discreet."],
      headlineAccent: "Handed over swept clean.",
      subheadline:
        "We completely clear cellars, attics, flats and commercial premises – including proper disposal and recycling. Anything of value is credited transparently against the price.",
      media: heroMedia("entruempelungen"),
      mediaAlt: "A helper carrying a green velvet armchair along a corridor",
      factsTitle: "Your clearance includes",
      facts: [
        "Free survey & fixed price",
        "Proper disposal with certificate",
        "Credit for items of value",
        "Swept-clean handover",
        "Discreet – even without you being there",
      ],
    },
    stats: [
      { value: "48 h", label: "Short-notice appointments", detail: "Subject to availability" },
      { value: "Fixed price", label: "After survey", detail: "Disposal included" },
      { value: "Recycling", label: "Properly separated", detail: "With disposal certificate" },
      { value: "Swept clean", label: "Handover guaranteed", detail: "Ready for the next tenant" },
    ],
    scope: {
      eyebrow: "What we do",
      title: "We clear – you gain space",
      description: "Whether a single cellar room or an entire commercial property: we take care of clearing, removal and disposal.",
      items: [
        {
          icon: "house",
          title: "Flat clearance",
          description: "Complete or partial clearance of flats and houses – on time for the handover.",
          highlights: ["Furniture & household items", "Dismantling included", "Swept-clean handover"],
        },
        {
          icon: "boxes",
          title: "Cellar, attic & garage",
          description: "No more cluttered storage rooms – we make space again within a few hours.",
          highlights: ["Tight access no problem", "Bulky waste & scrap metal", "Short notice possible"],
        },
        {
          icon: "building",
          title: "Office & commercial clearance",
          description: "Clearing offices, warehouses, practices and shops – planned and with minimal disruption.",
          highlights: ["File destruction (DIN 66399)", "Furniture & IT equipment", "Weekend jobs"],
        },
        {
          icon: "heart-handshake",
          title: "Special & hoarder clearances",
          description: "Sensitive, discreet clearance even in difficult situations – with unmarked vehicles.",
          highlights: ["Complete discretion", "Protective equipment", "Disinfection on request"],
        },
        {
          icon: "recycle",
          title: "Disposal & recycling",
          description: "Sorted separation and disposal through certified specialist companies – fully documented.",
          highlights: ["E-waste & hazardous waste", "Disposal certificate", "High recycling rate"],
        },
        {
          icon: "coins",
          title: "Credit for valuables",
          description: "We credit usable furniture, antiques and appliances fairly against your costs.",
          highlights: ["Transparent valuation", "Lowers the fixed price", "Donations to charities"],
        },
      ],
    },
    processTitle: "How your clearance works",
    process: [
      { title: "Enquiry & survey", description: "Free survey on site or based on your photos and videos." },
      { title: "Fixed price with credit", description: "You receive a binding price – items of value are already credited." },
      { title: "Clearing & disposal", description: "Our team clears quickly, separates materials and disposes of them properly." },
      { title: "Swept-clean handover", description: "We hand over the rooms swept clean – directly to the landlord or property manager if you wish." },
    ],
    faqs: [
      {
        question: "How much does a clearance cost?",
        answer:
          "The decisive factors are the amount and type of items, access (floor, lift, distances) and the disposal effort. After the survey you receive a fixed price including disposal – items of value are credited.",
      },
      {
        question: "Do I have to be present during the clearance?",
        answer:
          "No. Once we have the keys we work independently and document the result with photos. The landlord or property manager can also accept the handover.",
      },
      {
        question: "What happens to items that are still usable?",
        answer:
          "Anything of value is credited against the price; well-preserved furniture and household goods are passed on to charitable organisations wherever possible.",
      },
      {
        question: "How do you dispose of things?",
        answer:
          "We separate by material and dispose through certified specialist companies. On request you receive a disposal certificate, for example for commercial properties.",
      },
      {
        question: "Which areas do you cover for clearances?",
        answer:
          "All of Düsseldorf as well as Neuss, Meerbusch, Ratingen, Hilden and Erkrath. Other places in the region on request – just tell us about your property.",
      },
      {
        question: "How quickly can you clear?",
        answer: "Usually within a few days, often within 48 hours in urgent cases. We normally clear an average flat in one working day.",
      },
    ],
  },

  /* ------------------------------------------------------------------------
     House clearances
     ------------------------------------------------------------------------ */
  {
    slug: "haushaltsaufloesungen",
    name: "House clearances",
    icon: "house",
    teaser: "Sensitive complete clearance – after a bereavement, a move into a care home or when giving up a flat.",
    highlights: ["Personal contact", "Credit for valuables", "Handover to the landlord"],
    seo: {
      title: "House Clearance Düsseldorf – Fixed Price",
      description:
        "House clearance in Düsseldorf after a bereavement, a move into care or when giving up a flat: fixed price, fair credit for valuables and a swept-clean handover.",
    },
    updatedAt: "2026-10-23",
    hero: {
      eyebrow: "House clearance in Düsseldorf · sensitive & complete",
      headline: ["House clearance", "in Düsseldorf."],
      headlineAccent: "With respect and care.",
      subheadline:
        "Whether after a bereavement, a move into a care home or when giving up a flat: we clear households completely – with tact, fair credit for valuables and a swept-clean handover.",
      media: heroMedia("haushaltsaufloesungen", { width: 1920, height: 1012 }),
      mediaAlt: "Packed cardboard boxes in a sunlit room",
      factsTitle: "Your house clearance includes",
      facts: [
        "One personal contact",
        "Credit for furniture & antiques",
        "Safekeeping of documents & keepsakes",
        "Renovation & final cleaning on request",
        "Key handover to the landlord",
      ],
    },
    stats: [
      { value: "Discreet", label: "Sensitive handling", detail: "Unmarked vehicles on request" },
      { value: "Fixed price", label: "After survey", detail: "Disposal included" },
      { value: "Credit", label: "Value lowers your costs", detail: "Fair, transparent valuation" },
      { value: "Handover", label: "Swept clean & on time", detail: "With handover report" },
    ],
    scope: {
      eyebrow: "What we do",
      title: "We take care of everything – at your pace",
      description: "A house clearance is often emotional. We take the organisation and work off your hands and treat every item with respect.",
      items: [
        {
          icon: "house",
          title: "Complete clearance",
          description: "From cellar to attic – we clear the entire household and hand over the rooms empty.",
          highlights: ["All rooms & outbuildings", "Dismantling & removal", "Swept-clean handover"],
        },
        {
          icon: "heart-handshake",
          title: "Estates & inheritance",
          description: "We support heirs and estate administrators with calm, discretion and clear coordination.",
          highlights: ["Coordination with all heirs", "Photo documentation", "Nationwide too"],
        },
        {
          icon: "sofa",
          title: "Senior moves & care homes",
          description: "We bring selected furniture to the new home and gently clear the previous household.",
          highlights: ["Move & clearance combined", "Set-up in the new room", "Plenty of time & patience"],
        },
        {
          icon: "coins",
          title: "Valuation & purchase",
          description: "We value antiques, collectibles and well-preserved furniture fairly and credit them.",
          highlights: ["Transparent valuation", "Direct purchase possible", "Reduces the fixed price"],
        },
        {
          icon: "sparkles",
          title: "Renovation & final cleaning",
          description: "On request we remove wallpaper and flooring, paint and do the final cleaning.",
          highlights: ["Cosmetic repairs", "Flooring removal", "Deep cleaning"],
        },
        {
          icon: "key",
          title: "Handover to the landlord",
          description: "We arrange the appointment with the landlord or property manager and prepare a handover report.",
          highlights: ["Appointment coordination", "Handover report", "Key management"],
        },
      ],
    },
    processTitle: "How your house clearance works",
    process: [
      { title: "Personal first conversation", description: "We listen, clarify your wishes and arrange a free survey." },
      { title: "Fixed price with credit", description: "You receive a binding quote in which items of value are already credited." },
      { title: "Sorting & safekeeping", description: "We set aside documents, photos and keepsakes for you – nothing gets lost." },
      { title: "Clearing & handover", description: "We clear, dispose properly and hand over the flat swept clean." },
    ],
    faqs: [
      {
        question: "How much does a house clearance cost?",
        answer:
          "The cost depends on the living space, the amount of household goods, access and the disposal effort. Items of value are credited – in the best case this reduces the price considerably.",
      },
      {
        question: "What happens to personal documents and photos?",
        answer:
          "We sort carefully and put documents, photos, valuables and keepsakes together for you. We agree in advance what should be kept.",
      },
      {
        question: "Do you also handle the handover to the landlord?",
        answer: "Yes. We arrange the handover appointment, prepare a report and hand over the keys – without you having to be there if you prefer.",
      },
      {
        question: "How long does a house clearance take?",
        answer: "We usually clear an average flat in one to two working days. We agree the schedule flexibly with you and the landlord.",
      },
      {
        question: "Do you also clear households outside Düsseldorf?",
        answer:
          "Yes. Besides Düsseldorf we work in Neuss, Meerbusch, Ratingen, Hilden and Erkrath. For communities of heirs we also handle clearances further afield.",
      },
      {
        question: "Do you work with estate administrators and legal guardians?",
        answer:
          "Yes, regularly. We coordinate with heirs, legal guardians, probate courts and property managers and document every step transparently.",
      },
    ],
  },

  /* ------------------------------------------------------------------------
     Transport – no warehousing or contract logistics
     ------------------------------------------------------------------------ */
  {
    slug: "transport",
    name: "Transport",
    icon: "truck",
    showTrackingApp: true,
    teaser: "Furniture, single-item and business transport, delivery & collection – regionally, across Germany and in Europe.",
    highlights: ["From single items to full loads", "One contact person", "Germany & Europe"],
    seo: {
      title: "Furniture Transport & Haulage in Düsseldorf",
      description:
        "Furniture, single-item and business transport from Düsseldorf: loaded safely and delivered on time – regionally, across Germany and Europe. Quote within 24 hours.",
    },
    updatedAt: "2026-10-23",
    hero: {
      eyebrow: "Transport company in Düsseldorf · private & business",
      headline: ["Transport from Düsseldorf.", "Moved safely."],
      headlineAccent: "Delivered on time.",
      subheadline:
        "From a single piece of furniture and deliveries from the furniture store to pallets for your business: we collect, load professionally and deliver on time – with one contact person and a transparent fixed price.",
      media: heroMedia("transport"),
      mediaAlt: "Lorries on a motorway viaduct through wooded hills",
      factsTitle: "Your transport includes",
      facts: [
        "One contact person per job",
        "Professional load securing",
        "Protective blankets, straps & packaging",
        "Liability under HGB & CMR",
        "Fixed-price quote within 24 hours",
      ],
    },
    stats: [
      { value: "Fixed price", label: "Binding quote", detail: "No hidden costs" },
      { value: "24 h", label: "Quote", detail: "In writing & transparent" },
      { value: "Direct", label: "No reloading", detail: "Door to door" },
      { value: "EU-wide", label: "Service area", detail: "Germany & Europe" },
    ],
    scope: {
      eyebrow: "What we do",
      title: "Transport for every occasion",
      description:
        "Whether a single sofa, complete office equipment or goods for your customers: we take care of collection, loading and delivery – reliably and from one source.",
      items: [
        {
          icon: "sofa",
          title: "Furniture & single items",
          description: "Sofa, wardrobe, washing machine or that classified-ad bargain – we collect and deliver it safely packed.",
          highlights: ["Blankets & straps", "Carried into your home", "Assembly on request"],
        },
        {
          icon: "package",
          title: "Delivery & collection",
          description: "Collection from the furniture store, DIY store or warehouse and delivery to you – also as a delivery service for your customers.",
          highlights: ["Store & online purchases", "Appointment of your choice", "Assembly possible"],
        },
        {
          icon: "building",
          title: "Business transport",
          description: "Office equipment, pallets, trade fair and shop fitting: plannable transport for companies with one contact person.",
          highlights: ["Pallets & part loads", "Trade fair & shop fitting", "E-invoice (ZUGFeRD/XRechnung)"],
        },
        {
          icon: "zap",
          title: "Direct & express trips",
          description: "Urgent shipments go direct – no reloading, the shortest route and a confirmation on delivery.",
          highlights: ["Direct trip, no transhipment", "Germany & Europe", "Proof of delivery"],
        },
      ],
    },
    processTitle: "How your transport works",
    process: [
      { title: "Enquiry", description: "What, from where, to where and when – via form, email, phone or directly in the customer portal." },
      { title: "Quote within 24 hours", description: "You receive a binding fixed-price quote with collection and delivery windows." },
      { title: "Collection & loading", description: "We collect on time, pack if needed and secure the load professionally." },
      { title: "Delivery & proof", description: "Delivery within the agreed time window – into the room if you wish, with proof of delivery." },
    ],
    faqs: [
      {
        question: "What kind of transport do you handle?",
        answer:
          "Single pieces of furniture and appliances, deliveries from stores or warehouses, business transport such as office equipment and pallets, and direct trips – regionally, across Germany and in Europe. We do not offer storage or logistics services.",
      },
      {
        question: "Do you only drive within Düsseldorf?",
        answer:
          "No. We transport within Düsseldorf and the region – for example to Neuss, Meerbusch, Ratingen, Hilden and Erkrath – as well as across Germany and Europe, as direct runs without reloading.",
      },
      {
        question: "Can I track my transport live?",
        answer:
          "In the customer portal you can see the status, the driver and – during the trip – the position of your transport. The FA Tracking App for iOS and Android is coming soon. Your contact person also keeps you informed about every important step.",
      },
      {
        question: "How quickly will I get a quote?",
        answer: "Usually within 24 hours – often on the same day for simple transport jobs.",
      },
      {
        question: "Are the goods insured during transport?",
        answer:
          "Yes. We are liable under the German Commercial Code (HGB) and under the CMR convention for cross-border transport. For particularly valuable goods we offer extended transit insurance on request.",
      },
    ],
  },
];

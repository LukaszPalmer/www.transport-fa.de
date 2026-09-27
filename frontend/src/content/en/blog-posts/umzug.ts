import type { BlogPost } from "../../blog";
import { editorialTeamEn } from "./shared";

/** English version of the "Removals" posts – same slugs as the German originals. */
export const umzugPostsEn: BlogPost[] = [
  {
    slug: "umzugskosten-duesseldorf",
    title: "Moving costs in Düsseldorf 2026: how much does a move cost?",
    excerpt:
      "How much does a move in Düsseldorf cost? Guide prices by flat size, all cost factors, prices for extra services and 7 tips to save money on your move.",
    category: "umzug",
    publishedAt: "2026-09-26",
    author: editorialTeamEn,
    cover: { src: "/media/stock/umzug-team-kartons.jpg", alt: "Two movers carrying moving boxes through a bright flat" },
    featured: true,
    keywords: ["moving costs Düsseldorf", "removal company Düsseldorf", "how much does a move cost", "moving a 2-room flat cost", "fixed-price removal", "moving costs tax deductible"],
    body: [
      {
        type: "paragraph",
        text: "A move with a removal company in Düsseldorf usually costs between around €400 for a small one-room flat and €4,000 for a house with four or more rooms, depending on the size of the home. The price is determined mainly by five factors: the volume in cubic metres, floors and carrying distances, the distance between the addresses, the date and any extra services such as packing or kitchen assembly.",
      },
      {
        type: "checklist",
        title: "Key facts at a glance",
        items: [
          "Guide price within Düsseldorf: approx. €800–1,500 for a 2-room flat with a professional team",
          "Rule of thumb for volume: 0.3 to 0.5 m³ of belongings per square metre of living space",
          "Biggest price drivers: many floors without a lift, long carrying distances, a date at the end of the month",
          "Only a fixed price after a survey is binding – not a flat rate quoted over the phone",
          "20 % of the labour costs can be deducted from German income tax as household-related services (§ 35a EStG)",
        ],
      },
      { type: "heading", text: "How much does a move in Düsseldorf cost? Guide prices by flat size" },
      {
        type: "paragraph",
        text: "The following figures are typical market guide prices for a move within Düsseldorf with a professional removal team and truck – without extra services. They help you get a first idea and compare quotes.",
      },
      {
        type: "table",
        caption: "Moving costs in Düsseldorf – guide prices 2026",
        head: ["Home", "Volume (approx.)", "Team & duration", "Guide price"],
        rows: [
          ["1 room (up to 40 m²)", "15–20 m³", "2 helpers, 3–5 hrs", "€400–800"],
          ["2 rooms (approx. 60 m²)", "25–35 m³", "3 helpers, 5–7 hrs", "€800–1,500"],
          ["3 rooms (approx. 80 m²)", "35–50 m³", "3–4 helpers, 1 day", "€1,300–2,400"],
          ["4+ rooms / house", "50–80 m³", "4–5 helpers, 1–2 days", "€2,000–4,000"],
        ],
        note: "Move within the city, without packing service, kitchen assembly and no-parking zone. Floor, lift and carrying distances change the price considerably – only the fixed-price quote after a survey is binding.",
      },
      {
        type: "paragraph",
        text: "For moves to the surrounding area – for example to Neuss, Ratingen, Meerbusch, Hilden or Erkrath – there are usually only small additional travel costs. For long-distance moves to Hamburg, Berlin or Munich, costs rise noticeably due to travel time, tolls and possibly an overnight stay for the team.",
      },
      { type: "heading", text: "Which factors determine the cost of a move?" },
      {
        type: "list",
        items: [
          "Volume: the more cubic metres, the bigger the vehicle and the team. A furniture list or a survey gives the exact figure.",
          "Floors and lift: older buildings in Pempelfort, Flingern, Bilk or Unterbilk often have no lift – every floor adds carrying time.",
          "Carrying distances: if there are more than 20 to 30 metres between the front door and the truck, it takes more effort. A no-parking zone shortens the distance.",
          "Distance: within Düsseldorf it hardly matters; for long-distance moves kilometres, tolls and driving time count.",
          "Date: the end of the month, Fridays and the summer months are in high demand – mid-month and on weekdays it is often cheaper.",
          "Extra services: packing, furniture and kitchen assembly, furniture lift, storage or disposal of old furniture.",
        ],
      },
      { type: "heading", text: "What do extra services cost?" },
      {
        type: "table",
        caption: "Extra services – typical guide prices",
        head: ["Service", "Guide price"],
        rows: [
          ["No-parking zone incl. permit & signs", "approx. €100–250 per location"],
          ["Dismantling and reassembling a kitchen", "approx. €300–900"],
          ["Packing and unpacking service", "by effort, approx. €35–55 per helper hour"],
          ["Furniture lift / external lift", "approx. €150–400"],
          ["Moving boxes (purchase)", "approx. €2–4 each"],
          ["Disposal of old furniture", "by volume, often from approx. €50 per m³"],
        ],
        note: "Typical market guide prices. Many services can be bundled into the fixed price – usually cheaper than paying by the hour.",
      },
      { type: "heading", text: "Fixed price or hourly rate – which is cheaper?" },
      {
        type: "paragraph",
        text: "A fixed price protects you from nasty surprises: if the move takes longer than planned, the removal company bears the risk. With an hourly rate you pay for every extra quarter of an hour – for example if the lift is blocked or boxes haven't been packed yet. Reputable companies calculate the fixed price after a free survey on site or by video and put all services in writing.",
      },
      {
        type: "tip",
        title: "How to compare quotes properly",
        text: "Make sure all quotes include the same volume and the same services: boxes, assembly, no-parking zone, insurance and travel. A strikingly cheap price without a survey often ends up more expensive on moving day.",
      },
      { type: "heading", text: "7 tips to save money on your move in Düsseldorf" },
      {
        type: "list",
        ordered: true,
        items: [
          "Declutter before the move – every cubic metre less lowers the price.",
          "Choose a date in the middle of the month and on a weekday.",
          "Pack the boxes yourself and book the team only for carrying, transport and assembly.",
          "Apply for the no-parking zone in good time so the team has short distances.",
          "Compare several fixed-price quotes based on a survey.",
          "Sell or donate well-kept furniture instead of moving it.",
          "Keep the invoice and pay by bank transfer – that way you keep the tax reduction.",
        ],
      },
      {
        type: "link",
        label: "Clearing out a flat: checklist & disposal rules",
        href: "/blog/wohnung-entruempeln-checkliste",
        text: "Fewer belongings, a lower price – how to declutter properly before the move.",
      },
      { type: "heading", text: "Can moving costs be deducted from tax?" },
      {
        type: "paragraph",
        text: "Yes – if you pay tax in Germany. For a private move you can deduct 20 % of the labour costs from your tax liability as household-related services under § 35a EStG – up to €4,000 of tax reduction per year for all household-related services combined. You need an invoice showing the labour cost share and payment by bank transfer. If the move is job-related, for example because of a new job, you can claim the costs as income-related expenses. Please clarify the details with your tax adviser.",
      },
      { type: "heading", text: "Conclusion: plan your moving costs realistically" },
      {
        type: "paragraph",
        text: "If you know the size of your household, you can estimate the moving costs quite well. For reliable planning, however, there is no way around a survey: only then are the volume, carrying distances and extra services clear. At FA Transport you receive a binding fixed price after the free survey – for moves within Düsseldorf, to the surrounding area and across Germany.",
      },
      {
        type: "link",
        label: "Moving checklist: the timeline for your move",
        href: "/blog/umzugscheckliste",
        text: "From giving notice to registering your new address – all tasks in the right order.",
      },
    ],
    faqs: [
      {
        question: "How much does it cost to move a 2-room flat in Düsseldorf?",
        answer:
          "For a move within Düsseldorf with a professional team, the guide price is about €800 to €1,500. The volume is usually 25 to 35 m³. Floor, lift, carrying distances and extra services such as kitchen assembly change the price.",
      },
      {
        question: "How many movers do I need?",
        answer:
          "As a rule of thumb, two helpers are enough for a one-room flat, three for two to three rooms and four to five for larger flats or houses. Without a lift or with long carrying distances, plan one more person.",
      },
      {
        question: "When is the cheapest time to move?",
        answer: "On weekdays and in the middle of the month. The end of the month, Fridays, Saturdays and the summer holidays are in highest demand – dates are scarce then and often more expensive.",
      },
      {
        question: "Are moving costs tax deductible?",
        answer:
          "In Germany, for private moves 20 % of the labour costs can be deducted as household-related services under § 35a EStG; for job-related moves the costs count as income-related expenses. You need an invoice showing the labour share and payment by bank transfer.",
      },
      {
        question: "Does a fixed price make sense for a move?",
        answer: "Yes. A fixed price after a survey makes the costs predictable: delays on moving day are not at your expense. With an hourly rate you pay for every extra hour.",
      },
    ],
  },
  {
    slug: "umzugscheckliste",
    title: "Moving checklist: the timeline for your move",
    excerpt:
      "The moving checklist to tick off: what to do 3 months, 6 weeks and 1 week before and after the move – including deadlines and registering your new address.",
    category: "umzug",
    publishedAt: "2026-09-26",
    author: editorialTeamEn,
    cover: { src: "/media/stock/umzug-kartons-beschriftet.jpg", alt: "Labelled moving boxes and tape ready for the move" },
    keywords: ["moving checklist", "move checklist Germany", "planning a move", "moving timeline", "register address Düsseldorf", "no-parking zone Düsseldorf", "Wohnungsgeberbestätigung"],
    body: [
      {
        type: "paragraph",
        text: "A move works best with about three months' lead time. During this time you give notice on your old flat, get quotes, apply for the no-parking zone, pack step by step and register your new address within two weeks of moving in. This moving checklist shows you all tasks in the right order – ready to tick off.",
      },
      {
        type: "checklist",
        title: "Key facts at a glance",
        items: [
          "Tenancy: the statutory notice period for tenants in Germany is three months",
          "Removal company: book 6 to 8 weeks in advance, earlier for the end of the month",
          "No-parking zone: apply 2 to 3 weeks in advance – the signs must be up 72 hours before",
          "Registration: within two weeks of moving in at the citizens' office (Bürgerbüro)",
          "On moving day: photograph the meter readings and prepare a handover report",
        ],
      },
      { type: "heading", text: "3 months before the move: give notice and plan" },
      {
        type: "checklist",
        items: [
          "Give written notice on your tenancy – it must reach the landlord by the third working day of a month for that month to count",
          "Set the moving date and request leave",
          "Get quotes from removal companies – ideally with a survey",
          "Register the change of nursery or school",
          "Check the renovation obligations in your tenancy agreement (cosmetic repairs)",
          "Set a budget – see our overview of moving costs",
        ],
      },
      {
        type: "link",
        label: "Moving costs in Düsseldorf 2026: how much does a move cost?",
        href: "/blog/umzugskosten-duesseldorf",
        text: "Guide prices by flat size, extra services and money-saving tips.",
      },
      { type: "heading", text: "6 to 8 weeks before: removal company and no-parking zone" },
      {
        type: "checklist",
        items: [
          "Book the removal company – put the fixed price and services in writing",
          "Apply for (or order) a no-parking zone at the old and new address",
          "Declutter: sell, donate or dispose of whatever you won't take",
          "Book a bulky-waste collection or plan a clearance",
          "Get moving boxes, tape and padding",
          "Arrange the flat handover appointment with the landlord",
        ],
      },
      { type: "subheading", text: "No-parking zone in Düsseldorf: what you need to know" },
      {
        type: "paragraph",
        text: "In densely built-up districts such as Pempelfort, Flingern, Oberkassel or Carlstadt, a no-parking zone (Halteverbotszone) is almost always necessary. You apply for it at the road traffic authority of the City of Düsseldorf. Allow two to three weeks. The signs must be put up at least three full days – i.e. 72 hours – before the move, otherwise illegally parked cars cannot be towed at the owner's expense. Many removal companies take care of the application and the signs for you.",
      },
      { type: "heading", text: "4 weeks before: contracts and addresses" },
      {
        type: "checklist",
        items: [
          "Inform your electricity and gas supplier about the move",
          "Move your internet and phone line – if your tariff isn't available at the new address, you have a special right of termination",
          "Set up mail forwarding with Deutsche Post",
          "Inform your home contents insurance, bank, health insurance and employer",
          "Update your address for the broadcasting licence fee (Rundfunkbeitrag)",
          "Inform magazine subscriptions and clubs",
        ],
      },
      { type: "heading", text: "2 weeks before: pack properly" },
      {
        type: "list",
        items: [
          "Start with things you rarely need: books, decorations, seasonal clothing.",
          "Heavy items in small boxes, light items in large ones – no box should weigh more than 20 to 25 kg.",
          "Label every box with the destination room and contents, mark fragile boxes clearly.",
          "Attach furniture screws in labelled bags directly to the piece of furniture.",
          "Arrange care for children and pets on moving day.",
        ],
      },
      { type: "heading", text: "1 week before the move" },
      {
        type: "checklist",
        items: [
          "Defrost the fridge and freezer at least 24 hours in advance",
          "Pack a \"first night box\": bedding, towels, chargers, medication, tools, snacks",
          "Transport important documents, jewellery and cash separately and yourself",
          "Check the no-parking signs",
          "Prepare the stairwell and floors – the removal team usually takes care of protection",
        ],
      },
      { type: "heading", text: "On moving day" },
      {
        type: "checklist",
        items: [
          "Read and photograph the electricity, gas and water meters – in the old and new flat",
          "Go through the schedule and particularly delicate items with the team leader",
          "Hand over the old flat to the landlord with a handover report and all keys",
          "Check the new flat for defects and document them",
        ],
      },
      { type: "heading", text: "After the move: register and change your address" },
      {
        type: "paragraph",
        text: "Under the German Federal Registration Act you must register with the registration office within two weeks of moving in – in Düsseldorf at one of the citizens' offices (Bürgerbüros), usually by appointment. Bring your ID card or passport and the landlord's confirmation of residence (Wohnungsgeberbestätigung). If you miss the deadline you risk a fine.",
      },
      {
        type: "checklist",
        items: [
          "Register your residence at the citizens' office (deadline: two weeks)",
          "Have the address in your vehicle registration certificate (Part I) changed – you may keep your number plate",
          "Register your dog for the dog tax of the new municipality",
          "Update your address with the tax office, insurers, online shops and doctors",
          "Reclaim the deposit for your old flat",
        ],
      },
      {
        type: "tip",
        title: "Our tip from practice",
        text: "Keep a single folder for the move – digital or on paper – with tenancy agreements, quotes, permits and handover reports. That way you'll find everything straight away on moving day and when doing your tax return.",
      },
    ],
    faqs: [
      {
        question: "How far in advance should you plan a move?",
        answer:
          "About three months is ideal. That matches the statutory notice period for tenants in Germany and leaves enough time for quotes, the no-parking zone and packing. Book the removal company six to eight weeks in advance.",
      },
      {
        question: "When do I have to register my new address in Düsseldorf?",
        answer: "Within two weeks of moving in, at a citizens' office (Bürgerbüro) of the City of Düsseldorf. You need your ID and the landlord's confirmation of residence (Wohnungsgeberbestätigung).",
      },
      {
        question: "Do I need a no-parking zone for my move?",
        answer:
          "In most districts of Düsseldorf, yes, because free parking spaces in front of the building are rare. The zone shortens the carrying distances and saves time and money. The signs must be up 72 hours in advance.",
      },
      {
        question: "What goes into the first night box?",
        answer: "Everything you need on the first evening: bedding, towels, toiletries, medication, chargers, tools, light bulbs, toilet paper, drinks and snacks.",
      },
    ],
  },
];

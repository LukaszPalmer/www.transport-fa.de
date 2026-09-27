import type { BlogPost } from "../../blog";
import { editorialTeamEn } from "./shared";

/** English version of the "House clearance" posts – same slugs as the German originals. */
export const haushaltsaufloesungPostsEn: BlogPost[] = [
  {
    slug: "haushaltsaufloesung-kosten-duesseldorf",
    title: "House clearance in Düsseldorf: costs & process",
    excerpt:
      "How much does a house clearance in Düsseldorf cost? Guide prices by flat size, how the credit for valuables lowers the price and who pays the costs.",
    category: "haushaltsaufloesung",
    publishedAt: "2026-09-26",
    author: editorialTeamEn,
    cover: { src: "/media/stock/haushaltsaufloesung-wohnzimmer.jpg", alt: "Living room with a leather armchair and framed family photos on a wooden wall" },
    keywords: ["house clearance Düsseldorf", "house clearance cost", "flat clearance cost", "credit for valuables", "estate clearance Düsseldorf", "house clearance care home"],
    body: [
      {
        type: "paragraph",
        text: "In Düsseldorf, a house clearance for a 2- to 3-room flat usually costs between about €1,500 and €3,500 – before deducting the credit for valuables. The price depends on the living space, the amount of household goods, the floor and the disposal effort. Unlike a pure clearance, it usually also includes sorting documents, the credit for valuables and the handover to the landlord.",
      },
      {
        type: "checklist",
        title: "Key facts at a glance",
        items: [
          "Guide price 2–3 rooms: approx. €1,500–3,500 before credit for valuables",
          "The credit for valuables lowers the price – but rarely covers it completely",
          "Secure documents, photos and valuables beforehand or have them secured",
          "After a death, the heirs pay the costs from the estate",
          "A fixed price after a survey protects you from extra charges",
        ],
      },
      { type: "heading", text: "How much does a house clearance cost? Guide prices 2026" },
      {
        type: "table",
        caption: "House clearance in Düsseldorf – guide prices before credit for valuables",
        head: ["Property", "Duration (approx.)", "Guide price"],
        rows: [
          ["1–2 rooms (up to 50 m²)", "1 day", "€900–2,000"],
          ["2–3 rooms (50–80 m²)", "1–2 days", "€1,500–3,500"],
          ["4 rooms (80–110 m²)", "2 days", "€2,500–5,000"],
          ["Detached house with cellar & attic", "2–4 days", "€4,000–9,000"],
        ],
        note: "Typical market guide prices including clearing, transport and disposal. Renovation, final cleaning, hazardous waste and dismantling of fittings are charged extra.",
      },
      { type: "heading", text: "Which factors influence the costs?" },
      {
        type: "list",
        items: [
          "Living space and how full it is: a fully furnished flat with cellar and attic causes considerably more work.",
          "Floor and access: without a lift the carrying time increases, long distances to the vehicle cost extra.",
          "Type of household goods: electrical appliances, pollutants and rubble are more expensive to dispose of than furniture.",
          "Fittings: fitted kitchens, built-in wardrobes, carpets and lamps have to be dismantled.",
          "Extra services: renovation, final cleaning, handover to the landlord, document destruction.",
          "Credit for valuables: saleable items reduce the final price.",
        ],
      },
      { type: "heading", text: "Credit for valuables: what are the household goods still worth?" },
      {
        type: "paragraph",
        text: "With a credit for valuables, the service provider values saleable items and deducts their value from the fixed price. Good candidates are antiques, designer and branded furniture, high-quality porcelain, tools, bicycles and nearly new electrical appliances. Mass-produced items such as wall units, older upholstered furniture or unbranded fitted kitchens hardly fetch a price today. For particularly valuable individual pieces such as paintings or jewellery, an independent valuation beforehand is worthwhile.",
      },
      {
        type: "tip",
        title: "Beware of \"free house clearance\" offers",
        text: "A free clearance is only possible if the usable stock covers the costs completely – which is rare. Always ask for a written fixed price showing the credit for valuables.",
      },
      { type: "heading", text: "A house clearance step by step" },
      {
        type: "list",
        ordered: true,
        items: [
          "Personal first conversation: clarify the occasion, time frame and wishes – for example what relatives want to keep.",
          "Free survey and fixed-price quote with credit for valuables.",
          "Sorting and securing: documents, photos, valuables and keepsakes are put together.",
          "Clearing and dismantling, separation by material, proper disposal and donation of usable items.",
          "Renovation and final cleaning on request.",
          "Swept-clean handover to the landlord or property manager with a handover report.",
        ],
      },
      { type: "heading", text: "House clearance when moving into a care home" },
      {
        type: "paragraph",
        text: "If a relative moves into a care facility or assisted living, a senior move and a house clearance can be combined: selected furniture and keepsakes go to the new room and are set up there, the rest of the household is cleared. Allow enough time and involve the person concerned in the decisions as far as possible.",
      },
      { type: "heading", text: "Who pays for a house clearance?" },
      {
        type: "paragraph",
        text: "In principle, whoever places the order pays. After a death, these are usually the heirs, who can pay the costs from the estate. In a community of heirs, all co-heirs should agree to the order. Your tax adviser can clarify whether the costs can be taken into account for tax purposes, for example for inheritance tax.",
      },
      {
        type: "link",
        label: "House clearance after a death: a guide for heirs",
        href: "/blog/haushaltsaufloesung-todesfall",
        text: "Deadlines, tenancy, certificate of inheritance – and why you shouldn't sell anything before the clearance.",
      },
      {
        type: "paragraph",
        text: "FA Transport clears households in Düsseldorf and the surrounding area sensitively and completely – with a personal contact, fair credit for valuables and handover to the landlord, with unmarked vehicles on request.",
      },
    ],
    faqs: [
      {
        question: "How much does a house clearance of a 3-room flat cost?",
        answer: "As a guide, about €1,500 to €3,500 before credit for valuables, depending on how full the flat is, the floor and the disposal effort. Renovation and final cleaning may be added.",
      },
      {
        question: "What is the difference between a clearance and a house clearance?",
        answer:
          "A clearance empties rooms and disposes of items. A house clearance additionally includes sorting and securing documents and valuables, the credit for valuables and often the handover of the flat to the landlord.",
      },
      {
        question: "How long does a house clearance take?",
        answer: "An average flat is usually cleared in one to two working days. Houses with cellar, attic and garage take two to four days.",
      },
      {
        question: "What happens to furniture that nobody wants?",
        answer: "Saleable items are credited, well-preserved items are donated to charitable organisations where possible. The rest is separated by material and disposed of properly.",
      },
    ],
  },
  {
    slug: "haushaltsaufloesung-todesfall",
    title: "House clearance after a death: a guide for heirs",
    excerpt:
      "House clearance after a death: when you may start, which deadlines apply, what happens to the tenancy and what you should secure.",
    category: "haushaltsaufloesung",
    publishedAt: "2026-09-26",
    author: editorialTeamEn,
    cover: { src: "/media/stock/haushaltsaufloesung-erinnerungen.jpg", alt: "Old family photos being carefully looked through during a house clearance" },
    keywords: ["house clearance after death", "house clearance inheritance", "clear a deceased person's flat", "terminate tenancy after death", "disclaim inheritance deadline", "estate flat clearance"],
    body: [
      {
        type: "paragraph",
        text: "After a death, relatives should only start the house clearance once it is clear who inherits and whether the inheritance will be accepted. Under German law, the deadline for disclaiming an inheritance is usually six weeks. Until then: secure the flat, collect important documents – but don't sell or give anything away. This guide shows which steps are due and in which order.",
      },
      {
        type: "checklist",
        title: "Key facts at a glance",
        items: [
          "Deadline to disclaim: usually six weeks from learning of the inheritance (§ 1944 BGB)",
          "Don't sell or give anything away before it is clarified – this can count as accepting the inheritance",
          "Tenancy: heirs can terminate with three months' notice, within one month of finding out",
          "Secure documents, valuables and keepsakes before the clearance",
          "In a community of heirs, make decisions together and document them",
        ],
      },
      {
        type: "quote",
        text: "A house clearance is never just work. Take the time you need – you can hand over the organisation.",
        cite: "The FA Transport team",
      },
      { type: "heading", text: "First steps after a death" },
      {
        type: "checklist",
        items: [
          "Apply for the death certificate at the registry office – request several copies",
          "Hand in a handwritten will to the probate court without delay (required by § 2259 BGB)",
          "Secure the flat: close the windows, set the heating to frost protection, empty the fridge",
          "Secure the post or have it forwarded",
          "Inform the landlord about the death",
        ],
      },
      { type: "heading", text: "Accept or disclaim the inheritance?" },
      {
        type: "paragraph",
        text: "Heirs can disclaim the inheritance within six weeks of learning of the death and of being named as an heir. If the deceased's last residence was abroad, the deadline is six months. Disclaiming makes sense above all if the estate is over-indebted. So first get an overview of accounts, loans and unpaid bills.",
      },
      {
        type: "tip",
        title: "Secure – but only use later",
        text: "Anyone who sells, gives away or disposes of items from the estate may thereby implicitly accept the inheritance – and possibly lose the option to disclaim it. Until it is clarified, only secure documents and valuables, and seek legal advice if in doubt.",
      },
      { type: "heading", text: "What happens to the tenancy?" },
      {
        type: "paragraph",
        text: "If a spouse or partner, children or other household members lived in the flat, they take over the tenancy under § 563 BGB. Otherwise the tenancy continues with the heirs (§ 564 BGB). Heirs and landlord can then terminate it extraordinarily with the statutory notice period of three months – but only within one month of learning of the death and that nobody is taking over the tenancy. Rent continues to be paid from the estate until the end of the notice period. These three months are usually also the time frame for the house clearance.",
      },
      { type: "heading", text: "What proof do heirs need?" },
      {
        type: "paragraph",
        text: "Landlords, banks and insurers often ask for proof that you are an heir. This is usually the certificate of inheritance (Erbschein) from the probate court or a notarised will together with the record of its opening. Apply for the certificate of inheritance early, as processing can take several weeks.",
      },
      { type: "heading", text: "Secure these documents before the clearance" },
      {
        type: "checklist",
        items: [
          "Will, contract of inheritance and powers of attorney",
          "ID card, birth and marriage certificates, family register",
          "Bank statements, savings books, securities documents and loan agreements",
          "Insurance policies, especially life and funeral insurance",
          "Pension and tax notices – heirs may still have to file a tax return",
          "Land register extracts, tenancy and purchase agreements",
          "Keys, cash, jewellery and valuables",
          "Photos, letters and personal keepsakes",
        ],
      },
      { type: "heading", text: "Cancel contracts and inform the relevant bodies" },
      {
        type: "list",
        items: [
          "Cancel or deregister electricity, gas, phone, internet and the broadcasting licence fee.",
          "Inform the pension and health insurance as well as private insurers.",
          "Cancel subscriptions, memberships and clubs.",
          "Close email and social media accounts or put them into a memorial state.",
          "Inform the banks – check standing orders, don't close accounts too hastily.",
        ],
      },
      { type: "heading", text: "House clearance in a community of heirs" },
      {
        type: "paragraph",
        text: "If there are several heirs, they manage the estate together. Agree in advance who receives which keepsakes, who is the contact for the service provider and how costs and proceeds are shared. Photo documentation and a simple inventory list prevent misunderstandings later – especially if not all heirs live in Düsseldorf.",
      },
      { type: "heading", text: "Commissioning the house clearance" },
      {
        type: "paragraph",
        text: "Once the inheritance and tenancy are clarified, the actual clearance can begin. An experienced team sorts carefully, sets aside documents and keepsakes for you, credits usable items and hands over the flat swept clean to the landlord – without you having to be there if you wish. FA Transport works discreetly, with unmarked vehicles on request, and documents every step with photos.",
      },
      {
        type: "link",
        label: "House clearance in Düsseldorf: costs & process",
        href: "/blog/haushaltsaufloesung-kosten-duesseldorf",
        text: "Guide prices by flat size and how the credit for valuables lowers the price.",
      },
      {
        type: "paragraph",
        text: "Note: this article gives a general overview of German law and does not replace legal advice. For questions about inheritance, disclaiming or taxes, contact the probate court, a notary or a lawyer specialising in inheritance law.",
      },
    ],
    faqs: [
      {
        question: "When can the house clearance start after a death?",
        answer:
          "As soon as it is clear who inherits and that the inheritance is accepted – at the latest after the six-week deadline for disclaiming. You may and should secure documents and valuables beforehand, but don't sell or dispose of anything yet.",
      },
      {
        question: "Who has to clear a deceased person's flat?",
        answer:
          "The heirs. They take over the tenancy and must hand over the flat cleared when the tenancy ends. If all heirs disclaim, the probate court can appoint an estate administrator who takes care of the flat.",
      },
      {
        question: "How do you terminate a deceased person's tenancy?",
        answer:
          "Heirs can terminate the tenancy extraordinarily with three months' notice. Notice must be given within one month of learning of the death and that nobody is taking over the tenancy.",
      },
      {
        question: "Who pays for the house clearance after a death?",
        answer: "The heirs – usually from the estate. In a community of heirs, all co-heirs should agree to the order. Usable items can lower the costs through the credit for valuables.",
      },
      {
        question: "Do I have to be present during the house clearance?",
        answer:
          "No. Once we have the keys and have agreed what should be secured, the team can work independently and hand over the flat directly to the landlord. You receive photo documentation.",
      },
    ],
  },
];

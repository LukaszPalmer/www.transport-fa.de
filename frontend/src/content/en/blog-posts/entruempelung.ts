import type { BlogPost } from "../../blog";
import { editorialTeamEn } from "./shared";

/** English version of the "Clearance" posts – same slugs as the German originals. */
export const entruempelungPostsEn: BlogPost[] = [
  {
    slug: "entruempelung-kosten-duesseldorf",
    title: "Clearance in Düsseldorf: costs, process & money-saving tips",
    excerpt:
      "How much does a clearance in Düsseldorf cost? Prices per m³, guide prices for cellars, attics and flats – and how to recognise a reputable company.",
    category: "entruempelung",
    publishedAt: "2026-09-26",
    author: editorialTeamEn,
    cover: { src: "/media/stock/entruempelung-besenrein.jpg", alt: "Empty flat handed over swept clean after a clearance" },
    keywords: ["clearance Düsseldorf", "clearance costs", "clearance price per m³", "flat clearance cost", "cellar clearance Düsseldorf", "clearance company Düsseldorf", "hoarder clearance"],
    body: [
      {
        type: "paragraph",
        text: "A professional clearance in Düsseldorf usually costs around €35 to €70 per cubic metre of items – including working time, removal and disposal. A single cellar room is therefore often cleared for €250 to €600, a 2-room flat usually costs €1,000 to €2,500. Usable furniture and appliances can lower the price through a credit for valuables.",
      },
      {
        type: "checklist",
        title: "Key facts at a glance",
        items: [
          "Guide price: approx. €35–70 per m³ of items, including disposal",
          "Price drivers: floors without a lift, hazardous waste, dismantling and short-notice dates",
          "Credit for valuables: saleable items are offset against the price",
          "A written fixed price after a survey – with a disposal certificate – is the reputable way",
          "As the owner of the waste you remain responsible until everything has been disposed of properly",
        ],
      },
      { type: "heading", text: "How much does a clearance cost? Guide prices for Düsseldorf" },
      {
        type: "table",
        caption: "Clearance in Düsseldorf – guide prices 2026",
        head: ["Property", "Amount (approx.)", "Guide price"],
        rows: [
          ["Cellar room (approx. 10 m²)", "5–10 m³", "€250–600"],
          ["Attic", "5–15 m³", "€300–900"],
          ["Garage", "5–12 m³", "€250–700"],
          ["2-room flat (approx. 60 m²)", "20–35 m³", "€1,000–2,500"],
          ["3–4-room flat / house", "35–70 m³", "€2,000–5,000"],
          ["Hoarder or special clearance", "varies greatly", "individual after survey"],
        ],
        note: "Typical market guide prices including working time, transport and disposal, before credit for valuables. Hazardous waste, rubble and complex dismantling cost extra.",
      },
      { type: "heading", text: "What does the price of a clearance depend on?" },
      {
        type: "list",
        items: [
          "Amount and type of items: furniture and household goods are cheaper to dispose of than rubble, old tyres or hazardous waste.",
          "Access: upper floors without a lift, narrow cellar stairs and long distances to the vehicle increase the working time.",
          "Dismantling: fitted kitchens, built-in wardrobes, carpets or lamps have to be removed first.",
          "Disposal costs: the fees of the disposal facilities are charged by weight and type of waste.",
          "Date: very short-notice jobs, for example shortly before a flat handover, require extra teams.",
          "Extra services: final cleaning, renovation or document destruction according to DIN 66399.",
        ],
      },
      { type: "heading", text: "How does the credit for valuables work?" },
      {
        type: "paragraph",
        text: "With a credit for valuables, the clearance company checks which items can still be sold – for example designer furniture, antiques, high-quality tools or nearly new electrical appliances. Their value is deducted directly from the fixed price. To be honest: most used furniture such as wall units or older upholstered furniture has little market value today. A free clearance is therefore the exception, but a noticeable saving is quite possible if the contents are well preserved.",
      },
      { type: "heading", text: "The process: how a clearance works" },
      {
        type: "list",
        ordered: true,
        items: [
          "Enquiry with photos or a video – this already allows a rough estimate of the amount.",
          "Free survey on site and a written fixed price including credit for valuables.",
          "Scheduling – even without you being there, once we have the keys.",
          "Clearing, dismantling and separation by material for recycling and disposal.",
          "Swept-clean handover with photo documentation, directly to the landlord or property manager if you wish.",
        ],
      },
      { type: "heading", text: "Do it yourself or hire professionals?" },
      {
        type: "paragraph",
        text: "You can easily clear a small cellar room with household items yourself: Düsseldorf's municipal waste service (AWISTA) collects normal household quantities of bulky waste after registration, and the recycling centres accept electrical appliances and pollutants. For entire flats, fixed handover dates, heavy furniture, mixed waste or a hoarding situation, a clearance service usually pays off – not least because vans, disposal fees and several working days quickly add up.",
      },
      {
        type: "link",
        label: "Clearing out a flat: checklist & disposal rules",
        href: "/blog/wohnung-entruempeln-checkliste",
        text: "If you do it yourself: what goes where and how to proceed room by room.",
      },
      { type: "heading", text: "How do you recognise a reputable clearance company?" },
      {
        type: "checklist",
        items: [
          "A survey before the quote instead of a flat rate over the phone",
          "A written fixed price with all services and the credit for valuables",
          "Disposal through licensed specialist companies – with a certificate on request",
          "A complete legal notice with address and business liability insurance",
          "No cash payment in advance",
        ],
      },
      {
        type: "tip",
        title: "Beware of \"free clearance\" offers",
        text: "Offers with no costs and no survey often end with bulky waste dumped illegally. Under German waste law you remain jointly responsible as the owner of the waste until it has been disposed of properly. So have the proper disposal confirmed.",
      },
      { type: "heading", text: "Can the costs of a clearance be deducted from tax?" },
      {
        type: "paragraph",
        text: "If you pay tax in Germany, the labour costs of a clearance in a private household may be claimed as household-related services under § 35a EStG. You need an invoice showing the labour costs separately and payment by bank transfer. Please check with your tax adviser whether this applies to you.",
      },
      {
        type: "paragraph",
        text: "FA Transport clears cellars, attics, flats and commercial premises in Düsseldorf and the surrounding area – from Neuss and Meerbusch to Ratingen, Hilden and Erkrath. After the free survey you receive a fixed price including disposal and credit for valuables.",
      },
    ],
    faqs: [
      {
        question: "How much does a clearance cost per cubic metre?",
        answer: "As a guide, around €35 to €70 per cubic metre, including working time, transport and disposal. Hazardous waste, rubble, dismantling and hard-to-reach rooms increase the price.",
      },
      {
        question: "How much does it cost to have a cellar cleared?",
        answer: "An average cellar room with 5 to 10 m³ of items usually costs €250 to €600. Narrow stairs, damp or leftover paint and chemicals can increase the effort.",
      },
      {
        question: "Do I have to be present during the clearance?",
        answer: "No. Once we have the keys, the team can work independently and document the result with photos. The landlord or property manager can also accept the handover.",
      },
      {
        question: "How quickly can a flat be cleared?",
        answer: "An average flat is usually cleared in one working day. Larger houses, hoarder flats or complex dismantling can take two to three days.",
      },
      {
        question: "Is a free clearance possible?",
        answer: "Only in exceptional cases, when the value of the saleable items covers the costs. Be careful with offers without a survey – as the owner of the waste you are jointly liable for illegal disposal.",
      },
    ],
  },
  {
    slug: "wohnung-entruempeln-checkliste",
    title: "Clearing out a flat: checklist & disposal rules",
    excerpt:
      "Clearing out a flat, cellar & attic: step-by-step checklist, the 4-box method and what goes to bulky waste, the recycling centre and hazardous waste collection.",
    category: "entruempelung",
    publishedAt: "2026-09-26",
    author: editorialTeamEn,
    cover: { src: "/media/stock/entruempelung-sortieren.jpg", alt: "Clothes being sorted into boxes to keep and to donate during a clear-out" },
    keywords: ["clear out a flat", "decluttering checklist", "cellar clear-out", "attic clear-out", "bulky waste Düsseldorf", "what goes in bulky waste", "decluttering tips"],
    body: [
      {
        type: "paragraph",
        text: "The quickest way to clear out a flat is to go room by room and assign every item immediately to one of four categories: keep, sell, donate or dispose of. What matters is that bulky waste, electrical appliances and pollutants are separated and disposed of correctly. This checklist guides you step by step through flat, cellar and attic.",
      },
      {
        type: "checklist",
        title: "Key facts at a glance",
        items: [
          "Set your goal, date and disposal routes in advance",
          "Start with the least emotional room – usually the cellar or storage room",
          "4-box method: keep, sell, donate, dispose of",
          "Never put electrical appliances, batteries or chemicals in bulky or residual waste",
          "Protect yourself: gloves, sturdy shoes and an FFP2 mask in the cellar",
        ],
      },
      { type: "heading", text: "Step 1: preparation – before you fill the first box" },
      {
        type: "checklist",
        items: [
          "Set your goal: make space, prepare a move or get the flat ready for handover",
          "Plan a date and a time buffer – on your own, a full flat often takes several weekends",
          "Book a bulky-waste collection or check the recycling centre's opening hours",
          "Have boxes, strong rubbish bags, tape and tools ready",
          "For large amounts: organise a skip or a van – with a no-parking zone if necessary",
        ],
      },
      { type: "heading", text: "Step 2: the 4-box method" },
      {
        type: "paragraph",
        text: "Put four boxes or marked areas in each room. Pick up every item exactly once and decide immediately. The one-year rule helps: if you haven't used something for a year, you usually won't need it in future either.",
      },
      {
        type: "table",
        caption: "The 4-box method",
        head: ["Box", "What goes in", "Where it goes"],
        rows: [
          ["Keep", "Items used daily or seasonally, keepsakes", "Straight back to their place"],
          ["Sell", "Well-kept furniture, branded appliances, collectibles", "Classified ads, flea market, dealers"],
          ["Donate", "Intact clothing, household goods, books, toys", "Charity shop, clothing bank"],
          ["Dispose of", "Broken, worn-out, expired items", "Bulky waste, recycling centre, hazardous waste collection"],
        ],
      },
      { type: "heading", text: "Step 3: go room by room" },
      { type: "subheading", text: "Cellar" },
      {
        type: "paragraph",
        text: "Cellars often collect paint tins, cleaning products and old electrical appliances – exactly the things that must not go into bulky waste. Watch out for damp and mould: it's best to dispose of affected boxes and textiles straight away, and an FFP2 mask protects you while working.",
      },
      { type: "subheading", text: "Attic" },
      {
        type: "paragraph",
        text: "In the attic, dust, heat in summer and narrow stairs are the biggest hurdles. Never carry heavy items alone. Old mineral wool insulation installed before 1996 can be hazardous to health – don't remove it yourself, hire a specialist company.",
      },
      { type: "subheading", text: "Garage and storage room" },
      {
        type: "paragraph",
        text: "Used oil, car batteries and tyres go to dealers or garages, which are obliged to take them back or accept them for a fee. Tools in good condition are usually easy to sell.",
      },
      { type: "heading", text: "What goes where? Disposal rules at a glance" },
      {
        type: "table",
        caption: "Correct disposal – the most important types of waste",
        head: ["Type of waste", "Examples", "Correct disposal"],
        rows: [
          ["Bulky waste", "Furniture, mattresses, carpets", "Bulky-waste collection (in Düsseldorf: AWISTA) or recycling centre"],
          ["Electrical appliances", "Fridge, TV, cables", "Recycling centre or take-back in shops – never bulky or residual waste"],
          ["Batteries", "Device batteries, power banks", "Collection boxes in shops, recycling centre"],
          ["Pollutants", "Paints, varnishes, solvents, pesticides", "Hazardous waste collection"],
          ["Rubble", "Tiles, stones, mortar", "Skip or recycling centre (fee payable)"],
          ["Textiles", "Clothing, shoes, bedding", "Clothing bank or donation"],
          ["Files & data carriers", "Bank statements, hard drives", "Destroy in compliance with data protection (DIN 66399)"],
          ["Hazardous building materials", "Asbestos, old mineral wool", "Only via a specialist company"],
        ],
        note: "Each municipality sets its own rules on quantities, dates and fees – for Düsseldorf, the municipal waste service AWISTA provides information.",
      },
      {
        type: "tip",
        title: "Don't forget data protection",
        text: "Old phones, laptops and hard drives often contain personal data. Reset devices before handing them in or have data carriers destroyed by a certified service. The same applies to folders with bank statements, contracts and tax documents.",
      },
      { type: "heading", text: "When is a clearance service worth it?" },
      {
        type: "list",
        items: [
          "The whole flat or a house has to be cleared.",
          "There is a fixed date, for example the handover to the landlord.",
          "Heavy furniture, fitted kitchens or narrow stairwells make the work harder.",
          "There is mixed waste or there are pollutants.",
          "The situation is emotionally stressful, for example after a death.",
        ],
      },
      {
        type: "link",
        label: "Clearance in Düsseldorf: costs, process & money-saving tips",
        href: "/blog/entruempelung-kosten-duesseldorf",
        text: "What a clearance service costs and how to recognise reputable companies.",
      },
      {
        type: "link",
        label: "House clearance after a death: a guide for heirs",
        href: "/blog/haushaltsaufloesung-todesfall",
        text: "Deadlines, the tenancy and what you should keep before clearing.",
      },
    ],
    faqs: [
      {
        question: "What can go in bulky waste?",
        answer: "Bulky household items that don't fit in the bin: furniture, mattresses, carpets and large household objects. Electrical appliances, batteries, rubble and pollutants are not included.",
      },
      {
        question: "Where do I start when decluttering?",
        answer: "With the room you are least emotionally attached to – usually the cellar, storage room or garage. That quickly gives you space and routine for the harder rooms.",
      },
      {
        question: "How long does it take to clear out a flat?",
        answer: "On your own, a full flat often takes several weekends. A professional team usually clears an average flat in one working day.",
      },
      {
        question: "Where do old electrical appliances go?",
        answer:
          "To the recycling centre or back to a shop: larger retailers in Germany are obliged to take them back under the Electrical and Electronic Equipment Act. Electrical appliances must not go into bulky waste or the residual waste bin.",
      },
    ],
  },
];

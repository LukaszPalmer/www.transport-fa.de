import type { Commitment, CtaLink, Feature, Stat } from "@/types/content";
import { heroMedia } from "../media";
import { routes, sectionIds } from "../navigation";

/** English version of ../home.ts – same structure. */

export const homeSeo = {
  title: "FA Transport Düsseldorf – Removals, Clearances & Transport",
  description:
    "Removals, clearances, house clearances and transport in Düsseldorf and the surrounding area – on schedule, insured and at a fixed price. Quote within 24 hours.",
};

export const hero = {
  eyebrow: "Removals · Clearances · Transport · from Düsseldorf",
  headline: ["Removals & transport", "in Düsseldorf."],
  headlineAccent: "Reliable. At a fixed price.",
  subheadline:
    "Whether it's a move, a clearance, a house clearance or a transport job: we move what matters to you – on schedule, with care and with one fixed contact person. Locally, across Germany and in Europe.",
  primaryCta: { label: "Request a quote", href: routes.contactForm } satisfies CtaLink,
  secondaryCta: { label: "Discover our fleet", href: `#${sectionIds.fleet}` } satisfies CtaLink,
  proofPoints: ["Quote within 24 hours", "Dispatch 24/7", "Fixed price, no surprises"],
  media: heroMedia("hero"),
};

export const heroShipment = {
  id: "FA-26-04817",
  from: { city: "Düsseldorf", time: "07:30" },
  to: { city: "Munich", time: "15:45" },
  progress: 68,
  status: "On schedule",
  details: [
    { label: "Load", value: "38 m³ household" },
    { label: "Team", value: "3 movers" },
    { label: "Vehicle", value: "7.5 t truck" },
  ],
};

export const trustStats: Stat[] = [
  { value: "10", label: "Years of experience", detail: "Know-how in transport & removals" },
  { value: "99.8 %", label: "On-time rate", detail: "Across all jobs in 2025" },
  { value: "Fixed price", label: "Binding quotes", detail: "No hidden costs" },
  { value: "24/7", label: "Dispatch", detail: "Personal contacts" },
];

export const servicesSection = {
  eyebrow: "Services",
  title: "One contact for everything that needs moving.",
  description:
    "Removal, clearance, house clearance or transport: you get everything from one source – with our own teams, our own fleet and fixed prices.",
  footnote: "Want to combine several services or have a special request?",
  footnoteCta: { label: "Talk to us", href: routes.contactForm } satisfies CtaLink,
};

export const fleetSection = {
  eyebrow: "Fleet & technology",
  title: "A modern fleet. Full transparency. Fewer emissions.",
  description:
    "Our vehicles are on average less than three years old, connected via telematics and all meet the Euro 6 standard – for maximum safety, efficiency and planning reliability.",
  image: {
    src: "/media/stock/flotte-fahrzeuge.jpg",
    alt: "Van, lorry and articulated truck with a car transporter at a rest area at sunset",
    caption: "From vans to 40-tonne trucks",
    note: "Illustrative image",
  },
};

export const fleetStats: Stat[] = [
  { value: "10", label: "Own vehicles" },
  { value: "< 3 yrs", label: "Average fleet age" },
  { value: "100 %", label: "Euro 6 standard" },
  { value: "24/7", label: "Dispatch available" },
];

export const fleetLiveKpis: Stat[] = [
  { value: "EU-wide", label: "Service area" },
  { value: "99.8 %", label: "Punctuality" },
  { value: "Direct", label: "Trips without reloading" },
];

export const fleetFeatures: Feature[] = [
  {
    icon: "shield-check",
    title: "State-of-the-art vehicles",
    description:
      "Vans and trucks of the latest generation – with emergency braking, turning and lane-keeping assistants and professional load securing.",
  },
  {
    icon: "satellite",
    title: "GPS tracking & ERP integration",
    badge: "Coming soon",
    description:
      "Soon you will be able to follow the position, estimated arrival and proof of delivery of your shipment live in the customer portal. Direct integration with your ERP via API follows next.",
  },
  {
    icon: "zap",
    title: "Efficiently planned",
    description: "Well-planned routes and direct trips without reloading save time, money and unnecessary kilometres – good for your budget and the environment.",
  },
];

export const aboutSection = {
  eyebrow: "About us",
  title: "A partner you can rely on.",
  intro:
    "FA Transport is a young company from Düsseldorf – with a team that brings ten years of experience in transport, removals and clearances. We combine modern, digital processes with what matters most in our industry: punctuality, care and clear agreements.",
  mission: "We treat every job as if it were our own.",
  missionSource: "Management, FA Transport",
  commitmentsTitle: "Our promise to you",
};

export const values: Feature[] = [
  {
    icon: "shield-check",
    title: "Safety",
    description: "Careful packing, protective blankets and edge guards as well as statutory liability – so your belongings and freight arrive undamaged.",
  },
  {
    icon: "clock",
    title: "Reliability",
    description: "A 99.8 % on-time rate is no coincidence but the result of forward-looking dispatch and clear escalation paths.",
  },
  {
    icon: "activity",
    title: "Transparency",
    description: "Binding fixed prices, clear agreements and your documents always in the customer portal – you always know where you stand.",
  },
  {
    icon: "handshake",
    title: "Partnership",
    description: "One contact person, short decision paths and solutions that grow with your requirements.",
  },
];

export const commitments: Commitment[] = [
  { icon: "coins", value: "Fixed price", label: "Binding quote" },
  { icon: "house", value: "Free", label: "Survey on site or by video" },
  { icon: "clock", value: "< 24 hrs", label: "Reply to your enquiry" },
  { icon: "handshake", value: "1", label: "Fixed contact person" },
  { icon: "shield-check", value: "Insured", label: "Statutory liability (HGB)" },
  { icon: "phone", value: "24/7", label: "Dispatch available" },
];

export const footerClaim = "Fixed price · Insured · Dispatch 24/7";

export const careersTeaser = {
  eyebrow: "Careers",
  title: "Get stuck in, get ahead – in every part of our business.",
  description: "We are looking for professional drivers, removal drivers, removal helpers and clearance staff (m/f/d) in Düsseldorf.",
  cta: { label: "View open positions", href: routes.careers } satisfies CtaLink,
};

export const contactCta = {
  eyebrow: "Contact",
  title: "Ready for your next job?",
  description: "Talk to our experts – whether removal, clearance or transport. You will quickly receive an individual, transparent quote.",
  primaryCta: { label: "Request a quote", href: routes.contactForm } satisfies CtaLink,
  responseTime: "Reply within 24 hours",
};

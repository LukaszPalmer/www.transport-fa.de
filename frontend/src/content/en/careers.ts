import type { CareerArea, Feature, Job, ProcessStep, Stat } from "@/types/content";
import { heroMedia } from "../media";

/** English version of ../careers.ts – same structure. Jobs are in Düsseldorf; German skills are usually required. */

export const careersPage = {
  seo: {
    title: "Jobs in Düsseldorf – transport, removals & clearances",
    description:
      "Open positions at FA Transport in Düsseldorf: professional HGV drivers (CE), removal drivers, removal helpers and clearance staff (m/f/d). Apply online in 3 minutes.",
  },
  hero: {
    eyebrow: "Careers · Düsseldorf",
    headline: ["Get stuck in.", "Get ahead."],
    headlineAccent: "Grow with us.",
    subheadline:
      "Behind the wheel, in the removal team or on clearance jobs: at FA Transport in Düsseldorf you can expect a strong team, modern equipment and a secure job.",
    media: heroMedia("karriere"),
    factsTitle: "What you can rely on",
    facts: ["Permanent employment", "Punctual, fair pay", "Modern vehicles & equipment", "Apply in 3 minutes – no cover letter"],
  },
  stats: [
    { value: "3", label: "Areas", detail: "Transport, removals, clearances" },
    { value: "3 min", label: "To apply", detail: "No cover letter needed" },
    { value: "48 h", label: "Response", detail: "Personal & binding" },
    { value: "Düsseldorf", label: "Location", detail: "Short distances, fixed team" },
  ] satisfies Stat[],
};

export const careerAreas: CareerArea[] = [
  { id: "transport", label: "Transport", icon: "truck" },
  { id: "umzug", label: "Removals & assembly", icon: "sofa" },
  { id: "raeumung", label: "Clearances & house clearances", icon: "recycle" },
];

export const benefits: Feature[] = [
  { icon: "coins", title: "Fair pay", description: "Above-standard pay, expenses, allowances and punctual salary payments – always." },
  { icon: "calendar-check", title: "Plannable shifts", description: "Shift planning with notice, mostly day trips and reliable weekends." },
  { icon: "truck", title: "Top equipment", description: "Modern vehicles, high-quality workwear and professional tools." },
  { icon: "graduation-cap", title: "Training", description: "Support for driving licences (C/CE), module training and clear career paths." },
  { icon: "users", title: "Strong team", description: "Short paths, first-name culture and colleagues who pitch in – from apprentice to management." },
  { icon: "shield-check", title: "Secure job", description: "Permanent contracts in a healthy, owner-managed company." },
];

export const jobs: Job[] = [
  {
    id: "berufskraftfahrer-ce",
    title: "Professional HGV driver (m/f/d), licence CE",
    area: "transport",
    employment: "Full-time",
    location: "Düsseldorf · local & long-distance",
    summary: "You deliver full and part loads safely and on time to our customers in Germany and Europe.",
    tasks: ["Local and long-distance trips with a modern articulated truck", "Loading and unloading checks, load securing", "Digital freight documents via app"],
    profile: ["CE licence with code 95", "Driver card", "Reliability and team spirit"],
  },
  {
    id: "fahrer-c1-umzug",
    title: "Removal driver (m/f/d), licence C1/C",
    area: "umzug",
    employment: "Full-time",
    location: "Düsseldorf · regional",
    summary: "You drive our removal trucks and lend a hand in the team – from loading to handover.",
    tasks: ["Driving 7.5 t and 12 t removal vehicles", "Helping with loading and unloading", "Handover and customer communication on site"],
    profile: ["C1 or C licence", "Physical resilience", "Friendly manner"],
  },
  {
    id: "umzugshelfer",
    title: "Removal helper / furniture carrier (m/f/d)",
    area: "umzug",
    employment: "Full-time · part-time · mini-job",
    location: "Düsseldorf · regional",
    summary: "You are the heart of every move: you pack, carry and transport with care.",
    tasks: ["Carrying and loading furniture and boxes", "Packing and unpacking service", "Protecting floors, doors and staircases"],
    profile: ["Physical fitness", "Care and punctuality", "Good German skills"],
  },
  {
    id: "mitarbeiter-entruempelung",
    title: "Clearance & house clearance staff (m/f/d)",
    area: "raeumung",
    employment: "Full-time · mini-job",
    location: "Düsseldorf · regional",
    summary: "You clear flats, cellars and commercial premises – quickly, sorted by material and with respect.",
    tasks: ["Clearing and dismantling", "Separating materials for recycling", "Swept-clean handover of the premises"],
    profile: ["Physical resilience", "Discretion and empathy", "Driving licence B an advantage"],
  },
];

export const applicationProcess: ProcessStep[] = [
  { title: "Apply online", description: "Fill in the form, attach your CV – done. No cover letter needed." },
  { title: "Response within 48 h", description: "We get back to you personally by phone or email – guaranteed." },
  { title: "Get to know each other", description: "A relaxed conversation on site and, if you like, a trial day with the team." },
  { title: "Welcome to the team", description: "Onboarding with a dedicated mentor, workwear and everything you need." },
];

export const initiativeJob = { id: "initiativ", title: "Speculative application" };

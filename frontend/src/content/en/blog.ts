import type { IconName } from "@/components/ui/Icon";
import type { BlogCategory } from "../blog";
import { entruempelungPostsEn } from "./blog-posts/entruempelung";
import { haushaltsaufloesungPostsEn } from "./blog-posts/haushaltsaufloesung";
import { transportPostsEn } from "./blog-posts/transport";
import { umzugPostsEn } from "./blog-posts/umzug";

/** English version of the blog page, categories and posts (same slugs as German). */
export const blogPage = {
  seo: {
    title: "Guides: removals, clearances & transport",
    description:
      "Practical knowledge from FA Transport in Düsseldorf: costs, checklists and tips on removals, clearances, house clearances and transport.",
  },
  eyebrow: "Blog & guides",
  titleLead: "Read",
  titleAccent: "what really matters.",
  description:
    "Practical knowledge from ten years of removals, clearances and transport – explained clearly so that your project in Düsseldorf and the surrounding area succeeds from the start.",
  promises: [
    { icon: "award", title: "From practice", text: "Knowledge straight from our removal, clearance and dispatch teams." },
    { icon: "check", title: "To tick off", text: "Compact checklists you can use for your project right away." },
    { icon: "sparkles", title: "Clearly explained", text: "No jargon – with concrete everyday examples." },
  ] satisfies Array<{ icon: IconName; title: string; text: string }>,
  teaser: {
    eyebrow: "Blog & guides",
    title: "Read what really matters.",
    description: "Tips, checklists and background from our everyday work – so you know what to think of for removals, clearances and transport.",
  },
  comingSoon: {
    title: "The first articles are in preparation.",
    text: "Our team is currently writing guides and checklists on these topics. Check back soon.",
  },
  question: {
    title: "A question you'd like us to answer?",
    text: "Tell us what you'd like to know about removals, clearances or transport – we'll cover the most frequent questions on the blog.",
    cta: "Ask a question",
  },
  note: "Our articles refer to German law and local conditions in Düsseldorf.",
};

export const blogCategories: BlogCategory[] = [
  {
    slug: "umzug",
    name: "Removals",
    description: "Planning, deadlines and checklists for a relaxed move – private or business.",
    icon: "truck",
    image: "/media/stock/umzug-transporter-beladen.jpg",
    service: "umzuege",
  },
  {
    slug: "entruempelung",
    name: "Clearances",
    description: "What stays, what goes – and how to clear out cellars, attics or storage rooms properly.",
    icon: "recycle",
    image: "/media/stock/entruempelung-sofa-tragen.jpg",
    service: "entruempelungen",
  },
  {
    slug: "haushaltsaufloesung",
    name: "House clearances",
    description: "Sensitive and structured: process, credit for valuables and a swept-clean handover.",
    icon: "house",
    image: "/media/stock/haushaltsaufloesung-sessel.jpg",
    service: "haushaltsaufloesungen",
  },
  {
    slug: "transport",
    name: "Transport",
    description: "Freight, documents and processes explained clearly – from single items to part loads.",
    icon: "package",
    image: "/media/stock/transport-lkw-fahrer.jpg",
    service: "transport",
  },
];

export const blogPosts = [...umzugPostsEn, ...entruempelungPostsEn, ...haushaltsaufloesungPostsEn, ...transportPostsEn];

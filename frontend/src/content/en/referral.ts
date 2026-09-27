import type { IconName } from "@/components/ui/Icon";
import { routes } from "../navigation";

/** English version of ../referral.ts. */
export const referralProgram = {
  eyebrow: "Referral programme",
  title: "Recommend us –",
  titleAccent: "and earn with us.",
  description:
    "We work on a commission basis: refer a customer to us and if it turns into a job, you receive a commission. Private individual or company – we agree the amount fairly and individually with you.",
  steps: [
    { icon: "handshake", title: "Make the contact", text: "You recommend us or give us the name of a prospect – with their consent, of course." },
    { icon: "calendar-check", title: "The job goes ahead", text: "We advise, survey and prepare a quote. You don't have to do anything else." },
    { icon: "coins", title: "Receive your commission", text: "If your recommendation turns into a job, we pay you the agreed commission." },
  ] satisfies Array<{ icon: IconName; title: string; text: string }>,
  audiences: ["Private individuals", "Existing customers", "Property managers & estate agents", "Companies & trades"],
  card: {
    label: "Your commission",
    value: "Negotiable",
    note: "Percentage depending on job type and volume – agreed individually.",
    benefits: [
      "For all services: removals, clearances, house clearances and transport",
      "No costs, no risk – commission only when a job goes ahead",
      "Clear agreement in advance and one fixed contact person",
    ],
  },
  cta: { label: "Become a partner", href: `${routes.contact}?leistung=empfehlung#anfrage` },
};

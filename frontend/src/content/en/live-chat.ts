import type { Feature } from "@/types/content";

/** English version of ../live-chat.ts. */
export const liveChat = {
  eyebrow: "Live chat in the customer portal",
  title: "Questions? Chat directly with our dispatch team.",
  description:
    "No hold music, no email ping-pong: in the customer portal you can reach our team via live chat. We instantly see your customer number and jobs – and can help you directly.",
  features: [
    { icon: "clock", title: "Replies in minutes", description: "You can see whether someone is online – and when we have read your message." },
    { icon: "users", title: "Personal & with context", description: "Your contact person knows your jobs, appointments and documents." },
    { icon: "mail", title: "Never miss a reply", description: "Replies also reach you by email when you are offline." },
    { icon: "shield-check", title: "Data-minimal", description: "Closed chats are deleted automatically after 24 hours." },
  ] satisfies Feature[],
  mockup: {
    customerNumber: "K-10042",
    staff: "Sarah · Dispatch",
    messages: [
      { from: "customer", text: "Hi! Is the truck coming tomorrow at 8 am as planned?", time: "09:41" },
      { from: "staff", text: "Good morning! Yes – driver Marco is scheduled. Once he leaves you can follow him live in tracking.", time: "09:42" },
      { from: "customer", text: "Great, thanks! Can he also take the boxes from the cellar?", time: "09:43" },
    ] as Array<{ from: "customer" | "staff"; text: string; time: string }>,
  },
};

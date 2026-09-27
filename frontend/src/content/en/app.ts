import type { Feature } from "@/types/content";
import { appStores } from "../app-stores";

/** English version of ../app.ts – store badges and links are shared. */
export const trackingApp = {
  eyebrow: "FA Tracking App",
  title: "Your shipment. Live in your pocket.",
  description:
    "With the free FA Tracking App you always see where your belongings or freight are right now – with the live position on the map, an arrival time to the minute and a notification at every status change.",
  features: [
    { icon: "map-pin", title: "Live position & ETA", description: "Vehicle in real time on the map, arrival time recalculated continuously." },
    { icon: "bell", title: "Push notifications", description: "At pickup, 15 minutes before arrival and on delivery." },
    { icon: "file-text", title: "Digital documents", description: "Delivery note, handover report and proof of delivery right in the app." },
    { icon: "message", title: "Direct line", description: "Reach the driver or dispatch with one tap." },
  ] satisfies Feature[],
  note: "Free for iOS and Android · sign in with your customer portal account",
  comingSoonNote: "Until launch, your contact person keeps you informed about every status of your shipment.",
  stores: {
    appStore: { ...appStores.appStore, label: "Download FA Tracking on the App Store" },
    googlePlay: { ...appStores.googlePlay, label: "Get FA Tracking on Google Play" },
  },
};

export const trackingDemo = {
  shipmentId: "FA-26-04817",
  progress: 0.62,
  etaMinutes: 18,
  etaTime: "2:30 pm",
  destination: "Osterstraße 120, Hamburg-Eimsbüttel",
  status: "On schedule",
  steps: [
    { label: "Picked up", time: "1:52 pm", state: "done" },
    { label: "On the way", time: "live", state: "current" },
    { label: "Delivery", time: "2:30 pm", state: "open" },
  ] as Array<{ label: string; time: string; state: "done" | "current" | "open" }>,
  driver: { initials: "MK", name: "Marco K.", vehicle: "Your driver · HH-FA 142" },
  notification: { title: "FA Tracking", time: "now", text: "Your driver will be with you in 15 minutes." },
  delivered: { title: "Delivered · 2:28 pm", text: "Proof of delivery available" },
};

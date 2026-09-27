"use client";

import { RotateCw } from "lucide-react";
import { useMessages } from "@/i18n/client";
import { defineMessages } from "@/i18n/config";
import { buttonClasses } from "@/components/ui/button-styles";
import { Container } from "@/components/ui/Container";

const messages = defineMessages({
  de: {
    title: "Das Portal ist gerade nicht erreichbar",
    text: "Ihre Daten sind sicher – wir konnten sie nur gerade nicht laden. Bitte versuchen Sie es in einem Moment erneut.",
    retry: "Erneut versuchen",
  },
  en: {
    title: "The portal can't be reached right now",
    text: "Your data is safe – we just couldn't load it at the moment. Please try again in a moment.",
    retry: "Try again",
  },
});

/** Fehlergrenze des Portals – z. B. wenn die API kurz nicht erreichbar ist. */
export default function PortalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useMessages(messages);
  return (
    <Container className="py-24">
      <div className="mx-auto max-w-xl rounded-3xl bg-white p-8 text-center shadow-card ring-1 ring-primary/5 sm:p-10">
        <h1 className="font-display text-2xl font-bold text-primary">{t.title}</h1>
        <p className="mt-3 leading-relaxed text-slate-600">{t.text}</p>
        <button type="button" onClick={reset} className={buttonClasses({ variant: "dark", className: "mt-8" })}>
          <RotateCw aria-hidden="true" className="size-4" />
          {t.retry}
        </button>
      </div>
    </Container>
  );
}

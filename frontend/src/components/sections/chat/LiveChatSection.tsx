import { CheckCheck, MessageCircle, Send } from "lucide-react";
import { getLiveChat } from "@/content/live-chat";
import type { Locale } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import { routes } from "@/content/navigation";
import { cn } from "@/lib/cn";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { SectionHeading } from "@/components/ui/SectionHeading";

/**
 * „Live-Chat" – Vorstellung des Chats im Kundenportal mit UI-Mockup, das dem
 * echten Chat-Fenster nachempfunden ist (dekorativ, rein statisch).
 */
export async function LiveChatSection() {
  const locale = await getLocale();
  const liveChat = getLiveChat(locale);
  return (
    <section id="live-chat" aria-labelledby="live-chat-title" className="defer-render relative isolate overflow-hidden bg-primary py-24 lg:py-32">
      <div aria-hidden="true" className="bg-grid absolute inset-0 -z-10 opacity-50 [mask-image:radial-gradient(ellipse_at_30%_50%,black,transparent_70%)]" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(36rem_28rem_at_25%_55%,rgb(56_189_248/0.18),transparent_70%)]" />

      <Container className="grid grid-cols-1 items-center gap-16 lg:grid-cols-12 lg:gap-10">
        <div className="order-2 flex justify-center lg:order-1 lg:col-span-6">
          <ChatMockup locale={locale} />
        </div>

        <div className="order-1 lg:order-2 lg:col-span-6 xl:col-span-5 xl:col-start-8">
          <SectionHeading id="live-chat-title" tone="dark" eyebrow={liveChat.eyebrow} title={liveChat.title} description={liveChat.description} />
          <ul className="mt-10 grid grid-cols-1 gap-x-6 gap-y-7 sm:grid-cols-2">
            {liveChat.features.map((feature) => (
              <li key={feature.title} className="flex gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-accent ring-1 ring-white/10">
                  <Icon name={feature.icon} className="size-5" />
                </span>
                <span>
                  <span className="block font-semibold text-white">{feature.title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-slate-400">{feature.description}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href={routes.portalRegister} size="lg" withArrow>
              Kostenloses Konto erstellen
            </ButtonLink>
            <ButtonLink href={`${routes.portalLogin}?weiter=${encodeURIComponent(`${routes.portal}?chat=1`)}`} variant="glass" size="lg">
              Anmelden & chatten
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}

function ChatMockup({ locale }: { locale: Locale }) {
  const { mockup } = getLiveChat(locale);
  const en = locale === "en";
  return (
    <figure className="relative w-full max-w-sm">
      <figcaption className="sr-only">
        Beispiel: Ein Kunde fragt im Live-Chat nach dem Liefertermin, die Disposition bestätigt Termin und Fahrer.
      </figcaption>
      <div aria-hidden="true" className="absolute -inset-10 -z-10 rounded-full bg-[radial-gradient(closest-side,rgb(56_189_248/0.25),transparent)]" />

      <div aria-hidden="true" className="overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-white/10">
        <div className="bg-secondary px-5 py-4 text-white">
          <p className="font-display text-base font-bold">Live-Chat</p>
          <p className="mt-0.5 text-xs text-slate-300">
            {en ? "Customer no." : "Kundennr."} {mockup.customerNumber} · {en ? "anna@example.com" : "anna@beispiel.de"}
          </p>
          <p className="mt-3 flex items-center gap-2 text-xs text-slate-300">
            <span className="size-2 rounded-full bg-emerald-400" />
            Unser Team ist online – Antwort meist in wenigen Minuten
          </p>
        </div>

        <div className="space-y-3 bg-surface px-4 py-5">
          {mockup.messages.map((message, index) => {
            const own = message.from === "customer";
            return (
              <div key={index} className={cn("flex flex-col", own ? "items-end" : "items-start")}>
                {!own && <span className="mb-1 px-1 text-xs font-semibold text-slate-500">{mockup.staff}</span>}
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                    own ? "rounded-br-md bg-primary text-white" : "rounded-bl-md bg-white text-primary shadow-sm ring-1 ring-primary/5",
                  )}
                >
                  {message.text}
                </div>
                <span className="mt-1 flex items-center gap-1 px-1 text-[0.6875rem] text-slate-400">
                  {message.time}
                  {own && <CheckCheck className="size-3.5 text-accent-ink" />}
                </span>
              </div>
            );
          })}
          <p className="flex items-center gap-2 px-1 text-xs text-slate-500">
            <span className="inline-flex gap-0.5">
              {[0, 150, 300].map((delay) => (
                <span key={delay} className="size-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: `${delay}ms` }} />
              ))}
            </span>
            Sarah schreibt …
          </p>
        </div>

        <div className="flex items-center gap-2 border-t border-slate-100 bg-white p-3">
          <span className="flex h-11 flex-1 items-center rounded-xl border border-slate-200 bg-surface px-3.5 text-sm text-slate-400">{en ? "Write a message …" : "Nachricht schreiben …"}</span>
          <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-primary">
            <Send className="size-5" />
          </span>
        </div>
      </div>

      {/* Chat-Button, wie er im Portal unten rechts schwebt */}
      <div aria-hidden="true" className="absolute -right-4 -bottom-7 flex h-14 animate-float items-center gap-2.5 rounded-full bg-accent pr-5 pl-4 font-semibold text-primary shadow-xl sm:-right-10">
        <MessageCircle className="size-6" />
        <span className="text-sm">{en ? "Questions? Start a chat" : "Fragen? Chat starten"}</span>
        <span className="absolute -top-1 -right-1 flex size-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white ring-2 ring-primary">1</span>
      </div>
    </figure>
  );
}

import { trackingDemo } from "@/content/app";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { LiveDot } from "@/components/ui/LiveDot";
import { LogoMark } from "@/components/ui/Logo";

/** iOS-Statusleiste (Uhrzeit, Mobilfunk, WLAN, Akku). */
function StatusBar() {
  return (
    <div className="absolute inset-x-0 top-0 z-20 flex h-[46px] items-center justify-between px-7 pt-1 text-[12px] font-semibold text-white">
      <span className="tabular-nums">9:41</span>
      <span className="flex items-center gap-1.5" aria-hidden="true">
        <svg viewBox="0 0 18 12" className="h-[9px] w-auto fill-white">
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
          <rect x="10" y="3" width="3" height="9" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" />
        </svg>
        <svg viewBox="0 0 16 12" className="h-[9px] w-auto fill-white">
          <path d="M8 2.5c2.3 0 4.4.9 6 2.4l1.3-1.4A10.5 10.5 0 0 0 8 .5 10.5 10.5 0 0 0 .7 3.5L2 4.9a8.5 8.5 0 0 1 6-2.4Zm0 3.6c1.4 0 2.6.5 3.6 1.4l1.3-1.4A7 7 0 0 0 8 4.1a7 7 0 0 0-4.9 2l1.3 1.4c1-.9 2.2-1.4 3.6-1.4Zm0 3.5c.5 0 .9.2 1.3.5L8 11.5 6.7 10.1c.4-.3.8-.5 1.3-.5Z" />
        </svg>
        <svg viewBox="0 0 26 12" className="h-[10px] w-auto">
          <rect x="0.5" y="0.5" width="22" height="11" rx="3.5" fill="none" stroke="white" strokeOpacity="0.5" />
          <rect x="2" y="2" width="16" height="8" rx="2" fill="white" />
          <rect x="23.5" y="4" width="1.8" height="4" rx="0.9" fill="white" fillOpacity="0.5" />
        </svg>
      </span>
    </div>
  );
}

/**
 * App-Oberfläche über der Karte: Statusleiste, Sendungs-Kopfzeile und
 * Bottom-Sheet mit ETA, Fortschritt und Fahrer. Größen orientieren sich an
 * einem 390 pt breiten iPhone-Display, skaliert auf die Mockup-Breite.
 */
export function AppScreen() {
  const { shipmentId, etaMinutes, etaTime, destination, status, steps, driver } = trackingDemo;

  return (
    <>
      <div aria-hidden="true" className="absolute inset-x-0 top-0 z-10 h-32 bg-linear-to-b from-[#0b132b]/95 via-[#0b132b]/60 to-transparent" />
      {/* Dynamic Island */}
      <span aria-hidden="true" className="absolute top-2.5 left-1/2 z-30 h-[26px] w-[90px] -translate-x-1/2 rounded-full bg-black" />
      <StatusBar />

      {/* Kopfzeile */}
      <div className="glass-dark absolute inset-x-3.5 top-[54px] z-20 flex items-center gap-2.5 rounded-2xl px-3 py-2.5">
        <LogoMark className="size-7 shrink-0" />
        <div className="min-w-0 flex-1 leading-tight">
          <p className="text-[8.5px] font-semibold uppercase tracking-[0.14em] text-slate-400">Sendung</p>
          <p className="truncate text-[12px] font-bold text-white">{shipmentId}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-300 ring-1 ring-emerald-400/25">
          <LiveDot className="size-1.5 text-emerald-400" />
          Live
        </span>
      </div>

      {/* Bottom-Sheet */}
      <div className="absolute inset-x-0 bottom-0 z-20 h-[43%] rounded-t-[1.6rem] bg-primary/95 px-4 pt-2.5 ring-1 ring-white/10 shadow-[0_-24px_48px_-24px_rgb(0_0_0/0.7)]">
        <span aria-hidden="true" className="mx-auto block h-1 w-9 rounded-full bg-white/20" />

        <div className="mt-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] text-slate-400">Ankunft in</p>
            <p className="font-display text-[26px] leading-none font-extrabold text-white tabular-nums">
              {etaMinutes} Min.
            </p>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/10 px-2 py-0.5 text-[9.5px] font-semibold text-emerald-300 ring-1 ring-emerald-400/25">
              <Icon name="check" className="size-2.5" strokeWidth={3} />
              {status}
            </span>
            <p className="mt-1 text-[10px] text-slate-400 tabular-nums">ETA {etaTime} Uhr</p>
          </div>
        </div>

        <p className="mt-2 flex items-center gap-1.5 truncate text-[10px] text-slate-300">
          <Icon name="map-pin" className="size-3 shrink-0 text-accent" />
          {destination}
        </p>

        {/* Fortschritt */}
        <ol className="relative mt-4 grid grid-cols-3">
          <span aria-hidden="true" className="absolute top-[5px] right-[16.6%] left-[16.6%] h-0.5 rounded-full bg-white/10" />
          <span aria-hidden="true" className="absolute top-[5px] left-[16.6%] h-0.5 w-[42%] rounded-full bg-linear-to-r from-accent to-accent-bright" />
          {steps.map((step) => (
            <li key={step.label} className="relative flex flex-col items-center text-center">
              <span
                className={cn(
                  "relative size-3 rounded-full ring-[3px] ring-primary",
                  step.state === "done" && "bg-accent",
                  step.state === "current" && "bg-accent-bright shadow-[0_0_0_4px_rgb(0_229_255/0.2)]",
                  step.state === "open" && "bg-slate-600",
                )}
              />
              <span className={cn("mt-1.5 text-[9.5px] font-semibold", step.state === "open" ? "text-slate-500" : "text-white")}>
                {step.label}
              </span>
              <span className="text-[8.5px] text-slate-500 tabular-nums">{step.time}</span>
            </li>
          ))}
        </ol>

        {/* Fahrer */}
        <div className="mt-3.5 flex items-center gap-2.5 rounded-xl bg-white/5 p-2.5 ring-1 ring-white/10">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-accent to-accent-ink text-[10px] font-bold text-white">
            {driver.initials}
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block text-[11px] font-semibold text-white">{driver.name}</span>
            <span className="block truncate text-[9px] text-slate-400">{driver.vehicle}</span>
          </span>
          <span className="flex size-7 items-center justify-center rounded-full bg-white/10 text-white" aria-hidden="true">
            <Icon name="message" className="size-3.5" />
          </span>
          <span className="flex size-7 items-center justify-center rounded-full bg-accent text-primary" aria-hidden="true">
            <Icon name="phone" className="size-3.5" />
          </span>
        </div>

        {/* Home-Indikator */}
        <span aria-hidden="true" className="absolute bottom-1.5 left-1/2 h-1 w-24 -translate-x-1/2 rounded-full bg-white/50" />
      </div>
    </>
  );
}

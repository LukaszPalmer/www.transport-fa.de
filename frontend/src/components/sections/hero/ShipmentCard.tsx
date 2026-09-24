import { heroShipment } from "@/content/home";
import { Icon } from "@/components/ui/Icon";
import { LiveDot } from "@/components/ui/LiveDot";

/**
 * Glassmorphism-Karte mit beispielhafter Live-Sendung. Rein illustrativ
 * (aria-hidden) – visualisiert das Tracking-Versprechen direkt im Hero.
 */
export function ShipmentCard() {
  const { id, from, to, progress, status, details } = heroShipment;

  return (
    <div
      aria-hidden="true"
      className="glass-dark w-full max-w-sm rounded-2xl p-6 text-white shadow-elevated"
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-accent">
          <LiveDot />
          Live-Tracking
        </span>
        <span className="font-mono text-xs text-slate-400">{id}</span>
      </div>

      <div className="mt-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs text-slate-400">Abholung · {from.time}</p>
          <p className="mt-1 font-display text-xl font-semibold">{from.city}</p>
        </div>
        <Icon name="truck" className="mb-1 size-5 text-accent" />
        <div className="text-right">
          <p className="text-xs text-slate-400">ETA · {to.time}</p>
          <p className="mt-1 font-display text-xl font-semibold">{to.city}</p>
        </div>
      </div>

      <div className="relative mt-5 h-1.5 rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-linear-to-r from-accent to-accent-bright"
          style={{ width: `${progress}%` }}
        />
        <span
          className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-accent-bright shadow-glow"
          style={{ left: `${progress}%` }}
        />
      </div>

      <div className="mt-2.5 flex items-center justify-between text-xs">
        <span className="text-slate-400">{progress} % der Strecke</span>
        <span className="inline-flex items-center gap-1.5 font-medium text-success">
          <span className="size-1.5 rounded-full bg-success" />
          {status}
        </span>
      </div>

      <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-white/10 pt-5">
        {details.map((detail) => (
          <div key={detail.label}>
            <dt className="text-[0.6875rem] uppercase tracking-wider text-slate-400">{detail.label}</dt>
            <dd className="mt-1 text-sm font-semibold whitespace-nowrap">{detail.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

import { fleetLiveKpis } from "@/content/home";
import { LiveDot } from "@/components/ui/LiveDot";
import { StatList } from "@/components/ui/StatList";

/**
 * Schematische Telematik-Karte (Inline-SVG, 0 Bildrequests, skaliert verlustfrei).
 * Koordinaten = vereinfachte Längen-/Breitengrad-Projektion auf 560×400.
 *
 * Animationen:
 * - Datenfluss auf Routen & Hub-Pulse: CSS (stoppt bei prefers-reduced-motion)
 * - Fahrzeuge: SMIL <animateMotion> entlang der Routen; bei reduced motion
 *   werden stattdessen statische Marker gezeigt (motion-reduce/motion-safe).
 */

const hubs = [
  { name: "Hamburg", x: 261, y: 81, main: true, label: "right" },
  { name: "Berlin", x: 387, y: 117, main: false, label: "right" },
  { name: "Rotterdam", x: 58, y: 138, main: false, label: "top" },
  { name: "Köln", x: 149, y: 172, main: false, label: "left" },
  { name: "Leipzig", x: 349, y: 158, main: false, label: "right" },
  { name: "Frankfurt", x: 213, y: 201, main: true, label: "left" },
  { name: "München", x: 320, y: 270, main: true, label: "right" },
  { name: "Wien", x: 496, y: 268, main: false, label: "top" },
  { name: "Mailand", x: 231, y: 364, main: false, label: "right" },
] as const;

const routes = [
  { id: "route-north-south", d: "M261 81C255 130 225 165 213 201C230 245 280 252 320 270C300 305 252 330 231 364" },
  { id: "route-west-east", d: "M58 138C95 150 120 160 149 172C175 182 195 192 213 201C260 190 310 170 349 158C365 145 375 130 387 117" },
  { id: "route-north", d: "M261 81C300 85 350 95 387 117" },
  { id: "route-south-east", d: "M320 270C380 285 440 280 496 268" },
];

const trucks = [
  { route: "route-north-south", dur: "18s", begin: "0s", fallback: { x: 222, y: 170 } },
  { route: "route-west-east", dur: "22s", begin: "-6s", fallback: { x: 290, y: 178 } },
  { route: "route-south-east", dur: "12s", begin: "-3s", fallback: { x: 420, y: 281 } },
  { route: "route-north", dur: "10s", begin: "-2s", fallback: { x: 330, y: 92 } },
];

const labelOffset = {
  right: { dx: 12, dy: 4, anchor: "start" },
  left: { dx: -12, dy: 4, anchor: "end" },
  top: { dx: 0, dy: -12, anchor: "middle" },
} as const;

export function FleetMap() {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-secondary/70 p-2 shadow-elevated">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <p className="inline-flex items-center gap-2.5 text-sm font-semibold text-white">
          <LiveDot className="text-success" />
          Live-Flottenübersicht
        </p>
        <p className="flex gap-4 text-xs text-slate-400" aria-hidden="true">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-accent-bright" /> Fahrzeug
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-accent" /> Hub
          </span>
        </p>
      </div>

      <div className="relative flex-1 overflow-hidden rounded-xl bg-primary ring-1 ring-white/5">
        <svg
          // Ausschnitt ohne leeren Rand oben: Inhalte liegen zwischen y≈60 und y≈375
          viewBox="0 45 560 345"
          role="img"
          aria-labelledby="fleet-map-title fleet-map-desc"
          className="block aspect-[112/69] size-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <title id="fleet-map-title">Schematische Karte des FA-Transport-Streckennetzes</title>
          <desc id="fleet-map-desc">
            Hauptrouten zwischen Rotterdam, Hamburg, Berlin, Köln, Leipzig, Frankfurt, München, Wien und
            Mailand mit Fahrzeugen in Echtzeit.
          </desc>

          <defs>
            <pattern id="fleet-map-dots" width="14" height="14" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="rgb(255 255 255 / 0.07)" />
            </pattern>
            <radialGradient id="fleet-map-vignette" cx="50%" cy="50%" r="65%">
              <stop offset="60%" stopColor="#0b132b" stopOpacity="0" />
              <stop offset="100%" stopColor="#0b132b" stopOpacity="0.9" />
            </radialGradient>
          </defs>

          <rect width="560" height="400" fill="url(#fleet-map-dots)" />
          <rect width="560" height="400" fill="url(#fleet-map-vignette)" />

          {/* Routen: Basislinie + animierter Datenfluss */}
          {routes.map((route) => (
            <g key={route.id} fill="none" strokeLinecap="round">
              <path id={route.id} d={route.d} stroke="rgb(255 255 255 / 0.12)" strokeWidth="3" />
              <path
                d={route.d}
                stroke="#38bdf8"
                strokeOpacity="0.8"
                strokeWidth="1.5"
                strokeDasharray="4 8"
                className="animate-route-flow"
              />
            </g>
          ))}

          {/* Hubs */}
          {hubs.map((hub) => {
            const offset = labelOffset[hub.label];
            return (
              <g key={hub.name}>
                {hub.main && (
                  <circle
                    cx={hub.x}
                    cy={hub.y}
                    r="6"
                    fill="#38bdf8"
                    fillOpacity="0.35"
                    className="origin-center animate-pulse-ring [transform-box:fill-box]"
                  />
                )}
                <circle
                  cx={hub.x}
                  cy={hub.y}
                  r={hub.main ? 5 : 3.5}
                  fill="#0b132b"
                  stroke="#38bdf8"
                  strokeWidth="2"
                />
                <text
                  x={hub.x + offset.dx}
                  y={hub.y + offset.dy}
                  textAnchor={offset.anchor}
                  className="fill-slate-300 font-sans text-[12px] font-medium"
                >
                  {hub.name}
                </text>
              </g>
            );
          })}

          {/* Fahrzeuge – animiert */}
          <g className="motion-reduce:hidden">
            {trucks.map((truck) => (
              <g key={truck.route}>
                <circle r="9" fill="#00e5ff" fillOpacity="0.18" />
                <circle r="4" fill="#00e5ff" stroke="#0b132b" strokeWidth="1.5" />
                <animateMotion
                  dur={truck.dur}
                  begin={truck.begin}
                  repeatCount="indefinite"
                  keyPoints="0;1;0"
                  keyTimes="0;0.5;1"
                  calcMode="linear"
                >
                  {/* xlink:href statt href: breiteste Unterstützung (ältere Safari-Versionen) */}
                  <mpath xlinkHref={`#${truck.route}`} />
                </animateMotion>
              </g>
            ))}
          </g>

          {/* Fahrzeuge – statisch (reduced motion) */}
          <g className="hidden motion-reduce:inline">
            {trucks.map((truck) => (
              <circle
                key={truck.route}
                cx={truck.fallback.x}
                cy={truck.fallback.y}
                r="4"
                fill="#00e5ff"
                stroke="#0b132b"
                strokeWidth="1.5"
              />
            ))}
          </g>

          {/* Callout einer Beispiel-Tour (auf kleinen Screens ausgeblendet) */}
          <g transform="translate(372 318)" className="max-sm:hidden">
            <rect width="168" height="54" rx="10" fill="rgb(28 37 65 / 0.92)" stroke="rgb(255 255 255 / 0.12)" />
            <text x="14" y="22" className="fill-white font-sans text-[11px] font-semibold">
              Tour 042 · München → Wien
            </text>
            <text x="14" y="40" className="fill-slate-400 font-sans text-[10px]">
              86 km/h · ETA 16:05 · Im Plan
            </text>
          </g>
        </svg>
      </div>

      <StatList
        stats={fleetLiveKpis}
        className="grid-cols-3 divide-x divide-white/10 px-2 py-4 text-center"
        itemClassName="px-2"
        valueClassName="text-xl text-white sm:text-2xl"
        labelClassName="mt-1 text-xs text-slate-400"
      />
    </div>
  );
}

import { appMap } from "@/content/app-map.generated";
import { trackingDemo } from "@/content/app";

const { route, labels, width, height } = appMap;

/** Beschriftungen, die nicht mit Start, Ziel oder ETA-Blase kollidieren. */
const visibleLabels = labels.filter(
  (label) =>
    Math.hypot(label.x - route.origin.x, label.y - route.origin.y) > 40 &&
    Math.hypot(label.x - route.destination.x, label.y - route.destination.y) > 40,
);

/**
 * Route über der statischen Karte (gleiches Koordinatensystem 390 × 844).
 * Das Fahrzeug sitzt per animateMotion exakt bei `progress` auf dem Pfad –
 * ohne Koordinaten-Berechnung; der gefahrene Abschnitt nutzt pathLength.
 */
export function RouteLayer() {
  const traveled = Math.round(trackingDemo.progress * 100);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="absolute inset-0 size-full" aria-hidden="true">
      <defs>
        <path id="app-route" d={route.path} />
      </defs>

      {visibleLabels.map((label) => (
        <text
          key={label.text}
          x={label.x}
          y={label.y}
          textAnchor="middle"
          className={
            label.kind === "water"
              ? "fill-[#3d5a80] font-sans text-[10px] italic"
              : "fill-[#8a9bbd] font-sans text-[8.5px] font-semibold tracking-[0.08em] uppercase"
          }
          stroke="#101b35"
          strokeWidth={3}
          paintOrder="stroke"
          opacity={label.kind === "water" ? 1 : 0.7}
        >
          {label.text}
        </text>
      ))}

      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <use href="#app-route" stroke="#38bdf8" strokeOpacity={0.2} strokeWidth={14} />
        <use href="#app-route" stroke="#0b132b" strokeOpacity={0.85} strokeWidth={8} />
        <use href="#app-route" stroke="#38bdf8" strokeOpacity={0.4} strokeWidth={4.5} />
        <path d={route.path} pathLength={100} stroke="#38bdf8" strokeWidth={5} strokeDasharray={`${traveled} 100`} />
        {/* Datenfluss auf der Reststrecke */}
        <use href="#app-route" stroke="#ffffff" strokeOpacity={0.5} strokeWidth={1.5} strokeDasharray="1 11" className="animate-route-flow" />
      </g>

      {/* Start */}
      <circle cx={route.origin.x} cy={route.origin.y} r={6} fill="#0b132b" stroke="#38bdf8" strokeWidth={3} />

      {/* Ziel */}
      <g transform={`translate(${route.destination.x} ${route.destination.y})`}>
        <path d="M0 0C-2-8-9-11-9-18a9 9 0 1 1 18 0c0 7-7 10-9 18z" fill="#ffffff" stroke="#0b132b" strokeWidth={1.5} />
        <circle cy={-18} r={3.5} fill="#0b132b" />
      </g>

      {/* Fahrzeug + ETA */}
      <g>
        <animateMotion dur="1s" fill="freeze" keyPoints={`${trackingDemo.progress};${trackingDemo.progress}`} keyTimes="0;1" calcMode="linear">
          <mpath xlinkHref="#app-route" />
        </animateMotion>
        <circle r={17} fill="#38bdf8" fillOpacity={0.25} className="origin-center animate-pulse-ring [transform-box:fill-box]" />
        <circle r={11} fill="#ffffff" />
        <circle r={8.5} fill="#38bdf8" />
        {/* Lucide „truck“, skaliert */}
        <g transform="translate(-6 -6) scale(0.5)" fill="none" stroke="#0b132b" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2M15 18H9M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
          <circle cx={17} cy={18} r={2} />
          <circle cx={7} cy={18} r={2} />
        </g>
        <g transform="translate(0 -34)">
          <rect x={-36} y={-12} width={72} height={24} rx={12} fill="#0b132b" stroke="#38bdf8" strokeOpacity={0.55} />
          <path d="M-5 11.5 0 17 5 11.5z" fill="#0b132b" />
          <text textAnchor="middle" y={4} className="fill-white font-sans text-[10.5px] font-bold">
            ETA {trackingDemo.etaTime}
          </text>
        </g>
      </g>
    </svg>
  );
}

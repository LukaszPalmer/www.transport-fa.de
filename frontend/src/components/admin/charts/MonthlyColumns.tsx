"use client";

import { useId, useMemo, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Säulendiagramm je Monat (SVG, eine Y-Achse in Euro). 1–2 Reihen nebeneinander; Hover und
 * Tastaturfokus zeigen alle Werte eines Monats, darunter die Werte zusätzlich als Tabelle.
 * Farben geprüft (Dataviz-Validator, heller Hintergrund): Blau #2a78d6 / Orange #eb6834.
 */

export interface ColumnSeries {
  key: string;
  label: string;
  /** Werte in Cent, gleiche Reihenfolge wie `months`. */
  values: number[];
}

const COLORS = ["#2a78d6", "#eb6834"];
const HEIGHT = 240;
const PAD = { top: 16, right: 12, bottom: 28, left: 64 };
const BAR_MAX = 24;
const GAP = 2;

const monthLabel = new Intl.DateTimeFormat("de-DE", { month: "short" });
const monthLong = new Intl.DateTimeFormat("de-DE", { month: "long", year: "numeric" });
const euro = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });
const euroCompact = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", notation: "compact", maximumFractionDigits: 1 });

const toDate = (month: string) => new Date(`${month}-15T12:00:00Z`);

/** Runde Achsenteilung (1, 2, 2,5, 5 × 10^n). */
function niceTicks(max: number): number[] {
  if (max <= 0) return [0];
  const rough = max / 4;
  const power = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 2.5, 5, 10].map((factor) => factor * power).find((candidate) => candidate >= rough) ?? rough;
  const ticks: number[] = [];
  for (let value = 0; value <= max + step * 0.001; value += step) ticks.push(value);
  if (ticks[ticks.length - 1]! < max) ticks.push(ticks[ticks.length - 1]! + step);
  return ticks;
}

export function MonthlyColumns({ months, series, title, className }: { months: string[]; series: ColumnSeries[]; title: string; className?: string }) {
  const id = useId();
  const [active, setActive] = useState<number | null>(null);
  const width = 720;

  const { ticks, max } = useMemo(() => {
    const top = Math.max(0, ...series.flatMap((entry) => entry.values)) / 100;
    const scale = niceTicks(top);
    return { ticks: scale, max: scale[scale.length - 1] || 1 };
  }, [series]);

  const plotWidth = width - PAD.left - PAD.right;
  const plotHeight = HEIGHT - PAD.top - PAD.bottom;
  const band = plotWidth / Math.max(months.length, 1);
  const barWidth = Math.min(BAR_MAX, (band * 0.7 - GAP * (series.length - 1)) / series.length);
  const groupWidth = barWidth * series.length + GAP * (series.length - 1);
  const y = (euros: number) => PAD.top + plotHeight - (Math.max(euros, 0) / max) * plotHeight;

  /** Säule mit 4 px gerundetem Ende oben, eckig an der Grundlinie. */
  const barPath = (x: number, value: number) => {
    const top = y(value);
    const bottom = PAD.top + plotHeight;
    const height = bottom - top;
    if (height <= 0) return "";
    const r = Math.min(4, height, barWidth / 2);
    return `M${x},${bottom} V${top + r} Q${x},${top} ${x + r},${top} H${x + barWidth - r} Q${x + barWidth},${top} ${x + barWidth},${top + r} V${bottom} Z`;
  };

  const tooltipLeft = active === null ? 0 : ((PAD.left + band * active + band / 2) / width) * 100;

  return (
    <figure className={cn("relative", className)} aria-labelledby={`${id}-title`}>
      <figcaption id={`${id}-title`} className="sr-only">
        {title}
      </figcaption>
      {series.length > 1 && (
        <ul className="mb-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-600" aria-label="Legende">
          {series.map((entry, index) => (
            <li key={entry.key} className="flex items-center gap-2">
              <span aria-hidden="true" className="inline-block size-2.5 rounded-sm" style={{ background: COLORS[index] }} />
              {entry.label}
            </li>
          ))}
        </ul>
      )}

      <div className="relative">
        <svg viewBox={`0 0 ${width} ${HEIGHT}`} className="block h-auto w-full" role="img" aria-label={title} onPointerLeave={() => setActive(null)}>
          {ticks.map((tick) => (
            <g key={tick}>
              <line x1={PAD.left} x2={width - PAD.right} y1={y(tick)} y2={y(tick)} stroke="#e2e8f0" strokeWidth={1} />
              <text x={PAD.left - 8} y={y(tick)} dy="0.32em" textAnchor="end" className="fill-slate-500 text-[11px] tabular-nums">
                {euroCompact.format(tick)}
              </text>
            </g>
          ))}

          {months.map((month, index) => {
            const x0 = PAD.left + band * index + (band - groupWidth) / 2;
            return (
              <g
                key={month}
                tabIndex={0}
                role="button"
                aria-label={`${monthLong.format(toDate(month))}: ${series.map((entry) => `${entry.label} ${euro.format((entry.values[index] ?? 0) / 100)}`).join(", ")}`}
                onPointerEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                onBlur={() => setActive(null)}
                className="cursor-default outline-none"
              >
                {/* Trefferfläche: ganzes Monatsband, nicht nur die Säule */}
                <rect x={PAD.left + band * index} y={PAD.top} width={band} height={plotHeight} fill={active === index ? "#f1f5f9" : "transparent"} />
                {series.map((entry, seriesIndex) => (
                  <path key={entry.key} d={barPath(x0 + seriesIndex * (barWidth + GAP), (entry.values[index] ?? 0) / 100)} fill={COLORS[seriesIndex]} />
                ))}
                <text x={PAD.left + band * index + band / 2} y={HEIGHT - 8} textAnchor="middle" className="fill-slate-500 text-[11px]">
                  {monthLabel.format(toDate(month))}
                </text>
              </g>
            );
          })}
          <line x1={PAD.left} x2={width - PAD.right} y1={PAD.top + plotHeight} y2={PAD.top + plotHeight} stroke="#cbd5e1" strokeWidth={1} />
        </svg>

        {active !== null && (
          <div
            role="status"
            className="pointer-events-none absolute top-2 z-10 min-w-40 -translate-x-1/2 rounded-xl bg-white px-3 py-2 text-xs shadow-elevated ring-1 ring-primary/10"
            style={{ left: `${Math.min(Math.max(tooltipLeft, 12), 88)}%` }}
          >
            <p className="mb-1 font-semibold text-slate-500">{monthLong.format(toDate(months[active]!))}</p>
            {series.map((entry, index) => (
              <p key={entry.key} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <span aria-hidden="true" className="inline-block h-0.5 w-3 rounded" style={{ background: COLORS[index] }} />
                  {entry.label}
                </span>
                <strong className="text-primary tabular-nums">{euro.format((entry.values[active] ?? 0) / 100)}</strong>
              </p>
            ))}
          </div>
        )}
      </div>

      <details className="mt-3 text-sm">
        <summary className="cursor-pointer text-xs font-semibold text-accent-ink">Werte als Tabelle</summary>
        <table className="mt-2 w-full text-left text-xs">
          <thead className="text-slate-500">
            <tr>
              <th className="py-1 pr-3 font-semibold">Monat</th>
              {series.map((entry) => (
                <th key={entry.key} className="py-1 pr-3 text-right font-semibold">
                  {entry.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {months.map((month, index) => (
              <tr key={month} className="border-t border-slate-100">
                <td className="py-1 pr-3">{monthLong.format(toDate(month))}</td>
                {series.map((entry) => (
                  <td key={entry.key} className="py-1 pr-3 text-right tabular-nums">
                    {euro.format((entry.values[index] ?? 0) / 100)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}

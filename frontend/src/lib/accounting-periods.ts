/** Zeiträume als JJJJ-MM-TT (deutsche Zeit) – Monat, Quartal, Jahr jeweils aktuell und vorher. */
export function periodPresets(now = new Date()): Array<{ key: string; label: string; from: string; to: string }> {
  const [year, month] = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin" }).format(now).split("-").map(Number) as [number, number];
  const pad = (value: number) => String(value).padStart(2, "0");
  const lastDay = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate();
  const range = (y: number, fromMonth: number, toMonth: number) => ({ from: `${y}-${pad(fromMonth)}-01`, to: `${y}-${pad(toMonth)}-${pad(lastDay(y, toMonth))}` });
  const quarter = Math.floor((month - 1) / 3);
  const prevMonth = month === 1 ? { y: year - 1, m: 12 } : { y: year, m: month - 1 };
  const prevQuarter = quarter === 0 ? { y: year - 1, q: 3 } : { y: year, q: quarter - 1 };
  return [
    { key: "month", label: "Dieser Monat", ...range(year, month, month) },
    { key: "prev-month", label: "Letzter Monat", ...range(prevMonth.y, prevMonth.m, prevMonth.m) },
    { key: "quarter", label: "Dieses Quartal", ...range(year, quarter * 3 + 1, quarter * 3 + 3) },
    { key: "prev-quarter", label: "Letztes Quartal", ...range(prevQuarter.y, prevQuarter.q * 3 + 1, prevQuarter.q * 3 + 3) },
    { key: "year", label: "Dieses Jahr", ...range(year, 1, 12) },
    { key: "prev-year", label: "Letztes Jahr", ...range(year - 1, 1, 12) },
  ];
}

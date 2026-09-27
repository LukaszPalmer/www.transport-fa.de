"use client";

import type { AdminCustomerRow } from "@fa/shared";
import { ChevronRight, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { routes } from "@/content/navigation";
import { formatRelative } from "@/lib/admin-format";
import { useAdminRealtime } from "../realtime/AdminRealtime";
import { EmptyRow, OnlineDot, tableClasses } from "../ui";

/** Hook: aktueller Zeitpunkt, alle 30 s neu – hält „vor 5 Min." frisch. */
export function useNow(intervalMs = 30_000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return now;
}

/** Kundenliste – Online-Status und „zuletzt online" live über Socket.IO. */
export function CustomerTable({ customers }: { customers: AdminCustomerRow[] }) {
  const { customerPresence } = useAdminRealtime();
  const now = useNow();

  return (
    <div className={tableClasses.wrapper}>
      <table className={tableClasses.table}>
        <thead className={tableClasses.head}>
          <tr>
            <th className={tableClasses.th}>Kunde</th>
            <th className={tableClasses.th}>Kundennr.</th>
            <th className={tableClasses.th}>E-Mail</th>
            <th className={tableClasses.th}>Status</th>
            <th className={tableClasses.th}>Aufträge</th>
            <th className={tableClasses.th}>Letzte Unterhaltung</th>
            <th className={tableClasses.th}>
              <span className="sr-only">Öffnen</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {customers.length === 0 && <EmptyRow colSpan={7}>Keine Kunden gefunden.</EmptyRow>}
          {customers.map((customer) => {
            const live = customerPresence[customer.userId];
            const online = live?.online ?? customer.online;
            const lastSeenAt = live?.lastSeenAt ?? customer.lastSeenAt;
            const href = `${routes.adminUsers}/${customer.id}`;
            return (
              <tr key={customer.id} className={`${tableClasses.row} relative`}>
                <td className={tableClasses.td}>
                  <Link href={href} className="font-semibold text-primary after:absolute after:inset-0 hover:text-accent-ink">
                    {customer.companyName || customer.name}
                  </Link>
                  {customer.companyName && <p className="text-xs text-slate-500">{customer.name}</p>}
                  {customer.billingAddress ? (
                    <p className="text-xs text-slate-500">
                      {customer.billingAddress.postalCode} {customer.billingAddress.city}
                    </p>
                  ) : (
                    <p className="text-xs font-semibold text-amber-700">Adresse fehlt</p>
                  )}
                </td>
                <td className={`${tableClasses.td} font-mono text-xs text-slate-700`}>{customer.customerNumber}</td>
                <td className={tableClasses.td}>
                  <span className="text-slate-700">{customer.email}</span>
                  {!customer.emailVerified && <p className="text-xs font-semibold text-amber-700">nicht bestätigt</p>}
                </td>
                <td className={tableClasses.td}>
                  <span className="flex items-center gap-2 whitespace-nowrap">
                    <OnlineDot online={online} />
                    <span className={online ? "font-semibold text-emerald-700" : "text-slate-500"}>
                      {online ? "Online" : lastSeenAt ? `zuletzt ${formatRelative(lastSeenAt, now)}` : "noch nie online"}
                    </span>
                  </span>
                </td>
                <td className={`${tableClasses.td} text-slate-700`}>{customer.activeShipments ? `${customer.activeShipments} aktiv` : "–"}</td>
                <td className={tableClasses.td}>
                  {customer.lastConversation ? (
                    <div className="max-w-64">
                      <p className="flex items-center gap-1.5 text-xs text-slate-500">
                        <MessageSquare aria-hidden="true" className="size-3" />
                        {formatRelative(customer.lastConversation.at, now)}
                        {customer.lastConversation.open && <span className="rounded-full bg-accent/15 px-1.5 text-[0.625rem] font-bold text-accent-ink uppercase">offen</span>}
                      </p>
                      <p className="truncate text-slate-700">{customer.lastConversation.preview}</p>
                    </div>
                  ) : (
                    <span className="text-slate-400">–</span>
                  )}
                </td>
                <td className={`${tableClasses.td} text-right`}>
                  <ChevronRight aria-hidden="true" className="ml-auto size-4 text-slate-400" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Online-Status eines einzelnen Kunden (Detailseite) – live aktualisiert. */
export function LiveOnlineStatus({ userId, online, lastSeenAt }: { userId: string; online: boolean; lastSeenAt?: string }) {
  const { customerPresence } = useAdminRealtime();
  const now = useNow();
  const live = customerPresence[userId];
  const isOnline = live?.online ?? online;
  const seen = live?.lastSeenAt ?? lastSeenAt;
  return (
    <span className="inline-flex items-center gap-2 text-sm">
      <OnlineDot online={isOnline} />
      <span className={isOnline ? "font-semibold text-emerald-700" : "text-slate-500"}>
        {isOnline ? "Jetzt online" : seen ? `Zuletzt online ${formatRelative(seen, now)}` : "Noch nie online"}
      </span>
    </span>
  );
}

"use client";

import { SHIPMENT_STATUSES, type AdminShipmentRow, type ShipmentStatus } from "@fa/shared";
import { FileText, Phone, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { routes } from "@/content/navigation";
import { cn } from "@/lib/cn";
import { serviceLabel } from "@/lib/admin-format";
import { apiRequest } from "@/lib/api/client";
import { errorMessage } from "@/lib/api/errors";
import { formatDateTime, shipmentStatus } from "@/lib/portal-format";
import { StatusBadge } from "@/components/portal/dashboard/ui";
import { EmptyRow, tableClasses } from "../ui";
import { DriverDialog } from "./DriverDialog";

/** Auftragsliste mit Status-Pflege und Fahrer-Zuweisung (je nach Recht). */
export function ShipmentTable({
  shipments,
  canManageOrders,
  canManageDrivers,
  hideCustomer,
  emptyText = "Keine Aufträge gefunden.",
}: {
  shipments: AdminShipmentRow[];
  canManageOrders: boolean;
  canManageDrivers: boolean;
  hideCustomer?: boolean;
  emptyText?: string;
}) {
  const router = useRouter();
  const [rows, setRows] = useState(shipments);
  const [driverFor, setDriverFor] = useState<AdminShipmentRow>();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [source, setSource] = useState(shipments);

  // Neue Daten vom Server (Filter, Neuladen) übernehmen.
  if (source !== shipments) {
    setSource(shipments);
    setRows(shipments);
  }

  const replace = (row: AdminShipmentRow) => {
    setRows((current) => current.map((item) => (item.id === row.id ? row : item)));
    router.refresh();
  };

  const changeStatus = async (row: AdminShipmentRow, status: ShipmentStatus) => {
    setErrors((current) => ({ ...current, [row.id]: "" }));
    try {
      replace(await apiRequest<AdminShipmentRow>(`/admin/shipments/${row.id}/status`, { method: "PATCH", body: { status } }));
    } catch (error) {
      setErrors((current) => ({ ...current, [row.id]: errorMessage(error) }));
    }
  };

  const columns = hideCustomer ? 6 : 7;

  return (
    <>
      <div className={tableClasses.wrapper}>
        <table className={tableClasses.table}>
          <thead className={tableClasses.head}>
            <tr>
              <th className={tableClasses.th}>Auftrag</th>
              {!hideCustomer && <th className={tableClasses.th}>Kunde</th>}
              <th className={tableClasses.th}>Strecke</th>
              <th className={tableClasses.th}>Abholung</th>
              <th className={tableClasses.th}>Status</th>
              <th className={tableClasses.th}>Fahrer & LKW</th>
              <th className={tableClasses.th}>Dok.</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && <EmptyRow colSpan={columns}>{emptyText}</EmptyRow>}
            {rows.map((row) => {
              const closed = row.status === "DELIVERED" || row.status === "CANCELLED";
              return (
                <tr key={row.id} className={tableClasses.row}>
                  <td className={tableClasses.td}>
                    <p className="font-semibold whitespace-nowrap text-primary">{row.shipmentNumber}</p>
                    <p className="text-xs text-slate-500">{serviceLabel(row.service)}</p>
                  </td>
                  {!hideCustomer && (
                    <td className={tableClasses.td}>
                      <Link href={`${routes.adminUsers}/${row.customer.id}`} className="font-semibold text-primary hover:text-accent-ink">
                        {row.customer.name}
                      </Link>
                      <p className="text-xs text-slate-500">{row.customer.customerNumber}</p>
                    </td>
                  )}
                  <td className={cn(tableClasses.td, "text-slate-700")}>
                    {row.pickupCity} → {row.deliveryCity}
                  </td>
                  <td className={cn(tableClasses.td, "whitespace-nowrap text-slate-600")}>{row.plannedPickupAt ? formatDateTime(row.plannedPickupAt) : "–"}</td>
                  <td className={tableClasses.td}>
                    {canManageOrders ? (
                      <select
                        aria-label={`Status von ${row.shipmentNumber}`}
                        value={row.status}
                        onChange={(event) => void changeStatus(row, event.target.value as ShipmentStatus)}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm font-semibold text-primary focus:border-accent-ink focus:outline-none"
                      >
                        {SHIPMENT_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {shipmentStatus[status].label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <StatusBadge tone={shipmentStatus[row.status].tone}>{shipmentStatus[row.status].label}</StatusBadge>
                    )}
                    {errors[row.id] && <p className="mt-1 max-w-48 text-xs font-medium text-red-600">{errors[row.id]}</p>}
                  </td>
                  <td className={tableClasses.td}>
                    {row.driver ? (
                      <div>
                        <p className="font-semibold text-primary">{row.driver.name}</p>
                        <p className="flex items-center gap-1 text-xs text-slate-500">
                          <Phone aria-hidden="true" className="size-3" />
                          <a href={`tel:${row.driver.phone}`} className="hover:text-primary">
                            {row.driver.phone}
                          </a>
                          {row.driver.plate && <span className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.6875rem] text-slate-700">{row.driver.plate}</span>}
                        </p>
                        {canManageDrivers && !closed && (
                          <button type="button" onClick={() => setDriverFor(row)} className="mt-1 text-xs font-semibold text-accent-ink hover:underline">
                            Ändern
                          </button>
                        )}
                      </div>
                    ) : canManageDrivers && !closed ? (
                      <button
                        type="button"
                        onClick={() => setDriverFor(row)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-800 ring-1 ring-amber-200 hover:bg-amber-100"
                      >
                        <UserPlus aria-hidden="true" className="size-3.5" /> Fahrer zuweisen
                      </button>
                    ) : (
                      <span className="text-slate-400">–</span>
                    )}
                  </td>
                  <td className={cn(tableClasses.td, "text-slate-600")}>
                    <span className="inline-flex items-center gap-1">
                      <FileText aria-hidden="true" className="size-3.5 text-slate-400" />
                      {row.documents}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {driverFor && <DriverDialog shipment={driverFor} open onClose={() => setDriverFor(undefined)} onSaved={replace} />}
    </>
  );
}

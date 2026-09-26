"use client";

import type { StaffMe } from "@fa/shared";
import { Bell, BellOff, LayoutDashboard, LoaderCircle, LogOut, MessagesSquare, ReceiptText, Truck, UserCog, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { routes } from "@/content/navigation";
import { cn } from "@/lib/cn";
import { apiRequest } from "@/lib/api/client";
import { Logo } from "@/components/ui/Logo";
import { useAdminRealtime } from "./realtime/AdminRealtime";

type NavItem = { label: string; href: string; icon: typeof Users; visible: boolean; badge?: number };

/** Rahmen des Admin-Bereichs: Seitenleiste (mobil oben), Online-Schalter, Abmelden. */
export function AdminShell({ me, children }: { me: StaffMe; children: ReactNode }) {
  const pathname = usePathname();
  const { unreadChats } = useAdminRealtime();
  const has = (permission: StaffMe["staff"]["permissions"][number]) => me.staff.permissions.includes(permission);

  const items: NavItem[] = [
    { label: "Übersicht", href: routes.admin, icon: LayoutDashboard, visible: true },
    { label: "Kunden", href: routes.adminUsers, icon: Users, visible: has("can_view_customers") },
    { label: "Aufträge", href: routes.adminOrders, icon: Truck, visible: has("can_manage_orders") || has("can_manage_drivers") || has("can_view_customers") },
    { label: "Rechnungen", href: routes.adminInvoices, icon: ReceiptText, visible: has("can_manage_invoices") },
    { label: "Live-Chat", href: routes.adminChat, icon: MessagesSquare, visible: has("can_chat"), badge: unreadChats },
    { label: me.user.role === "ADMIN" ? "Team & Zugang" : "Mein Zugang", href: routes.adminTeam, icon: UserCog, visible: true },
  ];

  return (
    <div className="flex min-h-dvh flex-1 flex-col bg-surface lg:flex-row">
      <aside className="bg-primary text-white lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-64 lg:shrink-0 lg:flex-col">
        <div className="flex items-center justify-between gap-3 px-5 py-4 lg:py-6">
          <Logo href={routes.admin} label="Zur Admin-Übersicht" />
          <span className="rounded-full bg-accent/15 px-2.5 py-1 text-[0.6875rem] font-bold tracking-wider text-accent uppercase">Admin</span>
        </div>

        <nav aria-label="Admin-Bereich" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-1 lg:flex-col lg:overflow-visible lg:pb-0">
          {items
            .filter((item) => item.visible)
            .map((item) => {
              const active = item.href === routes.admin ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                    active ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white",
                  )}
                >
                  <item.icon aria-hidden="true" className={cn("size-5", active && "text-accent")} />
                  {item.label}
                  {item.badge ? (
                    <span className="ml-auto flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
                      {item.badge}
                      <span className="sr-only"> ungelesene Chats</span>
                    </span>
                  ) : null}
                </Link>
              );
            })}
        </nav>

        <div className="hidden border-t border-white/10 p-4 lg:block">
          {has("can_chat") && <PresenceSwitch />}
          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{me.staff.displayName}</p>
              <p className="truncate text-xs text-slate-400">{me.user.role === "ADMIN" ? "Administrator" : (me.staff.jobTitle ?? "Mitarbeiter")}</p>
            </div>
            <SignOut />
          </div>
        </div>
      </aside>

      {/* Mobil: Online-Schalter und Abmelden unter der Navigation */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-2 lg:hidden">
        {has("can_chat") ? <PresenceSwitch compact /> : <span className="text-sm font-semibold text-primary">{me.staff.displayName}</span>}
        <SignOut tone="dark" />
      </div>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

/** Online/Offline für den Live-Chat – nur „Online" darf antworten (serverseitig geprüft). */
function PresenceSwitch({ compact }: { compact?: boolean }) {
  const { presence, setPresence, connection, staffOnline, soundEnabled, setSoundEnabled } = useAdminRealtime();
  const [pending, setPending] = useState(false);
  const online = presence === "ONLINE";

  const toggle = async () => {
    setPending(true);
    try {
      await setPresence(online ? "OFFLINE" : "ONLINE");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className={cn("flex items-center gap-3", !compact && "rounded-2xl bg-white/5 p-3")}>
      <button
        type="button"
        role="switch"
        aria-checked={online}
        onClick={() => void toggle()}
        disabled={pending || connection !== "online"}
        className={cn(
          "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors disabled:opacity-60",
          online ? "bg-emerald-500" : compact ? "bg-slate-300" : "bg-slate-600",
        )}
      >
        <span className={cn("inline-block size-5 rounded-full bg-white shadow transition-transform", online ? "translate-x-6" : "translate-x-1")} />
        <span className="sr-only">Für den Live-Chat online</span>
      </button>
      <div className="min-w-0 flex-1">
        <p className={cn("text-sm font-semibold", compact ? "text-primary" : "text-white")}>
          {pending ? <LoaderCircle aria-hidden="true" className="inline size-4 animate-spin" /> : online ? "Online" : "Offline"}
        </p>
        {!compact && (
          <p className="text-xs text-slate-400">
            {connection !== "online" ? "Verbindung wird hergestellt …" : staffOnline ? "Kunden sehen: Team erreichbar" : "Kunden sehen: niemand online"}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={() => setSoundEnabled(!soundEnabled)}
        aria-pressed={soundEnabled}
        className={cn("rounded-lg p-1.5 transition-colors", compact ? "text-slate-500 hover:bg-slate-100" : "text-slate-400 hover:bg-white/10 hover:text-white")}
      >
        {soundEnabled ? <Bell aria-hidden="true" className="size-4" /> : <BellOff aria-hidden="true" className="size-4" />}
        <span className="sr-only">Ton bei neuen Nachrichten</span>
      </button>
    </div>
  );
}

function SignOut({ tone = "light" }: { tone?: "light" | "dark" }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        await apiRequest("/auth/logout", { method: "POST" }).catch(() => undefined);
        router.replace(routes.adminLogin);
        router.refresh();
      }}
      className={cn(
        "rounded-lg p-2 transition-colors disabled:opacity-60",
        tone === "light" ? "text-slate-400 hover:bg-white/10 hover:text-white" : "text-slate-500 hover:bg-slate-100 hover:text-primary",
      )}
    >
      {pending ? <LoaderCircle aria-hidden="true" className="size-5 animate-spin" /> : <LogOut aria-hidden="true" className="size-5" />}
      <span className="sr-only">Abmelden</span>
    </button>
  );
}

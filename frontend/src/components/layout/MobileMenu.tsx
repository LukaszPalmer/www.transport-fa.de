"use client";

import { ChevronDown, LogIn, Menu, Phone, X } from "lucide-react";
import { useRef, type MouseEvent } from "react";
import { company } from "@/content/company";
import type { NavItem } from "@/types/content";
import { buttonClasses } from "@/components/ui/button-styles";
import { LogoMark } from "@/components/ui/Logo";
import { SmartLink } from "@/components/ui/SmartLink";

/**
 * Mobilmenü auf Basis des nativen <dialog>-Elements:
 * Fokus-Falle, Esc-Taste, inerter Seitenhintergrund und Top-Layer gibt es
 * damit vom Browser – ohne zusätzliche Bibliothek.
 */
export function MobileMenu({ items }: { items: NavItem[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const open = () => dialogRef.current?.showModal();
  const close = () => dialogRef.current?.close();

  // Schließt bei Klick auf einen Link oder auf den Dialog-Hintergrund.
  const handleClick = (event: MouseEvent<HTMLDialogElement>) => {
    const target = event.target as Element;
    if (target === event.currentTarget || target.closest("a")) close();
  };

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-haspopup="dialog"
        aria-controls="mobile-menu"
        className="glass inline-flex size-10 items-center justify-center rounded-xl text-white lg:hidden"
      >
        <Menu aria-hidden="true" className="size-5" />
        <span className="sr-only">Menü öffnen</span>
      </button>

      <dialog
        id="mobile-menu"
        ref={dialogRef}
        aria-label="Hauptmenü"
        onClick={handleClick}
        className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none border-0 bg-primary p-0 text-white opacity-0 transition-[opacity,translate,display,overlay] transition-discrete duration-300 ease-out-expo translate-x-6 open:translate-x-0 open:opacity-100 starting:open:translate-x-6 starting:open:opacity-0 backdrop:bg-primary/60 lg:hidden"
      >
        <div className="flex min-h-full flex-col">
          <div className="container-page flex h-18 items-center justify-between border-b border-white/10">
            <span className="inline-flex items-center gap-3 font-display text-lg leading-none">
              <LogoMark className="size-9" />
              <span>
                <span className="font-extrabold">FA</span> <span className="font-medium">Transport</span>
              </span>
            </span>
            <button
              type="button"
              onClick={close}
              className="glass inline-flex size-10 items-center justify-center rounded-xl"
            >
              <X aria-hidden="true" className="size-5" />
              <span className="sr-only">Menü schließen</span>
            </button>
          </div>

          <nav aria-label="Mobile Navigation" className="container-page flex-1 py-8">
            <ul className="divide-y divide-white/10 border-y border-white/10">
              {items.map((item, index) => {
                const number = (
                  <span aria-hidden="true" className="font-mono text-xs text-slate-500">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                );

                return (
                  <li key={item.href}>
                    {item.children ? (
                      // Untermenü als natives Akkordeon – barrierefrei ohne zusätzliche Logik
                      <details className="group">
                        <summary className="flex cursor-pointer list-none items-center justify-between py-5 font-display text-2xl font-semibold transition-colors hover:text-accent [&::-webkit-details-marker]:hidden">
                          <span className="inline-flex items-center gap-2">
                            {item.label}
                            <ChevronDown
                              aria-hidden="true"
                              className="size-5 text-slate-400 transition-transform duration-300 group-open:rotate-180"
                            />
                          </span>
                          {number}
                        </summary>
                        <ul className="space-y-1 pb-5">
                          {item.children.map((child) => (
                            <li key={child.href}>
                              <SmartLink
                                href={child.href}
                                className="block rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition-colors hover:border-accent/40"
                              >
                                <span className="block font-semibold">{child.label}</span>
                                <span className="mt-0.5 block text-sm text-slate-400">{child.description}</span>
                              </SmartLink>
                            </li>
                          ))}
                          <li>
                            <SmartLink href={item.href} className="block px-4 py-3 text-sm font-medium text-accent">
                              Alle Leistungen im Überblick
                            </SmartLink>
                          </li>
                        </ul>
                      </details>
                    ) : (
                      <SmartLink
                        href={item.href}
                        className="flex items-center justify-between py-5 font-display text-2xl font-semibold transition-colors hover:text-accent"
                      >
                        {item.label}
                        {number}
                      </SmartLink>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="container-page space-y-3 pb-10">
            <SmartLink
              href={company.portalUrl}
              prefetch={false}
              className={buttonClasses({ size: "lg", className: "w-full" })}
            >
              <LogIn aria-hidden="true" className="size-5" />
              Kundenportal
            </SmartLink>
            <a
              href={company.contact.phoneHref}
              className={buttonClasses({ variant: "glass", size: "lg", className: "w-full" })}
            >
              <Phone aria-hidden="true" className="size-5" />
              {company.contact.phone}
            </a>
          </div>
        </div>
      </dialog>
    </>
  );
}

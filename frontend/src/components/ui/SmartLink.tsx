import type { AnchorHTMLAttributes } from "react";
import { LocaleLink } from "./LocaleLink";

type SmartLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  /** Nur für interne Routen: false für dynamische Seiten (z. B. Kundenportal). */
  prefetch?: boolean;
};

const isExternal = (href: string) => /^https?:\/\//.test(href);
const isNative = (href: string) => /^(\/?#|mailto:|tel:)/.test(href) || href.endsWith(".xml");

/**
 * Ein Link-Primitive für alle Ziele:
 * - interne Routen    → next/link in der Sprache der Seite (/en/… auf englischen Seiten)
 * - #Anker und /#Anker, mailto:, tel:, Dateien → natives <a>
 *   (Sprungmarken brauchen keinen Router; spart RSC-Prefetches der Startseite)
 * - externe URLs      → neues Tab mit sicherem rel-Attribut
 */
export function SmartLink({ href, children, prefetch, ...props }: SmartLinkProps) {
  if (isExternal(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  }

  if (isNative(href)) {
    // "/#anker" führt zur Startseite der jeweiligen Sprache – reine "#anker", mailto: und tel: bleiben unverändert.
    return href.startsWith("/") ? (
      <LocaleLink href={href} native {...props}>
        {children}
      </LocaleLink>
    ) : (
      <a href={href} {...props}>
        {children}
      </a>
    );
  }

  return (
    <LocaleLink href={href} prefetch={prefetch} {...props}>
      {children}
    </LocaleLink>
  );
}

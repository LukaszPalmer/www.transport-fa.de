"use client";

import Link from "next/link";
import type { AnchorHTMLAttributes } from "react";
import { useLocale } from "@/i18n/client";
import { localizeHref } from "@/i18n/config";

type LocaleLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  prefetch?: boolean;
  /** Natives <a> ohne Router – für Sprungmarken auf der Startseite ("/#flotte"). */
  native?: boolean;
};

/** Interner Link in der Sprache der aktuellen Seite: auf englischen Seiten führt "/kontakt" nach /en/kontakt. */
export function LocaleLink({ href, native, prefetch, children, ...props }: LocaleLinkProps) {
  const target = localizeHref(href, useLocale());
  return native ? (
    <a href={target} {...props}>
      {children}
    </a>
  ) : (
    <Link href={target} prefetch={prefetch} {...props}>
      {children}
    </Link>
  );
}

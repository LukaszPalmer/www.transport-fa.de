import Link from "next/link";
import { routes } from "@/content/navigation";

export default function AdminNotFound() {
  return (
    <div className="mx-auto mt-24 max-w-md px-6 text-center">
      <p className="font-display text-5xl font-bold text-primary">404</p>
      <p className="mt-4 text-slate-600">Diese Seite gibt es im Admin-Bereich nicht.</p>
      <Link href={routes.admin} className="mt-6 inline-flex font-semibold text-accent-ink underline-offset-4 hover:underline">
        Zur Übersicht
      </Link>
    </div>
  );
}

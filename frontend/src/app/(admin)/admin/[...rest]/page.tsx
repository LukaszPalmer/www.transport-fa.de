import { notFound } from "next/navigation";

/** Unbekannte Admin-URLs → 404 im Admin-Layout. */
export default function AdminCatchAll(): never {
  notFound();
}

import { notFound } from "next/navigation";

/** Unbekannte URLs landen hier und zeigen die 404-Seite der jeweiligen Sprache. */
export default function CatchAll(): never {
  notFound();
}

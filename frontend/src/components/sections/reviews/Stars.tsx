import { Icon } from "@/components/ui/Icon";

/** Sternebewertung (1–5), für Screenreader als Text ausgegeben. */
export function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`${rating} von 5 Sternen`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <Icon
          key={value}
          name="star"
          className={value <= rating ? "size-4 fill-amber-400 text-amber-400" : "size-4 text-slate-300"}
        />
      ))}
    </span>
  );
}

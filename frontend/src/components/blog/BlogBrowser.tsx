"use client";

import { useState, useSyncExternalStore } from "react";
import type { BlogCategory, BlogPost } from "@/content/blog";
import { useLocale } from "@/i18n/client";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { PostCard } from "./PostCard";

// Vorauswahl aus ?kategorie=… – liest die URL erst nach der Hydration (Seite bleibt statisch).
const noopSubscribe = () => () => {};
const readCategoryFromUrl = () => new URLSearchParams(window.location.search).get("kategorie");

/**
 * Beitragsübersicht mit Kategorie-Filter. Der Aufmacher (featured bzw. neuester Beitrag)
 * steht groß oben, sobald kein Filter aktiv ist. Filter landet in der URL (teilbar).
 */
export function BlogBrowser({ posts, categories }: { posts: BlogPost[]; categories: BlogCategory[] }) {
  const locale = useLocale();
  const en = locale === "en";
  const categoryOf = (slug: string) => categories.find((category) => category.slug === slug);
  const urlCategory = useSyncExternalStore(noopSubscribe, readCategoryFromUrl, () => null);
  const [chosen, setChosen] = useState<string | null>();
  const active = chosen !== undefined ? chosen : categories.some((category) => category.slug === urlCategory) ? urlCategory : null;

  const select = (slug: string | null) => {
    setChosen(slug);
    const url = new URL(window.location.href);
    if (slug) url.searchParams.set("kategorie", slug);
    else url.searchParams.delete("kategorie");
    window.history.replaceState(null, "", url);
  };

  const filtered = active ? posts.filter((post) => post.category === active) : posts;
  const lead = active ? undefined : (posts.find((post) => post.featured) ?? posts[0]);
  const rest = lead ? filtered.filter((post) => post !== lead) : filtered;
  const counts = new Map(categories.map((category) => [category.slug, posts.filter((post) => post.category === category.slug).length]));

  return (
    <div>
      <div role="toolbar" aria-label={en ? "Filter by topic" : "Nach Thema filtern"} className="flex flex-wrap gap-2">
        <FilterChip active={!active} onClick={() => select(null)} label={en ? "All topics" : "Alle Themen"} count={posts.length} />
        {categories
          .filter((category) => (counts.get(category.slug) ?? 0) > 0)
          .map((category) => (
            <FilterChip
              key={category.slug}
              active={active === category.slug}
              onClick={() => select(category.slug)}
              label={category.name}
              count={counts.get(category.slug) ?? 0}
              icon={category.icon}
            />
          ))}
      </div>

      {lead && <PostCard post={lead} category={categoryOf(lead.category)} locale={locale} variant="featured" className="mt-10" />}

      {rest.length > 0 && (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((post) => (
            <PostCard key={post.slug} post={post} category={categoryOf(post.category)} locale={locale} />
          ))}
        </div>
      )}

      {filtered.length === 0 && <p className="mt-10 text-center text-slate-500">{en ? "There are no articles on this topic yet." : "Zu diesem Thema gibt es noch keine Beiträge."}</p>}
    </div>
  );
}

function FilterChip({ active, onClick, label, count, icon }: { active: boolean; onClick: () => void; label: string; count: number; icon?: BlogCategory["icon"] }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ring-1 transition-colors duration-300",
        active ? "bg-primary text-white ring-primary" : "bg-white text-slate-600 ring-slate-200 hover:text-primary hover:ring-slate-300",
      )}
    >
      {icon && <Icon name={icon} className={cn("size-4", active ? "text-accent" : "text-slate-400")} />}
      {label}
      <span className={cn("rounded-full px-1.5 text-xs", active ? "bg-white/15" : "bg-slate-100")}>{count}</span>
    </button>
  );
}

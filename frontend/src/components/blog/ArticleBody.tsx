import Image from "next/image";
import { headingId, type BlogBlock } from "@/content/blog";
import { Icon } from "@/components/ui/Icon";
import { SmartLink } from "@/components/ui/SmartLink";

/**
 * Setzt die Textblöcke eines Beitrags in eine ruhige Lesetypografie (~70 Zeichen je Zeile).
 * Alle Texte sind reiner Text – React escaped sie, es wird nie HTML eingeschleust.
 */
export function ArticleBody({ blocks }: { blocks: BlogBlock[] }) {
  return (
    <div className="text-lg leading-8 text-slate-700 [&>*+*]:mt-6">
      {blocks.map((block, index) => (
        <Block key={index} block={block} />
      ))}
    </div>
  );
}

function Block({ block }: { block: BlogBlock }) {
  switch (block.type) {
    case "paragraph":
      return <p className="hyphens-auto">{block.text}</p>;

    case "heading":
      return (
        <h2 id={headingId(block.text)} className="!mt-14 scroll-mt-28 text-2xl leading-tight font-bold text-primary sm:text-3xl">
          {block.text}
        </h2>
      );

    case "subheading":
      return <h3 className="!mt-10 text-xl leading-snug font-bold text-primary">{block.text}</h3>;

    case "list": {
      const ListTag = block.ordered ? "ol" : "ul";
      return (
        <ListTag className="space-y-3">
          {block.items.map((item, index) => (
            <li key={item} className="flex gap-4">
              {block.ordered ? (
                <span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-accent">{index + 1}</span>
              ) : (
                <span aria-hidden="true" className="mt-3 size-2 shrink-0 rounded-full bg-accent" />
              )}
              <span>{item}</span>
            </li>
          ))}
        </ListTag>
      );
    }

    case "checklist":
      return (
        <div className="rounded-3xl bg-surface p-6 ring-1 ring-slate-200/80 sm:p-8">
          {block.title && (
            <p className="flex items-center gap-2 text-sm font-bold tracking-wide text-primary uppercase">
              <Icon name="check" className="size-4 text-accent-ink" strokeWidth={2.5} />
              {block.title}
            </p>
          )}
          <ul className="mt-4 space-y-3 text-base leading-7">
            {block.items.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-md bg-accent text-primary">
                  <Icon name="check" className="size-3.5" strokeWidth={3} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      );

    case "table":
      return (
        <figure className="!mt-10">
          <div className="overflow-x-auto rounded-2xl ring-1 ring-slate-200">
            <table className="w-full min-w-[32rem] border-collapse text-left text-base leading-6">
              <caption className="bg-surface px-5 py-4 text-left text-sm font-bold tracking-wide text-primary uppercase">
                {block.caption}
              </caption>
              <thead>
                <tr className="bg-primary text-white">
                  {block.head.map((cell) => (
                    <th key={cell} scope="col" className="px-5 py-3 text-sm font-semibold">
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {block.rows.map((row) => (
                  <tr key={row.join("|")} className="even:bg-surface/60">
                    {row.map((cell, index) =>
                      index === 0 ? (
                        <th key={index} scope="row" className="px-5 py-3 font-semibold text-primary">
                          {cell}
                        </th>
                      ) : (
                        <td key={index} className="px-5 py-3 text-slate-700">
                          {cell}
                        </td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {block.note && <figcaption className="mt-3 text-sm leading-6 text-slate-500">{block.note}</figcaption>}
        </figure>
      );

    case "link":
      return (
        <SmartLink
          href={block.href}
          className="group flex items-center justify-between gap-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card transition-[border-color,box-shadow] duration-300 hover:border-accent/50 hover:shadow-card-hover sm:p-6"
        >
          <span>
            <span className="block text-xs font-bold tracking-[0.14em] text-accent-ink uppercase">Lesetipp</span>
            <span className="mt-1 block font-display text-lg leading-snug font-bold text-primary">{block.label}</span>
            {block.text && <span className="mt-1 block text-base leading-6 text-slate-600">{block.text}</span>}
          </span>
          <Icon name="arrow-right" className="size-5 shrink-0 text-accent-ink transition-transform duration-300 group-hover:translate-x-1" />
        </SmartLink>
      );

    case "tip":
      return (
        <aside className="relative overflow-hidden rounded-3xl bg-primary p-6 text-base leading-7 text-slate-300 sm:p-8">
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(24rem_14rem_at_100%_0%,rgb(56_189_248/0.2),transparent_70%)]" />
          <p className="relative flex items-center gap-2 font-bold text-white">
            <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-primary">
              <Icon name="sparkles" className="size-4" />
            </span>
            {block.title}
          </p>
          <p className="relative mt-3">{block.text}</p>
        </aside>
      );

    case "quote":
      return (
        <figure className="border-l-4 border-accent py-1 pl-6">
          <blockquote className="font-display text-2xl leading-snug font-semibold text-primary">„{block.text}“</blockquote>
          {block.cite && <figcaption className="mt-3 text-sm text-slate-500">— {block.cite}</figcaption>}
        </figure>
      );

    case "image":
      return (
        <figure className="!mt-10">
          <div className="relative aspect-[16/9] overflow-hidden rounded-3xl bg-slate-100">
            <Image src={block.src} alt={block.alt} fill sizes="(min-width: 1024px) 46rem, 100vw" quality={70} className="object-cover" />
          </div>
          {block.caption && <figcaption className="mt-3 text-center text-sm text-slate-500">{block.caption}</figcaption>}
        </figure>
      );
  }
}

import Link from "next/link";
import type { Author } from "@/lib/mdarek-api/types";
import { authorSortKey } from "@/lib/format";

export function WriterCard({
  author,
  articleCount,
}: {
  author: Author;
  articleCount: number;
}) {
  return (
    <Link
      href={`/writers/${encodeURIComponent(author.slug)}`}
      className="group flex flex-col items-center rounded-md border border-line bg-raise p-6 text-center shadow-[var(--shadow-warm)] transition-shadow hover:shadow-lg"
    >
      <span className="flex size-16 items-center justify-center rounded-full border-2 border-gold bg-leather-soft font-head text-2xl font-bold text-leather">
        {authorSortKey(author.name).charAt(0)}
      </span>
      <h3 className="mt-3 font-bold text-ink transition-colors group-hover:text-leather">
        {author.name}
      </h3>
      {author.country && <p className="mt-1 text-xs text-soft">{author.country}</p>}
      <span className="mt-3 rounded-full border border-line px-3 py-0.5 text-xs text-soft">
        {articleCount} {articleCount === 1 ? "مادة" : "مواد"}
      </span>
    </Link>
  );
}

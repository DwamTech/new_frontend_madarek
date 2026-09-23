import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Clock } from "lucide-react";
import { getAuthors } from "@/lib/mdarek-api";
import { SectionBadge } from "@/components/section-mark";

type Props = { params: Promise<{ slug: string }> };

async function findAuthor(slugParam: string) {
  const slug = decodeURIComponent(slugParam);
  const authors = await getAuthors();
  return authors.find((a) => a.author.slug === slug) ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = await findAuthor(slug);
  if (!entry) return {};
  return {
    title: entry.author.name,
    description: `إنتاج ${entry.author.name} في مجلة مدارك.`,
  };
}

export default async function WriterPage({ params }: Props) {
  const { slug } = await params;
  const entry = await findAuthor(slug);
  if (!entry) notFound();

  const { author, articles } = entry;
  const issues = new Set(articles.map((a) => a.issueNumber));

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 lg:px-6">
      <header className="flex flex-col items-start gap-6 rounded-md border border-line bg-raise p-8 shadow-[var(--shadow-warm)] sm:flex-row">
        <span className="flex size-24 shrink-0 items-center justify-center rounded-full border-2 border-gold bg-leather-soft text-4xl font-bold text-leather">
          {author.name.replace(/^(د|أ|م)\.\s*/, "").charAt(0)}
        </span>
        <div>
          <h1 className="text-2xl font-bold text-ink">{author.name}</h1>
          {author.country && (
            <p className="mt-1 text-sm font-semibold text-soft">{author.country}</p>
          )}
          <div className="mt-4 flex gap-2">
            <span className="rounded-full bg-leather-soft px-3.5 py-1 text-sm font-bold text-leather">
              {articles.length} {articles.length === 1 ? "مادة" : "مواد"}
            </span>
            <span className="rounded-full border border-line px-3.5 py-1 text-sm text-soft">
              شارك في {issues.size} {issues.size === 1 ? "عدد" : "أعداد"}
            </span>
          </div>
        </div>
      </header>

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-bold text-ink">إنتاجه في المجلة</h2>
        <ul className="overflow-hidden rounded-md border border-line bg-raise">
          {articles.map((a) => (
            <li key={a.id} className="border-b border-line last:border-0">
              <Link
                href={`/articles/${a.id}`}
                className="group flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-4 transition-colors hover:bg-surface"
              >
                <SectionBadge slug={a.sectionSlug} name={a.sectionName} />
                <span className="min-w-0 flex-1 font-semibold leading-7 text-ink group-hover:text-leather">
                  {a.title}
                </span>
                <span className="text-xs text-soft">العدد {a.issueNumber}</span>
                <span className="flex items-center gap-1 text-xs text-soft">
                  <Clock className="size-3.5" />
                  {a.readingMinutes} د
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { getIssueByNumber } from "@/lib/mdarek-api";
import { ArticleCard } from "@/components/article-card";

type Props = { params: Promise<{ number: string; slug: string }> };

async function loadDossier(numberParam: string, slug: string) {
  const number = Number(numberParam);
  if (!Number.isInteger(number)) return null;
  const issue = await getIssueByNumber(number);
  const dossier = issue?.dossiers.find((d) => d.slug === slug) ?? null;
  if (!issue || !dossier) return null;
  return { issue, dossier };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { number, slug } = await params;
  const found = await loadDossier(number, slug);
  if (!found) return {};
  return {
    title: `${found.dossier.title} — ${found.issue.title}`,
    description: found.dossier.intro || undefined,
    openGraph: found.dossier.cover
      ? { images: [{ url: found.dossier.cover.url }] }
      : undefined,
  };
}

export default async function DossierPage({ params }: Props) {
  const { number, slug } = await params;
  const found = await loadDossier(number, slug);
  if (!found) notFound();
  const { issue, dossier } = found;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
      <Link
        href={`/issues/${issue.number}`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-lapis hover:underline"
      >
        <ArrowRight className="size-4" />
        {issue.title}
      </Link>

      <header className="mt-6 grid gap-8 lg:grid-cols-[240px_1fr] lg:items-center">
        {dossier.cover && (
          <div className="relative mx-auto aspect-[32/45] w-48 overflow-hidden rounded-md shadow-[var(--shadow-warm)] lg:mx-0 lg:w-full">
            <Image
              src={dossier.cover.url}
              alt={dossier.title}
              fill
              sizes="240px"
              className="object-cover"
            />
          </div>
        )}
        <div>
          <span className="rounded-full bg-leather-soft px-3 py-1 text-xs font-bold text-leather">
            ملف خاص
          </span>
          <h1 className="mt-3 text-3xl font-bold text-ink md:text-4xl">
            {dossier.title}
          </h1>
          {dossier.intro && (
            <p className="mt-4 text-[17px] leading-9 text-soft">{dossier.intro}</p>
          )}
        </div>
      </header>

      <section className="mt-12">
        <h2 className="mb-6 text-2xl font-bold text-ink">مقالات الملف</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {dossier.articles.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      </section>
    </div>
  );
}

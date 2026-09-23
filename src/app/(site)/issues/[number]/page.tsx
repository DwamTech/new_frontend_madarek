import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, Clock, Eye } from "lucide-react";
import { getIssueByNumber, getIssueSummaries } from "@/lib/mdarek-api";
import { IssueCoverLightbox } from "@/components/issue-cover-lightbox";
import { IssuePdfButton } from "@/components/issue-pdf-button";
import { SectionGlyph } from "@/components/section-mark";
import { orderSectionsArticlesAfterOpening } from "@/lib/section-colors";

type Props = { params: Promise<{ number: string }> };


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { number } = await params;
  const issue = await getIssueByNumber(Number(number));
  if (!issue) return {};
  return {
    title: `${issue.title} — ${issue.hijriDate}`,
    description: `فهرس ${issue.title} من مجلة مدارك (${issue.hijriDate} / ${issue.gregorianDate})`,
    openGraph: {
      title: `${issue.title} — مجلة مدارك`,
      description: `${issue.hijriDate} / ${issue.gregorianDate}`,
      images: issue.cover ? [{ url: issue.cover.url }] : undefined,
    },
    twitter: issue.cover ? { card: "summary_large_image" } : undefined,
  };
}

export default async function IssuePage({ params }: Props) {
  const { number } = await params;
  const num = Number(number);
  if (!Number.isInteger(num)) notFound();

  const [issue, summaries] = await Promise.all([
    getIssueByNumber(num),
    getIssueSummaries(),
  ]);
  if (!issue) notFound();

  const editorial = issue.articles.find((a) => a.sectionSlug === "opening");
  const hasPrev = summaries.some((s) => s.number === num - 1);
  const hasNext = summaries.some((s) => s.number === num + 1);
  const prevTitle = summaries.find((s) => s.number === num - 1)?.title;
  const nextTitle = summaries.find((s) => s.number === num + 1)?.title;

  // فهرس العدد مقسومًا بالأبواب — مقالات مباشرة بعد افتتاحية العدد
  const grouped = orderSectionsArticlesAfterOpening(issue.sections)
    .map((s) => ({
      section: s,
      items: issue.articles.filter((a) => a.sectionId === s.id),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
      {/* رأس العدد */}
      <div className="grid gap-10 lg:grid-cols-[260px_1fr] lg:gap-14">
        <div className="mx-auto w-52 lg:w-full">
          <IssueCoverLightbox
            issue={issue}
            issueNumber={num}
            sizes="260px"
            priority
            className="block w-full"
          />
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl font-bold text-ink md:text-4xl">{issue.title}</h1>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-sm font-semibold text-soft">
            <span>{issue.hijriDate}</span>
            <span aria-hidden>·</span>
            <span>{issue.gregorianDate}</span>
            <span className="flex items-center gap-1">
              <Eye className="size-4" /> {issue.views} قراءة
            </span>
          </p>
          {editorial && (
            <>
              <p className="mt-5 text-sm font-bold text-gold">افتتاحية العدد</p>
              <p className="font-amiri text-2xl font-bold text-ink">
                {editorial.title}
              </p>
              <p className="mt-2 max-w-2xl leading-9 text-soft">
                {editorial.excerpt}
              </p>
            </>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            {issue.pdf && (
              <Link
                href={`/issues/${num}/read`}
                className="rounded-md bg-leather px-6 py-3 font-bold text-[#FFF8EE] transition-[filter] hover:brightness-110 dark:text-[#1E1207]"
              >
                تصفح العدد
              </Link>
            )}
            <IssuePdfButton pdf={issue.pdf} />
          </div>
        </div>
      </div>

      {/* فهرس العدد */}
      <section id="index" className="mt-14 scroll-mt-24">
        <h2 className="mb-6 text-2xl font-bold text-ink">فهرس العدد</h2>
        {issue.articles.length === 0 ? (
          <p className="rounded-md border border-line bg-raise p-8 text-center text-soft">
            مواد هذا العدد متاحة حاليًا في نسخة PDF فقط — يجري ترقيمها نصيًا
            تباعًا.
          </p>
        ) : (
          <div className="space-y-8">
            {grouped.map(({ section, items }) => (
              <div key={section.slug}>
                <div className="mb-3 flex items-center gap-2.5">
                  <SectionGlyph
                    slug={section.slug}
                    icon={section.icon}
                    className="size-8 rounded-md"
                  />
                  <Link
                    href={`/sections/${section.slug}`}
                    className="font-bold text-ink hover:text-leather"
                  >
                    {section.name}
                  </Link>
                </div>
                <ul className="overflow-hidden rounded-md border border-line bg-raise">
                  {items.map((a) => (
                    <li key={a.id} className="border-b border-line last:border-0">
                      <Link
                        href={`/articles/${a.id}`}
                        className="group flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-4 transition-colors hover:bg-surface"
                      >
                        <span className="min-w-0 flex-1 font-semibold leading-7 text-ink group-hover:text-leather">
                          {a.title}
                        </span>
                        {a.author && (
                          <span className="text-sm text-soft">{a.author.name}</span>
                        )}
                        <span className="flex items-center gap-1 text-xs text-soft">
                          <Clock className="size-3.5" />
                          {a.readingMinutes} د
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* تنقل زمني */}
      <nav aria-label="التنقل بين الأعداد" className="mt-14 grid gap-4 sm:grid-cols-2">
        {hasPrev ? (
          <Link
            href={`/issues/${num - 1}`}
            className="group rounded-md border border-line bg-raise p-5 transition-colors hover:border-gold"
          >
            <p className="mb-1 flex items-center gap-1.5 text-xs text-soft">
              <ArrowRight className="size-3.5" />
              العدد السابق
            </p>
            <p className="font-bold text-ink group-hover:text-leather">{prevTitle}</p>
          </Link>
        ) : (
          <span aria-hidden />
        )}
        {hasNext ? (
          <Link
            href={`/issues/${num + 1}`}
            className="group rounded-md border border-line bg-raise p-5 text-end transition-colors hover:border-gold"
          >
            <p className="mb-1 flex items-center justify-end gap-1.5 text-xs text-soft">
              العدد التالي
              <ArrowLeft className="size-3.5" />
            </p>
            <p className="font-bold text-ink group-hover:text-leather">{nextTitle}</p>
          </Link>
        ) : (
          <div className="rounded-md border border-dashed border-line p-5 text-end text-sm text-soft">
            هذا أحدث الأعداد — العدد القادم قيد الإعداد
          </div>
        )}
      </nav>
    </div>
  );
}

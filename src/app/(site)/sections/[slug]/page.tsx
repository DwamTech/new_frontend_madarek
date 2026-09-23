import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getArticlesBySection, getCurrentIssue } from "@/lib/mdarek-api";
import { SectionFilterClient } from "@/components/section-filter-client";
import { SectionIcon } from "@/components/section-icon";
import { SectionGlyph } from "@/components/section-mark";
import { sectionPigment } from "@/lib/section-colors";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ issue?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const current = await getCurrentIssue();
  const section = current?.sections.find((s) => s.slug === slug);
  if (!section) return {};
  return {
    title: `باب ${section.name}`,
    description: `كل مواد باب ${section.name} عبر أعداد مجلة مدارك.`,
    // فلترة العدد تجري في المتصفح الآن (بلا تنقّل)، فكل قيم ?issue
    // أو ?issueId العالقة من روابط قديمة محوَّلة تشير لنفس المورد الأصلي
    alternates: { canonical: `/sections/${slug}` },
  };
}

export default async function SectionPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { issue } = await searchParams;

  const current = await getCurrentIssue();
  const section = current?.sections.find((s) => s.slug === slug);
  if (!current || !section) notFound();

  const all = await getArticlesBySection(slug);
  const issues = [...new Set(all.map((a) => a.issueNumber))].sort((a, b) => b - a);
  const initialIssue = issue ? Number(issue) : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
      {/* رأس الباب */}
      <header className="flex flex-wrap items-center gap-5 border-b border-line pb-8">
        <SectionGlyph
          slug={section.slug}
          icon={section.icon}
          className="size-16 rounded-md"
          iconClassName="size-8"
        />
        <div>
          <h1 className="text-3xl font-bold text-ink">{section.name}</h1>
          <p className="mt-1 text-soft">
            باب ثابت في كل عدد — تتراكم مادته منذ العدد الأول.
          </p>
        </div>
        <span className="ms-auto rounded-full border border-line px-4 py-1.5 text-sm font-semibold text-soft">
          {all.length} {all.length === 1 ? "مادة" : "مواد"}
        </span>
      </header>

      {/* فلترة بالعدد — تجري بالكامل في المتصفح بلا أي طلب خادم إضافي */}
      <SectionFilterClient
        slug={slug}
        articles={all}
        issues={issues}
        sectionIcon={section.icon}
        initialIssue={initialIssue}
      />

      {/* أبواب أخرى */}
      <section className="mt-16 border-t border-line pt-8">
        <h2 className="mb-4 text-lg font-bold text-ink">أبواب أخرى</h2>
        <div className="flex flex-wrap gap-2">
          {current.sections
            .filter((s) => s.slug !== slug)
            .map((s) => (
              <Link
                key={s.slug}
                href={`/sections/${s.slug}`}
                className="flex items-center gap-2 rounded-full border border-line bg-raise px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-gold hover:text-leather"
              >
                <SectionIcon
                  name={s.icon}
                  className="size-4"
                  style={{ color: `var(--pig-${sectionPigment(s.slug)})` }}
                />
                {s.name}
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}

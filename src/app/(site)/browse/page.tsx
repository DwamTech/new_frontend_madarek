import Link from "next/link";
import type { Metadata } from "next";
import { Clock } from "lucide-react";
import { getAllIssues, getCurrentIssue } from "@/lib/mdarek-api";
import { SectionGlyph } from "@/components/section-mark";
import { orderSectionsArticlesAfterOpening, sectionColorStyle } from "@/lib/section-colors";

export const metadata: Metadata = {
  title: "أرشيف الأبواب",
  description:
    "كل مواد مجلة مدارك منذ العدد الأول، مجمّعة بالأبواب العشرة عبر الأعداد.",
  alternates: { canonical: "/browse" },
};

export default async function BrowsePage() {
  const [issues, current] = await Promise.all([
    getAllIssues(),
    getCurrentIssue(),
  ]);
  const sections = orderSectionsArticlesAfterOpening(current?.sections ?? []);
  const all = issues.flatMap((i) => i.articles);

  // كل باب بمواده عبر الأعداد كلها — الأحدث عددًا أولًا
  const grouped = sections
    .map((s) => ({
      section: s,
      items: all
        .filter((a) => a.sectionSlug === s.slug)
        .sort((a, b) => b.issueNumber - a.issueNumber || a.id - b.id),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-bold text-ink">أرشيف الأبواب</h1>
        <p className="mt-2 leading-8 text-soft">
          {all.length} مادة عبر {issues.length} أعداد — كل باب بما تراكم فيه
          منذ العدد الأول.
        </p>
      </header>

      <div className="mt-10 space-y-10">
        {grouped.map(({ section, items }) => (
          <section
            key={section.slug}
            id={section.slug}
            className="scroll-mt-24"
            style={sectionColorStyle(section.slug)}
          >
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
              <span className="rounded-full border border-line px-2.5 py-0.5 text-xs text-soft">
                {items.length} {items.length === 1 ? "مادة" : "مواد"}
              </span>
            </div>
            <ul
              className="overflow-hidden rounded-md border border-line bg-raise border-s-[3px]"
              style={{ borderInlineStartColor: "var(--pig)" }}
            >
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
        ))}
      </div>
    </div>
  );
}

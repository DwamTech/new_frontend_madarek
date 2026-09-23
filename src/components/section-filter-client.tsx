"use client";

import { useMemo, useState } from "react";
import type { Article } from "@/lib/mdarek-api/types";
import { ArticleCard } from "@/components/article-card";

/**
 * فلترة الباب حسب العدد — تُنفَّذ بالكامل في المتصفح (بلا أي طلب للخادم).
 * كل مواد الباب تصل مرة واحدة من الخادم؛ التبديل بين الأعداد بعدها
 * مجرد تصفية في الذاكرة. الرابط يبقى قابلاً للمشاركة عبر History API
 * مباشرة (بدل موجّه Next.js) حتى لا يُطلق أي تنقّل أو طلب خادم جديد.
 */
export function SectionFilterClient({
  slug,
  articles,
  issues,
  sectionIcon,
  initialIssue,
}: {
  slug: string;
  articles: Article[];
  issues: number[];
  sectionIcon: string;
  initialIssue: number | null;
}) {
  const [selected, setSelected] = useState<number | null>(initialIssue);

  const filtered = useMemo(
    () => (selected === null ? articles : articles.filter((a) => a.issueNumber === selected)),
    [articles, selected],
  );

  const select = (n: number | null) => {
    setSelected(n);
    const url = n === null ? `/sections/${slug}` : `/sections/${slug}?issue=${n}`;
    window.history.replaceState(null, "", url);
  };

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-soft">حسب العدد:</span>
        <button
          type="button"
          onClick={() => select(null)}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
            selected === null
              ? "bg-leather text-[#FFF8EE] dark:text-[#1E1207]"
              : "border border-line bg-raise text-ink hover:border-gold"
          }`}
        >
          الكل
        </button>
        {issues.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => select(n)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              selected === n
                ? "bg-leather text-[#FFF8EE] dark:text-[#1E1207]"
                : "border border-line bg-raise text-ink hover:border-gold"
            }`}
          >
            العدد {n}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-10 rounded-md border border-line bg-raise p-10 text-center">
          <p className="font-bold text-ink">لا مواد بهذا الفلتر بعد</p>
          <p className="mt-1 text-sm text-soft">
            هذا الباب يتراكم عددًا بعد عدد — جرّب «الكل» أو عد لاحقًا.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => (
            <ArticleCard key={a.id} article={a} sectionIcon={sectionIcon} />
          ))}
        </div>
      )}
    </>
  );
}

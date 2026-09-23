"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDownWideNarrow, Eye, Search } from "lucide-react";
import type { IssueSummary } from "@/lib/mdarek-api/types";
import { IssueCoverLightbox } from "@/components/issue-cover-lightbox";

// قائمة الأرشيف التفاعلية: بحث + فرز + تجميع بالسنة الهجرية
// تستقبل البيانات جاهزة من الخادم — لا نداءات API من المتصفح
export function ArchiveList({ issues }: { issues: IssueSummary[] }) {
  const [q, setQ] = useState("");
  const [oldestFirst, setOldestFirst] = useState(false);

  const groups = useMemo(() => {
    const query = q.trim();
    const filtered = issues.filter(
      (i) =>
        !query ||
        i.title.includes(query) ||
        i.hijriDate.includes(query) ||
        i.gregorianDate.includes(query),
    );
    const sorted = [...filtered].sort((a, b) =>
      oldestFirst ? a.number - b.number : b.number - a.number,
    );
    const byYear = new Map<string, IssueSummary[]>();
    for (const i of sorted) {
      const year = i.hijriDate.match(/\d{4}/)?.[0] ?? "أخرى";
      const arr = byYear.get(year) ?? [];
      arr.push(i);
      byYear.set(year, arr);
    }
    return [...byYear.entries()];
  }, [issues, q, oldestFirst]);

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <label className="relative min-w-64 flex-1 sm:max-w-sm">
          <span className="sr-only">ابحث باسم العدد أو التاريخ</span>
          <Search className="pointer-events-none absolute end-3.5 top-1/2 size-4.5 -translate-y-1/2 text-soft" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث باسم العدد أو التاريخ…"
            className="w-full rounded-md border border-line bg-raise py-2.5 pe-11 ps-4 text-[15px] text-ink placeholder:text-soft/60"
          />
        </label>
        <button
          type="button"
          onClick={() => setOldestFirst((v) => !v)}
          className="flex items-center gap-2 rounded-md border border-line bg-raise px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-gold"
        >
          <ArrowDownWideNarrow className="size-4" />
          {oldestFirst ? "الأقدم أولًا" : "الأحدث أولًا"}
        </button>
      </div>

      {groups.length === 0 && (
        <div className="mt-12 rounded-md border border-line bg-raise p-10 text-center">
          <p className="font-bold text-ink">لا نتائج عن «{q}»</p>
          <p className="mt-1 text-sm text-soft">
            جرّب اسم العدد (السابع) أو السنة (1447).
          </p>
        </div>
      )}

      {groups.map(([year, list]) => (
        <section key={year} className="mt-10">
          <h2 className="mb-5 flex items-center gap-3 text-xl font-bold text-ink">
            أعداد سنة {year}هـ
            <span className="h-px flex-1 bg-line" aria-hidden />
          </h2>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {list.map((i) => (
              <div key={i.number}>
                <IssueCoverLightbox
                  issue={i}
                  issueNumber={i.number}
                  sizes="(min-width: 1024px) 200px, (min-width: 640px) 30vw, 45vw"
                  className="block w-full"
                />
                <Link
                  href={`/issues/${i.number}`}
                  className="mt-3 block text-center font-bold text-ink hover:text-leather"
                >
                  {i.title}
                </Link>
                <p className="mt-1 text-center text-xs text-soft">
                  {i.hijriDate} · {i.gregorianDate}
                </p>
                <p className="mt-1 flex items-center justify-center gap-1 text-center text-xs text-soft">
                  <Eye className="size-3.5" /> {i.views} قراءة
                </p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

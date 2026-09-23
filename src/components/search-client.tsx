"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Clock, Search } from "lucide-react";
import type { SearchRecord } from "@/lib/mdarek-api/types";
import { SectionBadge } from "@/components/section-mark";

// تطبيع عربي: إسقاط التشكيل وتوحيد الهمزات — «الامبريالية» تجد «الإمبريالية»
const normalize = (s: string) =>
  s
    .replace(/[ً-ْٰـ]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .toLowerCase();

// تمييز الكلمات المطابقة (بأي كلمة من الاستعلام) دون كسر النص الأصلي
function Highlight({ text, query }: { text: string; query: string }) {
  const tokens = normalize(query)
    .split(/\s+/)
    .filter((t) => t.length >= 2);
  if (tokens.length === 0) return <>{text}</>;
  return (
    <>
      {text.split(/(\s+)/).map((w, i) =>
        tokens.some((t) => normalize(w).includes(t)) ? (
          <mark key={i} className="rounded bg-gold-soft px-0.5 text-inherit">
            {w}
          </mark>
        ) : (
          <span key={i}>{w}</span>
        ),
      )}
    </>
  );
}

// مقتطف حول أول موضع تطابق فعلي في نص المادة الكامل، بدل مقتطف ثابت
// قد لا يحوي الكلمة المبحوث عنها إطلاقًا — يُبنى من النص الأصلي (لا
// المطبَّع) فيبقى قابلًا للعرض والتظليل بلا تشويه
function makeSnippet(text: string, query: string, radius = 100): string {
  const tokens = normalize(query)
    .split(/\s+/)
    .filter((t) => t.length >= 2);
  if (tokens.length === 0) return text.slice(0, radius * 2);
  const words = text.split(/(\s+)/);
  let matchStart = -1;
  let charIndex = 0;
  for (const w of words) {
    if (tokens.some((t) => normalize(w).includes(t))) {
      matchStart = charIndex;
      break;
    }
    charIndex += w.length;
  }
  if (matchStart === -1) return text.slice(0, radius * 2);
  const start = Math.max(0, matchStart - radius);
  const end = Math.min(text.length, matchStart + radius);
  const prefix = start > 0 ? "…" : "";
  const suffix = end < text.length ? "…" : "";
  return `${prefix}${text.slice(start, end).trim()}${suffix}`;
}

type SortMode = "relevance" | "date" | "views";
type ScopeMode = "all" | "title" | "content";
type LogicMode = "and" | "or" | "phrase";

export function SearchClient({ records }: { records: SearchRecord[] }) {
  const [q, setQ] = useState("");
  const [section, setSection] = useState("");
  const [issue, setIssue] = useState("");
  const [writer, setWriter] = useState("");
  const [sort, setSort] = useState<SortMode>("relevance");
  const [scope, setScope] = useState<ScopeMode>("all");
  const [logic, setLogic] = useState<LogicMode>("and");

  // خيارات الفلاتر مشتقة من البيانات الحقيقية نفسها
  const sections = useMemo(() => {
    const m = new Map<string, string>();
    for (const r of records) m.set(r.sectionSlug, r.sectionName);
    return [...m.entries()];
  }, [records]);
  const issues = useMemo(
    () => [...new Set(records.map((r) => r.issueNumber))].sort((a, b) => b - a),
    [records],
  );
  const writers = useMemo(() => {
    const m = new Map<string, string>();
    for (const r of records)
      if (r.authorSlug && r.authorName) m.set(r.authorSlug, r.authorName);
    return [...m.entries()].sort((a, b) => a[1].localeCompare(b[1], "ar"));
  }, [records]);

  const results = useMemo(() => {
    const nq = normalize(q.trim());
    const tokens = nq.split(/\s+/).filter((t) => t.length >= 2);
    const filtered = records.filter((r) => {
      if (section && r.sectionSlug !== section) return false;
      if (issue && String(r.issueNumber) !== issue) return false;
      if (writer && r.authorSlug !== writer) return false;
      if (nq.length < 2) return !nq;
      // نطاق البحث: الكل / العنوان فقط / المحتوى فقط
      const haystack = normalize(
        scope === "title"
          ? r.title
          : scope === "content"
            ? `${r.excerpt} ${r.plainText}`
            : `${r.title} ${r.excerpt} ${r.authorName ?? ""} ${r.keywords.join(" ")} ${r.plainText}`,
      );
      // منطق الكلمات: كل الكلمات / أي كلمة / العبارة كاملة
      if (logic === "phrase" || tokens.length <= 1) return haystack.includes(nq);
      if (logic === "or") return tokens.some((t) => haystack.includes(t));
      return tokens.every((t) => haystack.includes(t));
    });
    if (sort === "views") {
      return [...filtered].sort((a, b) => b.views - a.views);
    }
    if (sort === "date") {
      return [...filtered].sort(
        (a, b) =>
          +new Date(b.publishedAt ?? 0) - +new Date(a.publishedAt ?? 0),
      );
    }
    return filtered;
  }, [records, q, section, issue, writer, sort, scope, logic]);

  const active = q.trim().length >= 2 || section || issue || writer;
  const selectCls =
    "w-full rounded-md border border-line bg-raise px-3 py-2.5 text-sm text-ink";

  return (
    <>
      <label className="relative mx-auto mt-6 block max-w-2xl">
        <span className="sr-only">كلمة البحث</span>
        <Search className="pointer-events-none absolute end-4 top-1/2 size-5 -translate-y-1/2 text-soft" />
        <input
          type="search"
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="مثال: ابن تيمية، الفناء، التيجانية…"
          className="w-full rounded-md border-2 border-line bg-raise py-4 pe-12 ps-5 text-lg text-ink shadow-[var(--shadow-warm)] placeholder:text-soft/50 focus:border-gold"
        />
      </label>

      <div className="mt-10 grid gap-8 lg:grid-cols-[230px_1fr]">
        {/* الفلاتر — ظاهرة دائمًا لجمهور باحث */}
        <aside aria-label="فلاتر البحث" className="space-y-4">
          <div>
            <label htmlFor="f-section" className="mb-1.5 block text-sm font-bold text-ink">
              الباب
            </label>
            <select id="f-section" value={section} onChange={(e) => setSection(e.target.value)} className={selectCls}>
              <option value="">كل الأبواب</option>
              {sections.map(([slug, name]) => (
                <option key={slug} value={slug}>{name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="f-issue" className="mb-1.5 block text-sm font-bold text-ink">
              العدد
            </label>
            <select id="f-issue" value={issue} onChange={(e) => setIssue(e.target.value)} className={selectCls}>
              <option value="">كل الأعداد</option>
              {issues.map((n) => (
                <option key={n} value={n}>العدد {n}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="f-writer" className="mb-1.5 block text-sm font-bold text-ink">
              الكاتب
            </label>
            <select id="f-writer" value={writer} onChange={(e) => setWriter(e.target.value)} className={selectCls}>
              <option value="">كل الكتّاب</option>
              {writers.map(([slug, name]) => (
                <option key={slug} value={slug}>{name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="f-scope" className="mb-1.5 block text-sm font-bold text-ink">
              نطاق البحث
            </label>
            <select
              id="f-scope"
              value={scope}
              onChange={(e) => setScope(e.target.value as ScopeMode)}
              className={selectCls}
            >
              <option value="all">العنوان والمحتوى</option>
              <option value="title">العنوان فقط</option>
              <option value="content">المحتوى فقط</option>
            </select>
          </div>
          <div>
            <label htmlFor="f-logic" className="mb-1.5 block text-sm font-bold text-ink">
              منطق الكلمات
            </label>
            <select
              id="f-logic"
              value={logic}
              onChange={(e) => setLogic(e.target.value as LogicMode)}
              className={selectCls}
            >
              <option value="and">كل الكلمات</option>
              <option value="or">أي كلمة</option>
              <option value="phrase">العبارة كاملة</option>
            </select>
          </div>
          <div>
            <label htmlFor="f-sort" className="mb-1.5 block text-sm font-bold text-ink">
              الترتيب
            </label>
            <select
              id="f-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortMode)}
              className={selectCls}
            >
              <option value="relevance">الأنسب</option>
              <option value="date">الأحدث</option>
              <option value="views">الأكثر قراءة</option>
            </select>
          </div>
          {active ? (
            <button
              type="button"
              onClick={() => {
                setQ("");
                setSection("");
                setIssue("");
                setWriter("");
                setScope("all");
                setLogic("and");
                setSort("relevance");
              }}
              className="text-sm font-semibold text-lapis hover:underline"
            >
              مسح كل الفلاتر
            </button>
          ) : null}
        </aside>

        {/* النتائج */}
        <section aria-live="polite">
          {active ? (
            <p className="mb-4 text-sm text-soft">
              {results.length === 0
                ? "لا نتائج مطابقة"
                : `${results.length} ${results.length === 1 ? "نتيجة" : "نتائج"}`}
              {q.trim() && (
                <>
                  {" "}عن <b className="text-ink">«{q.trim()}»</b>
                </>
              )}
            </p>
          ) : (
            <p className="mb-4 text-sm text-soft">
              اكتب حرفين فأكثر للبحث في {records.length} مادة، أو استخدم
              الفلاتر للتصفح.
            </p>
          )}

          {active && results.length === 0 ? (
            <div className="rounded-md border border-line bg-raise p-10 text-center">
              <p className="text-lg font-bold text-ink">لم نجد ما يطابق بحثك</p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-soft">
                جرّب صيغة أخرى للكلمة أو وسّع الفلاتر. وإن كان سؤالك علميًا
                محددًا فيمكن لباحث مختص أن يجيبك عنه.
              </p>
              <div className="mt-5 flex justify-center gap-3">
                <Link
                  href="/services"
                  className="rounded-md bg-leather px-5 py-2.5 text-sm font-bold text-[#FFF8EE] transition-[filter] hover:brightness-110 dark:text-[#1E1207]"
                >
                  اسأل باحثًا
                </Link>
                <Link
                  href="/sections/articles"
                  className="rounded-md border border-leather px-5 py-2.5 text-sm font-bold text-leather hover:bg-leather-soft"
                >
                  تصفح الأبواب
                </Link>
              </div>
            </div>
          ) : (
            <ul className="space-y-3">
              {/* الفرز ينطبق حتى على القائمة الافتراضية قبل البحث */}
              {(active ? results : results.slice(0, 6)).map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/articles/${r.id}`}
                    className="group block rounded-md border border-line bg-raise p-5 transition-colors hover:border-gold"
                  >
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <SectionBadge slug={r.sectionSlug} name={r.sectionName} />
                      <span className="text-soft">العدد {r.issueNumber}</span>
                    </div>
                    <h2 className="mt-2 font-bold leading-8 text-ink group-hover:text-leather">
                      <Highlight text={r.title} query={q} />
                    </h2>
                    <p className="mt-1 line-clamp-2 text-sm leading-7 text-soft">
                      <Highlight
                        text={q.trim().length >= 2 ? makeSnippet(r.plainText, q) : r.excerpt}
                        query={q}
                      />
                    </p>
                    <p className="mt-2 flex items-center gap-3 text-xs text-soft">
                      {r.authorName && (
                        <span className="font-semibold">{r.authorName}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="size-3.5" /> {r.readingMinutes} د
                      </span>
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

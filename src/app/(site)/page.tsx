import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Eye,
  FolderOpen,
  History,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  getAllDossiers,
  getAllIssues,
  getArchiveSpotlight,
  getCurrentIssue,
  getIssueSummaries,
  getMostRead,
} from "@/lib/mdarek-api";
import { extractHighlights } from "@/lib/mdarek-api/sanitize";
import { orderSectionsForDisplay, sectionColorStyle } from "@/lib/section-colors";
import type { Article, Issue } from "@/lib/mdarek-api/types";
import { ArticleCard } from "@/components/article-card";
import { IssueCover } from "@/components/issue-cover";
import { IssueCoverLightbox } from "@/components/issue-cover-lightbox";
import { IssuePdfButton } from "@/components/issue-pdf-button";
import { SectionIcon } from "@/components/section-icon";
import { SectionBadge, SectionGlyph } from "@/components/section-mark";
import { Reveal } from "@/components/reveal";

/** أنسب مقتطف تحريري (ذهبي) من مواد العدد الحالي — نص حقيقي من اختيار المحررين */
function pickIssueQuote(
  articles: Article[],
): { text: string; article: Article } | null {
  let best: { text: string; article: Article } | null = null;
  for (const article of articles) {
    for (const text of extractHighlights(article.contentHtml)) {
      const ideal = text.length >= 80 && text.length <= 180;
      const bestIdeal = best
        ? best.text.length >= 80 && best.text.length <= 180
        : false;
      if (!best || (ideal && !bestIdeal) || (ideal === bestIdeal && text.length > best.text.length)) {
        best = { text, article };
      }
    }
  }
  return best;
}

/**
 * بعض مواد أبواب الأعمدة في العدد الأحدث تُنشأ فارغة (بلا نص) قبل
 * اكتمال تحريرها — نستبدلها بأحدث مادة حقيقية لنفس الباب من عدد سابق
 * بدل عرض بطاقة فارغة؛ لا فرق حقيقي/تخمين هنا: المقتطف الفارغ (`excerpt`)
 * هو أثر مباشر لمحتوى فعليًا خالٍ (تحقّق: adaptArticle يستخرجه من نص
 * المادة الحقيقي، لا يُخترع).
 */
function fillEmptyColumnArticles(
  current: Article[],
  allIssues: Issue[],
  currentIssueNumber: number,
): Article[] {
  const olderIssues = allIssues
    .filter((i) => i.number !== currentIssueNumber)
    .sort((a, b) => b.number - a.number);
  return current.map((a) => {
    if (a.excerpt) return a;
    for (const older of olderIssues) {
      const replacement = older.articles.find(
        (x) => x.sectionSlug === a.sectionSlug && x.excerpt,
      );
      if (replacement) return replacement;
    }
    return a;
  });
}

export default async function HomePage() {
  const [issue, summaries, mostRead, archiveSpotlight, allIssues, dossiers] =
    await Promise.all([
      getCurrentIssue(),
      getIssueSummaries(),
      getMostRead(3),
      getArchiveSpotlight(2),
      getAllIssues(),
      getAllDossiers(),
    ]);

  if (!issue) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-ink">تعذر تحميل المحتوى</h1>
        <p className="mt-2 text-soft">
          مصدر البيانات غير متاح حاليًا — أعد المحاولة بعد قليل.
        </p>
      </div>
    );
  }

  const editorial = issue.articles.find((a) => a.sectionSlug === "opening");
  // "عصارة الكتب" مستبعد عمدًا هنا لأن له واجهة مستقلة ("كتاب العدد") أسفله
  const columnArticles = fillEmptyColumnArticles(
    issue.articles.filter(
      (a) =>
        a.sectionSlug !== "opening" &&
        a.sectionSlug !== "articles" &&
        a.sectionSlug !== "library",
    ),
    allIssues,
    issue.number,
  );
  const essays = issue.articles.filter((a) => a.sectionSlug === "articles");
  const picks = [...essays].sort((a, b) => b.views - a.views).slice(0, 2);
  // الحد 7 يتسع لكل الأبواب المؤهلة عادةً (10 أبواب - افتتاحية - مقالات
  // - عصارة الكتب) بلا استبعاد أي باب — فيصير الإجمالي 9 (مقالان + 7).
  // التدوير برقم العدد يبقى شبكة أمان: لو زاد عدد الأبواب المؤهلة
  // مستقبلًا عن الحد، يتغيّر الباب المُستبعَد شهرًا بعد شهر بدل تجميده
  // على باب واحد دائمًا.
  const rotatedColumns = columnArticles.length
    ? [
        ...columnArticles.slice(issue.number % columnArticles.length),
        ...columnArticles.slice(0, issue.number % columnArticles.length),
      ]
    : columnArticles;
  const spotlightArticles = [...picks, ...rotatedColumns.slice(0, 7)];
  const issueQuote = pickIssueQuote(issue.articles);
  const iconOf = (slug: string) =>
    issue.sections.find((s) => s.slug === slug)?.icon ?? "newspaper";

  return (
    <>
      {/* ===== هيرو العدد الحالي — بالحجم الأصلي ===== */}
      <section className="relative overflow-hidden border-b border-line bg-gradient-to-b from-leather-soft/40 via-transparent to-transparent">
        <div className="ornament pointer-events-none absolute inset-0 opacity-[0.05]" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-3 lg:grid-cols-[290px_1fr] lg:gap-14 lg:px-6 lg:py-4">
          <IssueCoverLightbox
            issue={issue}
            issueNumber={issue.number}
            sizes="(min-width:1024px) 290px, 224px"
            priority
            coverFixedHeroHeight
            className="mx-auto w-56 transition-transform hover:-translate-y-1 lg:w-full"
          />

          <div className="flex flex-col justify-center lg:min-h-[367px] lg:justify-start">
            <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-soft">
              <span className="rounded-full bg-leather-soft px-3 py-0.5 font-bold text-leather">
                {issue.title}
              </span>
              <span>{issue.hijriDate}</span>
              <span aria-hidden>·</span>
              <span>{issue.gregorianDate}</span>
              <span className="flex items-center gap-1">
                <Eye className="size-4" /> {issue.views} قراءة
              </span>
            </p>

            {editorial ? (
              <>
                <p className="mt-5 text-sm font-bold tracking-wide text-gold">
                  افتتاحية العدد
                </p>
                <h1 className="mt-3 font-amiri text-4xl font-bold leading-snug text-ink md:text-5xl">
                  {editorial.title}
                </h1>
                <p className="mt-4 text-[17px] leading-9 text-soft">
                  {editorial.excerpt}
                </p>
                <Link
                  href={`/articles/${editorial.id}`}
                  className="mt-3 flex w-fit items-center gap-2 text-sm font-semibold text-leather transition-colors hover:text-gold"
                >
                  اقرأ الافتتاحية كاملة
                  <ArrowLeft className="size-4" />
                </Link>
              </>
            ) : (
              <h1 className="mt-5 font-amiri text-4xl font-bold leading-snug text-ink md:text-5xl">
                {issue.title}
              </h1>
            )}

            <div className="mt-7 flex flex-wrap gap-3 lg:mt-auto">
              <Link
                href={
                  issue.pdf
                    ? `/issues/${issue.number}/read`
                    : `/issues/${issue.number}`
                }
                className="rounded-md bg-leather px-6 py-3 font-bold text-[#FFF8EE] transition-[filter] hover:brightness-110 dark:text-[#1E1207]"
              >
                تصفح العدد الحالي
              </Link>
              <IssuePdfButton pdf={issue.pdf} />
            </div>
          </div>
        </div>
      </section>

      {/* ===== مختارات العدد: أعلى المقالات قراءةً + مواد بقية الأبواب ===== */}
      {spotlightArticles.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-14 lg:px-6">
          <div className="mb-6 flex items-baseline justify-between">
            {/* «مختارات» لا «مقالات»: القسم يجمع مواد من سبعة أبواب،
                و«مقالات» اسم باب بعينه فيصطدم بشارات البطاقات */}
            <h2 className="flex items-center gap-2 text-2xl font-bold text-ink">
              <Sparkles className="size-5 text-gold" />
              مختارات العدد
            </h2>
            <Link
              href={`/issues/${issue.number}`}
              className="text-sm font-semibold text-lapis hover:underline"
            >
              فهرس العدد كاملًا ←
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {spotlightArticles.map((a, i) => (
              <Reveal key={a.id} delay={Math.min(i * 60, 300)} className="h-full">
                <ArticleCard
                  article={a}
                  sectionIcon={iconOf(a.sectionSlug)}
                />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ===== من نصوص العدد — مقتطف حقيقي من تمييز المحررين ===== */}
      {issueQuote && (
        <section className="mx-auto max-w-7xl px-4 pt-14 lg:px-6">
          <Reveal>
          <Link
            href={`/articles/${issueQuote.article.id}`}
            className="group block rounded-md border border-gold/40 bg-gold-soft/50 p-6 transition-colors hover:bg-gold-soft md:p-8"
          >
            <p className="text-sm font-bold text-gold">من نصوص العدد</p>
            <p className="mt-2 font-amiri text-xl leading-relaxed text-ink md:text-2xl">
              «{issueQuote.text}»
            </p>
            <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-leather">
              من مادة: {issueQuote.article.title}
              <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
            </p>
          </Link>
          </Reveal>
        </section>
      )}

      {/* ===== الأبواب ===== */}
      <section className="mx-auto max-w-7xl px-4 pt-16 lg:px-6">
        <h2 className="mb-2 text-2xl font-bold text-ink">استكشف الأبواب</h2>
        <p className="mb-6 text-soft">
          عشرة أبواب ثابتة تتراكم معرفتها عددًا بعد عدد.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {orderSectionsForDisplay(issue.sections).map((s, i) => (
            <Reveal key={s.slug} delay={Math.min(i * 40, 240)} className="h-full">
              <Link
                href={`/sections/${s.slug}`}
                className="group flex h-full flex-col items-center gap-2.5 rounded-md border border-line bg-raise p-5 text-center transition-all hover:-translate-y-0.5 hover:border-gold hover:shadow-[var(--shadow-warm)]"
              >
                <SectionGlyph
                  slug={s.slug}
                  icon={s.icon}
                  className="size-12 rounded-md"
                  iconClassName="size-5.5"
                />
                <span className="text-sm font-bold text-ink group-hover:text-leather">
                  {s.name}
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===== الأكثر قراءة + كتاب العدد ومن الأرشيف ===== */}
      <section className="mx-auto grid max-w-7xl gap-6 px-4 pt-16 lg:grid-cols-2 lg:px-6">
        <Reveal className="h-full">
        <div className="h-full rounded-md border border-line bg-raise p-7 shadow-[var(--shadow-warm)]">
          <div className="flex items-baseline justify-between">
            <h2 className="flex items-center gap-2 text-xl font-bold text-ink">
              <TrendingUp className="size-4.5 text-leather" />
              الأكثر قراءة
            </h2>
            <Link href="/browse" className="text-sm font-semibold text-lapis hover:underline">
              كل المواد ←
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-line">
            {mostRead.map((a) => (
              <li key={a.id} className="py-3.5">
                <Link href={`/articles/${a.id}`} className="group flex items-center gap-4">
                  <div
                    // aspect-video بدل ارتفاع ثابت: نفس نسبة 16:9 المعتمدة
                    // في ArticleCard، فصورة المقال تملأ الصندوق بلا فراغ
                    // أيًا كان مكان ظهورها في الموقع
                    className="relative flex aspect-video w-44 shrink-0 items-center justify-center overflow-hidden rounded-md"
                    style={{
                      ...sectionColorStyle(a.sectionSlug),
                      backgroundImage:
                        "linear-gradient(to bottom left, var(--pig-soft), var(--gold-soft))",
                    }}
                  >
                    {a.cover ? (
                      <Image
                        src={a.cover.url}
                        alt={a.cover.alt}
                        fill
                        sizes="180px"
                        // object-contain: الصور الحالية أُنتجت قبل اعتماد
                        // مقاس 16:9 الموحّد، فنُبقيها كاملة بلا قصّ
                        className="object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <SectionIcon
                        name={iconOf(a.sectionSlug)}
                        className="size-8 opacity-40"
                        style={{ color: "var(--pig)" }}
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <SectionBadge slug={a.sectionSlug} name={a.sectionName} />
                    <span className="mt-1.5 block font-semibold leading-7 text-ink group-hover:text-leather">
                      {a.title}
                    </span>
                    <span className="flex items-center gap-2 text-xs text-soft">
                      {a.author?.name ?? "هيئة التحرير"}
                      <span aria-hidden>·</span>
                      العدد {a.issueNumber}
                      <span className="flex items-center gap-1">
                        <Eye className="size-3.5" /> {a.views}
                      </span>
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        </Reveal>

        <Reveal delay={80} className="h-full">
        <Link
          href="/dossiers"
          className="group block h-full rounded-md border border-line bg-raise p-7 shadow-[var(--shadow-warm)] transition-colors hover:border-gold"
        >
          <div className="flex items-baseline justify-between">
            <h2 className="flex items-center gap-2 text-xl font-bold text-ink group-hover:text-leather">
              <FolderOpen className="size-4.5 text-leather" />
              ملفات خاصة
            </h2>
            <span className="text-sm font-semibold text-lapis">
              {dossiers.length > 0 ? "كل الملفات ←" : "تصفّح ←"}
            </span>
          </div>
          <p className="mt-2 text-sm leading-7 text-soft">
            حين تجتمع عدة مقالات من العدد حول موضوع واحد، تُعرض هنا كملف
            مستقل.
          </p>
          {dossiers.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {dossiers.slice(0, 3).map(({ dossier }) => (
                <li
                  key={dossier.id}
                  className="truncate rounded-md border border-line bg-paper px-4 py-2.5 text-sm font-semibold text-ink"
                >
                  {dossier.title}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 rounded-md border border-dashed border-line p-5 text-center text-sm text-soft">
              لا توجد ملفات خاصة منشورة بعد — تابعونا.
            </p>
          )}
        </Link>
        </Reveal>
      </section>

      {/* ===== من الأرشيف — تناوب أسبوعي حتمي على مواد الأعداد السابقة ===== */}
      {archiveSpotlight.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-6 lg:px-6">
          <Reveal>
          <div className="rounded-md border border-line bg-surface p-7">
            <div className="mb-4 flex items-baseline justify-between gap-3">
              <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
                <History className="size-4.5 text-leather" />
                من الأرشيف
              </h2>
              <span className="text-xs text-soft">يتجدد أسبوعيًا</span>
            </div>
            <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {archiveSpotlight.map((a) => (
                <Link key={a.id} href={`/articles/${a.id}`} className="group flex items-start gap-4">
                  <div
                    // نفس مقاس وصورة "الأكثر قراءة" حرفيًا — توحيد شكل
                    // بطاقات المقالات في الصفحة الرئيسية كاملة
                    className="relative flex aspect-video w-44 shrink-0 items-center justify-center overflow-hidden rounded-md"
                    style={{
                      ...sectionColorStyle(a.sectionSlug),
                      backgroundImage:
                        "linear-gradient(to bottom left, var(--pig-soft), var(--gold-soft))",
                    }}
                  >
                    {a.cover ? (
                      <Image
                        src={a.cover.url}
                        alt={a.cover.alt}
                        fill
                        sizes="180px"
                        className="object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <SectionIcon
                        name={iconOf(a.sectionSlug)}
                        className="size-8 opacity-40"
                        style={{ color: "var(--pig)" }}
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <SectionBadge slug={a.sectionSlug} name={a.sectionName} />
                    <span className="mt-1.5 block font-semibold leading-7 text-ink group-hover:text-leather">
                      {a.title}
                    </span>
                    {/* مقدمة المادة — نفس معاملة "مختارات العدد" (ArticleCard) */}
                    <p className="mt-1.5 line-clamp-2 text-sm leading-7 text-soft">
                      {a.excerpt}
                    </p>
                    <span className="mt-1.5 block text-xs text-soft">
                      {a.author?.name ?? "هيئة التحرير"} · العدد {a.issueNumber}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          </Reveal>
        </section>
      )}

      {/* ===== الأعداد السابقة ===== */}
      <section className="mx-auto max-w-7xl px-4 pt-16 lg:px-6">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="flex items-center gap-2 text-2xl font-bold text-ink">
            <CalendarDays className="size-5 text-leather" />
            أعداد سابقة
          </h2>
          <Link href="/issues" className="text-sm font-semibold text-lapis hover:underline">
            الأرشيف كاملًا ←
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-5 sm:grid-cols-4 lg:grid-cols-7">
          {summaries.slice(1, 8).map((s, i) => (
            <Reveal key={s.number} delay={Math.min(i * 60, 300)}>
              <Link
                href={`/issues/${s.number}`}
                className="group block transition-transform hover:-translate-y-1"
              >
                <IssueCover issue={s} sizes="(min-width: 1024px) 160px, 30vw" />
                <p className="mt-2 text-center text-sm font-bold text-ink">{s.title}</p>
                <p className="text-center text-xs text-soft">{s.hijriDate}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}

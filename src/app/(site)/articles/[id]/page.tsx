import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Eye,
  FileText,
  ListOrdered,
} from "lucide-react";
import {
  getArticleContext,
  getArticlesBySection,
  getComments,
  getReactionCounts,
} from "@/lib/mdarek-api";
import { readingLabel } from "@/lib/format";
import { addHeadingAnchors } from "@/lib/mdarek-api/sanitize";
import { ArticleCard } from "@/components/article-card";
import { ArticleEngagement } from "@/components/article-engagement";
import { sectionColorStyle } from "@/lib/section-colors";
import { ReadingProgress } from "@/components/reading-progress";
import { ReadingTools } from "@/components/reading-tools";

type Props = { params: Promise<{ id: string }> };

async function loadContext(idParam: string) {
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) return null;
  return getArticleContext(id);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const ctx = await loadContext(id);
  if (!ctx) return {};
  const { article } = ctx;
  return {
    title: article.title,
    description: article.excerpt,
    // يضمن أن محركات البحث تفهرس هذا المسار النظيف تحديدًا، حتى لو
    // وصل الزائر عبر رابط قديم محوَّل يحمل معاملات زائدة (issueId وغيره)
    alternates: { canonical: `/articles/${article.id}` },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      publishedTime: article.publishedAt ?? undefined,
      authors: article.author ? [article.author.name] : undefined,
      images: article.cover ? [{ url: article.cover.url }] : undefined,
    },
    twitter: article.cover ? { card: "summary_large_image" } : undefined,
  };
}

export default async function ArticlePage({ params }: Props) {
  const { id } = await params;
  const ctx = await loadContext(id);
  if (!ctx) notFound();

  const { article, issue, prev, next } = ctx;
  const { html, toc } = addHeadingAnchors(article.contentHtml);

  const [related, reactionCounts, comments] = await Promise.all([
    getArticlesBySection(article.sectionSlug).then((all) =>
      all.filter((a) => a.id !== article.id).slice(0, 3),
    ),
    getReactionCounts(article.id),
    getComments(article.id),
  ]);

  return (
    <>
      <ReadingProgress />

      <article className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
        {/* فتات الخبز */}
        <nav aria-label="مسار الصفحة" className="mb-8 text-sm text-soft">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-leather">الرئيسية</Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href={`/issues/${issue.number}`} className="hover:text-leather">
                {issue.title}
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href={`/sections/${article.sectionSlug}`} className="hover:text-leather">
                {article.sectionName}
              </Link>
            </li>
          </ol>
        </nav>

        {/* رأس المقال */}
        <header className="mx-auto max-w-3xl">
          <Link
            href={`/sections/${article.sectionSlug}`}
            className="rounded-full px-3.5 py-1 text-sm font-bold"
            style={{
              ...sectionColorStyle(article.sectionSlug),
              background: "var(--pig-soft)",
              color: "var(--pig)",
            }}
          >
            {article.sectionName}
          </Link>
          <h1 className="mt-4 text-3xl font-bold leading-relaxed text-ink md:text-4xl md:leading-relaxed">
            {article.title}
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 border-y border-line py-4 text-sm text-soft">
            {article.author && (
              <>
                <Link
                  href={`/writers/${encodeURIComponent(article.author.slug)}`}
                  className="font-bold text-leather hover:underline"
                >
                  {article.author.name}
                </Link>
                <span aria-hidden>·</span>
              </>
            )}
            <span className="flex items-center gap-1.5">
              <Clock className="size-4" /> {readingLabel(article.readingMinutes)} قراءة
            </span>
            <span aria-hidden>·</span>
            <span>
              {issue.hijriDate} — {issue.gregorianDate}
            </span>
            <span aria-hidden>·</span>
            <span className="flex items-center gap-1.5">
              <Eye className="size-4" /> {article.views}
            </span>
          </div>
          {article.cover && (
            <figure className="mx-auto mt-6 overflow-hidden rounded-md">
              {/* بلا fill ولا نسبة أبعاد مفروضة: الصورة تأخذ عرض الحاوية
                  كاملًا وترتفع بارتفاعها الطبيعي فقط — نسب صور المواد
                  متفاوتة جدًا (من شبه مربعة إلى بانر عريض)، وأي صندوق
                  بنسبة ثابتة كان يعني إما قصًا أو فراغًا حول الصورة.
                  العرض يطابق عرض الرأس (max-w-3xl = 768px) بدل قيد
                  600px القديم غير المبرَّر الذي لم يكن يطابق شيئًا */}
              <Image
                src={article.cover.url}
                alt={article.cover.alt}
                width={1200}
                height={675}
                sizes="(min-width: 768px) 768px, 100vw"
                priority
                className="h-auto w-full"
              />
            </figure>
          )}
        </header>

        {/* جسم المقال + الفهرس + الأدوات */}
        <div className="mx-auto mt-10 grid max-w-3xl gap-10 lg:max-w-none lg:grid-cols-[minmax(0,1fr)_minmax(0,48rem)_minmax(0,1fr)]">
          <aside className="hidden lg:block lg:w-[200px] lg:justify-self-end" aria-label="فهرس المقال">
            {toc.length > 1 && (
              <div className="sticky top-24 rounded-md border border-line bg-raise p-4">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-soft">
                  <ListOrdered className="size-3.5" />
                  في هذه المادة
                </p>
                <ul className="space-y-1.5 text-sm">
                  {toc.map((h) => (
                    <li key={h.id} className={h.level === 3 ? "ps-3" : ""}>
                      <a
                        href={`#${h.id}`}
                        className="block leading-6 text-soft transition-colors hover:text-leather"
                      >
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>

          <div className="min-w-0">
            {html ? (
              <div
                id="article-body"
                className="prose-madarek"
                // المحتوى منظف في طبقة التكامل (sanitize-html) قبل الوصول هنا
                dangerouslySetInnerHTML={{ __html: html }}
              />
            ) : article.pdf ? (
              <div className="rounded-md border border-line bg-raise p-10 text-center">
                <p className="font-bold text-ink">
                  هذه المادة متاحة بنسخة PDF فقط
                </p>
                <p className="mt-1 text-sm text-soft">
                  لم يُرقم نصها بعد في النظام القديم.
                </p>
              </div>
            ) : null /* لا نص ولا PDF — تُترك فارغة كما في النظام القديم
                        نفسه (تحقّق: mdarek.net يعرض هذه الحالة بلا محتوى
                        أيضًا)، بدل جملة توضيحية لا طلبها المستخدم */}

            {/* مصادر المادة — قائمة غير مرقّمة عمدًا: بيانات النظام القديم
                لا تضمن تقابل عناصرها مع علامات [n] داخل المتن (بعض المواد
                فيها ٢٦ علامة و٣ مصادر)، فالترقيم كان يوهم بتقابل لا وجود له */}
            {article.references.length > 0 && (
              <section className="mt-10 rounded-md border border-line bg-raise p-6">
                <h2 className="mb-3 font-bold text-ink">مصادر ومراجع المادة</h2>
                <ul className="list-disc space-y-2 ps-5 text-sm leading-7 text-soft">
                  {article.references.map((r, i) => (
                    <li key={i}>
                      {r.url ? (
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-lapis underline underline-offset-4 hover:text-leather"
                        >
                          {r.title || r.url}
                        </a>
                      ) : (
                        r.title
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {article.pdf && (
              <a
                href={article.pdf.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-md border border-leather px-5 py-2.5 text-sm font-bold text-leather transition-colors print:hidden hover:bg-leather-soft"
              >
                <FileText className="size-4" />
                نسخة PDF من المادة
              </a>
            )}
          </div>

          <aside className="order-first print:hidden lg:order-none lg:justify-self-start" aria-label="أدوات القراءة">
            <div className="lg:sticky lg:top-24">
              <ReadingTools title={article.title} coverUrl={article.cover?.url} />
            </div>
          </aside>
        </div>

        {/* بطاقة الكاتب */}
        {article.author && (
          <div className="mx-auto mt-14 max-w-3xl rounded-md border border-line bg-raise p-6 shadow-[var(--shadow-warm)] print:hidden">
            <div className="flex items-center gap-4">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-full border-2 border-gold bg-leather-soft text-xl font-bold text-leather">
                {article.author.name.replace(/^(د|أ|م)\.\s*/, "").charAt(0)}
              </span>
              <div>
                <Link
                  href={`/writers/${encodeURIComponent(article.author.slug)}`}
                  className="font-bold text-ink hover:text-leather"
                >
                  {article.author.name}
                </Link>
                {article.author.country && (
                  <p className="text-xs text-soft">{article.author.country}</p>
                )}
                <Link
                  href={`/writers/${encodeURIComponent(article.author.slug)}`}
                  className="mt-1 inline-block text-sm font-semibold text-lapis hover:underline"
                >
                  كل مواده في المجلة ←
                </Link>
              </div>
            </div>
          </div>
        )}

        <ArticleEngagement key={article.id} articleId={article.id} counts={reactionCounts} comments={comments} />

        {/* السابق / التالي ضمن العدد */}
        {(prev || next) && (
          <nav
            aria-label="التنقل داخل العدد"
            className="mx-auto mt-6 grid max-w-3xl gap-4 print:hidden sm:grid-cols-2"
          >
            {prev ? (
              <Link
                href={`/articles/${prev.id}`}
                className="group rounded-md border border-line bg-raise p-5 transition-colors hover:border-gold"
              >
                <p className="mb-1 flex items-center gap-1.5 text-xs text-soft">
                  <ArrowRight className="size-3.5" />
                  السابق في العدد
                </p>
                <p className="font-semibold leading-7 text-ink group-hover:text-leather">
                  {prev.title}
                </p>
              </Link>
            ) : (
              <span aria-hidden />
            )}
            {next && (
              <Link
                href={`/articles/${next.id}`}
                className="group rounded-md border border-line bg-raise p-5 text-end transition-colors hover:border-gold"
              >
                <p className="mb-1 flex items-center justify-end gap-1.5 text-xs text-soft">
                  التالي في العدد
                  <ArrowLeft className="size-3.5" />
                </p>
                <p className="font-semibold leading-7 text-ink group-hover:text-leather">
                  {next.title}
                </p>
              </Link>
            )}
          </nav>
        )}

        {/* من نفس الباب */}
        {related.length > 0 && (
          <section className="mt-16 print:hidden">
            <h2 className="mb-6 text-2xl font-bold text-ink">
              من باب {article.sectionName}
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {related.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  );
}

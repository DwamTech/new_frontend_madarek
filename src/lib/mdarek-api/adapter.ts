// المحوّل: استجابات النظام القديم ← النماذج الداخلية الموحدة.
// دوال خالصة بلا شبكة — قابلة للاختبار على الـ fixtures مباشرة.

import type {
  RawArticle,
  RawComment,
  RawDossier,
  RawIssueDetail,
  RawIssueSummary,
  RawSection,
  RawTopic,
} from "./raw-types";
import type {
  Article,
  Author,
  Comment,
  Dossier,
  Issue,
  IssueSummary,
  Media,
  PdfDocument,
  SearchRecord,
  Section,
  Topic,
} from "./types";
import {
  estimateReadingMinutes,
  makeExcerpt,
  sanitizeArticleHtml,
  toPlainText,
} from "./sanitize";

/** أيقونات نظام التصميم لكل باب — بمفاتيح slugs النظام القديم */
const SECTION_ICONS: Record<string, string> = {
  opening: "pen-line",
  glossary: "book-a",
  profiles: "users",
  stats: "chart-column",
  news: "globe",
  refutations: "search-check",
  archive: "archive",
  history: "hourglass",
  library: "library",
  articles: "newspaper",
};

/** views_count يأتي نصًا في القوائم ورقمًا في التفاصيل — نوحده رقمًا */
function toCount(v: number | string | null | undefined): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** إزالة التطويل (ـ) من عناوين النظام القديم مثل «افتتــاحية الــعدد» */
function stripTatweel(s: string): string {
  return s.replace(/ـ/g, "");
}

/** توحيد المسافة قبل «هـ» في التواريخ الهجرية («1447هـ» ← «1447 هـ») */
function normalizeHijri(s: string): string {
  return s.replace(/(\d)\s*هـ/, "$1 هـ").trim();
}

function toMedia(url: string | null | undefined, alt: string): Media | null {
  if (!url || !/^https?:\/\//.test(url)) return null;
  return { url, alt };
}

function toPdf(url: string | null | undefined): PdfDocument | null {
  if (!url || !/^https?:\/\//.test(url)) return null;
  return { url };
}

/**
 * توحيد هويات الكتّاب: النظام القديم يُدخل نفس الشخص بصيغ متعددة
 * («الدكتور طارق الحمودي» و«د. طارق الحمّودي»…). المفاتيح هنا بعد
 * إسقاط التشكيل، والقيمة هي الصيغة الاعتمادية للعرض.
 * ملاحظة: دمج «محمد البشري» بصيغه الأربع اجتهاد يحتاج تأكيد التحرير.
 */
const AUTHOR_ALIASES: Record<string, string> = {
  "الدكتور طارق الحمودي": "د. طارق الحمّودي",
  "الدكتور محمد البشري": "د. محمد بن متعب البشري",
  "د. محمد البشري": "د. محمد بن متعب البشري",
  "د. محمد متعب البشري": "د. محمد بن متعب البشري",
  "هيئة تحرير مدارك": "هيئة تحرير مجلة مدارك",
  "د/عبد الله بن فهد بن عبد الرحمن العرفج":
    "د. عبد الله بن فهد بن عبد الرحمن العرفج",
};

/** مفتاح مطابقة الأسماء: بلا تشكيل وبمسافات موحدة */
function aliasKey(name: string): string {
  return name.replace(/[ً-ْٰ]/g, "").replace(/\s+/g, " ").trim();
}

/** «د. محمد أبو عمر - مصر» ← اسم + بلد (الشرطة بأنواعها، بشرط مسافات حولها) */
export function parseAuthor(raw: string | null | undefined): Author | null {
  const value = raw?.trim();
  if (!value) return null;
  const parts = value.split(/\s+[-–—]\s+/);
  let name = parts[0].trim();
  const country = parts.length > 1 ? parts.slice(1).join(" – ").trim() : null;
  name = AUTHOR_ALIASES[aliasKey(name)] ?? name;
  return { slug: authorSlug(name), name, country, raw: value };
}

/** معرّف مسار ثابت من الاسم العربي (يبقى عربيًا — صالح في مسارات Next) */
export function authorSlug(name: string): string {
  return name
    .replace(/[ً-ْٰـ]/g, "") // تشكيل وتطويل
    .replace(/[^\p{Letter}\p{Number}\s]/gu, "") // رموز وعلامات
    .trim()
    .replace(/\s+/g, "-");
}

export function adaptSection(raw: RawSection): Section {
  return {
    id: raw.id,
    slug: raw.slug,
    name: stripTatweel(raw.title).trim(),
    order: raw.sort_order,
    icon: SECTION_ICONS[raw.slug] ?? "newspaper",
    articleCount: raw.articles_count,
  };
}

/** عنوان العرض: open_title إن وجد، وإلا title (منظفًا من التطويل) */
export function articleDisplayTitle(raw: RawArticle): string {
  const open = raw.open_title?.trim();
  if (open) return stripTatweel(open).trim();
  return stripTatweel(raw.title).trim();
}

export function adaptArticle(
  raw: RawArticle,
  sections: Section[],
  issueNumber: number,
): Article {
  const section = sections.find((s) => s.id === raw.issue_section_id);
  const contentHtml = sanitizeArticleHtml(raw.content);
  const plain = toPlainText(contentHtml);

  return {
    id: raw.id,
    title: articleDisplayTitle(raw),
    excerpt: makeExcerpt(plain),
    contentHtml,
    sectionId: raw.issue_section_id,
    sectionSlug: section?.slug ?? "articles",
    sectionName: section?.name ?? "مقالات",
    issueId: raw.issue_id,
    issueNumber,
    author: parseAuthor(raw.author_name),
    cover: toMedia(raw.featured_image, articleDisplayTitle(raw)),
    pdf: toPdf(raw.pdf_file),
    references: (raw.references ?? []).map((r) => ({
      title: r.title?.trim() ?? "",
      url: r.url?.trim() || null,
    })),
    keywords: (raw.keywords ?? "")
      .split(/[،,]/)
      .map((k) => k.trim())
      .filter(Boolean),
    views: toCount(raw.views_count),
    readingMinutes: estimateReadingMinutes(plain),
    publishedAt: raw.published_at,
  };
}

export function adaptIssueSummary(raw: RawIssueSummary): IssueSummary {
  return {
    id: raw.id,
    number: raw.issue_number,
    title: raw.title.trim(),
    hijriDate: normalizeHijri(raw.hijri_date),
    gregorianDate: raw.gregorian_date.trim(),
    cover: toMedia(raw.cover_image, `غلاف ${raw.title}`),
    coverAlt: toMedia(raw.cover_image_alt, `غلاف ${raw.title} (بديل)`),
    pdf: toPdf(raw.pdf_file),
    views: toCount(raw.views_count),
    publishedAt: raw.published_at,
  };
}

/**
 * ملف بلا أي مقال صالح (article_ids لا تطابق أي مقال حقيقي في العدد)
 * يُسقَط دفاعيًا — أفضل من عرض ملف فارغ لا فائدة منه للزائر
 */
function adaptDossier(raw: RawDossier, articles: Article[]): Dossier | null {
  const dossierArticles = raw.article_ids
    .map((id) => articles.find((a) => a.id === id))
    .filter((a): a is Article => a !== undefined);
  if (dossierArticles.length === 0) return null;
  return {
    id: raw.id,
    slug: raw.slug,
    title: raw.title.trim(),
    intro: raw.intro?.trim() ?? "",
    cover: toMedia(raw.cover_image, raw.title.trim()),
    articles: dossierArticles,
  };
}

export function adaptIssue(raw: RawIssueDetail): Issue {
  const sections = (raw.sections ?? [])
    .filter((s) => s.is_active)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(adaptSection);

  const articles = (raw.articles ?? [])
    .filter((a) => a.status === "published" && !a.deleted_at)
    .map((a) => adaptArticle(a, sections, raw.issue_number))
    // ترتيب ثابت: ترتيب الباب ثم ترتيب الإدخال (لا يوجد sort_order للمقالات)
    .sort((a, b) => {
      const sa = sections.find((s) => s.id === a.sectionId)?.order ?? 99;
      const sb = sections.find((s) => s.id === b.sectionId)?.order ?? 99;
      return sa - sb || a.id - b.id;
    });

  // نتحقق من "draft" صراحةً بدل اشتراط "published" — لو أرسل الباكند
  // الملف بلا حقل status إطلاقًا (اختلاف بسيط عن العقد الموثَّق)، يظهر
  // الملف افتراضيًا بدل أن يختفي بصمت بسبب هذا الفرق وحده
  const dossiers = (raw.dossiers ?? [])
    .filter((d) => d.status !== "draft")
    .map((d) => adaptDossier(d, articles))
    .filter((d): d is Dossier => d !== null);

  return { ...adaptIssueSummary(raw), sections, articles, dossiers };
}

const TOPIC_CATEGORIES = new Set(["country", "author", "sect", "subject"]);

/** موضوع بفئة غير معروفة يُسقَط دفاعيًا — عقد الباكند يجب أن يلتزم بالقيم الأربع فقط */
export function adaptTopic(raw: RawTopic): Topic | null {
  if (!TOPIC_CATEGORIES.has(raw.category)) return null;
  return {
    id: raw.id,
    slug: raw.slug,
    name: raw.name.trim(),
    category: raw.category as Topic["category"],
    articleIds: raw.article_ids ?? [],
  };
}

export function adaptComment(raw: RawComment): Comment {
  return {
    id: raw.id,
    authorName: raw.author_name.trim(),
    text: raw.text.trim(),
    createdAt: raw.created_at,
  };
}

export function toSearchRecord(a: Article): SearchRecord {
  return {
    id: a.id,
    title: a.title,
    excerpt: a.excerpt,
    sectionSlug: a.sectionSlug,
    sectionName: a.sectionName,
    issueNumber: a.issueNumber,
    authorName: a.author?.name ?? null,
    authorSlug: a.author?.slug ?? null,
    keywords: a.keywords,
    readingMinutes: a.readingMinutes,
    views: a.views,
    publishedAt: a.publishedAt,
    plainText: toPlainText(a.contentHtml),
  };
}

/**
 * فحص عقد الـ API: يرمي خطأً وصفيًا إن تغيّر شكل الاستجابة عن الموثق —
 * تستدعيه الاختبارات وطبقة الجلب لاكتشاف أي تغيير في النظام القديم مبكرًا.
 */
export function assertIssueDetailContract(raw: unknown): RawIssueDetail {
  const o = raw as Partial<RawIssueDetail>;
  const missing: string[] = [];
  for (const k of [
    "id",
    "issue_number",
    "title",
    "hijri_date",
    "gregorian_date",
    "articles",
    "sections",
  ] as const) {
    if (o?.[k] === undefined) missing.push(k);
  }
  if (missing.length) {
    throw new Error(
      `تغيّر عقد API الأعداد — حقول مفقودة: ${missing.join(", ")}`,
    );
  }
  const a = (o.articles as RawArticle[])[0];
  if (a) {
    const artMissing: string[] = [];
    for (const k of ["id", "issue_section_id", "title", "content"] as const) {
      if (a[k] === undefined) artMissing.push(k);
    }
    if (artMissing.length) {
      throw new Error(
        `تغيّر عقد API المقالات — حقول مفقودة: ${artMissing.join(", ")}`,
      );
    }
  }
  return raw as RawIssueDetail;
}

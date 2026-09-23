// النماذج الداخلية الموحدة للتطبيق — مستقلة تمامًا عن شكل بيانات النظام القديم.
// كل الواجهة تستهلك هذه الأنواع فقط؛ التحويل يحدث في adapter.ts حصريًا.

export interface Media {
  url: string;
  alt: string;
}

export interface PdfDocument {
  url: string;
}

export interface Author {
  /** معرّف مشتق ثابت للمسارات (من الاسم الطبيعي) */
  slug: string;
  name: string;
  country: string | null;
  /** القيمة الأصلية كما وردت (للتشخيص) */
  raw: string;
}

export interface Section {
  id: number;
  slug: string;
  name: string;
  order: number;
  /** اسم أيقونة lucide في نظام التصميم */
  icon: string;
  articleCount: number;
}

export interface Reference {
  title: string;
  url: string | null;
}

export interface Article {
  id: number;
  title: string;
  /** مقتطف نصي نظيف مشتق من المحتوى */
  excerpt: string;
  /** HTML منظّف وجاهز للعرض الآمن */
  contentHtml: string;
  sectionId: number;
  sectionSlug: string;
  sectionName: string;
  issueId: number;
  issueNumber: number;
  author: Author | null;
  cover: Media | null;
  pdf: PdfDocument | null;
  references: Reference[];
  keywords: string[];
  views: number;
  readingMinutes: number;
  publishedAt: string | null;
}

/**
 * ملف خاص (Dossier) — مجموعة مقالات من نفس العدد تشترك في موضوع واحد
 * (مثل "ملف ابن عربي"). العقد المرسَل لمبرمج الباكند: حقل `dossiers`
 * ضمن استجابة تفاصيل العدد نفسها (GET /issues/{id})، كل عنصر بالشكل:
 * { id, slug, title, intro, cover_image, article_ids, status }
 * حيث article_ids معرّفات مقالات من نفس العدد، وcover_image رابط صورة
 * مُصدَّرة من صفحة داخلية في ملف PDF العدد (لا رقم صفحة وحده).
 */
export interface Dossier {
  id: number;
  slug: string;
  title: string;
  intro: string;
  cover: Media | null;
  articles: Article[];
}

export interface Issue {
  id: number;
  number: number;
  title: string;
  hijriDate: string;
  gregorianDate: string;
  cover: Media | null;
  coverAlt: Media | null;
  pdf: PdfDocument | null;
  views: number;
  publishedAt: string | null;
  sections: Section[];
  articles: Article[];
  dossiers: Dossier[];
}

/**
 * قيمة واحدة في "شجرة المواضيع" — عنصر ضمن إحدى الفئات الأربع الثابتة
 * (دولة/كاتب/فرقة/موضوع)، مرتبط بمقالات من كل الأعداد. العقد المرسَل
 * لمبرمج الباكند: نقطة جديدة GET /topics تُرجع مصفوفة مسطّحة بالشكل:
 * { id, slug, name, category, article_ids }
 * حيث category إحدى القيم الثابتة بالضبط: "country" | "author" |
 * "sect" | "subject" — لا شجرة parent_id، فالفئات الأربع أنفسها ثابتة
 * في الواجهة الأمامية ولا تُرسَل من الباكند.
 */
export interface Topic {
  id: number;
  slug: string;
  name: string;
  category: "country" | "author" | "sect" | "subject";
  articleIds: number[];
}

/** نسخة خفيفة للقوائم (بلا مقالات) */
export type IssueSummary = Omit<Issue, "articles" | "sections" | "dossiers"> & {
  sections?: Section[];
  dossiers?: Dossier[];
};

/**
 * تعليق منشور (مُعتمَد من المدير) على مقال. العقد المرسَل لمبرمج
 * الباكند: نقطة جديدة GET /articles/{id}/comments تُرجع مصفوفة
 * بالشكل: { id, author_name, text, status, created_at } — نعرض
 * `status === "approved"` فقط؛ الفلترة تحدث هنا لا في الواجهة أبدًا
 * حتى لا يظهر تعليق بانتظار المراجعة أو مرفوض بالخطأ.
 */
export interface Comment {
  id: number;
  authorName: string;
  text: string;
  createdAt: string;
}

/**
 * عدّادا الإعجاب/عدم الإعجاب لمقال. العقد المرسَل لمبرمج الباكند:
 * نقطة جديدة GET /articles/{id}/reactions تُرجع: { likes, dislikes }
 */
export interface ReactionCounts {
  likes: number;
  dislikes: number;
}

/** سجل خفيف لفهرس البحث في المتصفح — بلا HTML */
export interface SearchRecord {
  id: number;
  title: string;
  excerpt: string;
  sectionSlug: string;
  sectionName: string;
  issueNumber: number;
  authorName: string | null;
  authorSlug: string | null;
  keywords: string[];
  readingMinutes: number;
  views: number;
  publishedAt: string | null;
  /** نص المحتوى الكامل منزوع الوسوم للبحث */
  plainText: string;
}

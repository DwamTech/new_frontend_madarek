// أشكال استجابات API النظام القديم (back.mdarek.net) كما وردت فعليًا —
// موثقة من الفحص بتاريخ 2026-07-10. أي تغيير هنا يعني تغير عقد الـ API القديم.

export type RawPaginated<T> = {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string;
  links: unknown[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
};

export type RawIssueSummary = {
  id: number;
  user_id: number;
  title: string;
  slug: string;
  issue_number: number;
  cover_image: string | null;
  cover_image_alt: string | null;
  pdf_file: string | null;
  hijri_date: string;
  gregorian_date: string;
  /** يأتي نصًا في القائمة ورقمًا في التفاصيل */
  views_count: number | string;
  status: string;
  published_at: string | null;
  published_date: string | null;
  published_time: string | null;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type RawSection = {
  id: number;
  issue_id: number;
  title: string;
  slug: string;
  key: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  articles_count: number;
};

export type RawReference = {
  title: string;
  url?: string | null;
};

export type RawArticle = {
  id: number;
  user_id: number;
  issue_id: number;
  issue_section_id: number;
  /** في أبواب الأعمدة = اسم الباب؛ في باب «مقالات» = عنوان المقال نفسه */
  title: string;
  /** العنوان الفعلي للمادة (قد يساوي title أو يكون فارغًا) */
  open_title: string | null;
  slug: string;
  keywords: string | null;
  /** HTML غير موثوق — يجب تنظيفه قبل العرض */
  content: string | null;
  /** بصيغة «اسم – بلد» غالبًا، وقد يكون فارغًا */
  author_name: string | null;
  featured_image: string | null;
  pdf_file: string | null;
  gregorian_date: string | null;
  hijri_date: string | null;
  references: RawReference[] | null;
  status: string;
  published_at: string | null;
  views_count: number | string;
  /** يساوي key الباب (arc-*) أو يكون فارغًا في باب مقالات */
  className: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * ملف خاص كما يُفترَض أن يصل من الباكند ضمن تفاصيل العدد — عقد لم
 * يُنفَّذ بعد في النظام القديم (ميزة جديدة)، موثَّق هنا مسبقًا حتى
 * يعمل الربط تلقائيًا فور إضافته من جهة الباكند بلا أي تعديل هنا
 */
export type RawDossier = {
  id: number;
  slug: string;
  title: string;
  intro: string | null;
  /** رابط صورة مُصدَّرة من صفحة داخل PDF العدد — لا رقم صفحة */
  cover_image: string | null;
  article_ids: number[];
  status: string;
};

export type RawIssueDetail = RawIssueSummary & {
  articles: RawArticle[];
  sections: RawSection[];
  /** اختياري عمدًا: غير موجود بعد في النظام القديم */
  dossiers?: RawDossier[];
};

/** GET /api/articles/{id} يعيد الكائن مغلفًا */
export type RawArticleEnvelope = { article: RawArticle };

/**
 * قيمة موضوع كما يُفترَض أن ترد من نقطة GET /topics الجديدة — عقد لم
 * يُنفَّذ بعد في النظام القديم، موثَّق هنا مسبقًا حتى يعمل الربط
 * تلقائيًا فور إضافته من جهة الباكند بلا أي تعديل هنا. category يجب
 * أن تكون إحدى القيم الثابتة بالضبط: country | author | sect | subject
 */
export type RawTopic = {
  id: number;
  slug: string;
  name: string;
  category: string;
  article_ids: number[];
};

/**
 * تعليق كما يُفترَض أن يرد من نقطة GET /articles/{id}/comments الجديدة
 * — عقد لم يُنفَّذ بعد، موثَّق هنا مسبقًا ليعمل الربط تلقائيًا فور
 * إضافته من جهة الباكند بلا أي تعديل هنا. status يجب أن تكون إحدى:
 * pending | approved | rejected — تُعرض approved فقط للزوار
 */
export type RawComment = {
  id: number;
  author_name: string;
  text: string;
  status: string;
  created_at: string;
};

/**
 * عدّادا إعجاب/عدم إعجاب مقال كما يُفترَض أن يردا من نقطة جديدة
 * GET /articles/{id}/reactions — عقد لم يُنفَّذ بعد، موثَّق هنا مسبقًا
 */
export type RawReactionCounts = {
  likes: number;
  dislikes: number;
};

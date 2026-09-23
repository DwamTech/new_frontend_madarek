import type { CSSProperties } from "react";

/**
 * صبغة كل باب من أبواب المجلة العشرة.
 * المفاتيح هي slugs الأبواب الداخلية كما تصل من طبقة التكامل
 * (opening, glossary, … articles) — تحقَّق منها مقابل API الأعداد.
 *
 * الانضباط: الصبغة تظهر في الأيقونة والشارة وخط رفيع فقط.
 * لا تُلوَّن بها الأزرار ولا الروابط ولا العناوين، حتى تبقى
 * هوية «التذهيب» (الورق والحبر والجلدي) هي الكروم الثابت.
 */
const SECTION_PIGMENT: Record<string, string> = {
  opening: "house", // افتتاحية العدد — صوت المجلة، يبقى جلديًا
  glossary: "indigo", // قاموس المصطلحات
  profiles: "plum", // شخصيات صوفية
  stats: "teal", // إحصائيات وتحليلات
  news: "malachite", // الصوفية حول العالم
  refutations: "vermilion", // شبهات تحت المجهر
  archive: "ochre", // خزانة الوثائق
  history: "olive", // محطات تاريخية
  library: "madder", // عصارة الكتب
  articles: "lapis", // مقالات
};

/** اسم الصبغة لباب ما — الجلدي احتياطًا لأي باب جديد لم يُخصَّص بعد */
export function sectionPigment(slug: string): string {
  return SECTION_PIGMENT[slug] ?? "house";
}

/**
 * ترتيب عرض الأبواب في شبكات "استكشف الأبواب" — مستقل عن sort_order
 * القادم من الباكند. يضع «مقالات» مباشرة أسفل «افتتاحية العدد» (نفس
 * العمود في شبكة 5 أعمدة) و«محطات تاريخية» في آخر الشبكة.
 */
const SECTION_DISPLAY_ORDER = [
  "opening",
  "news",
  "stats",
  "profiles",
  "glossary",
  "articles",
  "library",
  "archive",
  "refutations",
  "history",
];

/** يرتّب أي مصفوفة أبواب حسب SECTION_DISPLAY_ORDER — الأبواب غير المعروفة تُلحق في آخرها بترتيبها الأصلي */
export function orderSectionsForDisplay<T extends { slug: string }>(
  sections: T[],
): T[] {
  return [...sections].sort((a, b) => {
    const ia = SECTION_DISPLAY_ORDER.indexOf(a.slug);
    const ib = SECTION_DISPLAY_ORDER.indexOf(b.slug);
    return (ia === -1 ? Infinity : ia) - (ib === -1 ? Infinity : ib);
  });
}

/**
 * يضع «مقالات» مباشرة بعد «افتتاحية العدد» (لا أسفلها في شبكة) وبقية
 * الأبواب بترتيبها الأصلي — لفهرس العدد، أرشيف الأبواب، وقائمة الأبواب
 * المنسدلة في شريط التنقل تحديدًا (لا شبكة "استكشف الأبواب" بالرئيسية).
 */
export function orderSectionsArticlesAfterOpening<T extends { slug: string }>(
  sections: T[],
): T[] {
  const opening = sections.filter((s) => s.slug === "opening");
  const articles = sections.filter((s) => s.slug === "articles");
  const rest = sections.filter((s) => s.slug !== "opening" && s.slug !== "articles");
  return [...opening, ...articles, ...rest];
}

/**
 * متغيرات CSS للباب: تُوضع على عنصر حاوٍ ثم يستهلكها الأبناء
 * عبر var(--pig) و var(--pig-soft). نمرّرها بالأسلوب هذا لأن
 * أسماء أصناف Tailwind الديناميكية لا تُلتقط وقت البناء.
 */
export function sectionColorStyle(slug: string): CSSProperties {
  const pigment = sectionPigment(slug);
  return {
    "--pig": `var(--pig-${pigment})`,
    "--pig-soft": `var(--pig-${pigment}-soft)`,
  } as CSSProperties;
}

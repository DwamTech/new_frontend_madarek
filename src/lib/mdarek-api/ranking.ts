/**
 * ترجيح «الأكثر قراءة» بعمر المادة.
 *
 * لماذا رقم العدد لا published_at؟
 * أعداد مدارك من ١ إلى ٦ كلها تحمل التاريخ نفسه (2026-05-18) في النظام
 * القديم — وهو تاريخ إدخالها دفعةً واحدة لا تاريخ نشرها الحقيقي. فالاعتماد
 * على published_at يجعل العدد الأول بعمر العدد السادس ويشوّه الترتيب.
 * أما رقم العدد فبيان تحريري حقيقي: المجلة شهرية، فالمسافة بين رقمين
 * هي عمر المادة بالأشهر. لا تُعِد هذا إلى published_at إلا بعد أن
 * تُصحَّح تواريخ الأعداد القديمة في النظام القديم.
 */

/**
 * ثابت التنعيم بالأشهر. مُعايَر على البيانات الحقيقية:
 * ١ يجعل الحداثة تطغى على الشعبية، و٣ يعيد تجميد القائمة على القديم.
 * ٢ يُبقي المواد القوية قديمةً في القمة ويفتح الباب للجديدة معًا.
 */
export const AGE_SMOOTHING_MONTHS = 2;

export type Rankable = { views: number; issueNumber: number };

/** معدّل القراءة الشهري التقريبي — كلما قدُمت المادة قُسِّمت مشاهداتها على عمر أطول */
export function readershipScore(
  item: Rankable,
  currentIssueNumber: number,
): number {
  const monthsOld = Math.max(0, currentIssueNumber - item.issueNumber);
  return item.views / (monthsOld + AGE_SMOOTHING_MONTHS);
}

/**
 * ترتيب تنازلي بالمعدّل المرجّح، والمشاهدات الخام فاصلًا عند التساوي
 * حتى يبقى الترتيب حتميًا (مهم مع كاش ISR).
 */
export function rankByReadership<T extends Rankable>(
  items: readonly T[],
  limit: number,
): T[] {
  if (items.length === 0) return [];
  const currentIssueNumber = Math.max(...items.map((i) => i.issueNumber));
  return [...items]
    .sort(
      (a, b) =>
        readershipScore(b, currentIssueNumber) -
          readershipScore(a, currentIssueNumber) || b.views - a.views,
    )
    .slice(0, limit);
}

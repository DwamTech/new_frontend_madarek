// الواجهة العامة لطبقة التكامل — كل صفحات التطبيق تستورد من هنا فقط.
// قراءة فقط من النظام القديم؛ لا استدعاء لأي endpoint كتابة (مثل POST /view).

import "server-only";
import { cache } from "react";
import { fetchJson, MdarekApiError } from "./client";
import {
  adaptComment,
  adaptIssue,
  adaptIssueSummary,
  adaptTopic,
  assertIssueDetailContract,
  toSearchRecord,
} from "./adapter";
import { rankByReadership } from "./ranking";
import { authorSortKey } from "@/lib/format";
import type {
  RawComment,
  RawIssueDetail,
  RawIssueSummary,
  RawPaginated,
  RawReactionCounts,
  RawTopic,
} from "./raw-types";
import type {
  Article,
  Author,
  Comment,
  Dossier,
  Issue,
  IssueSummary,
  ReactionCounts,
  SearchRecord,
  Section,
  Topic,
} from "./types";

// عينات حقيقية محفوظة (2026-07-10) — صمام أمان عند تعطل النظام القديم
import fixtureIssues from "./__fixtures__/issues-list.json";
import fixtureIssue14 from "./__fixtures__/issue-14.json";
import fixtureIssue2 from "./__fixtures__/issue-2.json";

const FIXTURE_ISSUES = new Map<number, RawIssueDetail>([
  [14, fixtureIssue14 as unknown as RawIssueDetail],
  [2, fixtureIssue2 as unknown as RawIssueDetail],
]);

function logFallback(what: string) {
  console.warn(`[mdarek-api] سقوط للعينات المحفوظة: ${what}`);
}

/** كل الأعداد المنشورة — الأحدث أولًا (لا نفترض عددها؛ نتبع pagination) */
export const getIssueSummaries = cache(async (): Promise<IssueSummary[]> => {
  const collect = async (): Promise<RawIssueSummary[]> => {
    const all: RawIssueSummary[] = [];
    let page = 1;
    let lastPage = 1;
    do {
      const res = await fetchJson<RawPaginated<RawIssueSummary>>(
        `/issues?status=published&page=${page}`,
      );
      all.push(...res.data);
      lastPage = res.last_page;
      page += 1;
    } while (page <= lastPage);
    return all;
  };

  let raw: RawIssueSummary[];
  try {
    raw = await collect();
  } catch {
    logFallback("قائمة الأعداد");
    raw = (fixtureIssues as unknown as RawPaginated<RawIssueSummary>).data;
  }

  return raw
    .filter((i) => i.status === "published")
    .map(adaptIssueSummary)
    .sort((a, b) => b.number - a.number);
});

/** عدد كامل بالمعرّف الداخلي للنظام القديم */
export const getIssueById = cache(async (id: number): Promise<Issue | null> => {
  try {
    const raw = await fetchJson<RawIssueDetail>(`/issues/${id}`);
    return adaptIssue(assertIssueDetailContract(raw));
  } catch (e) {
    if (e instanceof MdarekApiError && e.status === 404) return null;
    const fixture = FIXTURE_ISSUES.get(id);
    if (fixture) {
      logFallback(`العدد id=${id}`);
      return adaptIssue(fixture);
    }
    throw e;
  }
});

/** عدد كامل برقمه التحريري (الذي يظهر في المسارات /issues/7) */
export async function getIssueByNumber(number: number): Promise<Issue | null> {
  const summaries = await getIssueSummaries();
  const summary = summaries.find((s) => s.number === number);
  if (!summary) return null;
  return getIssueById(summary.id);
}

export async function getCurrentIssue(): Promise<Issue | null> {
  const summaries = await getIssueSummaries();
  if (summaries.length === 0) return null;
  return getIssueById(summaries[0].id);
}

/** أبواب العدد الحالي — للتنقل الرئيسي */
export async function getCurrentSections(): Promise<Section[]> {
  const issue = await getCurrentIssue();
  return issue?.sections ?? [];
}

/** كل الأعداد بمحتواها الكامل (نداءات مخزنة مؤقتًا — تُحسب مرة كل ساعة) */
export const getAllIssues = cache(async (): Promise<Issue[]> => {
  const summaries = await getIssueSummaries();
  const issues = await Promise.all(summaries.map((s) => getIssueById(s.id)));
  return issues.filter((i): i is Issue => i !== null);
});

/** مقال بمعرّفه + سياقه: عدده، والسابق/التالي داخل العدد */
export async function getArticleContext(articleId: number): Promise<{
  article: Article;
  issue: Issue;
  prev: Article | null;
  next: Article | null;
} | null> {
  // نبحث في الأعداد (المخزنة مؤقتًا) بدل نداء /articles/{id}
  // حتى يبقى المقال وسياقه من مصدر واحد متسق
  const issues = await getAllIssues();
  for (const issue of issues) {
    const idx = issue.articles.findIndex((a) => a.id === articleId);
    if (idx !== -1) {
      return {
        article: issue.articles[idx],
        issue,
        prev: idx > 0 ? issue.articles[idx - 1] : null,
        next: idx < issue.articles.length - 1 ? issue.articles[idx + 1] : null,
      };
    }
  }
  return null;
}

/** مواد باب معين عبر كل الأعداد */
export async function getArticlesBySection(slug: string): Promise<Article[]> {
  const issues = await getAllIssues();
  return issues.flatMap((i) =>
    i.articles.filter((a) => a.sectionSlug === slug),
  );
}

/** كل مواد المجلة عبر كل الأعداد (الأحدث عددًا أولًا بترتيب الأبواب داخله) */
export async function getAllArticles(): Promise<Article[]> {
  const issues = await getAllIssues();
  return issues.flatMap((i) => i.articles);
}

/** الأكثر قراءة عبر كل الأعداد — من عدادات القراءة الحقيقية في النظام القديم */
export async function getMostRead(limit = 3): Promise<Article[]> {
  const all = await getAllArticles();
  return rankByReadership(all, limit);
}

/**
 * «من الأرشيف»: مواد من أعداد سابقة بتناوب أسبوعي حتمي —
 * seed ثابت من رقم الأسبوع كي لا يتضارب الاختيار مع كاش ISR،
 * ويتجدد تلقائيًا كل أسبوع.
 */
export async function getArchiveSpotlight(count = 2): Promise<Article[]> {
  const issues = await getAllIssues();
  if (issues.length === 0) return [];
  const currentNumber = issues[0].number;
  const archive = issues
    .filter((i) => i.number !== currentNumber)
    .flatMap((i) => i.articles);
  if (archive.length === 0) return [];
  const week = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  const start = (week * count) % archive.length;
  return Array.from(
    { length: Math.min(count, archive.length) },
    (_, k) => archive[(start + k) % archive.length],
  );
}

/** الكتّاب مجمّعين من كل الأعداد مع إنتاجهم */
export const getAuthors = cache(
  async (): Promise<{ author: Author; articles: Article[] }[]> => {
    const issues = await getAllIssues();
    const map = new Map<string, { author: Author; articles: Article[] }>();
    for (const issue of issues) {
      for (const article of issue.articles) {
        if (!article.author) continue;
        const entry = map.get(article.author.slug);
        if (entry) {
          entry.articles.push(article);
          // بعد توحيد الأسماء قد يحمل سجل واحد فقط بيان البلد
          if (!entry.author.country && article.author.country) {
            entry.author = { ...entry.author, country: article.author.country };
          }
        } else {
          map.set(article.author.slug, {
            author: article.author,
            articles: [article],
          });
        }
      }
    }
    return [...map.values()].sort((a, b) =>
      authorSortKey(a.author.name).localeCompare(authorSortKey(b.author.name), "ar"),
    );
  },
);

/** فهرس البحث الخفيف (بلا HTML) — يُمرر لمكوّن البحث العميل */
export const getSearchIndex = cache(async (): Promise<SearchRecord[]> => {
  const issues = await getAllIssues();
  return issues.flatMap((i) => i.articles.map(toSearchRecord));
});

/**
 * كل الملفات الخاصة عبر كل الأعداد — تُقرأ من نفس استجابة تفاصيل
 * العدد (حقل dossiers، انظر adapter.ts). تُرجع مصفوفة فارغة حاليًا
 * حتى يضيف الباكند هذا الحقل فعليًا — لا خطأ ولا حاجة لتعديل هنا لاحقًا
 */
export async function getAllDossiers(): Promise<
  { dossier: Dossier; issueNumber: number }[]
> {
  const issues = await getAllIssues();
  return issues.flatMap((i) =>
    i.dossiers.map((dossier) => ({ dossier, issueNumber: i.number })),
  );
}

/**
 * كل قيم "شجرة المواضيع" (نقطة جديدة GET /topics غير موجودة بعد في
 * النظام القديم) — تُرجع مصفوفة فارغة دفاعيًا إذا فشل النداء (النقطة
 * غير مُنفَّذة بعد)، لا خطأ يوقف الصفحة. لا حاجة لتعديل هنا لاحقًا؛
 * تعمل تلقائيًا فور توفر النقطة من الباكند بالشكل الموثَّق في raw-types.ts
 */
export const getTopics = cache(async (): Promise<Topic[]> => {
  try {
    const raw = await fetchJson<RawTopic[]>("/topics");
    return raw.map(adaptTopic).filter((t): t is Topic => t !== null);
  } catch {
    return [];
  }
});

/**
 * تعليقات مقال المعتمَدة فقط (نقطة جديدة GET /articles/{id}/comments
 * غير موجودة بعد في النظام القديم) — تُرجع مصفوفة فارغة دفاعيًا إذا
 * فشل النداء، لا خطأ يوقف صفحة المقال. لا حاجة لتعديل هنا لاحقًا؛
 * تعمل تلقائيًا فور توفر النقطة من الباكند بالشكل الموثَّق في raw-types.ts
 */
export async function getComments(articleId: number): Promise<Comment[]> {
  try {
    // Moderation changes must be visible on the next article refresh, so this
    // endpoint intentionally does not inherit the long-lived editorial cache.
    const raw = await fetchJson<RawComment[]>(`/articles/${articleId}/comments`, { revalidate: 0 });
    return raw
      .filter((c) => c.status === "approved")
      .map(adaptComment)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  } catch {
    return [];
  }
}

/**
 * عدّادا إعجاب/عدم إعجاب مقال (نقطة جديدة GET /articles/{id}/reactions
 * غير موجودة بعد في النظام القديم) — صفران دفاعيًا إذا فشل النداء
 */
export async function getReactionCounts(articleId: number): Promise<ReactionCounts> {
  try {
    const raw = await fetchJson<RawReactionCounts>(`/articles/${articleId}/reactions`);
    return { likes: raw.likes ?? 0, dislikes: raw.dislikes ?? 0 };
  } catch {
    return { likes: 0, dislikes: 0 };
  }
}

export type {
  Article,
  Author,
  Comment,
  Dossier,
  Issue,
  IssueSummary,
  ReactionCounts,
  SearchRecord,
  Section,
  Topic,
};
export type { Media, PdfDocument, Reference } from "./types";

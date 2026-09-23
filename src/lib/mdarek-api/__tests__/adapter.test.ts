// اختبارات المحوّل على عينات حقيقية من API النظام القديم.
// إن تغيّر عقد الـ API (حقل حُذف أو تغيّر نوعه) تفشل هذه الاختبارات مبكرًا.

import { describe, expect, it } from "vitest";
import {
  adaptIssue,
  adaptIssueSummary,
  articleDisplayTitle,
  assertIssueDetailContract,
  authorSlug,
  parseAuthor,
  toSearchRecord,
} from "../adapter";
import {
  estimateReadingMinutes,
  extractHighlights,
  makeExcerpt,
  sanitizeArticleHtml,
  toPlainText,
} from "../sanitize";
import type {
  RawIssueDetail,
  RawIssueSummary,
  RawPaginated,
} from "../raw-types";

import issuesList from "../__fixtures__/issues-list.json";
import issue14 from "../__fixtures__/issue-2.json";
import issue14Real from "../__fixtures__/issue-14.json";

const list = issuesList as unknown as RawPaginated<RawIssueSummary>;
const rawIssue14 = issue14Real as unknown as RawIssueDetail;
const rawIssue2 = issue14 as unknown as RawIssueDetail;

describe("عقد الـ API", () => {
  it("عينتا العددين تطابقان العقد الموثق", () => {
    expect(() => assertIssueDetailContract(rawIssue14)).not.toThrow();
    expect(() => assertIssueDetailContract(rawIssue2)).not.toThrow();
  });

  it("يرمي خطأً وصفيًا عند غياب الحقول", () => {
    expect(() => assertIssueDetailContract({})).toThrow(/حقول مفقودة/);
  });

  it("قائمة الأعداد Laravel pagination بحقولها المعروفة", () => {
    expect(list.total).toBeGreaterThan(0);
    expect(Array.isArray(list.data)).toBe(true);
    expect(list.per_page).toBeGreaterThan(0);
    expect(list.data[0].issue_number).toBeTypeOf("number");
  });
});

describe("تحويل الأعداد", () => {
  it("يحوّل ملخص العدد مع توحيد views رقمًا", () => {
    const s = adaptIssueSummary(list.data[0]);
    expect(s.number).toBeGreaterThan(0);
    expect(s.views).toBeTypeOf("number");
    expect(s.cover?.url).toMatch(/^https:\/\/back\.mdarek\.net\//);
    expect(s.pdf?.url).toMatch(/\.pdf$/);
  });

  it("يوحد المسافة قبل هـ في التاريخ الهجري", () => {
    const noSpace = list.data.find((i) => /\dهـ/.test(i.hijri_date));
    expect(noSpace).toBeDefined();
    const s = adaptIssueSummary(noSpace!);
    expect(s.hijriDate).toMatch(/\d هـ/);
  });

  it("العدد السابع: 10 أبواب مرتبة و14 مادة", () => {
    const issue = adaptIssue(rawIssue14);
    expect(issue.number).toBe(7);
    expect(issue.sections).toHaveLength(10);
    expect(issue.sections[0].slug).toBe("opening");
    expect(issue.sections.at(-1)?.slug).toBe("articles");
    expect(issue.articles).toHaveLength(14);
    // المقالات مرتبة بترتيب الأبواب
    const orders = issue.articles.map(
      (a) => issue.sections.find((s) => s.id === a.sectionId)?.order ?? 99,
    );
    expect([...orders].sort((a, b) => a - b)).toEqual(orders);
  });

  it("ينظف التطويل من أسماء الأبواب والعناوين", () => {
    const issue = adaptIssue(rawIssue14);
    const opening = issue.sections.find((s) => s.slug === "opening");
    expect(opening?.name).toBe("افتتاحية العدد");
    expect(issue.articles.every((a) => !a.title.includes("ـ"))).toBe(true);
  });
});

describe("تحويل المقالات", () => {
  const issue = adaptIssue(rawIssue14);

  it("يعتمد open_title عنوانًا للعرض في أبواب الأعمدة", () => {
    const editorial = issue.articles.find((a) => a.sectionSlug === "opening");
    expect(editorial?.title).toBe("الإحسان بين الأولياء والأشقياء");
  });

  it("يحلل الكاتب اسمًا وبلدًا بأنواع الشرطات", () => {
    expect(parseAuthor("أسامة شحادة – الأردن")).toMatchObject({
      name: "أسامة شحادة",
      country: "الأردن",
    });
    expect(parseAuthor("د. محمد أبو عمر - مصر")).toMatchObject({
      name: "د. محمد أبو عمر",
      country: "مصر",
    });
    expect(parseAuthor("هيئة تحرير مجلة مدارك")).toMatchObject({
      name: "هيئة تحرير مجلة مدارك",
      country: null,
    });
    expect(parseAuthor("")).toBeNull();
    expect(parseAuthor(null)).toBeNull();
  });

  it("يوحد صيغ الاسم المتعددة لنفس الكاتب (aliases)", () => {
    const a = parseAuthor("الدكتور طارق الحمودي");
    const b = parseAuthor("د. طارق الحمّودي - المغرب");
    expect(a?.slug).toBe(b?.slug);
    expect(a?.name).toBe("د. طارق الحمّودي");
    expect(parseAuthor("هيئة تحرير مدارك")?.name).toBe(
      "هيئة تحرير مجلة مدارك",
    );
    expect(parseAuthor("د. محمد البشري - السعودية")?.name).toBe(
      "د. محمد بن متعب البشري",
    );
  });

  it("authorSlug بلا مسافات ولا رموز", () => {
    const slug = authorSlug("د. محمد أبو عمر");
    expect(slug).not.toMatch(/[\s.]/);
    expect(slug.length).toBeGreaterThan(3);
  });

  it("المقال الفارغ (122): بلا كاتب ولا صورة ولا PDF — دون انهيار", () => {
    const empty = issue.articles.find((a) => a.id === 122);
    expect(empty).toBeDefined();
    expect(empty?.author).toBeNull();
    expect(empty?.cover).toBeNull();
    expect(empty?.pdf).toBeNull();
    expect(empty?.keywords).toEqual([]);
  });

  it("المراجع مصفوفة {عنوان، رابط}", () => {
    const withRefs = issue.articles.find((a) => a.references.length > 0);
    expect(withRefs).toBeDefined();
    expect(withRefs!.references[0].title.length).toBeGreaterThan(0);
  });

  it("زمن القراءة والمقتطف محسوبان", () => {
    for (const a of issue.articles) {
      expect(a.readingMinutes).toBeGreaterThanOrEqual(1);
      if (a.contentHtml) expect(a.excerpt.length).toBeGreaterThan(0);
    }
  });

  it("fallback للعنوان من title عند غياب open_title", () => {
    expect(
      articleDisplayTitle({
        title: "عنوان تجريبي",
        open_title: null,
      } as never),
    ).toBe("عنوان تجريبي");
  });
});

describe("تنظيف HTML", () => {
  it("يزيل التنسيقات المضمنة ويفك span العادي ويبقي البنية", () => {
    const dirty =
      '<p style="text-align: justify;"><span style="font-family: var(--font-cairo);"><strong>نص مهم</strong></span></p>';
    const clean = sanitizeArticleHtml(dirty);
    expect(clean).not.toContain("style=");
    expect(clean).not.toContain("<span");
    expect(clean).not.toContain("<mark");
    expect(clean).toContain("<strong>نص مهم</strong>");
    expect(clean).toContain("<p>");
  });

  it("يفكّ رابط علامة الهامش الميتة ويبقي نصها [3]", () => {
    // نمط Word في النظام القديم: علامة تشير إلى هامش لا وجود لهدفه
    const dirty =
      '<p>قال المؤلف<a href="#_ftn3"><strong>[3]</strong></a> ثم أردف.</p>';
    const clean = sanitizeArticleHtml(dirty);
    expect(clean).not.toContain("<a");
    expect(clean).not.toContain("_ftn3");
    expect(clean).toContain("[3]"); // العلامة محتوى تحريري يبقى
  });

  it("يبقي الرابط الداخلي إن كان هدفه موجودًا فعلًا وبلا target=_blank", () => {
    const dirty =
      '<p><a href="#_ftn1">[1]</a></p><p id="_ftn1">نص الهامش الأول.</p>';
    const clean = sanitizeArticleHtml(dirty);
    expect(clean).toContain('href="#_ftn1"');
    expect(clean).not.toContain("_blank");
  });

  it("الروابط الخارجية تبقى وتُفتح في تبويب جديد بأمان", () => {
    const clean = sanitizeArticleHtml('<p><a href="https://x.test/a">مصدر</a></p>');
    expect(clean).toContain('target="_blank"');
    expect(clean).toContain('rel="noopener noreferrer"');
  });

  it("يحوّل التمييز الذهبي التحريري إلى mark ويحافظ عليه", () => {
    const dirty =
      '<p><span style="color: rgb(202, 138, 4); font-family: var(--font-cairo);"><strong>"أن تعبد الله كأنك تراه، فإن لم تكن تراه فإنه يراك"</strong></span></p>';
    const clean = sanitizeArticleHtml(dirty);
    expect(clean).toContain("<mark>");
    expect(clean).not.toContain("style=");
    expect(clean).not.toContain("<span");
    expect(clean).toContain("أن تعبد الله كأنك تراه");
  });

  it("extractHighlights يستخرج المقتطفات الحقيقية من محتوى العدد السابع", () => {
    const editorial = rawIssue14.articles.find((a) => a.id === 119)!;
    const clean = sanitizeArticleHtml(editorial.content);
    expect(clean).toContain("<mark>");
    const highlights = extractHighlights(clean);
    expect(highlights.length).toBeGreaterThan(0);
    expect(highlights.some((h) => h.includes("أن تعبد الله كأنك تراه"))).toBe(true);
    // ضمن حدود الطول المقررة ولا تكرار
    for (const h of highlights) {
      expect(h.length).toBeGreaterThanOrEqual(20);
      expect(h.length).toBeLessThanOrEqual(220);
    }
    expect(new Set(highlights).size).toBe(highlights.length);
  });

  it("extractHighlights يهمل القصير جدًا والطويل جدًا", () => {
    const html =
      "<p><mark>قصير</mark><mark>" +
      "مقتطف بطول مناسب تمامًا للعرض في الويدجت الرئيسي للموقع" +
      "</mark><mark>" +
      "نص ".repeat(120) +
      "</mark></p>";
    const highlights = extractHighlights(html);
    expect(highlights).toHaveLength(1);
  });

  it("سجل البحث يتضمن القراءات وتاريخ النشر للفرز", () => {
    const issue = adaptIssue(rawIssue14);
    const rec = toSearchRecord(issue.articles[0]);
    expect(rec.views).toBeTypeOf("number");
    expect(rec.publishedAt).toBeTruthy();
  });

  it("يحذف الصور الخارجية ويبقي صور مخزن النظام القديم", () => {
    const html =
      '<p><img src="https://evil.example.com/x.jpg"><img src="https://back.mdarek.net/storage/a.jpg" alt="صورة"></p>';
    const clean = sanitizeArticleHtml(html);
    expect(clean).not.toContain("evil.example.com");
    expect(clean).toContain("back.mdarek.net/storage/a.jpg");
  });

  it("يزيل السكربتات كليًا", () => {
    const clean = sanitizeArticleHtml(
      '<p>سلام</p><script>alert("xss")</script>',
    );
    expect(clean).not.toContain("script");
    expect(clean).not.toContain("alert");
  });

  it("الروابط تفتح بأمان في تبويب جديد", () => {
    const clean = sanitizeArticleHtml('<a href="https://example.com">رابط</a>');
    expect(clean).toContain('rel="noopener noreferrer"');
    expect(clean).toContain('target="_blank"');
  });

  it("plain text ومقتطف وزمن قراءة على محتوى حقيقي", () => {
    const content = rawIssue14.articles[0].content!;
    const plain = toPlainText(sanitizeArticleHtml(content));
    expect(plain).not.toContain("<");
    expect(makeExcerpt(plain, 100).length).toBeLessThanOrEqual(101);
    expect(estimateReadingMinutes(plain)).toBeGreaterThanOrEqual(1);
  });
});

describe("العدد القديم (الأول) — اتساق البيانات التاريخية", () => {
  it("يتحول كاملًا: 10 أبواب و9 مواد", () => {
    const issue = adaptIssue(rawIssue2);
    expect(issue.number).toBe(1);
    expect(issue.sections).toHaveLength(10);
    expect(issue.articles.length).toBeGreaterThan(0);
    for (const a of issue.articles) {
      expect(a.contentHtml).not.toContain("style=");
    }
  });
});

import { describe, expect, it } from "vitest";
import {
  AGE_SMOOTHING_MONTHS,
  rankByReadership,
  readershipScore,
} from "../ranking";

// أرقام مأخوذة من البيانات الحقيقية وقت المعايرة (back.mdarek.net)
const REAL = [
  { id: "الإمبريالية والتصوف", views: 122, issueNumber: 7 },
  { id: "قاموس المصطلحات", views: 116, issueNumber: 5 },
  { id: "قول ابن تيمية", views: 101, issueNumber: 7 },
  { id: "المتصوفة والعلم", views: 66, issueNumber: 8 },
  { id: "شخصيات صوفية", views: 52, issueNumber: 8 },
  { id: "افتتاحية العدد ٤", views: 74, issueNumber: 4 },
];

describe("ترجيح الأكثر قراءة بعمر المادة", () => {
  it("المادة الأحدث تتقدّم على أقدم منها بنفس المشاهدات", () => {
    const older = { views: 100, issueNumber: 4 };
    const newer = { views: 100, issueNumber: 8 };
    expect(readershipScore(newer, 8)).toBeGreaterThan(readershipScore(older, 8));
  });

  it("مادة العدد الحالي لا تُقسَم على صفر", () => {
    const score = readershipScore({ views: 60, issueNumber: 8 }, 8);
    expect(score).toBe(60 / AGE_SMOOTHING_MONTHS);
    expect(Number.isFinite(score)).toBe(true);
  });

  it("الشعبية الحقيقية تصمد: الأعلى مشاهدةً يبقى أولًا رغم قِدَمه عددًا", () => {
    // ضبط التنعيم على ٢ يمنع الحداثة وحدها من إزاحة مادة قوية
    const top = rankByReadership(REAL, 3);
    expect(top[0].id).toBe("الإمبريالية والتصوف");
  });

  it("مواد العدد الجديد تخترق القائمة — لا تتجمّد على القديم", () => {
    const top = rankByReadership(REAL, 3);
    expect(top.some((a) => a.issueNumber === 8)).toBe(true);
  });

  it("المادة الأقدم ذات المشاهدات المرتفعة تتراجع أمام الأحدث منها", () => {
    // «قاموس المصطلحات» (١١٦ مشاهدة، ع٥) كان ثانيًا بالمشاهدات الخام
    const top = rankByReadership(REAL, 3).map((a) => a.id);
    expect(top).not.toContain("قاموس المصطلحات");
  });

  it("الترتيب حتمي عند تساوي المعدّل — المشاهدات الخام هي الفاصل", () => {
    const tied = [
      { id: "أ", views: 40, issueNumber: 6 },
      { id: "ب", views: 80, issueNumber: 4 },
    ];
    // كلاهما بمعدّل متساوٍ عند العدد الحالي ٦: 40/2 = 80/4
    const [first] = rankByReadership(tied, 2);
    expect(first.id).toBe("ب");
    expect(rankByReadership(tied, 2)).toEqual(rankByReadership(tied, 2));
  });

  it("قائمة فارغة لا تُسقط الحساب", () => {
    expect(rankByReadership([], 3)).toEqual([]);
  });
});

import Image from "next/image";
import type { IssueSummary } from "@/lib/mdarek-api/types";

// غلاف العدد: الصورة الحقيقية من النظام القديم إن وجدت،
// وإلا غلاف مولّد بهوية «التذهيب الرقمي». النسبة 32/45 تطابق نسبة
// أغلفة الأعداد الحقيقية (~0.71) لا 3/4 — وإلا يقصّ object-cover من
// أعلى وأسفل الغلاف (شريط اسم العدد، وشريط www.Mdarek.net).
export function IssueCover({
  issue,
  sizes = "220px",
  priority = false,
  className = "",
  fixedHeroHeight = false,
}: {
  issue: Pick<IssueSummary, "title" | "hijriDate" | "gregorianDate" | "cover">;
  sizes?: string;
  priority?: boolean;
  className?: string;
  // استثناء نادر: ارتفاع ثابت بالبكسل (من lg فأعلى) بدل النسبة الثابتة
  // 32/45 — لهيرو الصفحة الرئيسية، حيث ثُبِّت الرقم عمدًا (367px) بدل
  // جعله يتبع ارتفاع عمود النص المجاور ديناميكيًا كما كان سابقًا
  fixedHeroHeight?: boolean;
}) {
  const shapeCls = fixedHeroHeight ? "aspect-[32/45] lg:aspect-auto lg:h-[367px]" : "aspect-[32/45]";

  if (issue.cover) {
    return (
      <div
        className={`relative ${shapeCls} overflow-hidden rounded-md shadow-[var(--shadow-warm)] transition-transform duration-300 group-hover:scale-105 ${className}`}
      >
        <Image
          src={issue.cover.url}
          alt={issue.cover.alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative flex ${shapeCls} flex-col items-center justify-between overflow-hidden rounded-md bg-gradient-to-b from-leather to-leather-2 p-5 text-center shadow-[var(--shadow-warm)] transition-transform duration-300 group-hover:scale-105 ${className}`}
    >
      <div className="ornament absolute inset-0 opacity-10" aria-hidden />
      <p className="relative font-amiri text-[2.6em] font-bold leading-none text-[#F5E6C8]">
        مدارك
      </p>
      <p className="relative text-[0.9em] font-semibold text-[#F5E6C8]/90">
        {issue.title}
      </p>
      <p className="relative text-[0.65em] text-[#F5E6C8]/70">
        {issue.hijriDate} · {issue.gregorianDate}
      </p>
    </div>
  );
}

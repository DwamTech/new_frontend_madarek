import { Download } from "lucide-react";
import type { PdfDocument } from "@/lib/mdarek-api/types";

/**
 * زر تحميل ملف العدد — يظهر دائمًا كوعد ثابت بالميزة، حتى قبل توفر
 * الملف على الخادم لهذا العدد بعينه؛ بلا فرق بصري عن الحالة الفعّالة
 * (لا تشويه لونيّ يُوهم بأن الميزة أُزيلت) — الفرق الوحيد أنه بلا وجهة
 * فعلًا فلا يستجيب للنقر.
 */
export function IssuePdfButton({ pdf }: { pdf: PdfDocument | null }) {
  if (!pdf) {
    return (
      <span
        aria-disabled="true"
        title="ملف PDF لهذا العدد غير متاح بعد"
        className="flex w-fit cursor-default items-center gap-2 rounded-md border border-leather px-6 py-3 font-bold text-leather"
      >
        <Download className="size-4.5" />
        تحميل العدد PDF
      </span>
    );
  }

  return (
    <a
      href={pdf.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex w-fit items-center gap-2 rounded-md border border-leather px-6 py-3 font-bold text-leather transition-colors hover:bg-leather-soft"
    >
      <Download className="size-4.5" />
      تحميل العدد PDF
    </a>
  );
}

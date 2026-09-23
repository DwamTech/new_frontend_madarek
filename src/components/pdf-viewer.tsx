"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// pdfjs-dist يقرأ window/document عند تقييم الوحدة (module evaluation)
// لا عند التنفيذ فقط — هذا يكسر التصيير على الخادم (SSR) حتى لو كان
// المكوّن نفسه "use client"، لأن Next.js يُقيّم مكوّنات العميل على
// الخادم أيضًا في تمريرة SSR الأولى. الحل: تحميل ديناميكي بـssr:false
// يعزل الاستيراد بالكامل عن بيئة الخادم.
export const PdfViewer = dynamic(
  () => import("@/components/pdf-viewer-impl").then((m) => m.PdfViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-soft">
        <Loader2 className="size-6 animate-spin" />
      </div>
    ),
  },
);

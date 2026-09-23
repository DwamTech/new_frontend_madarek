"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { ChevronLeft, ChevronRight, Download, Loader2, Minus, Plus } from "lucide-react";

// ملف الـworker منسوخ إلى public (بدل الاعتماد على تحليل الحزم عبر
// import.meta.url) لتفادي تفاوت دعم Turbopack/webpack لأصول pdfjs-dist
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

const navBtn =
  "flex size-8 items-center justify-center rounded-md border border-line bg-paper text-soft transition-colors hover:text-leather disabled:opacity-40 disabled:hover:text-soft";

function CenteredLoader() {
  return (
    <div className="flex h-40 items-center justify-center text-soft">
      <Loader2 className="size-6 animate-spin" />
    </div>
  );
}

export function PdfViewer({ url }: { url: string }) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [scale, setScale] = useState(1.2);
  // back.mdarek.net لا يرسل رأس CORS على ملفات PDF، فيتعذّر على pdf.js
  // جلبها مباشرة من المتصفح — نمرّرها عبر وكيلنا الخاص لتصبح من الأصل
  // نفسه (same-origin)؛ زر التحميل يبقى على الرابط الأصلي مباشرة
  const proxiedUrl = `/api/pdf-proxy?url=${encodeURIComponent(url)}`;

  const goTo = (n: number) => {
    if (!numPages) return;
    setPage(Math.min(Math.max(1, n), numPages));
  };

  return (
    <div className="flex h-full flex-col">
      {/* الشريط العلوي: تنقّل بين الصفحات، تكبير/تصغير، تحميل */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-raise px-4 py-2.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => goTo(page - 1)}
            disabled={page <= 1}
            aria-label="الصفحة السابقة"
            className={navBtn}
          >
            <ChevronRight className="size-4" />
          </button>
          <span className="min-w-16 text-center text-sm font-semibold text-ink">
            {page} / {numPages ?? "…"}
          </span>
          <button
            type="button"
            onClick={() => goTo(page + 1)}
            disabled={!numPages || page >= numPages}
            aria-label="الصفحة التالية"
            className={navBtn}
          >
            <ChevronLeft className="size-4" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setScale((s) => Math.max(0.6, +(s - 0.2).toFixed(1)))}
            aria-label="تصغير"
            className={navBtn}
          >
            <Minus className="size-4" />
          </button>
          <span className="w-12 text-center text-sm text-soft">{Math.round(scale * 100)}%</span>
          <button
            type="button"
            onClick={() => setScale((s) => Math.min(2.4, +(s + 0.2).toFixed(1)))}
            aria-label="تكبير"
            className={navBtn}
          >
            <Plus className="size-4" />
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="تحميل العدد"
            title="تحميل العدد"
            className={navBtn}
          >
            <Download className="size-4" />
          </a>
        </div>
      </div>

      {/* المحتوى: مصغّرات الصفحات + الصفحة الحالية */}
      <Document
        file={proxiedUrl}
        onLoadSuccess={({ numPages: n }) => setNumPages(n)}
        loading={<CenteredLoader />}
        error={
          <p className="p-8 text-center text-soft">تعذّر تحميل ملف العدد — حاول لاحقًا.</p>
        }
        className="flex flex-1 overflow-hidden"
      >
        <aside className="hidden w-28 shrink-0 overflow-y-auto border-e border-line bg-surface p-2 sm:block">
          {numPages &&
            Array.from({ length: numPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => goTo(n)}
                className={`mb-2 block w-full overflow-hidden rounded border-2 transition-colors ${
                  n === page ? "border-leather" : "border-transparent hover:border-line"
                }`}
              >
                <Page
                  pageNumber={n}
                  width={96}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  loading=""
                />
                <span className="mt-1 block text-center text-[11px] text-soft">{n}</span>
              </button>
            ))}
        </aside>
        <div className="flex flex-1 items-start justify-center overflow-auto bg-[#e7ded0] p-6 dark:bg-[#100b06]">
          <Page pageNumber={page} scale={scale} loading={<CenteredLoader />} />
        </div>
      </Document>
    </div>
  );
}

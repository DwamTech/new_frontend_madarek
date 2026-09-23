"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { IssueCover } from "@/components/issue-cover";
import type { IssueSummary } from "@/lib/mdarek-api/types";

const MIN_SCALE = 1;
const MAX_SCALE = 3;
const SCALE_STEP = 0.5;

/**
 * غلاف قابل للتكبير — نقرة تفتح الغلاف بحجم كبير ليتأمله الزائر ويقرأ
 * تفاصيله، بدل الانتقال المباشر لصفحة العدد؛ رابط "تصفح العدد" داخل
 * النافذة يقود لعارض PDF الفعلي (/read) إن توفّر، أو لفهرس العدد كبديل.
 * يدعم زووم إضافي (أزرار +/- وعجلة الفأرة والنقر المزدوج) مع سحب للتنقل
 * داخل الصورة عند التكبير — لقراءة تفاصيل الغلاف الصغيرة دون فتح العدد كاملاً.
 */
export function IssueCoverLightbox({
  issue,
  issueNumber,
  sizes,
  priority,
  className,
  coverFixedHeroHeight,
}: {
  issue: Pick<IssueSummary, "title" | "hijriDate" | "gregorianDate" | "cover" | "pdf">;
  issueNumber: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
  coverFixedHeroHeight?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [scale, setScale] = useState(MIN_SCALE);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // إعادة الزووم لوضعه الافتراضي في كل مرة تُفتح فيها النافذة من جديد
  // (تعديل حالة أثناء التصيير — النمط الموصى به في React بدل setState
  // داخل effect، كما في navbar.tsx)
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setScale(MIN_SCALE);
      setPan({ x: 0, y: 0 });
    }
  }

  // يمنع سحب الصورة خارج الإطار عند التكبير — الحد الأقصى للإزاحة نصف
  // مقدار الزيادة في حجم الصورة عن حجم الإطار نفسه
  const clampPan = (next: { x: number; y: number }, s: number) => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return next;
    const maxX = (rect.width * (s - 1)) / 2;
    const maxY = (rect.height * (s - 1)) / 2;
    return {
      x: Math.min(maxX, Math.max(-maxX, next.x)),
      y: Math.min(maxY, Math.max(-maxY, next.y)),
    };
  };

  const zoomTo = (s: number) => {
    const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));
    setScale(next);
    setPan((p) => clampPan(p, next));
  };

  const zoomIn = () => zoomTo(+(scale + SCALE_STEP).toFixed(2));
  const zoomOut = () => zoomTo(+(scale - SCALE_STEP).toFixed(2));

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    zoomTo(+(scale + (e.deltaY < 0 ? SCALE_STEP : -SCALE_STEP)).toFixed(2));
  };

  const onDoubleClick = () => zoomTo(scale > MIN_SCALE ? MIN_SCALE : 2);

  const onPointerDown = (e: React.PointerEvent) => {
    if (scale <= MIN_SCALE) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPan(
      clampPan({ x: dragStart.current.panX + dx, y: dragStart.current.panY + dy }, scale),
    );
  };

  const stopDragging = () => setDragging(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`تكبير غلاف ${issue.title}`}
        className={`group ${className ?? ""}`}
      >
        <IssueCover issue={issue} sizes={sizes} priority={priority} fixedHeroHeight={coverFixedHeroHeight} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            aria-label="إغلاق"
            className="absolute end-4 top-4 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <X className="size-5" />
          </button>

          <div
            className="flex max-h-full flex-col items-center gap-5"
            onClick={(e) => e.stopPropagation()}
          >
            {issue.cover ? (
              // الصورة تأخذ كامل الارتفاع المتاح تقريبًا (96vh) دون زر
              // "تصفح العدد" — أُزيل عمدًا من هذا العرض المكبَّر فقط (يبقى
              // في حالة عدم توفر غلاف أدناه) لصالح تكبير الصورة أكثر؛
              // أدوات الزووم فقط تبقى معلَّقة كطبقة سفلية شفافة فوقها.
              // الارتفاع يُحسب بـ min() ليأخذ الأصغر بين 96vh وما يقابل
              // عرض الشاشة الفعلي (بعد خصم padding‑6 المزدوج للنافذة، 3rem)
              // بنسبة الغلاف 45/32 — بدونه تفيض الصورة أفقيًا على الشاشات
              // الضيقة/الطويلة (الجوال) لأن max-w-full وحدها لا تحافظ على النسبة
              <div className="relative">
                <div
                  ref={frameRef}
                  className={`relative aspect-[32/45] h-[min(96vh,calc((100vw-3rem)*45/32))] max-h-full max-w-full touch-none overflow-hidden rounded-md ${
                    scale > MIN_SCALE ? (dragging ? "cursor-grabbing" : "cursor-grab") : "cursor-zoom-in"
                  }`}
                  onWheel={onWheel}
                  onDoubleClick={onDoubleClick}
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={stopDragging}
                  onPointerLeave={stopDragging}
                >
                  <Image
                    src={issue.cover.url}
                    alt={issue.cover.alt}
                    fill
                    sizes="(min-width: 768px) 760px, 96vw"
                    draggable={false}
                    className={`select-none object-contain shadow-2xl ${
                      dragging ? "" : "transition-transform duration-150 ease-out"
                    }`}
                    style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})` }}
                  />
                </div>

                <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center rounded-b-md bg-gradient-to-t from-black/70 to-transparent px-4 pb-4 pt-12">
                  <div className="pointer-events-auto flex items-center gap-1 rounded-full bg-white/10 px-2 py-1.5">
                    <button
                      type="button"
                      onClick={zoomOut}
                      disabled={scale <= MIN_SCALE}
                      aria-label="تصغير"
                      className="flex size-8 items-center justify-center rounded-full text-white transition-colors hover:bg-white/20 disabled:opacity-40"
                    >
                      <Minus className="size-4" />
                    </button>
                    <span className="w-12 text-center text-sm text-white/90">
                      {Math.round(scale * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={zoomIn}
                      disabled={scale >= MAX_SCALE}
                      aria-label="تكبير"
                      className="flex size-8 items-center justify-center rounded-full text-white transition-colors hover:bg-white/20 disabled:opacity-40"
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <IssueCover issue={issue} className="w-full max-w-sm" />
                <Link
                  href={issue.pdf ? `/issues/${issueNumber}/read` : `/issues/${issueNumber}`}
                  className="rounded-md bg-leather px-6 py-3 font-bold text-[#FFF8EE] transition-[filter] hover:brightness-110 dark:text-[#1E1207]"
                >
                  تصفح العدد
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

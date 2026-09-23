"use client";

import { useState } from "react";
import { Check, Copy, Mail, Minus, Plus, Printer, Share2 } from "lucide-react";
import { BrandIcon } from "@/components/brand-icons";

// أدوات القراءة: حجم الخط، مشاركة، طباعة — تلتصق جانبًا على الشاشات الكبيرة
export function ReadingTools({ title, coverUrl }: { title: string; coverUrl?: string }) {
  const [scale, setScale] = useState(1);
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const apply = (v: number) => {
    const next = Math.min(1.3, Math.max(0.85, v));
    setScale(next);
    document
      .getElementById("article-body")
      ?.style.setProperty("--reading-scale", String(next));
  };

  // مشاركة على فيسبوك مباشرة بحساب القارئ نفسه — نافذة sharer.php الرسمية
  // تستخدم جلسته المسجَّلة أصلًا في متصفحه، لا حسابًا للمجلة
  const shareFacebook = () => {
    const url = window.location.href;
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(fbUrl, "_blank", "noopener,noreferrer,width=600,height=520");
  };

  // api.whatsapp.com/send (بلا رقم) هو الرابط الرسمي لمشاركة "بلا جهة
  // محددة" تفتح واتساب ويب/التطبيق وتترك للمستخدم اختيار جهة الإرسال —
  // wa.me/<رقم> مخصَّص لمراسلة رقم بعينه فقط؛ استخدامه بلا رقم (wa.me/?text=)
  // لا يُعامَل بشكل موثوق (يظهر أحيانًا صفحة تثبيت التطبيق حتى مع تسجيل
  // الدخول لواتساب ويب)
  const shareWhatsapp = () => {
    const text = `${title} ${window.location.href}`;
    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  // مشاركة إضافية عبر إكس وتيليجرام والبريد — تظهر في القائمة البديلة
  // فقط (لا تكرر فيسبوك/واتساب اللذين لهما زرّان مستقلّان أصلًا)
  const shareX = () => {
    const url = window.location.href;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      "_blank",
      "noopener,noreferrer",
    );
    setMenuOpen(false);
  };

  const shareTelegram = () => {
    const url = window.location.href;
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      "_blank",
      "noopener,noreferrer",
    );
    setMenuOpen(false);
  };

  const shareEmail = () => {
    const url = window.location.href;
    window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`;
    setMenuOpen(false);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setMenuOpen(false);
    setTimeout(() => setCopied(false), 2000);
  };

  // زر المشاركة: يفتح لوحة المشاركة الأصلية للنظام إن كانت مدعومة (غالب
  // أجهزة الجوال)، وإلا يفتح قائمة مشاركة بديلة تناسب المتصفحات التي
  // لا تدعمها (إكس، تيليجرام، بريد، نسخ الرابط) بدل نسخ الرابط صامتًا
  const share = async () => {
    if (navigator.share) {
      const url = window.location.href;
      let shareData: ShareData = { title, text: title, url };

      // محاولة إرفاق صورة غلاف المقال — يمنح تطبيقات المراسلة (واتساب
      // وغيرها) سياقًا لإظهار صف "الأشخاص" (Direct Share) في صندوق
      // مشاركة أندرويد بثقة أكبر من نص مجرَّد، حسب دعم الجهاز والتطبيقات
      // المثبَّتة. نمرّ عبر وكيل الملفات الموجود أصلًا (api/pdf-proxy —
      // ليس خاصًا بـPDF فعليًا، يبثّ أي ملف من back.mdarek.net) لأن هذا
      // الخادم لا يرسل رأس CORS فيتعذّر جلب الصورة كـ Blob مباشرة من المتصفح
      if (coverUrl) {
        try {
          const res = await fetch(`/api/pdf-proxy?url=${encodeURIComponent(coverUrl)}`);
          if (res.ok) {
            const blob = await res.blob();
            const file = new File([blob], "cover.jpg", { type: blob.type || "image/jpeg" });
            const withFile = { ...shareData, files: [file] };
            if (navigator.canShare?.(withFile)) {
              shareData = withFile;
            }
          }
        } catch {
          /* تعذّر جلب صورة الغلاف — نكمل بمشاركة نصية فقط */
        }
      }

      try {
        await navigator.share(shareData);
      } catch {
        /* أغلق المستخدم لوحة المشاركة — لا حاجة لأي إجراء إضافي */
      }
      return;
    }
    setMenuOpen(true);
  };

  const btn =
    "flex size-10 items-center justify-center rounded-full border border-line bg-raise text-soft transition-colors hover:text-leather disabled:opacity-40";

  return (
    <div className="flex items-center gap-2 print:hidden lg:flex-col">
      <button
        type="button"
        onClick={() => apply(scale + 0.1)}
        disabled={scale >= 1.3}
        aria-label="تكبير الخط"
        title="تكبير الخط"
        className={btn}
      >
        <Plus className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => apply(scale - 0.1)}
        disabled={scale <= 0.85}
        aria-label="تصغير الخط"
        title="تصغير الخط"
        className={btn}
      >
        <Minus className="size-4" />
      </button>
      <button
        type="button"
        onClick={shareFacebook}
        aria-label="مشاركة المقال على فيسبوك"
        title="مشاركة على فيسبوك"
        className={btn}
      >
        <BrandIcon name="facebook" className="size-4" />
      </button>
      <button
        type="button"
        onClick={shareWhatsapp}
        aria-label="مشاركة المقال على واتساب"
        title="مشاركة على واتساب"
        className={btn}
      >
        <BrandIcon name="whatsapp" className="size-4" />
      </button>
      <div className="relative">
        <button
          type="button"
          onClick={share}
          aria-label="مشاركة المقال"
          aria-expanded={menuOpen}
          title={copied ? "نُسخ الرابط" : "مشاركة"}
          className={btn}
        >
          {copied ? <Check className="size-4 text-okay" /> : <Share2 className="size-4" />}
        </button>

        {/* قائمة مشاركة بديلة — تظهر فقط حين لا يدعم المتصفح navigator.share
            (سطح المكتب غالبًا)، كخيارات إضافية لا تكرر فيسبوك/واتساب */}
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />
            <div className="absolute end-0 top-full z-30 mt-2 w-52 rounded-md border border-line bg-raise p-1.5 shadow-lg">
              <button
                type="button"
                onClick={shareX}
                className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-ink transition-colors hover:bg-surface"
              >
                <BrandIcon name="x" className="size-4" />
                مشاركة على إكس
              </button>
              <button
                type="button"
                onClick={shareTelegram}
                className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-ink transition-colors hover:bg-surface"
              >
                <BrandIcon name="telegram" className="size-4" />
                مشاركة على تيليجرام
              </button>
              <button
                type="button"
                onClick={shareEmail}
                className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-ink transition-colors hover:bg-surface"
              >
                <Mail className="size-4" />
                عبر البريد الإلكتروني
              </button>
              <button
                type="button"
                onClick={copyLink}
                className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-ink transition-colors hover:bg-surface"
              >
                <Copy className="size-4" />
                نسخ الرابط
              </button>
            </div>
          </>
        )}
      </div>
      <button
        type="button"
        onClick={() => window.print()}
        aria-label="طباعة المقال"
        title="طباعة"
        className={`${btn} hidden lg:flex`}
      >
        <Printer className="size-4" />
      </button>
    </div>
  );
}

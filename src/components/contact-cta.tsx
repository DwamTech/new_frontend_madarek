import Link from "next/link";

/**
 * دعوة تواصل — بلا وعود تشغيلية؛ بطاقة منفصلة أسفل محتوى كل صفحة، قبل
 * التذييل مباشرة، لا جزءًا مندمجًا فيه. العنصر الخارجي هنا هو نفسه عنصر
 * flex مباشر داخل تخطيط الموقع (flex-col) — فـmx-auto عليه مباشرة كان
 * يُسقط تمدّده الافتراضي (align-items:stretch) بسبب خاصية الهوامش
 * التلقائية في flex، فيتقلّص العنصر إلى عرض محتواه بدل عرض الصفحة كاملًا
 * (تحقّق فعلي: 758px بدل 1280px). الإصلاح: مثل main وfooter تمامًا —
 * العنصر الخارجي بلا mx-auto ليتمدّد بحرّية، والتوسيط في عنصر داخلي.
 */
export function ContactCta() {
  return (
    <div className="mt-16 px-4 print:hidden lg:px-6">
      <div className="mx-auto max-w-7xl rounded-md bg-leather-2 px-8 py-6 text-[#EFDFC8] md:flex md:items-center md:justify-between md:gap-8">
        <div>
          <h2 className="text-xl font-bold">سؤال أو مساهمة علمية؟</h2>
          <p className="mt-2 max-w-xl text-sm leading-7 text-[#EFDFC8]/85">
            راسل هيئة التحرير مباشرة عبر البريد الرسمي — نموذج التواصل يجهّز
            رسالتك ويحوّلها لبريدك.
          </p>
        </div>
        <Link
          href="/contact"
          className="mt-4 inline-block shrink-0 rounded-md bg-gold px-6 py-3 font-bold text-[#241A05] transition-[filter] hover:brightness-105 md:mt-0"
        >
          صفحة التواصل
        </Link>
      </div>
    </div>
  );
}

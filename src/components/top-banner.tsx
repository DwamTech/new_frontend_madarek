import Image from "next/image";
import Link from "next/link";

// شعار المجلة وجملتها التعريفية موجودان داخل هذه الصورة نفسها، لذا حُذف
// تكرارهما من الشريط العلوي (navbar.tsx) — هذا الشريط غير لاصق عمدًا:
// يظهر أعلى كل صفحة ثم يختفي بالتمرير لأسفل، بينما يبقى الشريط العلوي
// وحده لاصقًا كما كان. رابط إلى الرئيسية لتعويض شعار الصفحة الرئيسية
// الذي كان يؤدي هذا الدور سابقًا.
//
// نسبة هذه الصورة (8000×1916 ≈ 4.18) أعرض بكثير من سابقتها (3.2)، أي
// ارتفاعها الطبيعي عند عرض الصفحة الكامل أقصر أصلًا (نحو 307px عند
// 1280px) بلا حاجة لأي تصغير أو قصّ إضافي — h-auto w-full تكفي على
// كل المقاسات
export function TopBanner() {
  return (
    <div className="border-b border-line print:hidden">
      <Link href="/" aria-label="الرئيسية — مجلة مدارك" className="block">
        <Image
          src="/top-banner.jpg"
          alt="مجلة مدارك — مجلة شهرية علمية متخصصة في بيان حقيقة التصوف"
          width={8000}
          height={1916}
          sizes="100vw"
          priority
          className="h-auto w-full"
        />
      </Link>
    </div>
  );
}

import Link from "next/link";
import { Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <p className="font-amiri text-7xl font-bold text-gold">٤٠٤</p>
      <h1 className="mt-4 text-2xl font-bold text-ink">
        هذه الصفحة ليست في فهارسنا
      </h1>
      <p className="mt-2 text-soft">
        ربما تغيّر عنوانها، أو كُتب الرابط بخطأ. جرّب البحث، أو ابدأ من أحدث
        المواد.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link
          href="/search"
          className="flex items-center gap-2 rounded-md bg-leather px-5 py-2.5 font-bold text-[#FFF8EE] transition-[filter] hover:brightness-110 dark:text-[#1E1207]"
        >
          <Search className="size-4" />
          ابحث في مدارك
        </Link>
        <Link
          href="/"
          className="rounded-md border border-leather px-5 py-2.5 font-bold text-leather transition-colors hover:bg-leather-soft"
        >
          الصفحة الرئيسية
        </Link>
      </div>
      <p className="mt-12 text-sm text-soft">
        أو ابدأ من <Link href="/issues" className="font-semibold text-lapis hover:underline">أرشيف الأعداد</Link>
        {" "}أو <Link href="/writers" className="font-semibold text-lapis hover:underline">صفحات الباحثين</Link>.
      </p>
    </div>
  );
}

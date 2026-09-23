import Link from "next/link";
import { NewsletterForm } from "@/components/newsletter-form";
import { MadarekLogo } from "@/components/logo";
import { BrandIcon } from "@/components/brand-icons";

const staticCols = (currentIssueNumber: number) => [
  {
    title: "المجلة",
    links: [
      { href: `/issues/${currentIssueNumber}`, label: "العدد الحالي" },
      { href: "/issues", label: "أرشيف الأعداد" },
      { href: "/browse", label: "أرشيف الأبواب" },
      { href: "/search", label: "البحث في المجلة" },
    ],
  },
  {
    title: "المؤسسة",
    links: [
      { href: "/about", label: "من نحن" },
      { href: "/writers", label: "الباحثون والكتّاب" },
      { href: "/services", label: "تطبيقاتنا" },
      { href: "/contact", label: "تواصل معنا" },
    ],
  },
];

export function Footer({ currentIssueNumber }: { currentIssueNumber: number }) {
  const cols = staticCols(currentIssueNumber);
  return (
    <footer className="mt-20 bg-leather-2 text-[#EFDFC8] print:hidden">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1.6fr] lg:px-6">
        <div>
          <MadarekLogo className="h-[74px] w-[91px] bg-gradient-to-b from-[#F5E6C8] to-[#D9B36A]" />
          <span className="sr-only">مدارك</span>
          <p className="mt-3 max-w-xs text-sm leading-7 text-[#EFDFC8]/85">
            مجلة شهرية علمية متخصصة في بيان حقيقة الصوفية — دراسةً وبحثًا
            ونقدًا، وفق منهج يقوم على التوثيق والتحقيق.
          </p>
        </div>

        {cols.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <h3 className="mb-3 text-sm font-bold text-[#D9B36A]">{c.title}</h3>
            <ul className="space-y-2">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-[#EFDFC8]/85 transition-colors hover:text-[#EFDFC8]"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div>
          <h3 className="mb-3 text-sm font-bold text-[#D9B36A]">
            يصلك كل عدد فور صدوره
          </h3>
          <NewsletterForm compact />
          <p className="mt-3 text-xs text-[#EFDFC8]/60">
            إشعار واحد شهريًا عند صدور العدد — لا شيء غيره.
          </p>
          <div className="mt-5 flex gap-2">
            {/* روابط حقيقية مؤكَّدة من تذييل الموقع القديم mdarek.net، لا تخمين */}
            <a
              href="https://apps.apple.com/eg/app/%D9%85%D8%AC%D9%84%D8%A9-%D9%85%D8%AF%D8%A7%D8%B1%D9%83/id6766868982"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-full border border-[#EFDFC8]/25 px-3 py-1 text-xs transition-colors hover:border-[#EFDFC8]/50 hover:text-[#EFDFC8]"
            >
              <BrandIcon name="apple" className="size-3.5" />
              App Store
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=com.mdarek.application"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-full border border-[#EFDFC8]/25 px-3 py-1 text-xs transition-colors hover:border-[#EFDFC8]/50 hover:text-[#EFDFC8]"
            >
              <BrandIcon name="google-play" className="size-3.5" />
              Google Play
            </a>
            {/* أزرق فيسبوك الرسمي لتمييزها عن شارتي المتجرين أحاديتَي
                اللون، وفي أقصى يسار الصف (آخر عنصر داخل حاوية RTL) */}
            <a
              href="https://www.facebook.com/profile.php?id=61584485048024"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="صفحة مدارك على فيسبوك"
              className="flex size-7 items-center justify-center rounded-full border border-[#1877F2]/50 text-[#1877F2] transition-colors hover:border-[#1877F2] hover:bg-[#1877F2] hover:text-white"
            >
              <BrandIcon name="facebook" className="size-3.5" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-[#EFDFC8]/15">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-5 text-xs text-[#EFDFC8]/70 lg:px-6">
          <p>حقوق النشر والاقتباس متاحة للجميع · محرم 1448هـ — يونيو 2026م</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-[#EFDFC8]">
              سياسة الخصوصية
            </Link>
            <Link href="/terms" className="hover:text-[#EFDFC8]">
              الشروط والأحكام
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

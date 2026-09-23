import Link from "next/link";
import type { Metadata } from "next";
import { Mail, Smartphone } from "lucide-react";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "تواصل معنا",
  description: "راسل مجلة مدارك: استفسار، سؤال علمي، مساهمة، أو شراكة.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-bold text-ink">يسعدنا أن نسمع منك</h1>
        <p className="mt-2 leading-8 text-soft">
          استفسار، مساهمة علمية، أو تصحيح — راسل هيئة التحرير عبر البريد
          الرسمي للمجلة، والنموذج أدناه يجهّز رسالتك.
        </p>
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        <div className="rounded-md border border-line bg-raise p-7 shadow-[var(--shadow-warm)]">
          <ContactForm />
        </div>

        <div className="space-y-5">
          <div className="rounded-md border border-line bg-raise p-6">
            <h2 className="flex items-center gap-2 font-bold text-ink">
              <Mail className="size-4.5 text-leather" />
              قنوات مباشرة
            </h2>
            <p className="mt-2 text-sm leading-7 text-soft">
              البريد الرسمي:{" "}
              {/* مؤكَّد من رابط mailto: الفعلي في تذييل الموقع القديم mdarek.net، لا تخمين */}
              <a href="mailto:info@mdarek.net" dir="ltr" className="font-semibold text-lapis hover:underline">
                info@mdarek.net
              </a>
              <br />
              فيسبوك:{" "}
              <a
                href="https://www.facebook.com/profile.php?id=61584485048024"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-lapis hover:underline"
              >
                مجلة مدارك
              </a>
            </p>
          </div>
          <div className="rounded-md border border-line bg-raise p-6">
            <h2 className="flex items-center gap-2 font-bold text-ink">
              <Smartphone className="size-4.5 text-leather" />
              تطبيقات الجوال
            </h2>
            <p className="mt-2 text-sm leading-7 text-soft">
              اقرأ الأعداد كاملة دون اتصال عبر تطبيق مدارك على App Store
              وGoogle Play.
            </p>
          </div>
          <div className="rounded-md bg-surface p-6">
            <h2 className="flex items-center gap-2 font-bold text-ink">
              <Smartphone className="size-4.5 text-leather" />
              تطبيقاتنا
            </h2>
            <p className="mt-1 text-sm leading-7 text-soft">
              تطبيقا iOS وAndroid مع رمز QR لتحميل كل منهما مباشرة.
            </p>
            <Link href="/services" className="mt-3 inline-block text-sm font-bold text-lapis hover:underline">
              تطبيقاتنا ←
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

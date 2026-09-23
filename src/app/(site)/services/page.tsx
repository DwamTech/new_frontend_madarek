import type { Metadata } from "next";
import QRCode from "qrcode";
import { CHANNELS } from "@/lib/data";
import { BrandIcon } from "@/components/brand-icons";

export const metadata: Metadata = {
  title: "تطبيقاتنا",
  description: "تطبيقا مدارك: iOS وAndroid لقراءة المجلة على الجوال.",
};

export default async function ServicesPage() {
  // باركود حقيقي يرمّز رابط المتجر نفسه المستخدَم في الزر بجانبه — لا صورة توضيحية
  const channels = await Promise.all(
    CHANNELS.map(async (c) => ({
      ...c,
      qr: await QRCode.toString(c.href, {
        type: "svg",
        margin: 0,
        color: { dark: "#241A05", light: "#00000000" },
      }),
    })),
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-bold text-ink">تطبيقاتنا</h1>
        <p className="mt-2 leading-8 text-soft">
          اقرأ مجلة مدارك على جوالك — تطبيقا iOS وAndroid.
        </p>
      </header>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {channels.map((c) => (
          <div
            key={c.slug}
            className="flex flex-col gap-5 rounded-md border border-line bg-raise p-6 shadow-[var(--shadow-warm)] sm:flex-row sm:items-center"
          >
            <div className="flex flex-1 flex-col">
              <span className="flex size-12 items-center justify-center rounded-md bg-leather-soft text-leather">
                <BrandIcon name={c.icon as "apple" | "google-play" | "facebook"} />
              </span>
              <h2 className="mt-4 text-lg font-bold text-ink">{c.name}</h2>
              <p className="mb-5 mt-1 text-sm leading-7 text-soft">{c.desc}</p>
              <a
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto self-start rounded-md border border-leather px-4 py-2 text-sm font-bold text-leather transition-colors hover:bg-leather-soft"
              >
                {c.cta}
              </a>
            </div>
            <div
              className="size-28 shrink-0 self-center rounded-md border border-line bg-raise p-2 [&_svg]:size-full"
              role="img"
              aria-label={`رمز QR لتحميل ${c.name}`}
              dangerouslySetInnerHTML={{ __html: c.qr }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

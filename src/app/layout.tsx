import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { IBM_Plex_Sans_Arabic, Noto_Naskh_Arabic, Amiri } from "next/font/google";
import "./globals.css";

const plex = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex",
  display: "swap",
});

const naskh = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-naskh",
  display: "swap",
});

const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri-v",
  display: "swap",
});

const SITE_URL = process.env.SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "مجلة مدارك — مجلة شهرية علمية متخصصة في بيان حقيقة الصوفية",
    template: "%s | مجلة مدارك",
  },
  description:
    "مجلة شهرية علمية متخصصة في بيان حقيقة الصوفية دراسةً وبحثًا ونقدًا، وفق منهج علمي يقوم على التوثيق والتحقيق.",
  openGraph: {
    siteName: "مجلة مدارك",
    locale: "ar",
    type: "website",
    images: [{ url: "/logo-512.png", width: 512, height: 512 }],
  },
  twitter: { card: "summary" },
};

// يُطبَّق الوضع قبل أول رسم لمنع وميض تبدل الألوان
const themeScript = `(function(){try{document.documentElement.classList.add("js");var t=localStorage.getItem("madarek-theme");var d=t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(d)document.documentElement.classList.add("dark");}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${plex.variable} ${naskh.variable} ${amiri.variable} flex min-h-screen flex-col antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}

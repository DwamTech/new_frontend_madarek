import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // react-pdf/pdfjs-dist بلا تحليل/تجميع من جهة الخادم — رغم أنه يُحمَّل
  // عبر next/dynamic بـssr:false، تمريرة "Collecting page data" أثناء
  // البناء كانت تحاول تحليل شجرة استيراده الضخمة والمعقّدة (عامل ويب،
  // خطوط مضمّنة) فتُنهك الذاكرة وتُسقط عملية البناء (تحقّق فعلي: تعطّل
  // الذاكرة/تعطّل أصلي متكرر). هذا يُخرجه من تلك التمريرة تمامًا.
  serverExternalPackages: ["pdfjs-dist", "react-pdf"],
  images: {
    // أغلفة الأعداد وصور المقالات تأتي من مخزن النظام القديم
    remotePatterns: [
      {
        protocol: "https",
        hostname: "back.mdarek.net",
        pathname: "/storage/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/storage/**",
      },
    ],
  },

  async redirects() {
    return [
      // روابط مقال مفردة من الموقع القديم:
      // /section/{slug}?issueId=14&articleId=128 → /articles/128
      // articleId مطابق تمامًا لمعرّف المقال عندنا؛ لا حاجة لأي تحويل.
      // آمن من التكرار: المسار الجديد (/articles) مختلف عن المصدر (/section)
      // فلا يمكن أن يطابق نفس القاعدة مجددًا.
      {
        source: "/section/:slug",
        has: [{ type: "query", key: "articleId", value: "(?<articleId>.*)" }],
        destination: "/articles/:articleId",
        permanent: true,
      },
      // أرشيف الأعداد: /archive → /issues
      {
        source: "/archive",
        destination: "/issues",
        permanent: true,
      },
      // ملاحظة: لا توجيه لدقة "issueId → issue" داخل /sections/{slug} —
      // Next.js يُبقي معاملات الطلب الأصلي في الوجهة دائمًا، وبما أن
      // مسار الوجهة هنا مطابق لمسار المصدر، فهذا يُنتج حلقة تحويل لا
      // نهائية (تحقق فعلي: ERR_TOO_MANY_REDIRECTS). الرابط الأساسي
      // /sections/{slug}?issueId=X يعمل أصلًا (200) عبر التوجيه الافتراضي
      // لمساراتنا الديناميكية، فقط بلا فلترة دقيقة — تنازل مقبول لتفادي
      // خطر حقيقي بدل ميزة تجميلية.
    ];
  },
};

export default nextConfig;

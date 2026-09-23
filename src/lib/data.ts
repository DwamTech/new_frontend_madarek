// منصات مدارك الحقيقية فقط — كل بند هنا مربوط بوجهة مؤكَّدة تحققنا منها
// من الموقع/النظام القديم. محتوى المجلة نفسه (أعداد/مقالات/أبواب/كتّاب)
// يأتي حصريًا من src/lib/mdarek-api. لا محتوى تجريبيًا في هذا الملف.

export type Channel = {
  slug: string;
  icon: string;
  name: string;
  desc: string;
  cta: string;
  href: string;
};

export const CHANNELS: Channel[] = [
  {
    slug: "app-ios",
    icon: "apple",
    name: "تطبيق iOS",
    desc: "اقرأ أعداد المجلة كاملة على آيفون وآيباد، مع القراءة دون اتصال.",
    cta: "App Store",
    href: "https://apps.apple.com/eg/app/%D9%85%D8%AC%D9%84%D8%A9-%D9%85%D8%AF%D8%A7%D8%B1%D9%83/id6766868982",
  },
  {
    slug: "app-android",
    icon: "google-play",
    name: "تطبيق Android",
    desc: "تطبيق مدارك الرسمي لأجهزة أندرويد بكل أعداد المجلة.",
    cta: "Google Play",
    href: "https://play.google.com/store/apps/details?id=com.mdarek.application",
  },
  {
    slug: "facebook",
    icon: "facebook",
    name: "صفحتنا على فيسبوك",
    desc: "تابع آخر أخبار المجلة وموادها على فيسبوك.",
    cta: "زيارة الصفحة",
    // نفس الرابط المؤكَّد المستخدَم في /contact وتذييل الموقع — لا تخمين
    href: "https://www.facebook.com/profile.php?id=61584485048024",
  },
  // البريد الرسمي استُبعد عمدًا: متاح أصلًا في /contact وعبر زر "صفحة
  // التواصل" أسفل هذه الصفحة — لا فقدان وصول، فقط انتقال لمكانه الأنسب.
  // أعداد المجلة PDF مستبعدة أيضًا: رابط داخلي مكرر لـ/issues، وهي أصلًا
  // الوجهة الأبرز في الموقع عبر زر "أرشيف الأعداد" الثابت بالشريط العلوي.
  // النشرة البريدية مستبعدة أيضًا: نموذج الاشتراك موجود أصلًا في تذييل كل
  // صفحة (footer.tsx) والرئيسية وصفحات المقالات.
];

import "server-only";

// عنوان الـ API القديم — متغير بيئة خادم فقط (بلا بادئة NEXT_PUBLIC
// فلا يصل للمتصفح أبدًا). لا مفاتيح ولا أسرار: الـ API عام للقراءة.
export const MDAREK_API_BASE = (
  process.env.MDAREK_API_BASE ?? "https://back.mdarek.net/api"
).replace(/\/$/, "");

/** مهلة النداء بالمللي ثانية */
export const MDAREK_API_TIMEOUT_MS = Number(
  process.env.MDAREK_API_TIMEOUT_MS ?? 10_000,
);

/**
 * عمر التخزين المؤقت (ثوانٍ). المحتوى شهري، لكن حركة الزوار منخفضة
 * وخادم النظام القديم بلا كاش خاص به أصلًا (لا فرق زمني بين نداءين
 * متتاليين لنفس المسار، تحقّق ميداني) — فتقصير المدة يُسرّع ظهور أي
 * تصحيح تحريري بعد النشر دون كلفة حقيقية على الزائر (ISR تصير القديم
 * فورًا مع تجديد في الخلفية) ولا على خادمهم.
 */
export const MDAREK_API_REVALIDATE_S = Number(
  process.env.MDAREK_API_REVALIDATE_S ?? 1_800,
);

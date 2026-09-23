// شعار مدارك الخطي الحقيقي معروضًا بتقنية mask حتى يتلون بتدرج الهوية
// ويتكيف مع الوضعين. نسخة logo-mark.png مقتصّة من الهامش الشفاف
// (نسبة المحتوى 1.23) فيملأ النص صندوقه — استخدم صندوقًا بنفس النسبة.

const maskStyle: React.CSSProperties = {
  WebkitMaskImage: "url(/logo-mark.png)",
  maskImage: "url(/logo-mark.png)",
  WebkitMaskSize: "contain",
  maskSize: "contain",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  WebkitMaskPosition: "center",
  maskPosition: "center",
};

export function MadarekLogo({ className = "" }: { className?: string }) {
  return <span aria-hidden style={maskStyle} className={`block ${className}`} />;
}

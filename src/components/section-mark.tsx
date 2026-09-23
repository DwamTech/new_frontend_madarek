import { SectionIcon } from "@/components/section-icon";
import { sectionColorStyle } from "@/lib/section-colors";

/**
 * شارة الباب — تحمل صبغة الباب بدل الجلدي الموحّد.
 * تُستعمل حيثما ظهر اسم الباب بجانب مادة (بطاقة، قائمة، رأس مقال).
 */
export function SectionBadge({
  slug,
  name,
  className = "",
}: {
  slug: string;
  name: string;
  className?: string;
}) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${className}`}
      style={{
        ...sectionColorStyle(slug),
        background: "var(--pig-soft)",
        color: "var(--pig)",
      }}
    >
      {name}
    </span>
  );
}

/**
 * مربّع أيقونة الباب بصبغته. الأبعاد تأتي من className
 * لأنها تختلف بين الرئيسية (size-12) والفهارس (size-8) وترويسة الباب (size-16).
 */
export function SectionGlyph({
  slug,
  icon,
  className = "",
  iconClassName = "size-4",
}: {
  slug: string;
  icon: string;
  className?: string;
  iconClassName?: string;
}) {
  return (
    <span
      className={`flex items-center justify-center ${className}`}
      style={{
        ...sectionColorStyle(slug),
        background: "var(--pig-soft)",
        color: "var(--pig)",
      }}
    >
      <SectionIcon name={icon} className={iconClassName} />
    </span>
  );
}

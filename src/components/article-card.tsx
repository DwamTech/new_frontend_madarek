import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";
import type { Article } from "@/lib/mdarek-api/types";
import { readingLabel } from "@/lib/format";
import { SectionIcon } from "@/components/section-icon";
import { SectionBadge } from "@/components/section-mark";
import { sectionColorStyle } from "@/lib/section-colors";

// بطاقة مقال — صورة المادة الحقيقية، وعند غيابها غلاف الباب المولّد بصبغته
export function ArticleCard({
  article,
  featured = false,
  sectionIcon = "newspaper",
  showTitle = true,
}: {
  article: Article;
  featured?: boolean;
  sectionIcon?: string;
  /** false: اسم الباب وحده كعنوان بارز، بلا عنوان المادة ولا شارة صغيرة —
   *  لعرض "مختارات العدد" الذي يقصد تصفّح الأبواب لا عناوين بعينها */
  showTitle?: boolean;
}) {
  return (
    <Link
      href={`/articles/${article.id}`}
      style={{
        ...sectionColorStyle(article.sectionSlug),
        // خلفية المحتوى نسخة خافتة من صبغة الباب بدل الأبيض التام —
        // تتناغم مع الشارة بدل القطع الفجائي إليها (تباين مفحوص: يتجاوز
        // AA للعنوان والنص الثانوي في كل الصبغات العشر)
        backgroundColor: "var(--pig-soft)",
      }}
      // الحدّ يأخذ صبغة الباب عند المرور: لون يظهر لحظة التفاعل فيؤكد
      // انتماء المادة، وبلا أي ضوضاء لونية في حالة السكون
      className="group flex h-full flex-col overflow-hidden rounded-md border border-line shadow-[var(--shadow-warm)] transition-[box-shadow,border-color] duration-200 hover:border-[color:var(--pig)] hover:shadow-lg"
    >
      <div
        // aspect-video لا ارتفاع ثابت: عرض الصندوق يتغيّر حسب الشبكة
        // (٢-٣ أعمدة حسب الشاشة)، فارتفاع ثابت بالبكسل كان يعني نسبة
        // فعلية متفاوتة باستمرار (~1.6 إلى ~3.3) لا تطابق أي مقاس صورة.
        // aspect-video يثبّت النسبة على 16:9 في كل شاشة — فصورة المقال
        // المصدَّرة بمقاس 1200×675 (16:9) تملأ الصندوق تمامًا بلا فراغ
        className="relative flex aspect-video items-center justify-center overflow-hidden"
        style={{
          // غلاف مولّد بصبغة الباب مع بقاء الذهبي طرفًا ثانيًا حفاظًا على الهوية
          backgroundImage:
            "linear-gradient(to bottom left, var(--pig-soft), var(--gold-soft))",
        }}
      >
        {article.cover ? (
          <Image
            src={article.cover.url}
            alt={article.cover.alt}
            fill
            sizes={featured ? "600px" : "400px"}
            // object-contain لا object-cover: صور المواد الحالية أُنتجت قبل
            // اعتماد مقاس 16:9 الموحّد وبنسب متفاوتة جدًا — القص كان سيُفقد
            // جزءًا من نص أو مشهد مهم فيها. بعد تثبيت الصندوق على 16:9، أي
            // صورة تُصدَّر بمقاس 1200×675 الموصى به تملؤه بلا فراغ من الأساس
            // ولا فرق فيها بين contain وcover؛ الفرق يظهر فقط في الصور
            // القديمة غير المطابقة، وهنا نُفضّل رؤيتها كاملة على قصّها
            className="object-contain transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <SectionIcon
            name={sectionIcon}
            className={`opacity-40 ${featured ? "size-16" : "size-11"}`}
            style={{ color: "var(--pig)" }}
          />
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        {showTitle ? (
          <>
            <SectionBadge
              slug={article.sectionSlug}
              name={article.sectionName}
              className="mb-2 self-start px-3"
            />
            <h3
              className={`font-bold leading-8 text-ink transition-colors group-hover:text-leather ${
                featured ? "text-xl" : "text-[17px]"
              }`}
            >
              {article.title}
            </h3>
          </>
        ) : (
          <h3
            className={`font-bold leading-8 text-ink transition-colors group-hover:text-leather ${
              featured ? "text-xl" : "text-[17px]"
            }`}
          >
            {article.sectionName}
          </h3>
        )}
        <p className="mb-4 mt-2 line-clamp-2 text-sm leading-7 text-soft">
          {article.excerpt}
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-line pt-3 text-xs text-soft">
          {article.author && (
            <>
              <span className="font-semibold">{article.author.name}</span>
              <span aria-hidden>·</span>
            </>
          )}
          <span className="flex items-center gap-1">
            <Clock className="size-3.5" />
            {readingLabel(article.readingMinutes)}
          </span>
          <span aria-hidden>·</span>
          <span>العدد {article.issueNumber}</span>
        </div>
      </div>
    </Link>
  );
}

import Link from "next/link";
import type { Metadata } from "next";
import { getAllIssues, getAuthors, getCurrentIssue } from "@/lib/mdarek-api";
import { SectionIcon } from "@/components/section-icon";
import { orderSectionsForDisplay, sectionColorStyle } from "@/lib/section-colors";

export const metadata: Metadata = {
  title: "من نحن",
  description:
    "مجلة مدارك: مجلة شهرية علمية متخصصة في بيان حقيقة الصوفية دراسةً وبحثًا ونقدًا.",
};

// كل نصوص هذا الملف (الفقرة الافتتاحية، المنهج، الرؤية، الرسالة،
// الأهداف العشرة) منسوخة حرفيًا من صفحة "من نحن" الحقيقية على
// mdarek.net/about — لا اختصار ولا إعادة صياغة. الإضافات الوحيدة غير
// الموجودة في الأصل: قسم "استكشف الأبواب" (شبكة روابط)، والأرقام،
// والدعوة للتواصل — موسومة بوضوح في التعليقات أدناه.

// المنهج — الفقرة الوسطى من "من نحن" الحقيقية
const METHOD_POINTS = [
  "تفكيك المصطلحات وتحرير دلالاتها، حتى لا تُدار المعارك في الضباب.",
  "قراءة الشخصيات والمدارس في ضوء ميزان العلم والشرع والسياق التاريخي.",
  "تحليل الامتداد العالمي للصوفية وتحولاتها المعاصرة.",
  "تفنيد الشبهات والمغالطات التي تُلبَّس على العامة أو تُسوَّق بأسماء براقة.",
  "إتاحة الوثائق والنقول والمراجع بما يخدم الباحث والقارئ الجاد.",
];

// الأهداف العشرة — نص كامل غير مختصر
const GOALS = [
  "تحرير المفاهيم والمصطلحات الصوفية وشرحها شرحًا علميًّا يزيل الالتباس ويمنع الخلط المتعمد أو غير المتعمد.",
  "رصد المدارس والاتجاهات الصوفية تاريخيًّا ومعاصرًا، وبيان تطوراتها الفكرية والاجتماعية.",
  "دراسة الشخصيات الصوفية المؤثرة دراسة نقدية موثقة، تُبيّن مواطن الصواب والخطأ بميزان منضبط.",
  "تفكيك الشبهات المتعلقة بالصوفية والرد عليها ردًّا علميًّا، مع تتبّع مصادر الشبهة ومسار انتشارها.",
  "تقديم إحصائيات وتحليلات تساعد على فهم الحضور المؤسسي والاجتماعي والإعلامي للصوفية، داخل العالم العربي وخارجه.",
  "متابعة \"الصوفية حول العالم\": الانتشار، التنظيمات، الأدوات، التحالفات، وأثر ذلك في المجال الديني والفكري.",
  "بناء خزانة وثائق تتضمن مواد أصلية ونقولًا ومصادر تساعد الباحث على الوصول للأصل بدل الدوران حول الكلام المنقول بلا سند.",
  "تأريخ المحطات المؤثرة التي شكّلت الظاهرة الصوفية: اللحظات المفصلية، والتحولات، والاصطدامات الفكرية عبر الزمن.",
  "مراجعة الكتب والدراسات المتعلقة بالصوفية مراجعة علمية تُظهر قيمتها ومآخذها وتضعها في سياقها.",
  "صناعة محتوى معرفي رصين يوازن بين قوة الحجة ووضوح العرض، بحيث يستفيد منه القارئ غير المتخصص دون فقدان الصرامة العلمية.",
];

export default async function AboutPage() {
  const [issues, authors, current] = await Promise.all([
    getAllIssues(),
    getAuthors(),
    getCurrentIssue(),
  ]);
  const sections = current?.sections ?? [];
  const articleCount = issues.reduce((n, i) => n + i.articles.length, 0);
  // إجمالي القراءات الحقيقي من عدادات النظام القديم.
  // تحقق ميداني: views_count للعدد = مجموع views_count لمقالاته بالضبط
  // في كل الأعداد — فهما عداد واحد، ونعرضه رقمًا واحدًا لا رقمين.
  const totalReads = issues.reduce((n, i) => n + i.views, 0);
  const stats = [
    { n: issues.length, t: "أعداد صادرة" },
    { n: articleCount, t: "مادة منشورة" },
    { n: authors.length, t: "باحثًا وكاتبًا" },
    { n: sections.length, t: "أبواب ثابتة" },
    { n: totalReads, t: "قراءة مسجّلة" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
      {/* الجوهر — الفقرة الافتتاحية والختامية من "من نحن" الحقيقية، حرفيًا */}
      <header className="relative overflow-hidden rounded-md border border-line bg-raise p-8 md:p-12">
        <div className="ornament pointer-events-none absolute inset-0 opacity-[0.06]" aria-hidden />
        <p className="relative text-sm font-bold tracking-wide text-gold">لماذا مدارك؟</p>
        <h1 className="relative mt-2 max-w-3xl font-amiri text-3xl font-bold leading-relaxed text-ink md:text-4xl md:leading-relaxed">
          مجلة مدارك مجلة شهرية علمية متخصصة في بيان حقيقة الصوفية دراسةً
          وبحثًا ونقدًا،
        </h1>
        <p className="relative mt-4 max-w-2xl leading-9 text-soft">
          وفق منهج علمي يقوم على التوثيق والتحقيق، وردّ المسائل إلى أصولها:
          نصوصًا ومفاهيم وتاريخًا وواقعًا.
        </p>
        <p className="relative mt-3 max-w-2xl leading-9 text-soft">
          وفي كل ذلك، تسعى &quot;مدارك&quot; إلى كتابةٍ رصينة لا تعتمد الإثارة،
          ولا تُدار بالانطباع، بل بالبرهان: نصٌّ ثابت، وفهمٌ منضبط، وحُكمٌ
          معلّل.
        </p>
      </header>

      {/* المنهج — الفقرة الوسطى الحقيقية، بلا اختصار */}
      <section className="mt-8 rounded-md border border-line bg-raise p-7 shadow-[var(--shadow-warm)]">
        <h2 className="flex items-center gap-2 text-xl font-bold text-ink">
          <span className="h-5 w-1 rounded-full bg-gold" aria-hidden />
          تعمل المجلة على تقديم ملف معرفي متكامل حول الظاهرة الصوفية
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {METHOD_POINTS.map((point) => (
            <li key={point} className="flex gap-3 text-sm leading-7 text-soft">
              <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-gold" aria-hidden />
              {point}
            </li>
          ))}
        </ul>
      </section>

      {/* الرؤية والرسالة — حرفيًا */}
      <section className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-md border border-line bg-raise p-7 shadow-[var(--shadow-warm)]">
          <h2 className="flex items-center gap-2 text-xl font-bold text-ink">
            <span className="h-5 w-1 rounded-full bg-gold" aria-hidden />
            الرؤية
          </h2>
          <p className="mt-3 leading-9 text-soft">
            أن تكون مدارك مرجعًا علميًّا عربيًّا موثوقًا في دراسة الصوفية:
            تاريخًا وفكرًا وممارسةً وتأثيرًا، يسهم في رفع الوعي، وتصحيح
            المفاهيم، وبناء خطاب علمي متوازن قادر على التفريق بين الحق
            والباطل دون تهويل ولا تمييع.
          </p>
        </div>
        <div className="rounded-md border border-line bg-raise p-7 shadow-[var(--shadow-warm)]">
          <h2 className="flex items-center gap-2 text-xl font-bold text-ink">
            <span className="h-5 w-1 rounded-full bg-gold" aria-hidden />
            الرسالة
          </h2>
          <p className="mt-3 leading-9 text-soft">
            تقديم محتوى علمي شهري متخصص يهدف إلى بيان حقيقة الصوفية من جميع
            جوانبها وذلك عبر تحرير علمي دقيق، وتحقيق للنقول، وتحليل للواقع،
            بما يخدم القارئ العام والباحث المتخصص على السواء.
          </p>
        </div>
      </section>

      {/* استكشف الأبواب — إضافة تصفّح جديدة، لا نص من الموقع القديم */}
      <section className="mt-14">
        <h2 className="text-2xl font-bold text-ink">استكشف الأبواب العشرة</h2>
        <p className="mt-2 max-w-2xl text-soft">
          كل عدد يمر عبر الأبواب العشرة نفسها: من تحرير المصطلح، إلى قراءة
          الشخصيات، إلى تفنيد الشبهات، إلى إتاحة الوثيقة الأصلية.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {orderSectionsForDisplay(sections).map((s) => (
            <Link
              key={s.slug}
              href={`/sections/${s.slug}`}
              style={sectionColorStyle(s.slug)}
              className="group rounded-md border border-line bg-raise p-4 transition-colors hover:border-[color:var(--pig)]"
            >
              <SectionIcon name={s.icon} className="size-5" style={{ color: "var(--pig)" }} />
              <p className="mt-2 text-sm font-bold text-ink group-hover:text-leather">
                {s.name}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* الأهداف */}
      <section className="mt-14">
        <h2 className="mb-6 text-2xl font-bold text-ink">أهدافنا العشرة</h2>
        <ol className="grid gap-3 md:grid-cols-2">
          {GOALS.map((g, i) => (
            <li key={i} className="flex gap-4 rounded-md bg-surface p-5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gold text-sm font-bold text-[#241A05]">
                {i + 1}
              </span>
              <p className="text-sm leading-7 text-ink">{g}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* أرقام + دعوة */}
      <section className="mt-14 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <dl className="grid grid-cols-2 gap-4">
          {stats.map((s, i) => (
            <div
              key={s.t}
              className={`rounded-md border border-line bg-raise p-6 text-center ${
                stats.length % 2 === 1 && i === stats.length - 1 ? "col-span-2" : ""
              }`}
            >
              <dd className="text-4xl font-bold tabular-nums text-leather">
                {s.n.toLocaleString("en")}
              </dd>
              <dt className="mt-1 text-sm text-soft">{s.t}</dt>
            </div>
          ))}
        </dl>
        <div className="flex flex-col justify-center rounded-md bg-leather-2 p-8 text-[#EFDFC8]">
          <h2 className="text-xl font-bold">هذه المعرفة تُبنى بالتعاون</h2>
          <p className="mt-2 text-sm leading-8 text-[#EFDFC8]/85">
            تعرّف على باحثينا، أو ساهم بمادة علمية، أو راسلنا بتصحيح.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/writers"
              className="rounded-md bg-gold px-5 py-2.5 text-sm font-bold text-[#241A05] transition-[filter] hover:brightness-105"
            >
              الباحثون والكتّاب
            </Link>
            <Link
              href="/contact"
              className="rounded-md border border-[#EFDFC8]/40 px-5 py-2.5 text-sm font-bold text-[#EFDFC8] transition-colors hover:bg-[#EFDFC8]/10"
            >
              تواصل معنا
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

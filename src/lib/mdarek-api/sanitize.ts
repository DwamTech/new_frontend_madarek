import sanitizeHtml from "sanitize-html";

// محتوى النظام القديم HTML غير موثوق ومحشو بتنسيقات مضمنة
// (font-family: cairo وألوان صريحة). ننظفه إلى بنية دلالية فقط،
// فيرث النص هوية التصميم الجديد تلقائيًا.

const ALLOWED_IMAGE_HOST = /^https:\/\/back\.mdarek\.net\//;

// اللون الذي يستخدمه محررو المجلة في النظام القديم لتمييز الآيات
// والأحاديث والنقول داخل المقالات — تمييز تحريري حقيقي نحافظ عليه
const EDITORIAL_GOLD = /rgb\(\s*202\s*,\s*138\s*,\s*4\s*\)/;

/**
 * مقالات النظام القديم مُلصقة من Word، فتحمل علامات هوامش
 * <a href="#_ftn3">[3]</a> بينما نصوص الهوامش نفسها ضاعت في الاستيراد
 * ولم يبقَ لها هدف في المحتوى. إبقاؤها روابط يوهم القارئ بأنها تنقله
 * إلى مصدر، فنفكّ الرابط ونُبقي العلامة [3] نصًّا — فهي محتوى تحريري
 * حقيقي. أما الروابط الداخلية التي لها هدف فعلي فتبقى كما هي.
 */
function anchorTargets(html: string): Set<string> {
  const ids = new Set<string>();
  for (const m of html.matchAll(/(?:id|name)\s*=\s*["']([^"']+)["']/g)) {
    ids.add(m[1]);
  }
  return ids;
}

function buildOptions(targets: Set<string>): sanitizeHtml.IOptions {
  return {
    ...OPTIONS,
    transformTags: {
      ...OPTIONS.transformTags,
      a: (tagName, attribs): sanitizeHtml.Tag => {
        const href = attribs.href ?? "";
        if (href.startsWith("#")) {
          // رابط داخلي: يبقى فقط إن كان هدفه موجودًا فعلًا، وبلا _blank
          return targets.has(href.slice(1))
            ? { tagName, attribs: { href } }
            : { tagName: "span", attribs: {} }; // يُفكّ ويبقى نصه
        }
        return {
          tagName,
          attribs: { ...attribs, target: "_blank", rel: "noopener noreferrer" },
        };
      },
    },
  };
}

const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "h2", "h3", "h4",
    "strong", "em", "b", "i", "u", "s", "sup", "sub",
    "blockquote", "q", "cite", "mark",
    "ul", "ol", "li",
    "a", "br", "hr",
    "img", "figure", "figcaption",
    "table", "thead", "tbody", "tr", "th", "td",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt"],
    th: ["colspan", "rowspan"],
    td: ["colspan", "rowspan"],
  },
  allowedSchemes: ["https", "http", "mailto"],
  // أي وسم غير مسموح يُحذف ويبقى نصه (span تُفكّ تلقائيًا)
  disallowedTagsMode: "discard",
  // ملاحظة: تحويل الوسم a يُبنى في buildOptions لأنه يحتاج معرفة
  // بأهداف الروابط الداخلية في المستند كله، لا بالوسم وحده
  transformTags: {
    // span بالذهبي التحريري ← mark (يبقى)؛ سائر spans تُفكّ كالمعتاد
    span: (tagName, attribs) =>
      EDITORIAL_GOLD.test(attribs.style ?? "")
        ? { tagName: "mark", attribs: {} }
        : { tagName, attribs },
  },
  exclusiveFilter: (frame) =>
    // صور من خارج مخزن النظام القديم تُحذف (لا نحمّل من مصادر مجهولة)
    frame.tag === "img" && !ALLOWED_IMAGE_HOST.test(frame.attribs.src ?? ""),
};

export function sanitizeArticleHtml(html: string | null | undefined): string {
  if (!html) return "";
  return sanitizeHtml(html, buildOptions(anchorTargets(html))).trim();
}

/** نص خالص منزوع الوسوم — للبحث والمقتطفات وحساب زمن القراءة */
export function toPlainText(html: string | null | undefined): string {
  if (!html) return "";
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, " ")
    .trim();
}

/** مقتطف عند حدود الكلمات */
export function makeExcerpt(plain: string, max = 220): string {
  if (plain.length <= max) return plain;
  const cut = plain.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > max * 0.6 ? lastSpace : max)}…`;
}

/** زمن قراءة تقديري — 180 كلمة/دقيقة للعربية */
export function estimateReadingMinutes(plain: string): number {
  const words = plain.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 180));
}

/**
 * يستخرج المقتطفات التي ميّزها محررو المجلة بالذهبي (بعد التحويل إلى mark)
 * — نصوص حقيقية من اختيار التحرير، تُستخدم في ويدجت «من نصوص العدد».
 */
export function extractHighlights(sanitizedHtml: string): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const re = /<mark>([\s\S]*?)<\/mark>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(sanitizedHtml)) !== null) {
    const text = toPlainText(m[1]);
    if (text.length < 20 || text.length > 220) continue;
    if (seen.has(text)) continue;
    seen.add(text);
    out.push(text);
  }
  return out;
}

/** يضيف معرّفات ربط للعناوين الداخلية ويستخرج فهرس المقال */
export function addHeadingAnchors(html: string): {
  html: string;
  toc: { id: string; text: string; level: number }[];
} {
  const toc: { id: string; text: string; level: number }[] = [];
  let i = 0;
  const out = html.replace(
    /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/g,
    (_m, lvl: string, attrs: string, inner: string) => {
      const text = toPlainText(inner);
      if (!text) return `<h${lvl}${attrs}>${inner}</h${lvl}>`;
      i += 1;
      const id = `heading-${i}`;
      toc.push({ id, text, level: Number(lvl) });
      return `<h${lvl}${attrs} id="${id}">${inner}</h${lvl}>`;
    },
  );
  return { html: out, toc };
}

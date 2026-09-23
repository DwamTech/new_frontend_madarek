/** صيغة عربية سليمة لزمن القراءة */
export function readingLabel(minutes: number): string {
  if (minutes === 1) return "دقيقة واحدة";
  if (minutes === 2) return "دقيقتان";
  if (minutes <= 10) return `${minutes} دقائق`;
  return `${minutes} دقيقة`;
}

// ألقاب تسبق بعض أسماء الباحثين — مختصرة بنقطة («أ.» أستاذ، «د.» دكتور،
// «م.» مهندس، وتركيباتها مثل «أ.د.») أو كاملة («الشيخ») — نتجاهلها عند
// الترتيب الأبجدي وعند اختيار حرف الصورة الرمزية، كي يُعتمد الاسم
// الحقيقي لا اللقب.
const TITLE_PREFIX_RE = /^(?:(?:[أدم]\.|الشيخ)\s*)+/;

/** الاسم بعد حذف اللقب المسبوق به — يُستخدم للترتيب الأبجدي وحرف الصورة الرمزية */
export function authorSortKey(name: string): string {
  return name.replace(TITLE_PREFIX_RE, "");
}

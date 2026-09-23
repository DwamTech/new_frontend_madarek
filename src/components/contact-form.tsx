"use client";

import { useState } from "react";
import { ArrowRight, Mail, Send } from "lucide-react";

const TYPES = [
  "استفسار عام",
  "مساهمة علمية",
  "تصحيح معلومة",
  "إعادة نشر أو اقتباس",
  "شراكة أو صحافة",
];

/**
 * الإرسال المباشر من الموقع لم يُفعَّل بعد (لا خادم بريد مربوطًا) —
 * فالنموذج يجهّز الرسالة ويسلّمها لتطبيق بريد المستخدم عبر mailto
 * إلى بريد المجلة الرسمي المؤكَّد. لا ادعاء إرسال لا يحدث.
 */
export function ContactForm() {
  const [ready, setReady] = useState(false);
  const [type, setType] = useState(TYPES[0]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const mailtoHref = () => {
    const subject = `[${type}] رسالة من ${name || "زائر الموقع"}`;
    const body = `${message}\n\n— ${name}${email ? ` <${email}>` : ""}`;
    return `mailto:info@mdarek.net?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  if (ready) {
    return (
      <div className="rounded-md border border-gold/40 bg-gold-soft/40 p-8 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-gold text-[#241A05]">
          <Mail className="size-6" />
        </span>
        <h2 className="mt-3 text-lg font-bold text-ink">رسالتك جاهزة للإرسال</h2>
        <p className="mx-auto mt-1 max-w-sm text-sm leading-7 text-soft">
          الإرسال المباشر من الموقع قيد التفعيل — الزر التالي يفتح تطبيق
          بريدك برسالتك كاملة موجَّهة إلى{" "}
          <span dir="ltr" className="font-semibold">info@mdarek.net</span>،
          فقط اضغط إرسال هناك.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <a
            href={mailtoHref()}
            className="flex items-center gap-2 rounded-md bg-leather px-5 py-2.5 text-sm font-bold text-[#FFF8EE] transition-[filter] hover:brightness-110 dark:text-[#1E1207]"
          >
            <Send className="size-4" />
            أرسل عبر بريدك
          </a>
          <button
            type="button"
            onClick={() => setReady(false)}
            className="flex items-center gap-2 rounded-md border border-leather px-5 py-2.5 text-sm font-bold text-leather transition-colors hover:bg-leather-soft"
          >
            <ArrowRight className="size-4" />
            عدّل الرسالة
          </button>
        </div>
      </div>
    );
  }

  const field = "w-full rounded-md border border-line bg-raise px-3.5 py-2.5 text-[15px] text-ink placeholder:text-soft/50";
  const label = "mb-1.5 block text-sm font-bold text-ink";

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        setReady(true);
      }}
    >
      <div>
        <label htmlFor="c-type" className={label}>نوع الرسالة</label>
        <select
          id="c-type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className={field}
        >
          {TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="c-name" className={label}>الاسم الكامل</label>
          <input
            id="c-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={field}
            placeholder="اسمك"
          />
        </div>
        <div>
          <label htmlFor="c-email" className={label}>البريد الإلكتروني</label>
          <input
            id="c-email"
            type="email"
            required
            dir="ltr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`${field} text-left`}
            placeholder="name@example.com"
          />
        </div>
      </div>
      <div>
        <label htmlFor="c-msg" className={label}>الرسالة</label>
        <textarea
          id="c-msg"
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={field}
          placeholder="اكتب رسالتك — وإن كانت مساهمة علمية فاذكر موضوعها ومصادرها."
        />
      </div>
      <button
        type="submit"
        className="flex items-center gap-2 rounded-md bg-leather px-6 py-3 font-bold text-[#FFF8EE] transition-[filter] hover:brightness-110 dark:text-[#1E1207]"
      >
        <Send className="size-4" />
        جهّز الرسالة
      </button>
    </form>
  );
}

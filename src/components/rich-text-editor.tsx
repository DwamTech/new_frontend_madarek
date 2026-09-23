"use client";

import { useEffect, useRef } from "react";
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Pilcrow,
  Redo2,
  Underline,
  Undo2,
} from "lucide-react";

// محرر نصوص مرئي بسيط (WYSIWYG) بلا اعتماد على مكتبة خارجية — لمدخل
// بيانات غير تقني: يكتب وينسّق بصريًا، ويُبنى HTML في الخلفية دون أن
// يظهر له أي وسم مباشرة. يستخدم execCommand (مدعوم في كل المتصفحات
// الحديثة رغم إهماله رسميًا) وهو كافٍ لتنسيق مقالة بسيط.
export function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current || !ref.current) return;
    ref.current.innerHTML = value;
    initialized.current = true;
    // القيمة الأولية فقط — التحديثات اللاحقة تأتي من onInput لا من الخارج
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exec = (command: string, arg?: string) => {
    ref.current?.focus();
    document.execCommand(command, false, arg);
    if (ref.current) onChange(ref.current.innerHTML);
  };

  const insertLink = () => {
    const url = window.prompt("رابط:");
    if (url) exec("createLink", url);
  };

  const btn =
    "flex size-8 items-center justify-center rounded text-soft transition-colors hover:bg-surface hover:text-ink";

  return (
    <div className="overflow-hidden rounded-md border border-line bg-raise">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-line bg-surface p-1.5">
        <button type="button" onClick={() => exec("bold")} className={btn} title="عريض" aria-label="عريض">
          <Bold className="size-4" />
        </button>
        <button type="button" onClick={() => exec("italic")} className={btn} title="مائل" aria-label="مائل">
          <Italic className="size-4" />
        </button>
        <button type="button" onClick={() => exec("underline")} className={btn} title="تحته خط" aria-label="تحته خط">
          <Underline className="size-4" />
        </button>
        <span className="mx-1 h-5 w-px bg-line" />
        <button type="button" onClick={() => exec("formatBlock", "h2")} className={btn} title="عنوان كبير" aria-label="عنوان كبير">
          <Heading2 className="size-4" />
        </button>
        <button type="button" onClick={() => exec("formatBlock", "h3")} className={btn} title="عنوان فرعي" aria-label="عنوان فرعي">
          <Heading3 className="size-4" />
        </button>
        <button type="button" onClick={() => exec("formatBlock", "p")} className={btn} title="فقرة عادية" aria-label="فقرة عادية">
          <Pilcrow className="size-4" />
        </button>
        <span className="mx-1 h-5 w-px bg-line" />
        <button type="button" onClick={() => exec("insertUnorderedList")} className={btn} title="قائمة نقطية" aria-label="قائمة نقطية">
          <List className="size-4" />
        </button>
        <button type="button" onClick={() => exec("insertOrderedList")} className={btn} title="قائمة مرقّمة" aria-label="قائمة مرقّمة">
          <ListOrdered className="size-4" />
        </button>
        <button type="button" onClick={insertLink} className={btn} title="إدراج رابط" aria-label="إدراج رابط">
          <Link2 className="size-4" />
        </button>
        <span className="mx-1 h-5 w-px bg-line" />
        <button type="button" onClick={() => exec("undo")} className={btn} title="تراجع" aria-label="تراجع">
          <Undo2 className="size-4" />
        </button>
        <button type="button" onClick={() => exec("redo")} className={btn} title="إعادة" aria-label="إعادة">
          <Redo2 className="size-4" />
        </button>
      </div>
      <div
        ref={ref}
        contentEditable
        dir="rtl"
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        className="min-h-48 max-w-none px-4 py-3 text-[15px] leading-8 text-ink outline-none [&_h2]:text-xl [&_h2]:font-bold [&_h3]:text-lg [&_h3]:font-bold [&_ol]:list-decimal [&_ol]:pr-5 [&_ul]:list-disc [&_ul]:pr-5 [&_a]:text-lapis [&_a]:underline"
      />
    </div>
  );
}

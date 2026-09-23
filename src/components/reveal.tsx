"use client";

import { useEffect, useRef } from "react";

/**
 * كشف تدريجي هادئ عند دخول العنصر نافذة العرض — مرة واحدة فقط.
 * الحالة المخفية تُطبق عبر CSS فقط عندما تكون html.js موجودة
 * (فلا يختفي المحتوى دون جافاسكربت)، وprefers-reduced-motion
 * يعطّل الحركة كليًا من globals.css.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  /** تأخير التدرج بالمللي ثانية (للبطاقات المتجاورة) */
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // احترام تفضيل تقليل الحركة: كشف فوري بلا أي حركة
    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      el.style.transition = "none";
      el.classList.add("is-revealed");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          el.classList.add("is-revealed");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-reveal
      className={className}
      style={
        delay
          ? ({ "--reveal-delay": `${delay}ms` } as React.CSSProperties)
          : undefined
      }
    >
      {children}
    </div>
  );
}

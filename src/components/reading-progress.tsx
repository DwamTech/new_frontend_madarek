"use client";

import { useEffect, useState } from "react";

// شريط تقدم القراءة — خيط ذهبي أعلى الصفحة
export function ReadingProgress() {
  const [p, setP] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setP(max > 0 ? (h.scrollTop / max) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed inset-x-0 top-16 z-30 h-0.5 bg-transparent print:hidden" aria-hidden>
      <div
        className="h-full bg-gold transition-[width] duration-100"
        style={{ width: `${p}%`, marginInlineStart: "auto" }}
      />
    </div>
  );
}

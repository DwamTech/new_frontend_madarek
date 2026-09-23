"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

// حالة الوضع الليلي مصدرها الحقيقي هو class على <html> —
// نشترك فيه عبر useSyncExternalStore بدل مزامنته يدويًا في effect
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

export function ThemeToggle() {
  const dark = useSyncExternalStore(
    subscribe,
    () => document.documentElement.classList.contains("dark"),
    () => false,
  );

  const toggle = () => {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("madarek-theme", next ? "dark" : "light");
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "التبديل إلى الوضع النهاري" : "التبديل إلى الوضع الليلي"}
      title={dark ? "الوضع النهاري" : "الوضع الليلي"}
      className="flex size-8 items-center justify-center rounded-full border border-line bg-raise text-soft transition-colors hover:text-leather"
    >
      {dark ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
    </button>
  );
}

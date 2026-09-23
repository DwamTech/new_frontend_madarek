"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Archive,
  BookOpen,
  ChevronDown,
  FolderOpen,
  Home,
  LayoutGrid,
  Library,
  ListTree,
  Menu,
  Search,
  Smartphone,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { SectionIcon } from "@/components/section-icon";
import { SectionGlyph } from "@/components/section-mark";
import { sectionPigment } from "@/lib/section-colors";
import { ThemeToggle } from "@/components/theme-toggle";

export type NavSection = { slug: string; name: string; icon: string };

export function Navbar({
  sections,
  currentIssueNumber,
}: {
  sections: NavSection[];
  currentIssueNumber: number;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false); // قائمة الجوال
  const [sectionsOpen, setSectionsOpen] = useState(false);
  const ddRef = useRef<HTMLDivElement>(null);

  const links: { href: string; label: string; icon: LucideIcon }[] = [
    { href: "/", label: "الرئيسية", icon: Home },
    { href: `/issues/${currentIssueNumber}`, label: "العدد الحالي", icon: BookOpen },
    { href: "/browse", label: "أرشيف الأبواب", icon: Archive },
    { href: "/writers", label: "الباحثون", icon: Users },
    { href: "/dossiers", label: "ملفات خاصة", icon: FolderOpen },
    { href: "/topics", label: "شجرة المواضيع", icon: ListTree },
    { href: "/services", label: "تطبيقاتنا", icon: Smartphone },
  ];

  // إغلاق منسدلة الأبواب عند النقر خارجها
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ddRef.current && !ddRef.current.contains(e.target as Node)) {
        setSectionsOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // إغلاق القوائم عند تغيّر المسار — تعديل حالة أثناء التصيير
  // (النمط الموصى به في React بدل setState داخل effect)
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setOpen(false);
    setSectionsOpen(false);
  }

  const linkCls = (href: string) =>
    `text-[15px] font-semibold transition-colors hover:text-leather ${
      pathname === href ? "text-leather" : "text-ink"
    }`;

  return (
    <>
      {/* شعار المجلة وجملتها التعريفية ينتقلان إلى شريط أعلى الصفحة
          (top-banner.tsx) يظهر فوق هذا الشريط في كل الصفحات، فلا داعي
          لتكرارهما هنا — رابط "الرئيسية" النصي أدناه يكفي للتنقل */}
      <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur print:hidden">
        <div className="mx-auto flex h-10 max-w-7xl items-center gap-4 px-3 lg:px-4">
        <nav className="hidden items-center gap-4 lg:flex" aria-label="التنقل الرئيسي">
          {links.slice(0, 1).map((l) => (
            <Link key={l.href} href={l.href} className={`flex items-center gap-1 ${linkCls(l.href)}`}>
              <l.icon className="size-3.5" />
              {l.label}
            </Link>
          ))}

          <div className="relative" ref={ddRef}>
            <button
              type="button"
              onClick={() => setSectionsOpen((v) => !v)}
              aria-expanded={sectionsOpen}
              className="flex items-center gap-1 text-[15px] font-semibold text-ink transition-colors hover:text-leather"
            >
              <LayoutGrid className="size-3.5" />
              الأبواب
              <ChevronDown
                className={`size-3.5 transition-transform ${sectionsOpen ? "rotate-180" : ""}`}
              />
            </button>
            {sectionsOpen && (
              <div className="absolute start-0 top-full mt-3 w-[480px] rounded-md border border-line bg-raise p-4 shadow-[var(--shadow-warm)]">
                <div className="grid grid-cols-2 gap-1">
                  {sections.map((s) => (
                    <Link
                      key={s.slug}
                      href={`/sections/${s.slug}`}
                      className="flex items-center gap-3 rounded-md p-2.5 transition-colors hover:bg-surface"
                    >
                      <SectionGlyph
                        slug={s.slug}
                        icon={s.icon}
                        className="size-9 shrink-0 rounded-md"
                        iconClassName="size-4.5"
                      />
                      <span className="text-sm font-bold text-ink">{s.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {links.slice(1).map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-1 ${linkCls(l.href)}`}
            >
              <l.icon className="size-3.5" />
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-2">
          <Link
            href="/search"
            aria-label="البحث في مدارك"
            title="البحث"
            className="flex size-8 items-center justify-center rounded-full border border-line bg-raise text-soft transition-colors hover:text-leather"
          >
            <Search className="size-3.5" />
          </Link>
          <ThemeToggle />
          <Link
            href="/issues"
            className="hidden items-center gap-1 rounded-md bg-leather px-2.5 py-1 text-sm font-bold text-[#FFF8EE] transition-[filter] hover:brightness-110 dark:text-[#1E1207] md:flex"
          >
            <Library className="size-3.5" />
            أرشيف الأعداد
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
            aria-expanded={open}
            className="flex size-8 items-center justify-center rounded-full border border-line bg-raise text-ink lg:hidden"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {/* قائمة الجوال */}
      {open && (
        <nav
          aria-label="قائمة الجوال"
          className="border-t border-line bg-paper px-4 pb-6 pt-4 lg:hidden"
        >
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="flex items-center gap-2 rounded-md px-3 py-2.5 text-[15px] font-semibold text-ink hover:bg-surface"
              >
                <l.icon className="size-4" />
                {l.label}
              </Link>
            ))}
            <Link
              href="/issues"
              className="flex items-center gap-2 rounded-md px-3 py-2.5 text-[15px] font-semibold text-ink hover:bg-surface"
            >
              <Library className="size-4" />
              أرشيف الأعداد
            </Link>
          </div>
          <p className="mb-2 mt-4 px-3 text-xs font-bold tracking-wide text-soft">
            أبواب المجلة
          </p>
          <div className="grid grid-cols-2 gap-1">
            {sections.map((s) => (
              <Link
                key={s.slug}
                href={`/sections/${s.slug}`}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-ink hover:bg-surface"
              >
                <SectionIcon
                  name={s.icon}
                  className="size-4"
                  style={{ color: `var(--pig-${sectionPigment(s.slug)})` }}
                />
                {s.name}
              </Link>
            ))}
          </div>
        </nav>
      )}
      </header>
    </>
  );
}

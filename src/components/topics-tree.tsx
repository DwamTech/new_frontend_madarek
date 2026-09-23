"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  Globe,
  PenLine,
  Tag,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { Topic } from "@/lib/mdarek-api/types";

const CATEGORIES: { key: Topic["category"]; label: string; icon: LucideIcon }[] = [
  { key: "country", label: "الدول", icon: Globe },
  { key: "author", label: "الكاتب", icon: PenLine },
  { key: "sect", label: "الفرقة", icon: Users },
  { key: "subject", label: "الموضوع", icon: Tag },
];

function CategoryAccordion({
  label,
  icon: Icon,
  values,
}: {
  label: string;
  icon: LucideIcon;
  values: Topic[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-md border border-line bg-raise">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-5 py-4"
      >
        <span className="flex items-center gap-3 font-bold text-ink">
          <span className="flex size-9 items-center justify-center rounded-md bg-leather-soft text-leather">
            <Icon className="size-4.5" />
          </span>
          {label}
          <span className="text-sm font-normal text-soft">({values.length})</span>
        </span>
        {open ? (
          <ChevronUp className="size-4 text-soft" />
        ) : (
          <ChevronDown className="size-4 text-soft" />
        )}
      </button>
      {open && (
        <div className="border-t border-line px-5 py-4">
          {values.length === 0 ? (
            <p className="text-sm text-soft">لا توجد قيم منشورة بعد لهذه الفئة.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {values.map((v) => (
                <Link
                  key={v.id}
                  href={`/topics/${v.category}/${v.slug}`}
                  className="rounded-full border border-line bg-paper px-4 py-1.5 text-sm font-semibold text-ink transition-colors hover:border-gold hover:text-leather"
                >
                  {v.name}
                  <span className="ms-1.5 text-soft">({v.articleIds.length})</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function TopicsTree({ topics }: { topics: Topic[] }) {
  return (
    <div className="space-y-3">
      {CATEGORIES.map((c) => (
        <CategoryAccordion
          key={c.key}
          label={c.label}
          icon={c.icon}
          values={topics.filter((t) => t.category === c.key)}
        />
      ))}
    </div>
  );
}

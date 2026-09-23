import type { Metadata } from "next";
import { getIssueSummaries } from "@/lib/mdarek-api";
import { ArchiveList } from "@/components/archive-list";

export const metadata: Metadata = {
  title: "أرشيف المجلة",
  description: "كل أعداد مجلة مدارك منذ التأسيس — تصفحًا نصيًا أو تحميلًا PDF.",
};

export default async function ArchivePage() {
  const issues = await getIssueSummaries();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
      <h1 className="text-3xl font-bold text-ink">أرشيف المجلة</h1>
      <p className="mt-2 text-soft">
        {issues.length} {issues.length === 1 ? "عدد" : "أعداد"} منذ التأسيس —
        تصفحًا نصيًا أو تحميلًا PDF.
      </p>
      <ArchiveList issues={issues} />
    </div>
  );
}

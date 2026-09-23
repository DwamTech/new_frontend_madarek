import type { Metadata } from "next";
import { getSearchIndex } from "@/lib/mdarek-api";
import { SearchClient } from "@/components/search-client";

export const metadata: Metadata = {
  title: "البحث",
  description: "ابحث في كل مواد مجلة مدارك: عنوانًا ونصًا وكاتبًا ومصطلحًا.",
};

export default async function SearchPage() {
  // الفهرس يُبنى في الخادم (مخزنًا مؤقتًا) ويُسلَّم للعميل خفيفًا بلا HTML
  const records = await getSearchIndex();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold text-ink">ابحث في مدارك</h1>
        <p className="mt-2 text-soft">
          عنوانًا، أو نصًا، أو كاتبًا، أو مصطلحًا — عبر كل الأعداد.
        </p>
      </header>
      <SearchClient records={records} />
    </div>
  );
}

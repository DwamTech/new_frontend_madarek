import type { Metadata } from "next";
import { getAuthors } from "@/lib/mdarek-api";
import { WriterCard } from "@/components/writer-card";

export const metadata: Metadata = {
  title: "الباحثون والكتّاب",
  description: "عقول مدارك: الباحثون والكتّاب الذين يقف إنتاجهم خلف المجلة.",
};

export default async function WritersPage() {
  const authors = await getAuthors();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-bold text-ink">عقول مدارك</h1>
        <p className="mt-2 leading-8 text-soft">
          {authors.length} باحثًا وكاتبًا يحررون مواد المجلة عددًا بعد عدد —
          لكل منهم صفحة تجمع إنتاجه كاملًا.
        </p>
      </header>
      <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
        {authors.map(({ author, articles }) => (
          <WriterCard
            key={author.slug}
            author={author}
            articleCount={articles.length}
          />
        ))}
      </div>
    </div>
  );
}

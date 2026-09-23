import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { getAllArticles, getTopics } from "@/lib/mdarek-api";
import { ArticleCard } from "@/components/article-card";
import type { Topic } from "@/lib/mdarek-api/types";

type Props = { params: Promise<{ category: string; slug: string }> };

const CATEGORY_LABELS: Record<Topic["category"], string> = {
  country: "الدول",
  author: "الكاتب",
  sect: "الفرقة",
  subject: "الموضوع",
};

async function loadTopic(category: string, slug: string) {
  const topics = await getTopics();
  const topic = topics.find((t) => t.category === category && t.slug === slug);
  if (!topic) return null;
  const articles = await getAllArticles();
  return {
    topic,
    articles: articles.filter((a) => topic.articleIds.includes(a.id)),
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params;
  const found = await loadTopic(category, slug);
  if (!found) return {};
  return {
    title: found.topic.name,
    description: `كل مقالات مجلة مدارك المصنَّفة تحت "${found.topic.name}".`,
  };
}

export default async function TopicValuePage({ params }: Props) {
  const { category, slug } = await params;
  const found = await loadTopic(category, slug);
  if (!found) notFound();
  const { topic, articles } = found;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
      <Link
        href="/topics"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-lapis hover:underline"
      >
        <ArrowRight className="size-4" />
        شجرة المواضيع
      </Link>

      <header className="mt-6 max-w-2xl">
        <span className="rounded-full bg-leather-soft px-3 py-1 text-xs font-bold text-leather">
          {CATEGORY_LABELS[topic.category]}
        </span>
        <h1 className="mt-3 text-3xl font-bold text-ink">{topic.name}</h1>
        <p className="mt-2 text-soft">
          {articles.length} {articles.length === 1 ? "مقال" : "مقالات"}
        </p>
      </header>

      {articles.length > 0 ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      ) : (
        <p className="mt-10 rounded-md border border-line bg-raise p-8 text-center text-soft">
          لا توجد مقالات مرتبطة بهذه القيمة حاليًا.
        </p>
      )}
    </div>
  );
}

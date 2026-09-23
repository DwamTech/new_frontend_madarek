import type { Metadata } from "next";
import { getTopics } from "@/lib/mdarek-api";
import { TopicsTree } from "@/components/topics-tree";

export const metadata: Metadata = {
  title: "شجرة المواضيع",
  description:
    "فهرس موضوعي لمقالات مجلة مدارك: تصفّح حسب الدولة أو الكاتب أو الفرقة أو الموضوع.",
};

export default async function TopicsPage() {
  const topics = await getTopics();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 lg:px-6">
      <header>
        <h1 className="text-3xl font-bold text-ink">شجرة المواضيع</h1>
        <p className="mt-2 leading-8 text-soft">
          فهرس موضوعي لمقالات المجلة بأربع فئات رئيسية قابلة للطي: الدول،
          الكاتب، الفرقة، والموضوع — افتح أي فئة لتصفّح قيمها، والنقر على
          قيمة يعرض كل مقالاتها.
        </p>
      </header>

      <div className="mt-10">
        <TopicsTree topics={topics} />
      </div>
    </div>
  );
}

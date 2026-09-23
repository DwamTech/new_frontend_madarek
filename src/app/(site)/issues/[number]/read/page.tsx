import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { getIssueByNumber } from "@/lib/mdarek-api";
import { PdfViewer } from "@/components/pdf-viewer";

type Props = { params: Promise<{ number: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { number } = await params;
  const issue = await getIssueByNumber(Number(number));
  if (!issue) return {};
  return { title: `تصفح ${issue.title}` };
}

export default async function IssueReadPage({ params }: Props) {
  const { number } = await params;
  const num = Number(number);
  if (!Number.isInteger(num)) notFound();

  const issue = await getIssueByNumber(num);
  // لا عارض بلا ملف PDF فعلي — الفهرس النصي هو البديل حتى يُرفع الملف
  if (!issue || !issue.pdf) notFound();

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="flex shrink-0 items-center gap-3 border-b border-line bg-paper px-4 py-2.5 lg:px-6">
        <Link
          href={`/issues/${issue.number}`}
          className="flex items-center gap-1.5 text-sm font-semibold text-soft transition-colors hover:text-leather"
        >
          <ArrowRight className="size-4" />
          فهرس العدد
        </Link>
        <span className="text-sm font-bold text-ink">{issue.title}</span>
      </div>
      <div className="min-h-0 flex-1">
        <PdfViewer url={issue.pdf.url} />
      </div>
    </div>
  );
}

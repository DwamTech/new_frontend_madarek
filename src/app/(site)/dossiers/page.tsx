import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { FolderOpen } from "lucide-react";
import { getAllDossiers } from "@/lib/mdarek-api";

export const metadata: Metadata = {
  title: "ملفات خاصة",
  description: "ملفات موضوعية تجمع مقالات مجلة مدارك التي تشترك في موضوع واحد.",
};

export default async function DossiersPage() {
  const dossiers = await getAllDossiers();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-bold text-ink">ملفات خاصة</h1>
        <p className="mt-2 leading-8 text-soft">
          حين تجتمع عدة مقالات من عدد واحد حول موضوع مشترك، تُجمع هنا في ملف
          مستقل.
        </p>
      </header>

      {dossiers.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-3 rounded-md border border-line bg-raise p-14 text-center">
          <FolderOpen className="size-10 text-soft" />
          <p className="font-bold text-ink">لا توجد ملفات خاصة منشورة بعد</p>
          <p className="text-sm text-soft">تابعونا — أول ملف في الطريق.</p>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {dossiers.map(({ dossier, issueNumber }) => (
            <Link
              key={dossier.id}
              href={`/issues/${issueNumber}/dossiers/${dossier.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-md border border-line bg-raise shadow-[var(--shadow-warm)] transition-colors hover:border-gold"
            >
              <div className="relative aspect-video overflow-hidden bg-leather-soft">
                {dossier.cover ? (
                  <Image
                    src={dossier.cover.url}
                    alt={dossier.title}
                    fill
                    sizes="400px"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center">
                    <FolderOpen className="size-10 text-leather" />
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <span className="mb-2 self-start rounded-full bg-leather-soft px-3 py-0.5 text-xs font-bold text-leather">
                  العدد {issueNumber}
                </span>
                <h3 className="font-bold leading-8 text-ink transition-colors group-hover:text-leather">
                  {dossier.title}
                </h3>
                {dossier.intro && (
                  <p className="mt-2 line-clamp-2 text-sm leading-7 text-soft">
                    {dossier.intro}
                  </p>
                )}
                <p className="mt-auto pt-3 text-xs text-soft">
                  {dossier.articles.length}{" "}
                  {dossier.articles.length === 1 ? "مقال" : "مقالات"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

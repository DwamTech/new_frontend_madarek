import { Navbar } from "@/components/navbar";
import { TopBanner } from "@/components/top-banner";
import { Footer } from "@/components/footer";
import { ContactCta } from "@/components/contact-cta";
import { getCurrentIssue } from "@/lib/mdarek-api";
import { orderSectionsArticlesAfterOpening } from "@/lib/section-colors";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const current = await getCurrentIssue();
  const navSections = orderSectionsArticlesAfterOpening(current?.sections ?? []).map(
    (s) => ({ slug: s.slug, name: s.name, icon: s.icon }),
  );

  return (
    <div className="flex min-h-screen flex-col">
      <TopBanner />
      <Navbar sections={navSections} currentIssueNumber={current?.number ?? 1} />
      <main className="flex-1">{children}</main>
      <ContactCta />
      <Footer currentIssueNumber={current?.number ?? 1} />
    </div>
  );
}

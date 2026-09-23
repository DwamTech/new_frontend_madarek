import type { MetadataRoute } from "next";
import {
  getAllIssues,
  getAuthors,
  getCurrentIssue,
} from "@/lib/mdarek-api";

const SITE_URL = process.env.SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [issues, authors, current] = await Promise.all([
    getAllIssues(),
    getAuthors(),
    getCurrentIssue(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    "",
    "/issues",
    "/browse",
    "/writers",
    "/search",
    "/services",
    "/about",
    "/contact",
  ].map((p) => ({
    url: `${SITE_URL}${p}`,
    changeFrequency: p === "" ? "weekly" : "monthly",
    priority: p === "" ? 1 : 0.6,
  }));

  const issuePages: MetadataRoute.Sitemap = issues.map((i) => ({
    url: `${SITE_URL}/issues/${i.number}`,
    lastModified: i.publishedAt ?? undefined,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const articlePages: MetadataRoute.Sitemap = issues.flatMap((i) =>
    i.articles.map((a) => ({
      url: `${SITE_URL}/articles/${a.id}`,
      lastModified: a.publishedAt ?? undefined,
      changeFrequency: "yearly" as const,
      priority: 0.7,
    })),
  );

  const sectionPages: MetadataRoute.Sitemap = (current?.sections ?? []).map(
    (s) => ({
      url: `${SITE_URL}/sections/${s.slug}`,
      changeFrequency: "monthly",
      priority: 0.5,
    }),
  );

  const writerPages: MetadataRoute.Sitemap = authors.map(({ author }) => ({
    url: `${SITE_URL}/writers/${encodeURIComponent(author.slug)}`,
    changeFrequency: "monthly",
    priority: 0.4,
  }));

  return [
    ...staticPages,
    ...issuePages,
    ...articlePages,
    ...sectionPages,
    ...writerPages,
  ];
}

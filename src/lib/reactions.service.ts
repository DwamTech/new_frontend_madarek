import type { ArticleReactions, ReactionAction, ReactionType } from "./reactions.model";

const PUBLIC_API_BASE = (
  process.env.NEXT_PUBLIC_MDAREK_API_BASE ?? "https://back.mdarek.net/api"
).replace(/\/$/, "");

export class ReactionSubmissionError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "ReactionSubmissionError";
  }
}

export async function submitReaction(
  articleId: number,
  type: ReactionType,
  action: ReactionAction,
): Promise<ArticleReactions> {
  let response: Response;
  try {
    response = await fetch(`${PUBLIC_API_BASE}/articles/${articleId}/reactions`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ type, action }),
    });
  } catch {
    throw new ReactionSubmissionError("تعذر الاتصال بالخادم. يرجى المحاولة مرة أخرى.", 0);
  }

  const data: unknown = await response.json().catch(() => null);
  if (response.ok && data && typeof data === "object") {
    const counts = data as Partial<ArticleReactions>;
    if (typeof counts.likes === "number" && typeof counts.dislikes === "number") {
      return { likes: counts.likes, dislikes: counts.dislikes };
    }
  }

  if (response.status === 404) {
    throw new ReactionSubmissionError("المقال غير متاح للتفاعل حالياً.", 404);
  }
  if (response.status === 422 || response.status === 400) {
    throw new ReactionSubmissionError("نوع التفاعل غير صالح. يرجى المحاولة مرة أخرى.", 422);
  }
  if (response.status === 429) {
    throw new ReactionSubmissionError("تم إجراء عدد كبير من المحاولات. يرجى المحاولة لاحقاً.", 429);
  }
  throw new ReactionSubmissionError("تعذر تسجيل التفاعل حالياً. يرجى المحاولة مرة أخرى.", response.status);
}

import type { CreateCommentPayload, PendingCommentResponse } from "./comments.model";

const PUBLIC_API_BASE = (
  process.env.NEXT_PUBLIC_MDAREK_API_BASE ?? "https://back.mdarek.net/api"
).replace(/\/$/, "");

export class CommentSubmissionError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly field?: keyof CreateCommentPayload,
  ) {
    super(message);
    this.name = "CommentSubmissionError";
  }
}

function validationError(data: unknown): CommentSubmissionError {
  const body = data && typeof data === "object"
    ? data as { errors?: Record<string, unknown> }
    : {};
  const fields = body.errors && typeof body.errors === "object"
    ? Object.keys(body.errors)
    : [];
  const field = fields[0] as keyof CreateCommentPayload | undefined;
  const message = field === "captcha_token"
    ? "تعذر التحقق. يرجى إكمال التحقق مرة أخرى."
    : field === "author_name"
      ? "يرجى إدخال اسم صالح لا يتجاوز 120 حرفاً."
      : field === "text"
        ? "يرجى إدخال تعليق صالح لا يتجاوز 2000 حرف."
        : "يرجى مراجعة بيانات التعليق والمحاولة مرة أخرى.";
  return new CommentSubmissionError(message, 422, field);
}

export async function submitComment(
  articleId: number,
  payload: CreateCommentPayload,
): Promise<PendingCommentResponse> {
  let response: Response;
  try {
    response = await fetch(`${PUBLIC_API_BASE}/articles/${articleId}/comments`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new CommentSubmissionError(
      "تعذر الاتصال بالخادم. يرجى المحاولة مرة أخرى.",
      0,
    );
  }

  const data: unknown = await response.json().catch(() => null);
  if (response.ok) return data as PendingCommentResponse;
  if (response.status === 422 || response.status === 400) throw validationError(data);
  if (response.status === 429) {
    throw new CommentSubmissionError(
      "تم إرسال عدد كبير من التعليقات. يرجى المحاولة لاحقاً.",
      429,
    );
  }
  if (response.status === 404) {
    throw new CommentSubmissionError("المقال غير متاح لاستقبال التعليقات.", 404);
  }
  throw new CommentSubmissionError(
    "تعذر إرسال التعليق حالياً. يرجى المحاولة مرة أخرى.",
    response.status,
  );
}

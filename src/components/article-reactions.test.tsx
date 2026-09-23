import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ArticleEngagement } from "./article-engagement";
import { getStoredReaction, storeReaction } from "@/lib/reactions-cookie";
import { ReactionSubmissionError, submitReaction } from "@/lib/reactions.service";

vi.mock("@/lib/comments.service", () => ({ CommentSubmissionError: class CommentSubmissionError extends Error {}, submitComment: vi.fn() }));
vi.mock("@/components/turnstile-widget", () => ({ TurnstileWidget: () => null }));
vi.mock("@/lib/reactions.service", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/reactions.service")>();
  return { ...original, submitReaction: vi.fn() };
});

const mockSubmitReaction = vi.mocked(submitReaction);
const likeButton = () => screen.getByRole("button", { name: /^مفيد \d/ });
const dislikeButton = () => screen.getByRole("button", { name: /^غير مفيد \d/ });
function renderEngagement() { return render(<ArticleEngagement articleId={12} counts={{ likes: 2, dislikes: 1 }} comments={[]} />); }

afterEach(() => {
  ["", "_like", "_dislike"].forEach((suffix) => { document.cookie = `madarek_article_reaction_12${suffix}=; Max-Age=0; Path=/`; });
});

describe("تفاعلات المقال العامة", () => {
  beforeEach(() => vi.clearAllMocks());

  it("يضيف Like ويعرض العداد المؤكد ويحفظ Cookie", async () => {
    mockSubmitReaction.mockResolvedValue({ likes: 3, dislikes: 1 });
    renderEngagement();
    fireEvent.click(likeButton());
    await waitFor(() => expect(mockSubmitReaction).toHaveBeenCalledWith(12, "like", "add"));
    expect(likeButton().getAttribute("aria-pressed")).toBe("true");
    expect(getStoredReaction(12)).toBe("like");
  });

  it("يلغي Like النشط ويعود إلى الحالة المحايدة", async () => {
    storeReaction(12, "like");
    mockSubmitReaction.mockResolvedValue({ likes: 1, dislikes: 1 });
    renderEngagement();
    fireEvent.click(likeButton());
    await waitFor(() => expect(mockSubmitReaction).toHaveBeenCalledWith(12, "like", "remove"));
    expect(likeButton().getAttribute("aria-pressed")).toBe("false");
    expect(getStoredReaction(12)).toBeNull();
  });

  it("يضيف ويلغي Dislike", async () => {
    mockSubmitReaction.mockResolvedValueOnce({ likes: 2, dislikes: 2 }).mockResolvedValueOnce({ likes: 2, dislikes: 1 });
    renderEngagement();
    fireEvent.click(dislikeButton());
    await waitFor(() => expect(mockSubmitReaction).toHaveBeenCalledWith(12, "dislike", "add"));
    fireEvent.click(dislikeButton());
    await waitFor(() => expect(mockSubmitReaction).toHaveBeenLastCalledWith(12, "dislike", "remove"));
    expect(getStoredReaction(12)).toBeNull();
  });

  it("يبدل Like إلى Dislike دون إبقاء الاختيارين نشطين", async () => {
    storeReaction(12, "like");
    mockSubmitReaction.mockResolvedValueOnce({ likes: 1, dislikes: 1 }).mockResolvedValueOnce({ likes: 1, dislikes: 2 });
    renderEngagement();
    fireEvent.click(dislikeButton());
    await waitFor(() => expect(mockSubmitReaction).toHaveBeenNthCalledWith(1, 12, "like", "remove"));
    await waitFor(() => expect(mockSubmitReaction).toHaveBeenNthCalledWith(2, 12, "dislike", "add"));
    expect(likeButton().getAttribute("aria-pressed")).toBe("false");
    expect(dislikeButton().getAttribute("aria-pressed")).toBe("true");
    expect(getStoredReaction(12)).toBe("dislike");
  });

  it("يمنع الطلبات المتكررة أثناء عملية جارية", () => {
    mockSubmitReaction.mockReturnValue(new Promise(() => undefined));
    renderEngagement();
    fireEvent.click(likeButton());
    fireEvent.click(likeButton());
    expect(mockSubmitReaction).toHaveBeenCalledTimes(1);
  });

  it("يبقي الحالة وCookie عند فشل الحذف", async () => {
    storeReaction(12, "like");
    mockSubmitReaction.mockRejectedValue(new ReactionSubmissionError("تعذر تسجيل التفاعل حالياً.", 500));
    renderEngagement();
    fireEvent.click(likeButton());
    await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("تعذر تسجيل التفاعل"));
    expect(likeButton().getAttribute("aria-pressed")).toBe("true");
    expect(getStoredReaction(12)).toBe("like");
  });
});

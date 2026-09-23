import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ArticleEngagement } from "./article-engagement";
import { CommentSubmissionError, submitComment } from "@/lib/comments.service";

vi.mock("@/lib/comments.service", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/comments.service")>();
  return { ...original, submitComment: vi.fn() };
});

vi.mock("@/components/turnstile-widget", () => ({
  TurnstileWidget: ({ onToken, resetKey }: { onToken: (token: string) => void; resetKey: number }) => (
    <button type="button" data-testid="turnstile" data-reset-key={resetKey} onClick={() => onToken("captcha-token")}>إكمال التحقق</button>
  ),
}));

const mockSubmit = vi.mocked(submitComment);
const comments = [{ id: 1, authorName: "قارئ", text: "تعليق منشور", createdAt: "2026-09-23T10:00:00Z" }];

describe("تفاعل التعليقات العامة", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "public-test-key";
  });

  it("يعرض التعليقات المقبولة الحالية مع التاريخ", () => {
    render(<ArticleEngagement articleId={12} counts={{ likes: 0, dislikes: 0 }} comments={comments} />);
    expect(screen.getByText("قارئ")).toBeTruthy();
    expect(screen.getByText("تعليق منشور")).toBeTruthy();
    expect(document.querySelector("time")?.dateTime).toBe("2026-09-23T10:00:00Z");
  });

  it("يمنع الإرسال عند غياب رمز Turnstile", () => {
    render(<ArticleEngagement articleId={12} counts={{ likes: 0, dislikes: 0 }} comments={[]} />);
    fireEvent.change(screen.getByLabelText("الاسم"), { target: { value: "أحمد" } });
    fireEvent.change(screen.getByLabelText("التعليق"), { target: { value: "تعليق جديد" } });
    fireEvent.click(screen.getByRole("button", { name: "إرسال التعليق" }));
    expect(screen.getByRole("alert").textContent).toContain("إكمال التحقق");
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it("يرسل captcha_token ويعرض رسالة الانتظار ويمسح النموذج ويعيد Turnstile", async () => {
    mockSubmit.mockResolvedValue({ message: "ok", comment: { id: 2, author_name: "أحمد", text: "جديد", status: "pending", created_at: "2026-09-23T10:00:00Z" } });
    render(<ArticleEngagement articleId={12} counts={{ likes: 0, dislikes: 0 }} comments={comments} />);
    fireEvent.change(screen.getByLabelText("الاسم"), { target: { value: " أحمد " } });
    fireEvent.change(screen.getByLabelText("التعليق"), { target: { value: " جديد " } });
    fireEvent.click(screen.getByRole("button", { name: "إكمال التحقق" }));
    fireEvent.click(screen.getByRole("button", { name: "إرسال التعليق" }));

    await waitFor(() => expect(mockSubmit).toHaveBeenCalledWith(12, { author_name: "أحمد", text: "جديد", captcha_token: "captcha-token" }));
    expect(screen.getByRole("status").textContent).toContain("سيظهر بعد مراجعته");
    expect((screen.getByLabelText("الاسم") as HTMLInputElement).value).toBe("");
    expect(screen.queryByText("جديد")).toBeNull();
    expect(screen.getByTestId("turnstile").getAttribute("data-reset-key")).toBe("1");
  });

  it.each([
    [new CommentSubmissionError("يرجى مراجعة بيانات التعليق", 422), "يرجى مراجعة"],
    [new CommentSubmissionError("تم إرسال عدد كبير من التعليقات", 429), "عدد كبير"],
    [new CommentSubmissionError("تعذر الاتصال بالخادم", 0), "تعذر الاتصال"],
  ])("يعرض أخطاء الإرسال الآمنة ويعيد التحقق", async (failure, expected) => {
    mockSubmit.mockRejectedValue(failure);
    render(<ArticleEngagement articleId={12} counts={{ likes: 0, dislikes: 0 }} comments={[]} />);
    fireEvent.change(screen.getByLabelText("الاسم"), { target: { value: "أحمد" } });
    fireEvent.change(screen.getByLabelText("التعليق"), { target: { value: "تعليق" } });
    fireEvent.click(screen.getByRole("button", { name: "إكمال التحقق" }));
    fireEvent.click(screen.getByRole("button", { name: "إرسال التعليق" }));
    await waitFor(() => expect(screen.getByRole("alert").textContent).toContain(expected));
    expect(screen.getByTestId("turnstile").getAttribute("data-reset-key")).toBe("1");
  });
});

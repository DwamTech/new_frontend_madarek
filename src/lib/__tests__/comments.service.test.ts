import { beforeEach, describe, expect, it, vi } from "vitest";
import { CommentSubmissionError, submitComment } from "../comments.service";

const response = (body: unknown, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: vi.fn().mockResolvedValue(body),
}) as unknown as Response;

describe("خدمة إرسال التعليقات", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  it("يرسل رقم المقال والحقول الثلاثة المؤكدة فقط", async () => {
    fetchMock.mockResolvedValue(response({ message: "ok", comment: { status: "pending" } }, 201));
    const payload = { author_name: "أحمد", text: "تعليق", captcha_token: "token-1" };
    await submitComment(42, payload);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/articles/42/comments"),
      expect.objectContaining({ method: "POST", body: JSON.stringify(payload) }),
    );
  });

  it.each([
    [422, { errors: { text: ["invalid"] } }, "تعليق صالح"],
    [429, {}, "عدد كبير"],
    [500, {}, "تعذر إرسال التعليق"],
  ])("يعرض رسالة عربية آمنة لحالة HTTP %s", async (status, body, message) => {
    fetchMock.mockResolvedValue(response(body, status as number));
    await expect(submitComment(1, { author_name: "أ", text: "ب", captcha_token: "ت" }))
      .rejects.toMatchObject({ status, message: expect.stringContaining(message as string) });
  });

  it("لا يعرض Failed to fetch عند فشل الشبكة", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    await expect(submitComment(1, { author_name: "أ", text: "ب", captcha_token: "ت" }))
      .rejects.toEqual(expect.objectContaining<CommentSubmissionError>({
        status: 0,
        message: expect.stringContaining("تعذر الاتصال بالخادم"),
      }));
  });
});

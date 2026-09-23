import { beforeEach, describe, expect, it, vi } from "vitest";
import { submitReaction } from "../reactions.service";

const response = (body: unknown, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: vi.fn().mockResolvedValue(body),
}) as unknown as Response;

describe("خدمة تفاعلات المقال", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  it.each([["like", "add"], ["like", "remove"], ["dislike", "add"], ["dislike", "remove"]] as const)("يرسل %s/%s للمقال الرقمي إلى نقطة التفاعل", async (type, action) => {
    fetchMock.mockResolvedValue(response({ likes: 8, dislikes: 3 }));

    await expect(submitReaction(42, type, action)).resolves.toEqual({ likes: 8, dislikes: 3 });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/articles/42/reactions"),
      expect.objectContaining({ method: "POST", body: JSON.stringify({ type, action }) }),
    );
  });

  it.each([
    [404, "المقال غير متاح"],
    [422, "نوع التفاعل غير صالح"],
    [429, "عدد كبير من المحاولات"],
    [500, "تعذر تسجيل التفاعل"],
  ])("يعرض رسالة عربية آمنة لحالة HTTP %s", async (status, message) => {
    fetchMock.mockResolvedValue(response({}, status));
    await expect(submitReaction(1, "like", "add"))
      .rejects.toMatchObject({ status, message: expect.stringContaining(message) });
  });

  it("لا يمرر رسالة فشل الشبكة الخام", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    await expect(submitReaction(1, "like", "add"))
      .rejects.toMatchObject({ status: 0, message: "تعذر الاتصال بالخادم. يرجى المحاولة مرة أخرى." });
  });
});

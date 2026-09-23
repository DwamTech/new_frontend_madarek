import { afterEach, describe, expect, it } from "vitest";
import { getStoredReaction, migrateLegacyReactionCookies, REACTION_COOKIE_DAYS, reactionCookieName, removeStoredReaction, storeReaction } from "../reactions-cookie";

afterEach(() => {
  document.cookie.split("; ").forEach((cookie) => {
    const name = cookie.split("=")[0];
    if (name.startsWith("madarek_article_reaction_")) document.cookie = `${name}=; Max-Age=0; Path=/`;
  });
});

describe("Cookie تفاعل المقال", () => {
  it("يستخدم Cookie واحداً لكل مقال لمدة 30 يوماً", () => {
    expect(reactionCookieName(15)).toBe("madarek_article_reaction_15");
    expect(REACTION_COOKIE_DAYS).toBe(30);
  });

  it("يحفظ اختياراً واحداً ويحذفه عند الإلغاء", () => {
    storeReaction(15, "like");
    expect(getStoredReaction(15)).toBe("like");
    storeReaction(15, "dislike");
    expect(getStoredReaction(15)).toBe("dislike");
    removeStoredReaction(15);
    expect(getStoredReaction(15)).toBeNull();
  });

  it("ينظف Cookies النموذج القديم دون تغيير الحالة الجديدة", () => {
    document.cookie = "madarek_article_reaction_16_like=1; Path=/";
    document.cookie = "madarek_article_reaction_16_dislike=1; Path=/";
    migrateLegacyReactionCookies(16);
    expect(getStoredReaction(16)).toBeNull();
    expect(document.cookie).not.toContain("madarek_article_reaction_16_like");
    expect(document.cookie).not.toContain("madarek_article_reaction_16_dislike");
  });
});

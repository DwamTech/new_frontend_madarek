import type { ReactionType } from "./reactions.model";

export const REACTION_COOKIE_DAYS = 30;
export const REACTION_COOKIE_EVENT = "madarek-reaction-cookie-change";

export function reactionCookieName(articleId: number): string {
  return `madarek_article_reaction_${articleId}`;
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const prefix = `${name}=`;
  const entry = document.cookie.split("; ").find((cookie) => cookie.startsWith(prefix));
  return entry?.slice(prefix.length) ?? null;
}

function cookieOptions(): string {
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  return `; Path=/; SameSite=Lax${secure}`;
}

function clearLegacyReactionCookies(articleId: number): void {
  if (typeof document === "undefined") return;
  for (const type of ["like", "dislike"] as const) {
    document.cookie = `${reactionCookieName(articleId)}_${type}=; Max-Age=0${cookieOptions()}`;
  }
}

function notifyReactionCookieChange(): void {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(REACTION_COOKIE_EVENT));
}

export function migrateLegacyReactionCookies(articleId: number): void {
  clearLegacyReactionCookies(articleId);
}

export function getStoredReaction(articleId: number): ReactionType | null {
  const value = readCookie(reactionCookieName(articleId));
  return value === "like" || value === "dislike" ? value : null;
}

export function storeReaction(articleId: number, type: ReactionType): void {
  if (typeof document === "undefined") return;

  clearLegacyReactionCookies(articleId);
  document.cookie = `${reactionCookieName(articleId)}=${type}; Max-Age=${REACTION_COOKIE_DAYS * 24 * 60 * 60}${cookieOptions()}`;
  notifyReactionCookieChange();
}

export function removeStoredReaction(articleId: number): void {
  if (typeof document === "undefined") return;
  clearLegacyReactionCookies(articleId);
  document.cookie = `${reactionCookieName(articleId)}=; Max-Age=0${cookieOptions()}`;
  notifyReactionCookieChange();
}

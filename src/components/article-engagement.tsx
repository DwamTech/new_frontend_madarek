"use client";

import { useCallback, useEffect, useState, useSyncExternalStore, type FormEvent } from "react";
import { MessageCircle, ThumbsDown, ThumbsUp } from "lucide-react";
import type { Comment, ReactionCounts } from "@/lib/mdarek-api/types";
import { CommentSubmissionError, submitComment } from "@/lib/comments.service";
import { TurnstileWidget } from "@/components/turnstile-widget";
import { getStoredReaction, migrateLegacyReactionCookies, REACTION_COOKIE_EVENT, removeStoredReaction, storeReaction } from "@/lib/reactions-cookie";
import type { ReactionType } from "@/lib/reactions.model";
import { ReactionSubmissionError, submitReaction } from "@/lib/reactions.service";

export function ArticleEngagement({ articleId, counts, comments }: {
  articleId: number;
  counts: ReactionCounts;
  comments: Comment[];
}) {
  const [authorName, setAuthorName] = useState("");
  const [text, setText] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaResetKey, setCaptchaResetKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [reactionCounts, setReactionCounts] = useState(() => counts);
  const subscribeToReactionCookie = useCallback((notify: () => void) => {
    window.addEventListener(REACTION_COOKIE_EVENT, notify);
    return () => window.removeEventListener(REACTION_COOKIE_EVENT, notify);
  }, []);
  const readReactionCookie = useCallback(() => getStoredReaction(articleId), [articleId]);
  const storedReaction = useSyncExternalStore(
    subscribeToReactionCookie,
    readReactionCookie,
    () => null,
  );
  const [reactionSubmitting, setReactionSubmitting] = useState(false);
  const [reactionError, setReactionError] = useState("");
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

  useEffect(() => {
    migrateLegacyReactionCookies(articleId);
  }, [articleId]);

  const reactToArticle = async (type: ReactionType) => {
    if (reactionSubmitting) return;

    setReactionSubmitting(true);
    setReactionError("");
    try {
      if (storedReaction === type) {
        const updatedCounts = await submitReaction(articleId, type, "remove");
        setReactionCounts(updatedCounts);
        removeStoredReaction(articleId);
      } else if (!storedReaction) {
        const updatedCounts = await submitReaction(articleId, type, "add");
        setReactionCounts(updatedCounts);
        storeReaction(articleId, type);
      } else {
        const previousType = storedReaction;
        const countsAfterRemoval = await submitReaction(articleId, previousType, "remove");
        try {
          const updatedCounts = await submitReaction(articleId, type, "add");
          setReactionCounts(updatedCounts);
          storeReaction(articleId, type);
        } catch (switchError) {
          try {
            const restoredCounts = await submitReaction(articleId, previousType, "add");
            setReactionCounts(restoredCounts);
          } catch {
            setReactionCounts(countsAfterRemoval);
            removeStoredReaction(articleId);
          }
          throw switchError;
        }
      }
    } catch (submissionError) {
      setReactionError(submissionError instanceof ReactionSubmissionError
        ? submissionError.message
        : "تعذر تسجيل التفاعل حالياً. يرجى المحاولة مرة أخرى.");
    } finally {
      setReactionSubmitting(false);
    }
  };

  const captchaExpired = useCallback(() => {
    setCaptchaToken("");
    setError("انتهت صلاحية التحقق. يرجى إكماله مرة أخرى.");
  }, []);
  const captchaFailed = useCallback(() => {
    setCaptchaToken("");
    setError("تعذر إكمال التحقق. يرجى المحاولة مرة أخرى.");
  }, []);
  const captchaSucceeded = useCallback((token: string) => {
    setCaptchaToken(token);
    setError("");
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    const cleanName = authorName.trim();
    const cleanText = text.trim();
    if (!cleanName || cleanName.length > 120) {
      setError("يرجى إدخال اسم صالح لا يتجاوز 120 حرفاً.");
      return;
    }
    if (!cleanText || cleanText.length > 2000) {
      setError("يرجى إدخال تعليق صالح لا يتجاوز 2000 حرف.");
      return;
    }
    if (!captchaToken) {
      setError("يرجى إكمال التحقق قبل إرسال التعليق.");
      return;
    }

    setSubmitting(true);
    try {
      await submitComment(articleId, {
        author_name: cleanName,
        text: cleanText,
        captcha_token: captchaToken,
      });
      setAuthorName("");
      setText("");
      setSuccess("تم إرسال تعليقك بنجاح وسيظهر بعد مراجعته.");
    } catch (submissionError) {
      setError(submissionError instanceof CommentSubmissionError
        ? submissionError.message
        : "تعذر إرسال التعليق حالياً. يرجى المحاولة مرة أخرى.");
    } finally {
      setCaptchaToken("");
      setCaptchaResetKey((value) => value + 1);
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto mt-10 max-w-3xl space-y-10 print:hidden">
      <div className="space-y-2">
        <div className="flex items-center justify-center gap-3">
        <button type="button" onClick={() => void reactToArticle("like")} disabled={reactionSubmitting} aria-pressed={storedReaction === "like"} title={storedReaction === "like" ? "إلغاء التفاعل" : "تفاعل مفيد"} className="flex items-center gap-2 rounded-full border border-line bg-raise px-5 py-2.5 text-sm font-bold text-ink transition-colors hover:border-leather disabled:cursor-not-allowed disabled:opacity-60 aria-pressed:border-leather aria-pressed:bg-leather aria-pressed:text-[#FFF8EE]">
          <ThumbsUp className="size-4" /> مفيد <span className="text-soft aria-pressed:text-inherit">{reactionCounts.likes}</span>
        </button>
        <button type="button" onClick={() => void reactToArticle("dislike")} disabled={reactionSubmitting} aria-pressed={storedReaction === "dislike"} title={storedReaction === "dislike" ? "إلغاء التفاعل" : "تفاعل غير مفيد"} className="flex items-center gap-2 rounded-full border border-line bg-raise px-5 py-2.5 text-sm font-bold text-ink transition-colors hover:border-leather disabled:cursor-not-allowed disabled:opacity-60 aria-pressed:border-leather aria-pressed:bg-leather aria-pressed:text-[#FFF8EE]">
          <ThumbsDown className="size-4" /> غير مفيد <span className="text-soft aria-pressed:text-inherit">{reactionCounts.dislikes}</span>
        </button>
        </div>
        {reactionError && <p className="text-center text-sm text-red-700" role="alert">{reactionError}</p>}
      </div>

      <div>
        <h2 className="mb-5 flex items-center gap-2 text-xl font-bold text-ink">
          <MessageCircle className="size-5 text-leather" /> التعليقات
          <span className="text-base font-normal text-soft">({comments.length})</span>
        </h2>

        <form className="space-y-3 rounded-md border border-line bg-raise p-5" onSubmit={(event) => void submit(event)}>
          <input type="text" aria-label="الاسم" placeholder="الاسم" value={authorName} maxLength={120} required onChange={(event) => setAuthorName(event.target.value)} className="w-full rounded-md border border-line bg-paper px-4 py-2.5 text-sm text-ink placeholder:text-soft" />
          <textarea aria-label="التعليق" placeholder="اكتب تعليقك..." value={text} maxLength={2000} required onChange={(event) => setText(event.target.value)} rows={3} className="w-full resize-none rounded-md border border-line bg-paper px-4 py-2.5 text-sm text-ink placeholder:text-soft" />
          <TurnstileWidget siteKey={siteKey} resetKey={captchaResetKey} onToken={captchaSucceeded} onExpire={captchaExpired} onError={captchaFailed} />
          {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
          {success && <p className="text-sm font-semibold text-green-700" role="status">{success}</p>}
          <button type="submit" disabled={submitting || !siteKey} className="rounded-md bg-leather px-5 py-2.5 text-sm font-bold text-[#FFF8EE] transition-[filter] disabled:cursor-not-allowed disabled:opacity-60 dark:text-[#1E1207]">
            {submitting ? "جارٍ الإرسال..." : "إرسال التعليق"}
          </button>
        </form>

        {comments.length === 0 ? (
          <p className="mt-6 text-center text-sm text-soft">لا توجد تعليقات بعد — كن أول من يعلّق.</p>
        ) : (
          <ul className="mt-6 space-y-4">
            {comments.map((comment) => (
              <li key={comment.id} className="rounded-md border border-line bg-raise p-5">
                <p className="font-bold text-ink">{comment.authorName}</p>
                <p className="mt-1.5 leading-7 text-soft">{comment.text}</p>
                <time className="mt-2 block text-xs text-soft" dateTime={comment.createdAt}>
                  {new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium" }).format(new Date(comment.createdAt))}
                </time>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

"use client";

import { useActionState } from "react";
import { subscribeToNewsletter, type NewsletterState } from "@/lib/newsletter-actions";

const initialState: NewsletterState = { ok: false, message: "" };

export function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [state, formAction, pending] = useActionState(
    subscribeToNewsletter,
    initialState,
  );

  return (
    <form action={formAction}>
      <div className="flex items-center gap-2">
        <input
          type="email"
          name="email"
          required
          disabled={pending}
          dir="ltr"
          placeholder="name@example.com"
          className={`w-0 min-w-0 flex-1 rounded-md border border-line bg-raise px-3 text-left text-ink placeholder:text-soft/60 disabled:opacity-60 ${
            compact ? "py-2 text-sm" : "py-2.5 text-[15px]"
          }`}
        />
        <button
          type="submit"
          disabled={pending}
          className={`shrink-0 rounded-md bg-gold font-bold text-[#241A05] transition-[filter] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60 ${
            compact ? "px-4 py-2 text-sm" : "px-5 py-2.5 text-[15px]"
          }`}
        >
          {pending ? "جارٍ الاشتراك…" : "اشتراك"}
        </button>
      </div>
      {state.message && (
        <p
          className={`mt-2 text-xs font-semibold ${
            state.ok ? "text-leather" : "text-danger"
          }`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}

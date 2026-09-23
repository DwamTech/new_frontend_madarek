"use server";

import "server-only";
import { MDAREK_API_BASE, MDAREK_API_TIMEOUT_MS } from "@/lib/mdarek-api/env";

export type NewsletterState = { ok: boolean; message: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function subscribeToNewsletter(
  _prevState: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  const email = String(formData.get("email") ?? "").trim();

  if (!EMAIL_RE.test(email)) {
    return { ok: false, message: "بريد إلكتروني غير صحيح." };
  }

  try {
    const response = await fetch(`${MDAREK_API_BASE}/newsletter/subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email }),
      signal: AbortSignal.timeout(MDAREK_API_TIMEOUT_MS),
      cache: "no-store",
    });

    if (response.status === 201 || response.status === 200) {
      return { ok: true, message: "تم الاشتراك في النشرة البريدية بنجاح." };
    }

    if (response.status === 422) {
      return { ok: false, message: "هذا البريد مشترك بالفعل." };
    }
  } catch {
    // Network and timeout failures intentionally share the same visitor-safe message.
  }

  return { ok: false, message: "تعذر إتمام الاشتراك، حاول مرة أخرى." };
}

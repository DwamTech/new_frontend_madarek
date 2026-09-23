import "server-only";
import {
  MDAREK_API_BASE,
  MDAREK_API_REVALIDATE_S,
  MDAREK_API_TIMEOUT_MS,
} from "./env";

export class MdarekApiError extends Error {
  constructor(
    message: string,
    public readonly path: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "MdarekApiError";
  }
}

// السجل يذكر المسار والحالة فقط — لا محتوى ولا بيانات شخصية
function logApiFailure(path: string, detail: string) {
  console.warn(`[mdarek-api] فشل النداء ${path}: ${detail}`);
}

/**
 * نداء GET للـ API القديم — قراءة فقط، بمهلة وتخزين مؤقت.
 * لا يُستدعى إلا من جهة الخادم (import "server-only" أعلاه يضمن ذلك).
 */
export async function fetchJson<T>(path: string, options?: { revalidate?: number }): Promise<T> {
  const url = `${MDAREK_API_BASE}${path}`;
  let res: Response;
  try {
    res = await fetch(url, {
      signal: AbortSignal.timeout(MDAREK_API_TIMEOUT_MS),
      headers: { Accept: "application/json" },
      next: { revalidate: options?.revalidate ?? MDAREK_API_REVALIDATE_S },
    });
  } catch (e) {
    const reason =
      e instanceof Error && e.name === "TimeoutError"
        ? `تجاوز المهلة (${MDAREK_API_TIMEOUT_MS}ms)`
        : e instanceof Error
          ? e.message
          : "خطأ شبكة غير معروف";
    logApiFailure(path, reason);
    throw new MdarekApiError(reason, path);
  }

  if (!res.ok) {
    logApiFailure(path, `HTTP ${res.status}`);
    throw new MdarekApiError(`HTTP ${res.status}`, path, res.status);
  }

  try {
    return (await res.json()) as T;
  } catch {
    logApiFailure(path, "استجابة ليست JSON صالحًا");
    throw new MdarekApiError("استجابة ليست JSON صالحًا", path, res.status);
  }
}

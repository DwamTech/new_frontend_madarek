import { NextRequest, NextResponse } from "next/server";

/**
 * يبثّ ملف PDF من مصدر الوسائط الوحيد الموثوق في المشروع (back.mdarek.net
 * — نفس النطاق المصرَّح به في next.config.ts للصور)، ضروري لأن الخادم لا
 * يرسل رأس CORS على ملفات PDF فيتعذّر جلبها مباشرة من متصفح العميل
 * (pdf.js) عبر طلب عابر للأصل. القيد على النطاق هنا يمنع تحوّل هذه
 * النقطة إلى وكيل مفتوح (Open Proxy / SSRF) يجلب أي رابط يُمرَّر له.
 */
const TRUSTED_HOST = "back.mdarek.net";
// أطول من مهلة نداءات JSON العادية (10 ثوانٍ) — ملفات PDF أثقل، والخادم
// القديم عانى بطئًا حقيقيًا موثّقًا مسبقًا مع بعض المسارات
const FETCH_TIMEOUT_MS = 30_000;

export async function GET(request: NextRequest) {
  const src = request.nextUrl.searchParams.get("url");
  if (!src) {
    return NextResponse.json({ error: "missing url" }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(src);
  } catch {
    return NextResponse.json({ error: "invalid url" }, { status: 400 });
  }

  const isProductionStorage = target.protocol === "https:" && target.hostname === TRUSTED_HOST;
  const isLocalStorage = target.origin === "http://localhost:8000" && target.pathname.startsWith("/storage/");
  if (!isProductionStorage && !isLocalStorage) {
    return NextResponse.json({ error: "host not allowed" }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
  } catch {
    return NextResponse.json({ error: "upstream fetch failed" }, { status: 502 });
  }
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "upstream fetch failed" }, { status: 502 });
  }

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "application/pdf",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

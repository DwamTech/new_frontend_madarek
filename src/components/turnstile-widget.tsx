"use client";

import { useCallback, useEffect, useRef } from "react";
import Script from "next/script";

type TurnstileApi = {
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window { turnstile?: TurnstileApi }
}

export function TurnstileWidget({
  siteKey,
  resetKey,
  onToken,
  onExpire,
  onError,
}: {
  siteKey: string;
  resetKey: number;
  onToken: (token: string) => void;
  onExpire: () => void;
  onError: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  const renderWidget = useCallback(() => {
    if (!siteKey || !containerRef.current || !window.turnstile || widgetIdRef.current) return;
    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: onToken,
      "expired-callback": onExpire,
      "error-callback": onError,
      language: "ar",
      theme: "auto",
    });
  }, [onError, onExpire, onToken, siteKey]);

  useEffect(() => {
    renderWidget();
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [renderWidget]);

  useEffect(() => {
    if (widgetIdRef.current && window.turnstile) window.turnstile.reset(widgetIdRef.current);
  }, [resetKey]);

  if (!siteKey) {
    return <p className="text-sm text-red-700" role="alert">التحقق غير متاح حالياً. يرجى المحاولة لاحقاً.</p>;
  }

  return (
    <>
      <Script
        id="cloudflare-turnstile"
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={renderWidget}
        onError={onError}
      />
      <div ref={containerRef} aria-label="التحقق من أنك لست روبوتاً" />
    </>
  );
}

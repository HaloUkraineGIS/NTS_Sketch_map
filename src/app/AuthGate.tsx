import { useEffect, useState, type ReactNode } from "react";
import { ensureSignedIn } from "@/auth/oauth";
import { useAppStore } from "@/store/useAppStore";

interface AuthGateProps {
  children: ReactNode;
}

/**
 * Блокує рендер дочірнього UI, доки OAuth2-логін проти Portal не завершиться.
 * TODO(Claude Code): додати UI помилки, якщо getCredential реджектиться
 * (наприклад, редирект URI не збігається з зареєстрованим в Application item).
 */
export function AuthGate({ children }: AuthGateProps) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const setCredential = useAppStore((s) => s.setCredential);

  useEffect(() => {
    let cancelled = false;

    ensureSignedIn()
      .then((credential) => {
        if (cancelled) return;
        setCredential(credential);
        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Auth failed", err);
        setError(err?.message ?? "Помилка автентифікації");
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [setCredential]);

  if (status === "loading") {
    return (
      <calcite-loader label="Автентифікація..." scale="l" />
    );
  }

  if (status === "error") {
    return (
      <calcite-notice open kind="danger" icon="exclamation-mark-triangle">
        <div slot="title">Не вдалося увійти</div>
        <div slot="message">{error}</div>
      </calcite-notice>
    );
  }

  return <>{children}</>;
}

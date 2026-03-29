"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[App Error]", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center gap-4 px-6">
      <h2 className="text-xl font-bold">Algo salió mal</h2>
      <p className="text-sm text-hq-text-muted">
        {error.message || "Error inesperado. Intentá de nuevo."}
      </p>
      <button
        onClick={reset}
        className="rounded-xl border border-hq-purple-border bg-hq-purple-bg px-6 py-2 text-sm font-semibold text-hq-purple"
      >
        Reintentar
      </button>
    </div>
  );
}

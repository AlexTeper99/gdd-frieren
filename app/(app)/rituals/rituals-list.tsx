"use client";

import { markRitualComplete } from "@/features/rituals/actions";
import { useState } from "react";
import Link from "next/link";

type Ritual = {
  id: string;
  descripcion: string;
  horaInicio: string;
  horaFin: string;
  lugar: string;
  racha: number;
  completedToday: boolean;
};

export function RitualsList({ rituals }: { rituals: Ritual[] }) {
  const [items, setItems] = useState(rituals);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleMark(ritualId: string) {
    setLoadingId(ritualId);
    setError(null);

    try {
      const result = await markRitualComplete(ritualId);
      if (result.success) {
        setItems((prev) =>
          prev.map((r) =>
            r.id === ritualId
              ? { ...r, completedToday: true, racha: result.newStreak! }
              : r
          )
        );
      } else {
        setError(result.error ?? "Error al marcar ritual");
      }
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setLoadingId(null);
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <p className="text-sm text-hq-text-muted">
          No tenés rituales para hoy
        </p>
        <Link
          href="/profile/rituals"
          className="text-xs text-hq-purple underline opacity-60 hover:opacity-100"
        >
          Agregar rituales
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {error && (
        <div className="rounded-lg border border-hq-red-border bg-hq-red-bg p-3 text-sm text-hq-red">
          {error}
        </div>
      )}

      {items.map((r) => (
        <button
          key={r.id}
          onClick={() => !r.completedToday && loadingId !== r.id && handleMark(r.id)}
          disabled={r.completedToday || loadingId === r.id}
          className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
            r.completedToday
              ? "border-hq-green-border bg-hq-green-bg"
              : loadingId === r.id
                ? "border-hq-border opacity-50"
                : "border-hq-border bg-hq-bg-card hover:border-hq-border-hover"
          }`}
        >
          <div
            className={`flex h-5 w-5 items-center justify-center rounded-md border text-xs ${
              r.completedToday
                ? "border-hq-green bg-hq-green text-white"
                : loadingId === r.id
                  ? "border-hq-border animate-pulse"
                  : "border-hq-border-hover"
            }`}
          >
            {r.completedToday ? "✓" : loadingId === r.id ? "…" : ""}
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium">{r.descripcion}</div>
            <div className="text-[10px] text-hq-text-muted">
              {r.horaInicio}-{r.horaFin} · {r.lugar}
            </div>
          </div>
          <div className="text-xs font-semibold text-hq-amber">
            🔥 {r.racha}
          </div>
        </button>
      ))}

      <div className="mt-4 rounded-lg bg-hq-bg-card p-3 text-center text-[11px] text-hq-text-faint">
        Cada ✓ suma +5 HP (o +7 si racha ≥7)
        <br />
        No cumplido a las 23:59: -10 HP + racha = 0
      </div>
    </div>
  );
}

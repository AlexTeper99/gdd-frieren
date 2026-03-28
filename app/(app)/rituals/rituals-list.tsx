"use client";

import { markRitualComplete } from "@/lib/actions/rituals";
import { useState } from "react";

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

  async function handleMark(ritualId: string) {
    const result = await markRitualComplete(ritualId);
    if (result.success) {
      setItems((prev) =>
        prev.map((r) =>
          r.id === ritualId
            ? { ...r, completedToday: true, racha: result.newStreak! }
            : r
        )
      );
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((r) => (
        <button
          key={r.id}
          onClick={() => !r.completedToday && handleMark(r.id)}
          disabled={r.completedToday}
          className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
            r.completedToday
              ? "border-green-500/30 bg-green-500/5"
              : "border-white/10 bg-white/5 hover:border-white/20"
          }`}
        >
          <div
            className={`flex h-5 w-5 items-center justify-center rounded-md border text-xs ${
              r.completedToday
                ? "border-green-500 bg-green-500 text-white"
                : "border-white/15"
            }`}
          >
            {r.completedToday ? "\u2713" : ""}
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium">{r.descripcion}</div>
            <div className="text-[10px] opacity-35">
              {r.horaInicio}-{r.horaFin} · {r.lugar}
            </div>
          </div>
          <div className="text-xs font-semibold text-orange-400">
            {r.racha}
          </div>
        </button>
      ))}

      <div className="mt-4 rounded-lg bg-white/5 p-3 text-center text-[11px] opacity-25">
        Cada checkmark suma +5 HP (o +7 si racha mayor o igual a 7)
        <br />
        No cumplido a las 23:59: -10 HP + racha = 0
      </div>
    </div>
  );
}

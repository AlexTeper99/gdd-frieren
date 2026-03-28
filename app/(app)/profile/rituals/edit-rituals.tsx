"use client";

import { useActionState, useState } from "react";
import { createRitual, toggleRitualActive } from "@/lib/actions/profile";

const DAYS = ["lun", "mar", "mie", "jue", "vie", "sab", "dom"];

type Ritual = {
  id: string;
  descripcion: string;
  dias: string[];
  horaInicio: string;
  horaFin: string;
  lugar: string;
  activo: boolean;
};

export function EditRituals({ rituals }: { rituals: Ritual[] }) {
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  function toggleDay(d: string) {
    setSelectedDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  }

  async function handleCreate(_prev: unknown, formData: FormData) {
    selectedDays.forEach((d) => formData.append("dias", d));
    const result = await createRitual(formData);
    if (result.success) setSelectedDays([]);
    return result;
  }

  const [state, action, pending] = useActionState(handleCreate, null);

  return (
    <div className="flex flex-col gap-3">
      {/* Existing rituals */}
      {rituals.map((r) => (
        <div
          key={r.id}
          className="rounded-xl border border-white/10 bg-white/5 p-3"
        >
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">{r.descripcion}</div>
            <span
              className={`rounded-lg px-2 py-0.5 text-[10px] font-semibold ${
                r.activo
                  ? "bg-green-500/10 text-green-400"
                  : "bg-white/5 text-white/30"
              }`}
            >
              {r.activo ? "Activo" : "Inactivo"}
            </span>
          </div>
          <div className="mt-1 text-[11px] opacity-40">
            {r.dias.join(", ")} · {r.horaInicio}-{r.horaFin} · {r.lugar}
          </div>
          <button
            onClick={() => toggleRitualActive(r.id)}
            className="mt-2 rounded-lg border border-red-500/15 bg-red-500/5 px-3 py-1 text-[11px] text-red-400"
          >
            {r.activo ? "Desactivar" : "Activar"}
          </button>
        </div>
      ))}

      <hr className="border-white/5" />

      {/* Add new */}
      <div className="font-mono text-[10px] uppercase opacity-40">
        Agregar nuevo ritual
      </div>
      <form
        action={action}
        className="rounded-xl border border-purple-500/10 bg-purple-500/5 p-3"
      >
        <label className="mb-1 block font-mono text-[10px] uppercase opacity-40">
          Hábito
        </label>
        <input
          name="descripcion"
          placeholder="Meditar"
          className="mb-3 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
        />

        <label className="mb-1 block font-mono text-[10px] uppercase opacity-40">
          Días
        </label>
        <div className="mb-3 flex gap-1">
          {DAYS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => toggleDay(d)}
              className={`rounded-md border px-2 py-1 text-[10px] capitalize ${
                selectedDays.includes(d)
                  ? "border-purple-500/30 bg-purple-500/10 text-purple-300"
                  : "border-white/10 opacity-30"
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="mb-3 flex gap-2">
          <div className="flex-1">
            <label className="mb-1 block font-mono text-[10px] uppercase opacity-40">
              Hora inicio
            </label>
            <input
              name="horaInicio"
              type="time"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block font-mono text-[10px] uppercase opacity-40">
              Hora fin
            </label>
            <input
              name="horaFin"
              type="time"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <label className="mb-1 block font-mono text-[10px] uppercase opacity-40">
          Lugar
        </label>
        <input
          name="lugar"
          placeholder="Habitación"
          className="mb-3 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
        />

        {state?.error && (
          <p className="mb-2 text-xs text-red-400">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl border border-purple-500/30 bg-purple-500/15 py-2.5 font-semibold text-purple-300 disabled:opacity-30"
        >
          + Agregar ritual
        </button>
      </form>
    </div>
  );
}

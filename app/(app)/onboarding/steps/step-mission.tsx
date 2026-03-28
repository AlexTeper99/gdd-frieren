"use client";

import { useState, useActionState } from "react";
import { saveMission, saveRitual } from "@/lib/actions/onboarding";

const CATEGORIES = ["Sueño", "Alimentación", "Movimiento", "Mente", "Cuidado"];
const DAYS = ["lun", "mar", "mie", "jue", "vie", "sab", "dom"];

type Props = {
  rituals: { id: string; descripcion: string }[];
  onComplete: () => void;
};

export function StepMission({ rituals: initialRituals, onComplete }: Props) {
  const [category, setCategory] = useState("");
  const [rituals, setRituals] = useState(initialRituals);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  async function handleSaveMission() {
    const fd = new FormData();
    fd.set("misionCategoria", category);
    const result = await saveMission(fd);
    if (result.success && rituals.length > 0) onComplete();
    return result;
  }

  async function handleAddRitual(formData: FormData) {
    selectedDays.forEach((d) => formData.append("dias", d));
    const result = await saveRitual(formData);
    if (result.success) {
      setRituals((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          descripcion: formData.get("descripcion") as string,
        },
      ]);
    }
    return result;
  }

  const [ritualState, ritualAction, ritualPending] = useActionState(
    (_prev: unknown, formData: FormData) => handleAddRitual(formData),
    null
  );

  function toggleDay(day: string) {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="mb-1 text-2xl font-bold">Misión y Rituales</h1>
      <p className="mb-6 text-sm opacity-40">
        Tu foco y los hábitos que vas a sostener.
      </p>

      <label className="mb-2 block font-mono text-xs uppercase opacity-40">
        Categoría
      </label>
      <div className="mb-4 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={`rounded-full border px-3 py-1.5 text-xs transition ${
              category === c
                ? "border-purple-500/40 bg-purple-500/10 text-purple-300"
                : "border-white/10 bg-white/5"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {rituals.length > 0 && (
        <>
          <label className="mb-2 block font-mono text-xs uppercase opacity-40">
            Tus rituales ({rituals.length})
          </label>
          {rituals.map((r) => (
            <div
              key={r.id}
              className="mb-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
            >
              {r.descripcion}
            </div>
          ))}
        </>
      )}

      <hr className="my-4 border-white/5" />

      <label className="mb-2 block font-mono text-xs uppercase opacity-40">
        Agregar ritual
      </label>
      <form action={ritualAction} className="rounded-lg border border-white/10 bg-white/5 p-3">
        <label className="mb-1 block font-mono text-[10px] uppercase opacity-40">
          Hábito
        </label>
        <input
          name="descripcion"
          placeholder="Caminar 30 minutos"
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
              className={`rounded-md border px-2 py-1 text-[10px] capitalize transition ${
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
          placeholder="Barrio"
          className="mb-3 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
        />

        <button
          type="submit"
          disabled={ritualPending}
          className="w-full rounded-lg border border-white/10 py-2 text-sm opacity-60"
        >
          + Agregar ritual
        </button>
      </form>

      {ritualState?.error && (
        <p className="mt-2 text-sm text-red-400">{ritualState.error}</p>
      )}

      <button
        onClick={handleSaveMission}
        disabled={!category || rituals.length === 0}
        className="mt-4 w-full rounded-xl border border-purple-500/30 bg-purple-500/15 py-3 font-semibold text-purple-300 disabled:opacity-30"
      >
        Siguiente
      </button>
    </div>
  );
}

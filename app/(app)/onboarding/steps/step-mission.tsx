"use client";

import { useState } from "react";
import { saveMission, saveRitual } from "@/lib/actions/onboarding";

const CATEGORIES = ["Sueño", "Alimentación", "Movimiento", "Mente", "Cuidado"];
const DAYS = ["lun", "mar", "mie", "jue", "vie", "sab", "dom"];

type RitualEntry = {
  id: string;
  descripcion: string;
  dias: string[];
  horaInicio: string;
  horaFin: string;
  lugar: string;
};

type Props = {
  rituals: RitualEntry[];
  onComplete: () => void;
};

export function StepMission({ rituals: initialRituals, onComplete }: Props) {
  const [category, setCategory] = useState("");
  const [rituals, setRituals] = useState<RitualEntry[]>(initialRituals);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields as controlled state
  const [descripcion, setDescripcion] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [lugar, setLugar] = useState("");

  function toggleDay(day: string) {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  function resetForm() {
    setDescripcion("");
    setSelectedDays([]);
    setHoraInicio("");
    setHoraFin("");
    setLugar("");
    setError(null);
  }

  async function handleAddRitual() {
    if (!descripcion || !selectedDays.length || !horaInicio || !horaFin || !lugar) {
      setError("Completá todos los campos del ritual");
      return;
    }

    setSaving(true);
    setError(null);

    const fd = new FormData();
    fd.set("descripcion", descripcion);
    selectedDays.forEach((d) => fd.append("dias", d));
    fd.set("horaInicio", horaInicio);
    fd.set("horaFin", horaFin);
    fd.set("lugar", lugar);

    const result = await saveRitual(fd);

    if (result.success) {
      setRituals((prev) => [
        ...prev,
        { id: crypto.randomUUID(), descripcion, dias: selectedDays, horaInicio, horaFin, lugar },
      ]);
      resetForm();
    } else {
      setError(result.error ?? "Error al guardar");
    }

    setSaving(false);
  }

  function removeRitual(id: string) {
    setRituals((prev) => prev.filter((r) => r.id !== id));
  }

  async function handleNext() {
    if (!category || rituals.length === 0) return;
    const fd = new FormData();
    fd.set("misionCategoria", category);
    const result = await saveMission(fd);
    if (result.success) onComplete();
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

      {/* Ritual list */}
      {rituals.length > 0 && (
        <>
          <label className="mb-2 block font-mono text-xs uppercase opacity-40">
            Tus rituales ({rituals.length})
          </label>
          {rituals.map((r) => (
            <div
              key={r.id}
              className="mb-2 flex items-start gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2"
            >
              <div className="flex-1">
                <div className="text-sm font-medium">{r.descripcion}</div>
                <div className="text-[10px] opacity-35">
                  {r.dias.join(", ")} · {r.horaInicio}-{r.horaFin} · {r.lugar}
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeRitual(r.id)}
                className="mt-0.5 text-xs text-red-400/50 hover:text-red-400"
              >
                ✕
              </button>
            </div>
          ))}
        </>
      )}

      <hr className="my-4 border-white/5" />

      {/* Add ritual form — controlled inputs */}
      <label className="mb-2 block font-mono text-xs uppercase opacity-40">
        Agregar ritual
      </label>
      <div className="rounded-lg border border-white/10 bg-white/5 p-3">
        <label className="mb-1 block font-mono text-[10px] uppercase opacity-40">
          Hábito
        </label>
        <input
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
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
              value={horaInicio}
              onChange={(e) => setHoraInicio(e.target.value)}
              type="time"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block font-mono text-[10px] uppercase opacity-40">
              Hora fin
            </label>
            <input
              value={horaFin}
              onChange={(e) => setHoraFin(e.target.value)}
              type="time"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <label className="mb-1 block font-mono text-[10px] uppercase opacity-40">
          Lugar
        </label>
        <input
          value={lugar}
          onChange={(e) => setLugar(e.target.value)}
          placeholder="Barrio"
          className="mb-3 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
        />

        {error && (
          <p className="mb-2 text-xs text-red-400">{error}</p>
        )}

        <button
          type="button"
          onClick={handleAddRitual}
          disabled={saving}
          className="w-full rounded-lg border border-white/10 py-2 text-sm opacity-60 hover:opacity-80 disabled:opacity-30"
        >
          {saving ? "Guardando..." : "+ Agregar ritual"}
        </button>
      </div>

      <button
        type="button"
        onClick={handleNext}
        disabled={!category || rituals.length === 0}
        className="mt-4 w-full rounded-xl border border-purple-500/30 bg-purple-500/15 py-3 font-semibold text-purple-300 disabled:opacity-30"
      >
        Siguiente
      </button>
    </div>
  );
}

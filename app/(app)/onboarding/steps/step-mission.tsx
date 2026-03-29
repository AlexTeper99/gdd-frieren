"use client";

import { useState } from "react";
import { saveMissionAndRituals } from "@/features/onboarding/actions";

const CATEGORIES = ["Sueño", "Alimentación", "Movimiento", "Mente", "Cuidado"];
const DAYS = ["lun", "mar", "mie", "jue", "vie", "sab", "dom"];

const SUGGESTED_RITUALS: Record<string, { descripcion: string; dias: string[]; horaInicio: string; horaFin: string; lugar: string }[]> = {
  "Sueño": [
    { descripcion: "Dormir antes de las 23", dias: ["lun","mar","mie","jue","vie","sab","dom"], horaInicio: "22:30", horaFin: "23:00", lugar: "Habitación" },
    { descripcion: "No pantallas 1h antes de dormir", dias: ["lun","mar","mie","jue","vie","sab","dom"], horaInicio: "22:00", horaFin: "22:30", lugar: "Casa" },
  ],
  "Alimentación": [
    { descripcion: "Cocinar el desayuno", dias: ["lun","mar","mie","jue","vie"], horaInicio: "07:00", horaFin: "09:00", lugar: "Cocina" },
    { descripcion: "Preparar almuerzo casero", dias: ["lun","mar","mie","jue","vie"], horaInicio: "12:00", horaFin: "13:00", lugar: "Cocina" },
  ],
  "Movimiento": [
    { descripcion: "Caminar 30 minutos", dias: ["lun","mar","mie","jue","vie"], horaInicio: "07:00", horaFin: "08:00", lugar: "Barrio" },
    { descripcion: "Ejercicio o deporte", dias: ["lun","mie","vie"], horaInicio: "18:00", horaFin: "19:00", lugar: "Gimnasio" },
  ],
  "Mente": [
    { descripcion: "Meditar 10 minutos", dias: ["lun","mar","mie","jue","vie","sab","dom"], horaInicio: "07:00", horaFin: "07:30", lugar: "Habitación" },
    { descripcion: "Leer 20 minutos", dias: ["lun","mar","mie","jue","vie","sab","dom"], horaInicio: "22:00", horaFin: "22:30", lugar: "Casa" },
  ],
  "Cuidado": [
    { descripcion: "Tomar 2 litros de agua", dias: ["lun","mar","mie","jue","vie","sab","dom"], horaInicio: "08:00", horaFin: "22:00", lugar: "Donde sea" },
    { descripcion: "Skincare noche", dias: ["lun","mar","mie","jue","vie","sab","dom"], horaInicio: "22:00", horaFin: "22:30", lugar: "Baño" },
  ],
};

type RitualDraft = {
  id: string;
  descripcion: string;
  dias: string[];
  horaInicio: string;
  horaFin: string;
  lugar: string;
};

type Props = {
  rituals: RitualDraft[];
  onComplete: () => void;
  onBack: () => void;
};

export function StepMission({ rituals: initialRituals, onComplete, onBack }: Props) {
  const [category, setCategory] = useState("");
  const [rituals, setRituals] = useState<RitualDraft[]>(initialRituals);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields — 100% local
  const [descripcion, setDescripcion] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [lugar, setLugar] = useState("");

  function handleCategorySelect(cat: string) {
    setCategory(cat);
    const suggestions = SUGGESTED_RITUALS[cat] ?? [];
    const existingDescriptions = new Set(rituals.map(r => r.descripcion));
    const newSuggestions = suggestions
      .filter(s => !existingDescriptions.has(s.descripcion))
      .map(s => ({ ...s, id: crypto.randomUUID() }));
    if (newSuggestions.length > 0) {
      setRituals(prev => [...prev, ...newSuggestions]);
    }
  }

  function toggleDay(day: string) {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  // Add to local list only — no DB call
  function handleAddRitual() {
    if (!descripcion || !selectedDays.length || !horaInicio || !horaFin || !lugar) {
      setError("Completá todos los campos del ritual");
      return;
    }
    setError(null);
    setRituals((prev) => [
      ...prev,
      { id: crypto.randomUUID(), descripcion, dias: [...selectedDays], horaInicio, horaFin, lugar },
    ]);
    // Reset form for next ritual
    setDescripcion("");
    setSelectedDays([]);
    setHoraInicio("");
    setHoraFin("");
    setLugar("");
  }

  function removeRitual(id: string) {
    setRituals((prev) => prev.filter((r) => r.id !== id));
  }

  // Save everything to DB only on "Siguiente"
  async function handleNext() {
    if (!category || rituals.length === 0) return;
    setSubmitting(true);
    setError(null);

    const result = await saveMissionAndRituals(
      category,
      rituals.map(({ descripcion, dias, horaInicio, horaFin, lugar }) => ({
        descripcion,
        dias,
        horaInicio,
        horaFin,
        lugar,
      }))
    );

    if (result.success) {
      onComplete();
    } else {
      setError(result.error ?? "Error al guardar");
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="mb-1 text-2xl font-bold">Misión y Rituales</h1>
      <p className="mb-6 text-sm opacity-40">
        Tu foco y los hábitos que vas a sostener.
      </p>

      <button
        type="button"
        onClick={onBack}
        className="mb-4 text-xs text-hq-text-faint hover:text-hq-text-muted"
      >
        ← Volver al personaje
      </button>

      <label className="mb-2 block font-mono text-xs uppercase opacity-40">
        Categoría
      </label>
      <div className="mb-4 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => handleCategorySelect(c)}
            className={`rounded-full border px-3 py-1.5 text-xs transition ${
              category === c
                ? "border-hq-purple-border bg-hq-purple-bg text-hq-purple"
                : "border-hq-border bg-hq-bg-card"
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
              className="mb-2 flex items-start gap-2 rounded-lg border border-hq-green-border bg-hq-green-bg px-3 py-2"
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
                className="mt-0.5 text-xs text-hq-red/50 hover:text-hq-red"
              >
                ✕
              </button>
            </div>
          ))}
        </>
      )}

      <hr className="my-4 border-hq-border" />

      {/* Add ritual form — 100% local, no server calls */}
      <label className="mb-2 block font-mono text-xs uppercase opacity-40">
        Nuevo ritual
      </label>
      <div className="rounded-lg border border-hq-border bg-hq-bg-card p-3">
        <label className="mb-1 block font-mono text-[10px] uppercase opacity-40">
          Hábito
        </label>
        <input
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Caminar 30 minutos"
          className="mb-3 w-full rounded-lg border border-hq-border bg-hq-bg-card px-3 py-2 text-sm"
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
                  ? "border-hq-purple-border bg-hq-purple-bg text-hq-purple"
                  : "border-hq-border opacity-30"
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
              className="w-full rounded-lg border border-hq-border bg-hq-bg-card px-3 py-2 text-sm"
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
              className="w-full rounded-lg border border-hq-border bg-hq-bg-card px-3 py-2 text-sm"
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
          className="mb-3 w-full rounded-lg border border-hq-border bg-hq-bg-card px-3 py-2 text-sm"
        />

        {error && (
          <p className="mb-2 text-xs text-hq-red">{error}</p>
        )}

        <button
          type="button"
          onClick={handleAddRitual}
          className="w-full rounded-lg border border-hq-border py-2 text-sm opacity-60 hover:opacity-80"
        >
          + Agregar a la lista
        </button>
      </div>

      <button
        type="button"
        onClick={handleNext}
        disabled={!category || rituals.length === 0 || submitting}
        className="mt-4 w-full rounded-xl border border-hq-purple-border bg-hq-purple-bg py-3 font-semibold text-hq-purple disabled:opacity-30"
      >
        {submitting ? "Guardando..." : "Siguiente"}
      </button>
    </div>
  );
}

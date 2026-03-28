"use client";

import { useActionState, useState, useRef } from "react";
import {
  createRitual,
  toggleRitualActive,
  updateRitual,
} from "@/features/profile/actions";

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function toggleDay(d: string) {
    setSelectedDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  }

  function startEditing(r: Ritual) {
    setEditingId(r.id);
    setSelectedDays([...r.dias]);

    // Populate form fields after React re-renders
    setTimeout(() => {
      if (!formRef.current) return;
      const form = formRef.current;
      (form.elements.namedItem("descripcion") as HTMLInputElement).value =
        r.descripcion;
      (form.elements.namedItem("horaInicio") as HTMLInputElement).value =
        r.horaInicio;
      (form.elements.namedItem("horaFin") as HTMLInputElement).value =
        r.horaFin;
      (form.elements.namedItem("lugar") as HTMLInputElement).value = r.lugar;
    }, 0);
  }

  function cancelEditing() {
    setEditingId(null);
    setSelectedDays([]);
    if (formRef.current) formRef.current.reset();
  }

  async function handleSubmit(_prev: unknown, formData: FormData) {
    selectedDays.forEach((d) => formData.append("dias", d));

    if (editingId) {
      const result = await updateRitual(editingId, formData);
      if (result.success) {
        setEditingId(null);
        setSelectedDays([]);
        if (formRef.current) formRef.current.reset();
      }
      return result;
    }

    const result = await createRitual(formData);
    if (result.success) {
      setSelectedDays([]);
      if (formRef.current) formRef.current.reset();
    }
    return result;
  }

  const [state, action, pending] = useActionState(handleSubmit, null);

  return (
    <div className="flex flex-col gap-3">
      {/* Existing rituals */}
      {rituals.map((r) => (
        <div
          key={r.id}
          className="rounded-xl border border-hq-border bg-hq-bg-card p-3"
        >
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">{r.descripcion}</div>
            <span
              className={`rounded-lg px-2 py-0.5 text-[10px] font-semibold ${
                r.activo
                  ? "bg-hq-green-bg text-hq-green"
                  : "bg-hq-bg-card text-white/30"
              }`}
            >
              {r.activo ? "Activo" : "Inactivo"}
            </span>
          </div>
          <div className="mt-1 text-[11px] opacity-40">
            {r.dias.join(", ")} · {r.horaInicio}-{r.horaFin} · {r.lugar}
          </div>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => startEditing(r)}
              className="rounded-lg border border-hq-purple-border bg-hq-purple-bg px-3 py-1 text-[11px] text-hq-purple"
            >
              Editar
            </button>
            <button
              onClick={() => toggleRitualActive(r.id)}
              className="rounded-lg border border-hq-red-border bg-hq-red-bg px-3 py-1 text-[11px] text-hq-red"
            >
              {r.activo ? "Desactivar" : "Activar"}
            </button>
          </div>
        </div>
      ))}

      <hr className="border-hq-border" />

      {/* Add new / Edit */}
      <div className="font-mono text-[10px] uppercase opacity-40">
        {editingId ? "Editar ritual" : "Agregar nuevo ritual"}
      </div>
      <form
        ref={formRef}
        action={action}
        className="rounded-xl border border-hq-purple-border bg-hq-purple-bg p-3"
      >
        <label className="mb-1 block font-mono text-[10px] uppercase opacity-40">
          Hábito
        </label>
        <input
          name="descripcion"
          placeholder="Meditar"
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
              className={`rounded-md border px-2 py-1 text-[10px] capitalize ${
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
              name="horaInicio"
              type="time"
              className="w-full rounded-lg border border-hq-border bg-hq-bg-card px-3 py-2 text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block font-mono text-[10px] uppercase opacity-40">
              Hora fin
            </label>
            <input
              name="horaFin"
              type="time"
              className="w-full rounded-lg border border-hq-border bg-hq-bg-card px-3 py-2 text-sm"
            />
          </div>
        </div>

        <label className="mb-1 block font-mono text-[10px] uppercase opacity-40">
          Lugar
        </label>
        <input
          name="lugar"
          placeholder="Habitación"
          className="mb-3 w-full rounded-lg border border-hq-border bg-hq-bg-card px-3 py-2 text-sm"
        />

        {state?.error && (
          <p className="mb-2 text-xs text-hq-red">{state.error}</p>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={pending}
            className="flex-1 rounded-xl border border-hq-purple-border bg-hq-purple-bg py-2.5 font-semibold text-hq-purple disabled:opacity-30"
          >
            {editingId ? "Guardar cambios" : "+ Agregar ritual"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEditing}
              className="rounded-xl border border-hq-border bg-hq-bg-card px-4 py-2.5 text-sm opacity-60"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

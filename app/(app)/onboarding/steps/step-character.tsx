"use client";

import { useState, useActionState } from "react";
import { saveCharacter } from "@/features/onboarding/actions";

const ARCHETYPES = [
  { value: "paladin", label: "Paladín", icon: "⚔️", sub: "Himmel" },
  { value: "mago", label: "Mago", icon: "✨", sub: "Frieren" },
  { value: "guerrero", label: "Guerrero", icon: "🛡️", sub: "Eisen" },
  { value: "sacerdote", label: "Sacerdote", icon: "☮️", sub: "Heiter" },
] as const;

type Props = {
  current: {
    nombrePersonaje: string | null;
    arquetipo: string | null;
    identidadTexto: string | null;
  };
  onComplete: () => void;
};

export function StepCharacter({ current, onComplete }: Props) {
  const [selectedArchetype, setSelectedArchetype] = useState(
    current.arquetipo ?? ""
  );

  async function handleSubmit(formData: FormData) {
    formData.set("arquetipo", selectedArchetype);
    const result = await saveCharacter(formData);
    if (result.success) onComplete();
    return result;
  }

  const [state, action, pending] = useActionState(
    (_prev: unknown, formData: FormData) => handleSubmit(formData),
    null
  );

  return (
    <form action={action} className="w-full max-w-sm">
      <h1 className="mb-1 text-2xl font-bold">Tu Personaje</h1>
      <p className="mb-6 text-sm opacity-40">
        Elegí arquetipo, nombre e identidad.
      </p>

      <label className="mb-2 block font-mono text-xs uppercase opacity-40">
        Arquetipo
      </label>
      <div className="mb-4 grid grid-cols-2 gap-2">
        {ARCHETYPES.map((a) => (
          <button
            key={a.value}
            type="button"
            onClick={() => setSelectedArchetype(a.value)}
            className={`rounded-xl border p-3 text-center transition ${
              selectedArchetype === a.value
                ? "border-hq-purple-border bg-hq-purple-bg"
                : "border-hq-border bg-hq-bg-card"
            }`}
          >
            <div className="text-2xl">{a.icon}</div>
            <div className="text-sm font-semibold">{a.label}</div>
            <div className="text-xs opacity-35">{a.sub}</div>
          </button>
        ))}
      </div>

      <label className="mb-2 block font-mono text-xs uppercase opacity-40">
        Nombre del personaje
      </label>
      <input
        name="nombrePersonaje"
        defaultValue={current.nombrePersonaje ?? ""}
        placeholder="Kael"
        className="mb-4 w-full rounded-lg border border-hq-border bg-hq-bg-card px-3 py-2.5 text-sm"
      />

      <label className="mb-2 block font-mono text-xs uppercase opacity-40">
        ¿Quién querés ser a fin de año?
      </label>
      <textarea
        name="identidadTexto"
        defaultValue={current.identidadTexto ?? ""}
        placeholder="Alguien que cuida lo que come y cómo se mueve"
        rows={3}
        className="mb-6 w-full rounded-lg border border-hq-border bg-hq-bg-card px-3 py-2.5 text-sm"
      />

      {state?.error && (
        <p className="mb-4 text-sm text-hq-red">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending || !selectedArchetype}
        className="w-full rounded-xl border border-hq-purple-border bg-hq-purple-bg py-3 font-semibold text-hq-purple disabled:opacity-30"
      >
        {pending ? "Guardando..." : "Siguiente"}
      </button>
    </form>
  );
}

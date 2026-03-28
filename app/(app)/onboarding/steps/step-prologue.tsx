"use client";

import { useState } from "react";
import { completeOnboarding } from "@/lib/actions/onboarding";
import { useRouter } from "next/navigation";

type Props = {
  userId: string;
};

export function StepPrologue({ userId }: Props) {
  const [prologueText, setPrologueText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [completing, setCompleting] = useState(false);
  const router = useRouter();

  async function generatePrologue() {
    setLoading(true);
    const res = await fetch("/api/story/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trigger: "prologo" }),
    });
    const data = await res.json();
    setPrologueText(data.text);
    setLoading(false);
  }

  async function handleEnter() {
    setCompleting(true);
    await completeOnboarding();
    router.push("/");
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="mb-1 text-2xl font-bold">Tu Historia Comienza</h1>
      <p className="mb-6 text-sm opacity-40">Generado por IA · Estilo Frieren</p>

      {!prologueText && !loading && (
        <button
          onClick={generatePrologue}
          className="w-full rounded-xl border border-purple-500/30 bg-purple-500/15 py-3 font-semibold text-purple-300"
        >
          Generar prólogo
        </button>
      )}

      {loading && (
        <p className="py-12 text-center text-sm opacity-40">
          Escribiendo tu historia...
        </p>
      )}

      {prologueText && (
        <>
          {prologueText.split("\n\n").map((paragraph, i) => (
            <div
              key={i}
              className="mb-3 rounded-r-lg border-l-2 border-purple-500/15 bg-purple-500/5 p-3 font-serif text-sm italic leading-relaxed opacity-75"
            >
              {paragraph}
            </div>
          ))}

          <button
            onClick={handleEnter}
            disabled={completing}
            className="mt-4 w-full rounded-xl border border-purple-500/30 bg-purple-500/15 py-3 font-semibold text-purple-300 disabled:opacity-30"
          >
            {completing ? "Entrando..." : "Entrar a Valdris"}
          </button>
        </>
      )}
    </div>
  );
}

"use client";

import { useActionState } from "react";
import { submitPactAnswers } from "@/features/pact/actions";

type Props = {
  myAnswers: Record<string, string> | null;
  otherAnswers: Record<string, string> | null;
  iSigned: boolean;
  otherSigned: boolean;
  myName: string;
  otherName: string;
};

const QUESTIONS = [
  { key: "obstaculos", label: "¿Qué puede hacer difícil cumplir los rituales?" },
  { key: "plan", label: "¿Cómo vas a manejar esos obstáculos?" },
  { key: "apoyo", label: "¿Cómo se van a sostener el uno al otro?" },
  { key: "opcional", label: "¿Algo extra esta semana?" },
];

export function PactView({
  myAnswers,
  otherAnswers,
  iSigned,
  otherSigned,
  myName,
  otherName,
}: Props) {
  const isSealed = iSigned && otherSigned;

  const [, action, pending] = useActionState(
    (_prev: unknown, formData: FormData) => submitPactAnswers(formData),
    null
  );

  if (isSealed) {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 text-center">
          <div className="text-4xl">🏰</div>
          <div className="mt-2 font-semibold text-amber-400">Pacto Sellado</div>
          <div className="mt-1 text-xs opacity-35">
            {myName} ✓ · {otherName} ✓
          </div>
        </div>

        <div className="rounded-lg bg-white/5 p-3">
          <div className="mb-1 text-xs opacity-35">{myName}</div>
          <div className="text-xs opacity-50 leading-relaxed">
            {Object.values(myAnswers ?? {}).join(". ")}
          </div>
        </div>

        {otherAnswers && (
          <div className="rounded-lg bg-white/5 p-3">
            <div className="mb-1 text-xs opacity-35">{otherName}</div>
            <div className="text-xs opacity-50 leading-relaxed">
              {Object.values(otherAnswers).join(". ")}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (iSigned) {
    return (
      <div className="text-center py-12">
        <p className="text-sm opacity-40">Tu firma fue registrada ✓</p>
        <p className="mt-2 text-xs opacity-25">
          Esperando a {otherName}...
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      {QUESTIONS.map((q, i) => (
        <div key={q.key}>
          <div className="font-mono text-[10px] opacity-25">{i + 1}/4</div>
          <label className="mb-1 block text-xs font-semibold">{q.label}</label>
          <textarea
            name={q.key}
            rows={2}
            className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm"
          />
        </div>
      ))}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl border border-purple-500/30 bg-purple-500/15 py-3 font-semibold text-purple-300 disabled:opacity-30"
      >
        {pending ? "Firmando..." : "Firmar Pacto"}
      </button>

      {otherSigned && (
        <p className="text-center text-xs opacity-25">{otherName} ya firmó ✓</p>
      )}
    </form>
  );
}

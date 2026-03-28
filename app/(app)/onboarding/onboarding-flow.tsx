"use client";

import { useState } from "react";
import { StepCharacter } from "./steps/step-character";
import { StepMission } from "./steps/step-mission";
import { StepPrologue } from "./steps/step-prologue";

type Props = {
  userId: string;
  currentCharacter: {
    nombrePersonaje: string | null;
    arquetipo: string | null;
    identidadTexto: string | null;
    misionCategoria: string | null;
  };
  rituals: {
    id: string;
    descripcion: string;
    dias: string[];
    horaInicio: string;
    horaFin: string;
    lugar: string;
  }[];
};

export function OnboardingFlow({ userId, currentCharacter, rituals }: Props) {
  const [step, setStep] = useState(
    currentCharacter.arquetipo
      ? currentCharacter.misionCategoria
        ? 3
        : 2
      : 1
  );

  return (
    <div className="flex min-h-screen flex-col items-center px-6 py-12">
      <p className="mb-2 font-mono text-xs uppercase tracking-widest opacity-30">
        Paso {step} de 3
      </p>

      {step === 1 && (
        <StepCharacter
          current={currentCharacter}
          onComplete={() => setStep(2)}
        />
      )}
      {step === 2 && (
        <StepMission
          rituals={rituals}
          onComplete={() => setStep(3)}
        />
      )}
      {step === 3 && <StepPrologue userId={userId} />}
    </div>
  );
}

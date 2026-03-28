"use client";

import Link from "next/link";

const ARCHETYPE_ICONS: Record<string, string> = {
  paladin: "⚔️",
  mago: "✨",
  guerrero: "🛡️",
  sacerdote: "☮️",
};

type Player = {
  id: string;
  nombre: string;
  arquetipo: string;
  hp: number;
};

type Props = {
  me: Player;
  other: Player | null;
  ritualsCompleted: number;
  ritualsTotal: number;
  isSunday: boolean;
};

export function HomeScreen({
  me,
  other,
  ritualsCompleted,
  ritualsTotal,
  isSunday,
}: Props) {
  const today = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col gap-3 px-6 py-8">
      <h1 className="text-2xl font-bold">Valdris</h1>
      <p className="mb-2 text-xs capitalize opacity-25">{today}</p>

      {/* Both characters */}
      <div className="flex gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-purple-500/15 bg-purple-500/5 p-3">
          <span className="text-lg">{ARCHETYPE_ICONS[me.arquetipo]}</span>
          <div className="flex-1">
            <div className="text-sm font-semibold">{me.nombre}</div>
            <div className="text-[10px] capitalize opacity-35">{me.arquetipo}</div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-green-500">{me.hp}</div>
            <div className="text-[9px] opacity-30">HP</div>
          </div>
        </div>
        {other && (
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3">
            <span className="text-lg">{ARCHETYPE_ICONS[other.arquetipo]}</span>
            <div className="flex-1">
              <div className="text-sm font-semibold">{other.nombre}</div>
              <div className="text-[10px] capitalize opacity-35">{other.arquetipo}</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-amber-400">{other.hp}</div>
              <div className="text-[9px] opacity-30">HP</div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <Link href="/rituals" className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10">
        <span className="text-2xl">🔥</span>
        <div>
          <div className="font-semibold">Rituales</div>
          <div className="text-xs opacity-35">{ritualsCompleted} de {ritualsTotal} completados hoy</div>
        </div>
      </Link>

      <Link href="/story" className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10">
        <span className="text-2xl">📖</span>
        <div>
          <div className="font-semibold">Historia</div>
          <div className="text-xs opacity-35">Leer / escribir la novela</div>
        </div>
      </Link>

      <Link
        href="/pact"
        className={`flex items-center gap-3 rounded-xl border p-4 transition hover:bg-white/10 ${
          isSunday
            ? "border-amber-500/30 bg-amber-500/5"
            : "border-white/10 bg-white/5"
        }`}
      >
        <span className="text-2xl">📜</span>
        <div className="flex-1">
          <div className="font-semibold">Pacto</div>
          <div className="text-xs opacity-35">Compromiso semanal</div>
        </div>
        {isSunday && (
          <span className="rounded-lg bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
            DOM
          </span>
        )}
      </Link>

      <Link href="/profile" className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10">
        <span className="text-2xl">{ARCHETYPE_ICONS[me.arquetipo]}</span>
        <div>
          <div className="font-semibold">{me.nombre}</div>
          <div className="text-xs opacity-35">{me.arquetipo} · HP {me.hp} · Tu personaje</div>
        </div>
      </Link>

      {other && (
        <Link href={`/profile/${other.id}`} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10">
          <span className="text-2xl">{ARCHETYPE_ICONS[other.arquetipo]}</span>
          <div>
            <div className="font-semibold">{other.nombre}</div>
            <div className="text-xs opacity-35">{other.arquetipo} · HP {other.hp}</div>
          </div>
        </Link>
      )}

      <form action="/api/auth/signout" method="POST" className="mt-4">
        <button
          type="submit"
          className="w-full rounded-xl border border-white/10 py-2 text-xs opacity-25 hover:opacity-50"
        >
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}

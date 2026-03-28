"use client";

import Link from "next/link";

const ARCHETYPE_ICONS: Record<string, string> = {
  paladin: "⚔️",
  mago: "✨",
  guerrero: "🛡️",
  sacerdote: "☮️",
};

type Profile = {
  user: {
    id: string;
    nombrePersonaje: string | null;
    arquetipo: string | null;
    identidadTexto: string | null;
    hp: number;
  };
  rituals: {
    id: string;
    descripcion: string;
    horaInicio: string;
    horaFin: string;
    racha: number;
    activo: boolean;
  }[];
  heatmap: Record<string, { completed: number; total: number }>;
};

export function ProfileView({
  profile,
  isMe,
}: {
  profile: Profile;
  isMe: boolean;
}) {
  const { user, rituals, heatmap } = profile;

  // Build 28-day heatmap grid
  const days: { date: string; ratio: number }[] = [];
  for (let i = 27; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const data = heatmap[dateStr];
    days.push({
      date: dateStr,
      ratio: data ? data.completed / Math.max(data.total, 1) : 0,
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-purple-500/25 bg-purple-500/10 text-xl">
          {ARCHETYPE_ICONS[user.arquetipo ?? "mago"]}
        </div>
        <div>
          <div className="text-lg font-bold">{user.nombrePersonaje}</div>
          <div className="text-xs capitalize opacity-35">{user.arquetipo}</div>
        </div>
      </div>

      {user.identidadTexto && (
        <p className="text-xs italic opacity-35">&quot;{user.identidadTexto}&quot;</p>
      )}

      {/* HP */}
      <div>
        <div className="mb-1 font-mono text-[10px] uppercase opacity-40">
          Puntos de Vida
        </div>
        <div className="h-3 overflow-hidden rounded-lg bg-white/5">
          <div
            className="h-full rounded-lg bg-green-500"
            style={{ width: `${user.hp}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-xs opacity-40">
          <span>
            {user.hp} / 100 HP
          </span>
        </div>
      </div>

      {/* Streaks */}
      <div>
        <div className="mb-2 font-mono text-[10px] uppercase opacity-40">
          Rachas por ritual
        </div>
        {rituals
          .filter((r) => r.activo)
          .map((r) => (
            <div
              key={r.id}
              className="mb-1 flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2"
            >
              <span className="text-[10px] opacity-40">🔥</span>
              <div className="flex-1">
                <div className="text-xs font-medium">{r.descripcion}</div>
                <div className="text-[10px] opacity-35">
                  {r.horaInicio}-{r.horaFin}
                </div>
              </div>
              <span className="text-xs font-semibold text-orange-400">
                {r.racha}d
              </span>
            </div>
          ))}
      </div>

      <hr className="border-white/5" />

      {/* Heatmap */}
      <div>
        <div className="mb-1 font-mono text-[10px] uppercase opacity-40">
          Historial (4 semanas)
        </div>
        <div className="mb-1 grid grid-cols-7 gap-[3px]">
          {["L", "M", "X", "J", "V", "S", "D"].map((d) => (
            <div key={d} className="text-center text-[8px] opacity-25">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-[3px]">
          {days.map((d) => (
            <div
              key={d.date}
              className="aspect-square rounded-sm"
              style={{
                backgroundColor:
                  d.ratio === 0
                    ? "rgba(255,255,255,0.03)"
                    : `rgba(76,175,80,${Math.max(0.15, d.ratio)})`,
              }}
              title={`${d.date}: ${Math.round(d.ratio * 100)}%`}
            />
          ))}
        </div>
        <div className="mt-2 flex items-center gap-2 text-[10px] text-hq-text-faint">
          <span>Menos</span>
          <div className="h-3 w-3 rounded-sm" style={{ background: "rgba(255,255,255,0.03)" }} />
          <div className="h-3 w-3 rounded-sm" style={{ background: "rgba(76,175,80,0.2)" }} />
          <div className="h-3 w-3 rounded-sm" style={{ background: "rgba(76,175,80,0.5)" }} />
          <div className="h-3 w-3 rounded-sm" style={{ background: "rgba(76,175,80,0.8)" }} />
          <div className="h-3 w-3 rounded-sm bg-hq-green" />
          <span>Más</span>
        </div>
      </div>

      {isMe && (
        <>
          <hr className="border-white/5" />
          <Link
            href="/profile/rituals"
            className="w-full rounded-xl border border-white/10 py-2.5 text-center text-sm opacity-40"
          >
            Editar rituales
          </Link>
        </>
      )}

      {!isMe && (
        <p className="text-center text-[10px] opacity-15">
          Solo lectura — no podés editar rituales del otro jugador
        </p>
      )}
    </div>
  );
}

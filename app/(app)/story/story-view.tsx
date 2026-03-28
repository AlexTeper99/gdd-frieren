"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Entry = {
  id: string;
  turnoNumero: number;
  textoJugador: string | null;
  textoIa: string | null;
  autorNombre: string;
};

type Props = {
  isMyTurn: boolean;
  lastEntry: Entry | null;
  entries: Entry[];
};

export function StoryView({ isMyTurn, lastEntry, entries }: Props) {
  const [text, setText] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit() {
    if (!text.trim()) return;
    setGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/story/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trigger: "diario", textoJugador: text }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Error al generar la historia");
        setGenerating(false);
        return;
      }

      const data = await res.json();
      setResult(data.text);
      setGenerating(false);
      router.refresh();
    } catch {
      setError("Error de conexión. Verificá tu internet e intentá de nuevo.");
      setGenerating(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Empty state — first time */}
      {!lastEntry && entries.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <p className="text-lg font-semibold">Tu aventura comienza</p>
          <p className="text-sm text-hq-text-muted">
            Escribí la primera entrada de la historia de Valdris.
          </p>
        </div>
      )}

      {isMyTurn ? (
        <span className="inline-block w-fit rounded-full border border-green-500/25 bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400">
          Tu turno de escribir
        </span>
      ) : (
        <span className="inline-block w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/35">
          Turno del otro jugador
        </span>
      )}

      {/* Previous entry */}
      {lastEntry && (lastEntry.textoJugador || lastEntry.textoIa) && (
        <>
          <p className="font-mono text-[10px] uppercase opacity-20">
            Turno {lastEntry.turnoNumero} · {lastEntry.autorNombre}
          </p>
          {lastEntry.textoJugador && (
            <div className="rounded-r-lg border-l-2 border-blue-500/20 bg-blue-500/5 p-3 text-sm leading-relaxed opacity-70">
              {lastEntry.textoJugador}
            </div>
          )}
          {lastEntry.textoIa && lastEntry.textoIa.split("\n\n").map((p, i) => (
            <div
              key={i}
              className="rounded-r-lg border-l-2 border-purple-500/15 bg-purple-500/5 p-3 font-serif text-sm italic leading-relaxed opacity-75"
            >
              {p}
            </div>
          ))}
        </>
      )}

      {/* Write area */}
      {isMyTurn && !result && (
        <>
          <hr className="border-white/5" />
          <label className="font-mono text-[10px] uppercase opacity-40">
            Tu parte de la historia
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            placeholder="Kael se acercó al río antes de que Lyra despertara..."
            className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm"
          />
          <button
            onClick={handleSubmit}
            disabled={generating || !text.trim()}
            className="w-full rounded-xl border border-purple-500/30 bg-purple-500/15 py-3 font-semibold text-purple-300 disabled:opacity-30"
          >
            {generating ? "Escribiendo..." : "Enviar"}
          </button>
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-400">
          {error}
          <button
            onClick={() => { setError(null); }}
            className="ml-2 underline opacity-60 hover:opacity-100"
          >
            Reintentar
          </button>
        </div>
      )}
        </>
      )}

      {/* Generated result */}
      {result && (
        <>
          <hr className="border-white/5" />
          <p className="font-mono text-[10px] uppercase opacity-20">
            Continuación
          </p>
          {result.split("\n\n").map((p, i) => (
            <div
              key={i}
              className="rounded-r-lg border-l-2 border-purple-500/15 bg-purple-500/5 p-3 font-serif text-sm italic leading-relaxed opacity-75"
            >
              {p}
            </div>
          ))}
        </>
      )}

      {/* History */}
      {entries.length > 1 && (
        <>
          <hr className="my-2 border-white/5" />
          <p className="text-center text-xs opacity-20">
            Entradas anteriores
          </p>
          {entries.slice(0, -1).reverse().map((e) => (
            <div key={e.id} className="opacity-40">
              <p className="font-mono text-[10px] uppercase opacity-50">
                Turno {e.turnoNumero} · {e.autorNombre}
              </p>
              {e.textoJugador && (
                <div className="rounded-r-lg border-l-2 border-blue-500/10 bg-blue-500/5 p-3 text-xs leading-relaxed opacity-60">
                  {e.textoJugador.slice(0, 100)}...
                </div>
              )}
              <div className="rounded-r-lg border-l-2 border-purple-500/10 bg-purple-500/5 p-3 font-serif text-xs italic leading-relaxed">
                {(e.textoIa ?? "").slice(0, 200)}...
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

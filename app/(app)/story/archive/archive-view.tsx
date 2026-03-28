"use client";

import Link from "next/link";

type Entry = {
  id: string;
  turnoNumero: number;
  tipo: string;
  textoJugador: string | null;
  textoIa: string | null;
  autorNombre: string;
  fecha: string;
};

type Props = {
  entries: Entry[];
  page: number;
  totalPages: number;
};

export function ArchiveView({ entries, page, totalPages }: Props) {
  if (entries.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-hq-text-muted">No hay entradas todavía</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {entries.map((e) => (
        <div key={e.id} className="border-b border-hq-border pb-6 last:border-0">
          <div className="mb-2 flex items-center gap-2">
            <span className="font-mono text-[10px] text-hq-text-faint">
              Turno {e.turnoNumero}
            </span>
            <span className="text-[10px] text-hq-text-muted">
              {e.autorNombre}
            </span>
            {e.tipo === "prologo" && (
              <span className="rounded bg-hq-purple-bg px-1.5 py-0.5 text-[9px] text-hq-purple">
                prólogo
              </span>
            )}
          </div>

          {e.textoJugador && (
            <div className="mb-3 rounded-r-lg border-l-2 border-hq-blue-border bg-hq-blue-bg p-3 text-sm leading-relaxed">
              {e.textoJugador}
            </div>
          )}

          {e.textoIa && e.textoIa.split("\n\n").map((p, i) => (
            <p
              key={i}
              className="mb-2 font-serif text-sm italic leading-relaxed text-hq-text-muted"
            >
              {p}
            </p>
          ))}
        </div>
      ))}

      <div className="flex items-center justify-between pt-4">
        {page > 1 ? (
          <Link
            href={`/story/archive?page=${page - 1}`}
            className="text-xs text-hq-purple hover:underline"
          >
            ← Anterior
          </Link>
        ) : (
          <span />
        )}
        <span className="text-[10px] text-hq-text-faint">
          {page} / {totalPages}
        </span>
        {page < totalPages ? (
          <Link
            href={`/story/archive?page=${page + 1}`}
            className="text-xs text-hq-purple hover:underline"
          >
            Siguiente →
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}

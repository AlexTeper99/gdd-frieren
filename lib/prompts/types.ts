export type TriggerType = "prologo" | "diario";

export type PlayerContext = {
  nombre: string;
  arquetipo: string;
  identidad: string;
  hp: number;
  rituales: { nombre: string; racha: number }[];
};

export type NarrativeContext = {
  trigger: TriggerType;
  jugadorActivo: PlayerContext;
  otroJugador: PlayerContext | null;
  textoJugador: string | null;
  resumen: string | null;
  worldState: {
    npcs: { nombre: string; estado: string; ultimaAparicion: number }[];
    zonas: { nombre: string; estado: string }[];
    hilosAbiertos: string[];
    hechosInmutables: string[];
  } | null;
  entradasRecientes: string[];
};

export type TriggerType = "prologo" | "diario";

export type PlayerContext = {
  nombre: string;
  arquetipo: string;
  identidad: string;
  hp: number;
  rituales: { nombre: string; racha: number }[];
};

export type WorldState = {
  npcs: { nombre: string; estado: string; ultima_aparicion: number }[];
  zonas: { nombre: string; estado: string }[];
  hilos_abiertos: string[];
  hechos_inmutables: string[];
};

export type NarrativeContext = {
  trigger: TriggerType;
  jugadorActivo: PlayerContext;
  otroJugador: PlayerContext | null;
  textoJugador: string | null;
  resumen: string | null;
  worldState: WorldState | null;
  entradasRecientes: string[];
};

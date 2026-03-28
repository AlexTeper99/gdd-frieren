import {
  pgTable,
  text,
  timestamp,
  primaryKey,
  integer,
  boolean,
  date,
  time,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

// --- Enums ---

export const archetypeEnum = pgEnum("archetype", [
  "paladin",
  "mago",
  "guerrero",
  "sacerdote",
]);

// --- Auth tables (existing, unchanged) ---

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  // Game fields
  nombrePersonaje: text("nombre_personaje"),
  arquetipo: archetypeEnum("arquetipo"),
  identidadTexto: text("identidad_texto"),
  misionCategoria: text("mision_categoria"),
  hp: integer("hp").default(100).notNull(),
  onboardingCompleted: boolean("onboarding_completed").default(false).notNull(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  ]
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => [
    primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  ]
);

// --- Game tables ---

export const rituals = pgTable("rituals", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  descripcion: text("descripcion").notNull(),
  dias: text("dias").array().notNull(),
  horaInicio: time("hora_inicio").notNull(),
  horaFin: time("hora_fin").notNull(),
  lugar: text("lugar").notNull(),
  racha: integer("racha").default(0).notNull(),
  activo: boolean("activo").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const ritualLogs = pgTable("ritual_logs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  ritualId: text("ritual_id")
    .notNull()
    .references(() => rituals.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  fecha: date("fecha").notNull(),
  cumplido: boolean("cumplido").notNull(),
});

export const storyEntries = pgTable("story_entries", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  fecha: date("fecha").notNull(),
  turnoNumero: integer("turno_numero").notNull(),
  textoJugador: text("texto_jugador"),
  textoIa: text("texto_ia"),
  snapshotJ1: jsonb("snapshot_j1"),
  snapshotJ2: jsonb("snapshot_j2"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pacts = pgTable("pacts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  semana: date("semana").notNull(),
  respuestasJ1: jsonb("respuestas_j1"),
  respuestasJ2: jsonb("respuestas_j2"),
  firmadoJ1: boolean("firmado_j1").default(false).notNull(),
  firmadoJ2: boolean("firmado_j2").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  subscriptionJson: jsonb("subscription_json").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const storyMemory = pgTable("story_memory", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  resumen: text("resumen"),
  worldState: jsonb("world_state"),
  updatedAtEntry: integer("updated_at_entry"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

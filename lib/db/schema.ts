import {
  pgTable,
  pgEnum,
  text,
  boolean,
  integer,
  timestamp,
  date,
  json,
  uniqueIndex,
} from 'drizzle-orm/pg-core'

// Enums
export const archetypeEnum = pgEnum('archetype', [
  'warrior',
  'mage',
  'ranger',
  'healer',
])

export const sceneTypeEnum = pgEnum('scene_type', [
  'daily',
  'weekly_close',
  'arc_close',
  'bond',
])

// Tables
export const users = pgTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull().unique(),
  characterName: text('character_name'),
  archetype: archetypeEnum('archetype'),
  identityText: text('identity_text'),
  onboardingDone: boolean('onboarding_done').notNull().default(false),
  partnerId: text('partner_id').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const habits = pgTable('habits', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .unique()
    .references(() => users.id),
  objectiveArea: text('objective_area').notNull(),
  identityDescription: text('identity_description').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const conducts = pgTable('conducts', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  habitId: text('habit_id')
    .notNull()
    .references(() => habits.id),
  what: text('what').notNull(),
  whenTime: text('when_time').notNull(),
  where: text('where').notNull(),
  contingency: text('contingency'),
  sortOrder: integer('sort_order').notNull().default(0),
})

export const dailyCheckins = pgTable(
  'daily_checkins',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    date: date('date').notNull(),
    level: integer('level').notNull(), // 1=bien, 2=regular, 3=dificil
    freeNote: text('free_note'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [uniqueIndex('checkin_user_date_idx').on(table.userId, table.date)]
)

export const statsHistory = pgTable(
  'stats_history',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    date: date('date').notNull(),
    vit: integer('vit').notNull().default(50),
    sta: integer('sta').notNull().default(50),
    int: integer('int').notNull().default(50),
    str: integer('str').notNull().default(50),
    streak: integer('streak').notNull().default(0),
  },
  (table) => [uniqueIndex('stats_user_date_idx').on(table.userId, table.date)]
)

export const arcs = pgTable('arcs', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  month: integer('month').notNull(),
  year: integer('year').notNull(),
  initialDescription: text('initial_description'),
  resolution: text('resolution'),
  currentWeek: integer('current_week').notNull().default(1),
  closed: boolean('closed').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const scenes = pgTable('scenes', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  arcId: text('arc_id')
    .notNull()
    .references(() => arcs.id),
  type: sceneTypeEnum('type').notNull(),
  text: text('text').notNull(),
  date: date('date').notNull(),
  isBond: boolean('is_bond').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const weeklyPacts = pgTable('weekly_pacts', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  weekStart: date('week_start').notNull(),
  textP1: text('text_p1'),
  textP2: text('text_p2'),
  narrativeText: text('narrative_text'),
  signedP1: boolean('signed_p1').notNull().default(false),
  signedP2: boolean('signed_p2').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const worldState = pgTable('world_state', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  realmName: text('realm_name').notNull().default('Valdris'),
  npcsJson: json('npcs_json').notNull().$type<string[]>().default([]),
  zonesJson: json('zones_json').notNull().$type<string[]>().default([]),
  currentState: text('current_state').notNull().default('calm'),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})

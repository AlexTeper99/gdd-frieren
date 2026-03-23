import { eq, desc, and } from 'drizzle-orm'
import { db } from '.'
import {
  users,
  habits,
  conducts,
  dailyCheckins,
  statsHistory,
  scenes,
  arcs,
  weeklyPacts,
  worldState,
} from './schema'

export async function getUserByEmail(email: string) {
  return db.query.users.findFirst({
    where: eq(users.email, email),
    with: {
      habit: {
        with: {
          conducts: true,
        },
      },
    },
  })
}

export async function getUserWithStats(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  })
  const latestStats = await db.query.statsHistory.findFirst({
    where: eq(statsHistory.userId, userId),
    orderBy: desc(statsHistory.date),
  })
  return { user, stats: latestStats }
}

export async function getLatestCheckin(userId: string) {
  return db.query.dailyCheckins.findFirst({
    where: eq(dailyCheckins.userId, userId),
    orderBy: desc(dailyCheckins.date),
  })
}

export async function getRecentScenes(arcId: string | undefined, limit = 7) {
  if (!arcId) return []
  return db.query.scenes.findMany({
    where: eq(scenes.arcId, arcId),
    orderBy: desc(scenes.date),
    limit,
  })
}

export async function getCurrentArc() {
  return db.query.arcs.findFirst({
    where: eq(arcs.closed, false),
    orderBy: desc(arcs.createdAt),
  })
}

export async function getCurrentPact() {
  return db.query.weeklyPacts.findFirst({
    orderBy: desc(weeklyPacts.weekStart),
  })
}

export async function getWorldState() {
  return db.query.worldState.findFirst()
}

export async function getPartner(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  })
  if (!user?.partnerId) return null
  return getUserWithStats(user.partnerId)
}

export async function getCheckinDatesForUser(userId: string, limit = 30) {
  const checkins = await db.query.dailyCheckins.findMany({
    where: eq(dailyCheckins.userId, userId),
    orderBy: desc(dailyCheckins.date),
    limit,
    columns: { date: true },
  })
  return checkins.map((c) => new Date(c.date))
}

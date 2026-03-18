import { Hono } from 'hono'
import { db } from '../db'
import { startOfWeek, eachDayOfInterval, endOfWeek, format } from 'date-fns'

export const statsRouter = new Hono()

statsRouter.get('/:clerkId', async (c) => {
  const clerkId = c.req.param('clerkId')

  const user = await db.user.findUnique({ where: { clerkId } })
  if (!user) {
    return c.json({
      totalMins: 0, sessions: 0, streak: 0, bestStreak: 0,
      week: {}, rooms: {}, recentSessions: [],
    })
  }

  const allSessions = await db.session.findMany({
    where: { userId: user.id },
    orderBy: { completedAt: 'desc' },
  })

  const totalMins = allSessions.reduce((sum, s) => sum + s.durationMins, 0)
  const sessionCount = allSessions.length

  const uniqueDays = [
    ...new Set(allSessions.map((s) => format(s.completedAt, 'yyyy-MM-dd'))),
  ].sort((a, b) => b.localeCompare(a))

  let bestStreak = 0
  let current = 0
  let prevDate: string | null = null

  for (const day of uniqueDays) {
    if (!prevDate) {
      current = 1
    } else {
      const diff = Math.round(
        (new Date(prevDate).getTime() - new Date(day).getTime()) / 86_400_000
      )
      if (diff === 1) {
        current += 1
      } else {
        if (current > bestStreak) bestStreak = current
        current = 1
      }
    }
    prevDate = day
  }
  if (current > bestStreak) bestStreak = current
  const streak = uniqueDays[0] === format(new Date(), 'yyyy-MM-dd') ? current : 0

  const weekStart = startOfWeek(new Date())
  const weekEnd = endOfWeek(new Date())
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })
  const week: Record<number, number> = {}
  for (const day of weekDays) {
    const dow = day.getDay()
    const dayStr = format(day, 'yyyy-MM-dd')
    week[dow] = allSessions
      .filter((s) => format(s.completedAt, 'yyyy-MM-dd') === dayStr)
      .reduce((sum, s) => sum + s.durationMins, 0)
  }

  const rooms: Record<string, number> = {}
  for (const s of allSessions) {
    rooms[s.roomKey] = (rooms[s.roomKey] ?? 0) + s.durationMins
  }

  return c.json({
    totalMins,
    sessions: sessionCount,
    streak,
    bestStreak,
    week,
    rooms,
    recentSessions: allSessions.slice(0, 20).map((s) => ({
      id: s.id,
      roomKey: s.roomKey,
      durationMins: s.durationMins,
      completedAt: s.completedAt.toISOString(),
    })),
  })
})
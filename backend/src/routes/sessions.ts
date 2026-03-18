import { Hono } from 'hono'
import { z } from 'zod'
import { db } from '../db'

export const sessionsRouter = new Hono()

const CreateSessionSchema = z.object({
  clerkId: z.string(),
  roomKey: z.string(),
  durationMins: z.number().int().positive(),
  completedAt: z.string().datetime().optional(),
})

// POST /api/sessions — record a completed session
sessionsRouter.post('/', async (c) => {
  try {
    const body = await c.req.json()
    const data = CreateSessionSchema.parse(body)

    // Upsert user on the fly
    const user = await db.user.upsert({
      where: { clerkId: data.clerkId },
      update: {},
      create: { clerkId: data.clerkId },
    })

    const session = await db.session.create({
      data: {
        userId: user.id,
        roomKey: data.roomKey,
        durationMins: data.durationMins,
        completedAt: data.completedAt ? new Date(data.completedAt) : new Date(),
      },
    })

    return c.json({ ok: true, session })
  } catch (err) {
    console.error(err)
    return c.json({ ok: false, error: 'Invalid request' }, 400)
  }
})

// GET /api/sessions/:clerkId — fetch recent sessions
sessionsRouter.get('/:clerkId', async (c) => {
  const clerkId = c.req.param('clerkId')

  const user = await db.user.findUnique({ where: { clerkId } })
  if (!user) return c.json({ sessions: [] })

  const sessions = await db.session.findMany({
    where: { userId: user.id },
    orderBy: { completedAt: 'desc' },
    take: 50,
  })

  return c.json({ sessions })
})
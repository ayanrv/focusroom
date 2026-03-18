import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { sessionsRouter } from './routes/sessions'
import { statsRouter } from './routes/stats'

const app = new Hono()

app.use('*', logger())
app.use(
  '*',
  cors({
    origin: ['http://localhost:5173', 'https://your-vercel-app.vercel.app'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
)

app.get('/health', (c) => c.json({ ok: true }))
app.route('/api/sessions', sessionsRouter)
app.route('/api/stats', statsRouter)

const PORT = Number(process.env.PORT) || 3001

serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.log(`FocusRoom API running on http://localhost:${info.port}`)
})
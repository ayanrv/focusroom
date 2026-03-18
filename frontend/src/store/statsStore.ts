import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Stats, Session, RoomKey } from '@/types'
import { format } from 'date-fns'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

const emptyStats = (): Stats => ({
  totalMins: 0,
  sessions: 0,
  streak: 0,
  bestStreak: 0,
  lastDay: null,
  week: {},
  rooms: {},
  recentSessions: [],
})

interface StatsStore {
  stats: Stats
  recordSession: (mins: number, room: RoomKey) => void
  resetStats: () => void
}

export const useStatsStore = create<StatsStore>()(
  persist(
    (set) => ({
      stats: emptyStats(),

      recordSession: (mins, room) => {
        // 1. Update local state immediately (optimistic)
        set((state) => {
          const s = { ...state.stats }
          s.totalMins += mins
          s.sessions += 1

          const today = format(new Date(), 'yyyy-MM-dd')
          const yesterday = format(new Date(Date.now() - 86_400_000), 'yyyy-MM-dd')

          if (s.lastDay === today) {
            // already counted today
          } else if (s.lastDay === yesterday) {
            s.streak += 1
          } else {
            s.streak = 1
          }
          s.lastDay = today
          if (s.streak > s.bestStreak) s.bestStreak = s.streak

          s.rooms = { ...s.rooms, [room]: (s.rooms[room] ?? 0) + mins }

          const dow = new Date().getDay()
          s.week = { ...s.week, [dow]: (s.week[dow] ?? 0) + mins }

          const session: Session = {
            id: crypto.randomUUID(),
            roomKey: room,
            durationMins: mins,
            completedAt: new Date().toISOString(),
          }
          s.recentSessions = [session, ...s.recentSessions].slice(0, 20)

          return { stats: s }
        })

        // 2. Also persist to backend (fire and forget — no auth yet, uses a guest id)
        const guestId = localStorage.getItem('fr_guest_id') ?? (() => {
          const id = `guest_${crypto.randomUUID()}`
          localStorage.setItem('fr_guest_id', id)
          return id
        })()

        fetch(`${API_URL}/api/sessions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clerkId: guestId,
            roomKey: room,
            durationMins: mins,
            completedAt: new Date().toISOString(),
          }),
        }).catch(() => {
          // silently fail — localStorage is the source of truth for now
        })
      },

      resetStats: () => set({ stats: emptyStats() }),
    }),
    { name: 'focusroom-stats' }
  )
)
import { create } from 'zustand'
import type { TimerState, TimerStatus, TimerMode } from '@/types'

interface TimerStore extends TimerState {
  setDuration: (mins: number) => void
  setMode: (mode: TimerMode) => void
  start: () => void
  pause: () => void
  resume: () => void
  reset: () => void
  tick: () => void
  setStatus: (status: TimerStatus) => void
}

const DEFAULT_MINS = 25

export const useTimerStore = create<TimerStore>((set, get) => ({
  mode: 'focus',
  status: 'idle',
  duration: DEFAULT_MINS * 60,
  remaining: DEFAULT_MINS * 60,
  sessionMins: DEFAULT_MINS,

  setDuration: (mins) =>
    set({ sessionMins: mins, duration: mins * 60, remaining: mins * 60, status: 'idle' }),

  setMode: (mode) => {
    const mins = mode === 'focus' ? get().sessionMins : 5
    set({ mode, duration: mins * 60, remaining: mins * 60, status: 'idle' })
  },

  start: () => set({ status: 'running' }),
  pause: () => set({ status: 'paused' }),
  resume: () => set({ status: 'running' }),
  reset: () => set((s) => ({ status: 'idle', remaining: s.duration })),
  setStatus: (status) => set({ status }),

  tick: () =>
    set((s) => {
      if (s.status !== 'running') return s
      const remaining = s.remaining - 1
      if (remaining <= 0) return { remaining: 0, status: 'done' }
      return { remaining }
    }),
}))
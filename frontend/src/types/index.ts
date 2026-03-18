export type RoomKey = 'library' | 'spaceship' | 'cafe' | 'rain' | 'forest' | 'void'

export interface Room {
  key: RoomKey
  name: string
  icon: string
  description: string
  accent: [number, number, number]
  bg: [number, number, number]
  sounds: SoundKey[]
}

export type SoundKey = 'ambient' | 'rain' | 'keys' | 'fire' | 'wind' | 'noise' | 'space'

export type TimerMode = 'focus' | 'break'
export type TimerStatus = 'idle' | 'running' | 'paused' | 'done'

export interface TimerState {
  mode: TimerMode
  status: TimerStatus
  duration: number     // seconds
  remaining: number    // seconds
  sessionMins: number  // minutes selected for this session
}

export interface Session {
  id: string
  roomKey: RoomKey
  durationMins: number
  completedAt: string  // ISO string
}

export interface Stats {
  totalMins: number
  sessions: number
  streak: number
  bestStreak: number
  lastDay: string | null
  week: Record<number, number>   // day-of-week (0=Sun) → minutes
  rooms: Partial<Record<RoomKey, number>>
  recentSessions: Session[]
}

export interface SoundLayer {
  key: SoundKey
  label: string
  icon: string
  active: boolean
  volume: number  // 0–1
}
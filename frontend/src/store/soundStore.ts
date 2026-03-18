import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SoundKey, SoundLayer } from '@/types'

const ALL_SOUNDS: SoundLayer[] = [
  { key: 'ambient', label: 'Ambient', icon: '〜', active: true,  volume: 0.6 },
  { key: 'rain',    label: 'Rain',    icon: '🌧', active: false, volume: 0.5 },
  { key: 'keys',    label: 'Keys',    icon: '⌨', active: false, volume: 0.4 },
  { key: 'fire',    label: 'Fire',    icon: '🔥', active: false, volume: 0.5 },
  { key: 'wind',    label: 'Wind',    icon: '💨', active: false, volume: 0.4 },
  { key: 'noise',   label: 'Noise',   icon: '◌', active: false, volume: 0.3 },
  { key: 'space',   label: 'Space',   icon: '✦', active: false, volume: 0.5 },
]

interface SoundStore {
  layers: SoundLayer[]
  masterVolume: number
  muted: boolean
  toggleLayer: (key: SoundKey) => void
  setVolume: (key: SoundKey, volume: number) => void
  setMasterVolume: (v: number) => void
  toggleMute: () => void
}

export const useSoundStore = create<SoundStore>()(
  persist(
    (set) => ({
      layers: ALL_SOUNDS,
      masterVolume: 0.8,
      muted: false,

      toggleLayer: (key) =>
        set((s) => ({
          layers: s.layers.map((l) => (l.key === key ? { ...l, active: !l.active } : l)),
        })),

      setVolume: (key, volume) =>
        set((s) => ({
          layers: s.layers.map((l) => (l.key === key ? { ...l, volume } : l)),
        })),

      setMasterVolume: (v) => set({ masterVolume: v }),
      toggleMute: () => set((s) => ({ muted: !s.muted })),
    }),
    { name: 'focusroom-sounds' }
  )
)
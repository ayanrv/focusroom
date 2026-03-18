import { create } from 'zustand'
import type { Room, RoomKey } from '@/types'

export const ROOMS: Record<RoomKey, Room> = {
  library: {
    key: 'library',
    name: 'Library',
    icon: '📚',
    description: 'Warm amber light, floating dust motes',
    accent: [180, 120, 60],
    bg: [20, 15, 8],
    sounds: ['ambient', 'fire', 'rain'],
  },
  spaceship: {
    key: 'spaceship',
    name: 'Spaceship',
    icon: '🚀',
    description: 'Drifting through the cosmos',
    accent: [80, 120, 255],
    bg: [5, 8, 20],
    sounds: ['space', 'ambient', 'noise'],
  },
  cafe: {
    key: 'cafe',
    name: 'Café',
    icon: '☕',
    description: 'Warm steam, cozy amber haze',
    accent: [200, 140, 60],
    bg: [18, 12, 6],
    sounds: ['ambient', 'rain', 'keys'],
  },
  rain: {
    key: 'rain',
    name: 'Rain Room',
    icon: '🌧',
    description: 'Silver streaks on a dark window',
    accent: [80, 140, 200],
    bg: [8, 12, 18],
    sounds: ['rain', 'wind', 'ambient'],
  },
  forest: {
    key: 'forest',
    name: 'Forest',
    icon: '🌲',
    description: 'Fireflies and falling leaves',
    accent: [60, 160, 90],
    bg: [6, 14, 8],
    sounds: ['wind', 'ambient', 'rain'],
  },
  void: {
    key: 'void',
    name: 'The Void',
    icon: '✦',
    description: 'Pure focus. Absolute silence.',
    accent: [140, 80, 220],
    bg: [4, 4, 8],
    sounds: ['noise', 'ambient'],
  },
}

interface RoomStore {
  activeRoom: RoomKey | null
  setRoom: (key: RoomKey | null) => void
}

export const useRoomStore = create<RoomStore>((set) => ({
  activeRoom: null,
  setRoom: (key) => set({ activeRoom: key }),
}))
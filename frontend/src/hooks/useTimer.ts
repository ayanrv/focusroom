import { useEffect, useCallback } from 'react'
import { useTimerStore } from '@/store/timerStore'
import { useStatsStore } from '@/store/statsStore'
import { useRoomStore } from '@/store/roomStore'

export function useTimer() {
  const timer = useTimerStore()
  const recordSession = useStatsStore((s) => s.recordSession)
  const activeRoom = useRoomStore((s) => s.activeRoom)

  // Tick every second when running
  useEffect(() => {
    if (timer.status !== 'running') return
    const id = setInterval(() => timer.tick(), 1000)
    return () => clearInterval(id)
  }, [timer.status, timer.tick])

  // Handle completion
  useEffect(() => {
    if (timer.status === 'done' && activeRoom) {
      recordSession(timer.sessionMins, activeRoom)
    }
  }, [timer.status])

  const toggle = useCallback(() => {
    if (timer.status === 'idle' || timer.status === 'paused') timer.start()
    else if (timer.status === 'running') timer.pause()
  }, [timer])

  const progress = 1 - timer.remaining / timer.duration

  const formatted = {
    minutes: String(Math.floor(timer.remaining / 60)).padStart(2, '0'),
    seconds: String(timer.remaining % 60).padStart(2, '0'),
  }

  return { timer, toggle, progress, formatted }
}
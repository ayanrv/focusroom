import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useRoomStore, ROOMS } from '@/store/roomStore'
import { useTimerStore } from '@/store/timerStore'
import { useStatsStore } from '@/store/statsStore'
import { useAudio } from '@/hooks/useAudio'
import { useWakeLock } from '@/hooks/useWakeLock'
import { useNotification } from '@/hooks/useNotification'
import { RoomScene } from '@/rooms/RoomScene'
import { Timer } from '@/components/Timer'
import { SoundPanel } from '@/components/SoundPanel'
import { StatsPanel } from '@/components/StatsPanel'
import { SessionComplete } from '@/components/SessionComplete'
import type { RoomKey } from '@/types'
import styles from './FocusRoom.module.css'

export function FocusRoom() {
  const { roomKey } = useParams<{ roomKey: string }>()
  const navigate = useNavigate()
  const setRoom = useRoomStore((s) => s.setRoom)
  const activeRoom = useRoomStore((s) => s.activeRoom)
  const timerStatus = useTimerStore((s) => s.status)
  const timerSessionMins = useTimerStore((s) => s.sessionMins)
  const stats = useStatsStore((s) => s.stats)
  const [statsOpen, setStatsOpen] = useState(false)
  const { resume, unlocked } = useAudio()
  const { notify } = useNotification()
  const prevStatus = useRef(timerStatus)

  // Keep screen awake while timer is running
  useWakeLock(timerStatus === 'running')

  // Sync URL param → store on direct load / refresh
  useEffect(() => {
    if (roomKey && roomKey in ROOMS) {
      setRoom(roomKey as RoomKey)
    } else {
      navigate('/')
    }
  }, [roomKey])

  // Fire notification when session completes
  useEffect(() => {
    if (prevStatus.current === 'running' && timerStatus === 'done') {
      notify(
        '✦ Session complete',
        `You focused for ${timerSessionMins} minutes. Great work!`
      )
    }
    prevStatus.current = timerStatus
  }, [timerStatus])

  const room = activeRoom ? ROOMS[activeRoom] : null
  if (!room) return null

  const [ar, ag, ab] = room.accent
  const accentColor = `rgb(${ar},${ag},${ab})`
  const totalH = Math.floor(stats.totalMins / 60)
  const totalM = stats.totalMins % 60

  return (
    <div className={styles.wrap}>
      <RoomScene roomKey={room.key} />
      <div className={styles.overlay} />

      {!unlocked && (
        <div className={styles.audioPrompt}>
          <button className={styles.audioUnlockBtn} onClick={resume}>
            ♫ Enable sounds
          </button>
        </div>
      )}

      <header className={styles.topbar}>
        <button className={styles.roomBadge} onClick={() => navigate('/')}>
          <span className={styles.badgeIcon}>{room.icon}</span>
          <span>{room.name}</span>
        </button>
        <div className={styles.topActions}>
          {timerStatus === 'running' && (
            <div className={styles.liveDot} title="Session in progress" />
          )}
          <button
            className={`${styles.iconBtn} ${statsOpen ? styles.iconBtnActive : ''}`}
            onClick={() => setStatsOpen((o) => !o)}
            title="Stats"
          >
            ◈
          </button>
        </div>
      </header>

      <main className={styles.center}>
        <Timer accentColor={accentColor} />
      </main>

      <footer className={styles.bottombar}>
        <SoundPanel availableSounds={room.sounds} />
        <div className={styles.miniStats}>
          <div className={styles.miniStat}>
            <span className={styles.miniVal}>{totalH}h {totalM}m</span>
            <span className={styles.miniLabel}>Total</span>
          </div>
          <div className={styles.miniStat}>
            <span className={styles.miniVal}>{stats.sessions}</span>
            <span className={styles.miniLabel}>Sessions</span>
          </div>
          <div className={styles.miniStat}>
            <span className={styles.miniVal}>{stats.streak}🔥</span>
            <span className={styles.miniLabel}>Streak</span>
          </div>
        </div>
      </footer>

      <StatsPanel open={statsOpen} onClose={() => setStatsOpen(false)} />
      {timerStatus === 'done' && <SessionComplete />}
    </div>
  )
}
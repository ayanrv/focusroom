import { useStatsStore } from '@/store/statsStore'
import { ROOMS } from '@/store/roomStore'
import type { RoomKey } from '@/types'
import styles from './StatsPanel.module.css'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface StatsPanelProps {
  open: boolean
  onClose: () => void
}

export function StatsPanel({ open, onClose }: StatsPanelProps) {
  const { stats } = useStatsStore()

  const totalH = Math.floor(stats.totalMins / 60)
  const totalM = stats.totalMins % 60
  const avgMins = stats.sessions > 0 ? Math.round(stats.totalMins / stats.sessions) : 0

  const maxWeek = Math.max(...DAYS.map((_, i) => stats.week[i] ?? 0), 1)
  const maxRoom = Math.max(...Object.values(stats.rooms), 1)

  return (
    <aside className={`${styles.panel} ${open ? styles.open : ''}`}>
      <button className={styles.close} onClick={onClose}>✕</button>
      <h2 className={styles.title}>Your stats</h2>

      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardLabel}>Total focus time</div>
          <div className={styles.cardValue}>{totalH}h {totalM}m</div>
          <div className={styles.cardSub}>All time</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardLabel}>Sessions</div>
          <div className={styles.cardValue}>{stats.sessions}</div>
          <div className={styles.cardSub}>avg. {avgMins}m each</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardLabel}>Day streak</div>
          <div className={styles.cardValue}>{stats.streak} 🔥</div>
          <div className={styles.cardSub}>Best: {stats.bestStreak} days</div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionLabel}>This week</div>
        {DAYS.map((day, i) => {
          const mins = stats.week[i] ?? 0
          const pct = Math.round((mins / maxWeek) * 100)
          return (
            <div key={day} className={styles.barRow}>
              <span className={styles.barLabel}>{day}</span>
              <div className={styles.barTrack}>
                <div className={styles.barFill} style={{ width: `${pct}%` }} />
              </div>
              <span className={styles.barVal}>{mins}m</span>
            </div>
          )
        })}
      </div>

      <div className={styles.section}>
        <div className={styles.sectionLabel}>Rooms</div>
        {Object.entries(stats.rooms).length === 0 && (
          <p className={styles.empty}>No sessions yet</p>
        )}
        {(Object.entries(stats.rooms) as [RoomKey, number][]).map(([key, mins]) => {
          const pct = Math.round((mins / maxRoom) * 100)
          const room = ROOMS[key]
          return (
            <div key={key} className={styles.barRow}>
              <span className={styles.barLabel}>{room?.icon ?? key}</span>
              <div className={styles.barTrack}>
                <div className={styles.barFill} style={{ width: `${pct}%` }} />
              </div>
              <span className={styles.barVal}>{mins}m</span>
            </div>
          )
        })}
      </div>

      <div className={styles.section}>
        <div className={styles.sectionLabel}>Recent sessions</div>
        {stats.recentSessions.slice(0, 5).map((s) => {
          const room = ROOMS[s.roomKey]
          const date = new Date(s.completedAt)
          return (
            <div key={s.id} className={styles.session}>
              <span>{room?.icon}</span>
              <span>{room?.name}</span>
              <span className={styles.sessionMins}>{s.durationMins}m</span>
              <span className={styles.sessionDate}>
                {date.toLocaleDateString()}
              </span>
            </div>
          )
        })}
      </div>
    </aside>
  )
}
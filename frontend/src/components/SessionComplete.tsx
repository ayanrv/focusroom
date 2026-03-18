import { useNavigate } from 'react-router-dom'
import { useTimerStore } from '@/store/timerStore'
import { useRoomStore, ROOMS } from '@/store/roomStore'
import styles from './SessionComplete.module.css'

export function SessionComplete() {
  const navigate = useNavigate()
  const timer = useTimerStore()
  const activeRoom = useRoomStore((s) => s.activeRoom)
  const setRoom = useRoomStore((s) => s.setRoom)

  const room = activeRoom ? ROOMS[activeRoom] : null

  const handleAgain = () => {
    timer.reset()
  }

  const handleHome = () => {
    timer.reset()
    setRoom(null)
    navigate('/')
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.glyph}>✦</div>
      <h2 className={styles.heading}>Session complete</h2>
      <p className={styles.sub}>
        You focused for {timer.sessionMins} minutes
        {room ? ` in the ${room.name}` : ''}. Great work.
      </p>
      <div className={styles.actions}>
        <button className={styles.ghost} onClick={handleAgain}>
          Go again
        </button>
        <button className={styles.primary} onClick={handleHome}>
          Choose room
        </button>
      </div>
    </div>
  )
}
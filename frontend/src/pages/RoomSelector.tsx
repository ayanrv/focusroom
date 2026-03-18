import { useNavigate } from 'react-router-dom'
import { useRoomStore, ROOMS } from '@/store/roomStore'
import type { RoomKey } from '@/types'
import styles from './RoomSelector.module.css'

export function RoomSelector() {
  const setRoom = useRoomStore((s) => s.setRoom)
  const navigate = useNavigate()

  const enter = (key: RoomKey) => {
    setRoom(key)
    navigate(`/room/${key}`)
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.hero}>
        <h1 className={styles.title}>FocusRoom</h1>
        <p className={styles.sub}>Choose your environment</p>
      </div>

      <div className={styles.grid}>
        {(Object.values(ROOMS)).map((room) => (
          <button
            key={room.key}
            className={styles.card}
            onClick={() => enter(room.key)}
            style={{
              '--accent': `rgb(${room.accent.join(',')})`,
            } as React.CSSProperties}
          >
            <span className={styles.icon}>{room.icon}</span>
            <span className={styles.name}>{room.name}</span>
            <span className={styles.desc}>{room.description}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
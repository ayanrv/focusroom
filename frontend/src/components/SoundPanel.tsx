import { useSoundStore } from '@/store/soundStore'
import { useAudio } from '@/hooks/useAudio'
import type { SoundKey } from '@/types'
import styles from './SoundPanel.module.css'

interface SoundPanelProps {
  availableSounds: SoundKey[]
}

export function SoundPanel({ availableSounds }: SoundPanelProps) {
  const { layers, toggleLayer, masterVolume, setMasterVolume, muted, toggleMute } = useSoundStore()
  const { resume } = useAudio()

  const visible = layers.filter((l) => availableSounds.includes(l.key))

  return (
    <div className={styles.wrap}>
      <div className={styles.sounds}>
        {visible.map((layer) => (
          <button
            key={layer.key}
            className={`${styles.btn} ${layer.active ? styles.active : ''}`}
            onClick={() => {
              resume()
              toggleLayer(layer.key)
            }}
          >
            <span className={styles.icon}>{layer.icon}</span>
            {layer.label}
          </button>
        ))}
      </div>

      <div className={styles.master}>
        <button className={styles.muteBtn} onClick={toggleMute}>
          {muted ? '🔇' : '🔊'}
        </button>
        <input
          type="range"
          min={0} max={1} step={0.01}
          value={masterVolume}
          onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
          className={styles.slider}
        />
      </div>
    </div>
  )
}
import { useTimer } from '@/hooks/useTimer'
import { useTimerStore } from '@/store/timerStore'
import styles from './Timer.module.css'

const DURATIONS = [25, 45, 60, 90]
const RING_R = 154
const RING_CIRC = 2 * Math.PI * RING_R

interface TimerProps {
  accentColor: string
}

export function Timer({ accentColor }: TimerProps) {
  const { formatted, progress, toggle } = useTimer()
  const timer = useTimerStore()

  const offset = RING_CIRC * (1 - progress)

  const btnLabel =
    timer.status === 'running' ? 'Pause'
    : timer.status === 'paused' ? 'Resume'
    : 'Start'

  return (
    <div className={styles.wrap}>
      {/* SVG progress ring */}
      <svg className={styles.ring} viewBox="0 0 340 340">
        <circle cx="170" cy="170" r={RING_R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
        <circle
          cx="170" cy="170" r={RING_R}
          fill="none"
          stroke={accentColor}
          strokeWidth="1.5"
          strokeDasharray={RING_CIRC}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 170 170)"
          style={{ transition: 'stroke-dashoffset 1s linear' }}
        />
      </svg>

      {/* Display */}
      <div className={styles.inner}>
        <p className={styles.label}>
          {timer.mode === 'focus' ? 'FOCUS SESSION' : 'BREAK'}
        </p>
        <div className={styles.time}>
          {formatted.minutes}:{formatted.seconds}
        </div>

        <div className={styles.controls}>
          <button className={styles.ghost} onClick={() => timer.reset()}>
            Reset
          </button>
          <button className={styles.primary} onClick={toggle}>
            {btnLabel}
          </button>
        </div>

        <div className={styles.durations}>
          {DURATIONS.map((m) => (
            <button
              key={m}
              className={`${styles.dur} ${timer.sessionMins === m && timer.status === 'idle' ? styles.durActive : ''}`}
              onClick={() => timer.setDuration(m)}
            >
              {m}m
            </button>
          ))}
        </div>

        <div className={styles.modes}>
          <button
            className={`${styles.mode} ${timer.mode === 'focus' ? styles.modeActive : ''}`}
            onClick={() => timer.setMode('focus')}
          >
            Focus
          </button>
          <button
            className={`${styles.mode} ${timer.mode === 'break' ? styles.modeActive : ''}`}
            onClick={() => timer.setMode('break')}
          >
            Break
          </button>
        </div>
      </div>
    </div>
  )
}
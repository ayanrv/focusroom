import { useEffect, useRef } from 'react'

export function useWakeLock(active: boolean) {
  const lockRef = useRef<WakeLockSentinel | null>(null)

  useEffect(() => {
    if (!('wakeLock' in navigator)) return

    async function acquire() {
      try {
        lockRef.current = await navigator.wakeLock.request('screen')
      } catch (_) {}
    }

    async function release() {
      try {
        await lockRef.current?.release()
        lockRef.current = null
      } catch (_) {}
    }

    if (active) {
      acquire()
    } else {
      release()
    }

    // Re-acquire if tab becomes visible again
    const onVisible = () => { if (active && document.visibilityState === 'visible') acquire() }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      release()
    }
  }, [active])
}
import { useEffect, useRef } from 'react'

export function useNotification() {
  const permissionRef = useRef<NotificationPermission>('default')

  // Request permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(p => {
        permissionRef.current = p
      })
    } else if ('Notification' in window) {
      permissionRef.current = Notification.permission
    }
  }, [])

  function notify(title: string, body: string) {
    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'focusroom-session',
      })
    }

    // Also play a soft chime via Web Audio as fallback
    try {
      const ctx = new AudioContext()
      const notes = [523.25, 659.25, 783.99, 1046.5] // C5 E5 G5 C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.value = freq
        gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.18)
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + i * 0.18 + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.18 + 0.6)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(ctx.currentTime + i * 0.18)
        osc.stop(ctx.currentTime + i * 0.18 + 0.6)
      })
      setTimeout(() => ctx.close(), 2000)
    } catch (_) {}
  }

  return { notify }
}
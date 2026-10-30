import { useEffect, useRef } from 'react'

// Detects short and long shakes via DeviceMotionEvent.
// A real shake is back-and-forth: acceleration spikes on every reversal and
// dips in between. So a gesture is a run of spikes above `threshold` with no
// quiet gap longer than `gapMs`.
// - Short shake: the run lasts at least `shortMs` (with a few spikes) and stops.
// - Long shake:  the run keeps going for `longMs`; fires while still shaking.
// Fires exactly one callback per gesture, with a cooldown afterwards.
//
// On iOS the API requires a one-time permission grant triggered from a
// user gesture; caller can invoke requestMotionPermission() from a tap.
export function useShake({
  onShortShake,
  onLongShake,
  threshold = 12,
  shortMs = 250,
  longMs = 1500,
  gapMs = 350,
  minSpikes = 4,
  cooldownMs = 1200,
  enabled = true,
} = {}) {
  const shortRef = useRef(onShortShake)
  const longRef = useRef(onLongShake)
  shortRef.current = onShortShake
  longRef.current = onLongShake

  useEffect(() => {
    if (!enabled) return
    if (typeof window === 'undefined') return
    if (typeof window.DeviceMotionEvent === 'undefined') return

    let start = null // time of the first spike in the current gesture
    let lastSpike = 0
    let spikes = 0
    let coolUntil = 0

    const magnitude = (e) => {
      // Prefer acceleration without gravity; fall back to subtracting ~1g.
      const a = e.acceleration
      if (a && a.x != null) return Math.hypot(a.x, a.y || 0, a.z || 0)
      const g = e.accelerationIncludingGravity
      if (!g || g.x == null) return null
      return Math.abs(Math.hypot(g.x, g.y || 0, g.z || 0) - 9.81)
    }

    const handle = (e) => {
      const mag = magnitude(e)
      if (mag == null) return
      const now = Date.now()
      if (now < coolUntil) return

      if (mag > threshold) {
        if (start == null) {
          start = now
          spikes = 0
        }
        lastSpike = now
        spikes++
        if (now - start >= longMs) {
          start = null
          coolUntil = now + cooldownMs
          longRef.current && longRef.current()
        }
      } else if (start != null && now - lastSpike > gapMs) {
        // Gesture over: was it a deliberate shake or just a bump?
        const duration = lastSpike - start
        start = null
        if (duration >= shortMs && spikes >= minSpikes) {
          coolUntil = now + cooldownMs
          shortRef.current && shortRef.current()
        }
      }
    }

    window.addEventListener('devicemotion', handle)
    return () => window.removeEventListener('devicemotion', handle)
  }, [enabled, threshold, shortMs, longMs, gapMs, minSpikes, cooldownMs])
}

// iOS 13+ requires requesting permission from a user gesture.
export async function requestMotionPermission() {
  if (typeof DeviceMotionEvent === 'undefined') return 'unsupported'
  if (typeof DeviceMotionEvent.requestPermission !== 'function') return 'granted'
  try {
    return await DeviceMotionEvent.requestPermission()
  } catch {
    return 'denied'
  }
}

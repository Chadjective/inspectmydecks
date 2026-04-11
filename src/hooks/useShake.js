import { useEffect, useRef } from 'react'

// Detects short and long shakes via DeviceMotionEvent.
// - Short shake: sustained acceleration above threshold for ~SHORT_MS
// - Long shake:  sustained acceleration above threshold for ~LONG_MS
// Fires exactly one callback per gesture, with a cooldown afterwards.
//
// On iOS the API requires a one-time permission grant triggered from a
// user gesture; caller can invoke requestPermission() from a button.
export function useShake({
  onShortShake,
  onLongShake,
  threshold = 14,
  shortMs = 300,
  longMs = 1500,
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

    let shakeStart = null
    let firedLong = false
    let coolUntil = 0

    const handle = (e) => {
      const acc = e.accelerationIncludingGravity || e.acceleration
      if (!acc) return
      const mag = Math.sqrt(
        (acc.x || 0) ** 2 + (acc.y || 0) ** 2 + (acc.z || 0) ** 2,
      )
      // accelerationIncludingGravity baseline is ~9.8; subtract it if present.
      const adjusted = e.accelerationIncludingGravity ? Math.abs(mag - 9.8) : mag

      const now = Date.now()
      if (now < coolUntil) return

      if (adjusted > threshold) {
        if (shakeStart == null) {
          shakeStart = now
          firedLong = false
        } else if (!firedLong && now - shakeStart >= longMs) {
          firedLong = true
          coolUntil = now + cooldownMs
          shakeStart = null
          longRef.current && longRef.current()
        }
      } else if (shakeStart != null) {
        const duration = now - shakeStart
        shakeStart = null
        if (!firedLong && duration >= shortMs) {
          coolUntil = now + cooldownMs
          shortRef.current && shortRef.current()
        }
        firedLong = false
      }
    }

    window.addEventListener('devicemotion', handle)
    return () => window.removeEventListener('devicemotion', handle)
  }, [enabled, threshold, shortMs, longMs, cooldownMs])
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

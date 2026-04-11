import { useRef } from 'react'

// Lightweight swipe hook — no dependencies. Detects a horizontal swipe
// above a threshold, ignores vertical drags, and returns a set of
// handlers to spread on the target element.
export function useSwipe({ onSwipeLeft, onSwipeRight, threshold = 50 } = {}) {
  const start = useRef(null)

  const onPointerDown = (e) => {
    start.current = {
      x: e.clientX,
      y: e.clientY,
      t: Date.now(),
    }
  }

  const onPointerUp = (e) => {
    if (!start.current) return
    const dx = e.clientX - start.current.x
    const dy = e.clientY - start.current.y
    const dt = Date.now() - start.current.t
    start.current = null

    if (Math.abs(dx) < threshold) return
    if (Math.abs(dy) > Math.abs(dx)) return
    if (dt > 800) return

    if (dx < 0 && onSwipeLeft) onSwipeLeft()
    else if (dx > 0 && onSwipeRight) onSwipeRight()
  }

  const onPointerCancel = () => {
    start.current = null
  }

  return {
    onPointerDown,
    onPointerUp,
    onPointerCancel,
  }
}

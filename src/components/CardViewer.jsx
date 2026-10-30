import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import FlipCard from './FlipCard.jsx'
import Navigation from './Navigation.jsx'
import ShuffleAnimation from './ShuffleAnimation.jsx'
import InfoPanel, { UNSUPPORTED } from './InfoPanel.jsx'
import { useSwipe } from '../hooks/useSwipe.js'
import { useShake, requestMotionPermission } from '../hooks/useShake.js'

// Fisher–Yates
function shuffle(array) {
  const a = array.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const SLIDE_MS = 340
const RIFFLE_MS = 420
const SHUFFLE_MS = 820

const SHAKE_KEY = 'semillero:shake'

// Shake needs a motion sensor; desktops report the API but have no sensor.
const shakeSupported =
  typeof window !== 'undefined' &&
  typeof window.DeviceMotionEvent !== 'undefined' &&
  !!window.matchMedia?.('(pointer: coarse)').matches

// iOS (and some browsers) must ask permission from a tap before sending motion events.
const shakeNeedsPermission =
  shakeSupported && typeof window.DeviceMotionEvent.requestPermission === 'function'

function readShakePref() {
  try {
    return localStorage.getItem(SHAKE_KEY)
  } catch {
    return null
  }
}

function saveShakePref(on) {
  try {
    localStorage.setItem(SHAKE_KEY, on ? 'on' : 'off')
  } catch {
    /* ignore */
  }
}

export default function CardViewer({ deck, onBack }) {
  // The order is a permutation of card indices — reshuffling creates a new one.
  const [order, setOrder] = useState(() => deck.cards.map((_, i) => i))
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [transition, setTransition] = useState(null) // 'leaving-left' | 'leaving-right' | 'entering-left' | 'entering-right' | 'bouncing-left' | 'bouncing-right'
  const [shuffleFx, setShuffleFx] = useState(null)    // 'riffle' | 'shuffle' | null
  const [infoOpen, setInfoOpen] = useState(false)
  // On by default unless switched off. Where the browser gates motion behind a
  // permission prompt (iPhone), it is requested on the first tap (see below).
  const [shakeOn, setShakeOn] = useState(() => shakeSupported && readShakePref() !== 'off')
  const [shakeDenied, setShakeDenied] = useState(false)
  const motionGrantedRef = useRef(!shakeNeedsPermission)

  const animatingRef = useRef(false)

  const currentCard = deck.cards[order[index]]

  // --- Navigation ---
  const go = useCallback(
    (dir) => {
      if (animatingRef.current) return
      const nextIndex = index + dir
      if (nextIndex < 0 || nextIndex >= order.length) {
        // bounce
        animatingRef.current = true
        setTransition(dir < 0 ? 'bouncing-right' : 'bouncing-left')
        setTimeout(() => {
          setTransition(null)
          animatingRef.current = false
        }, 320)
        return
      }
      animatingRef.current = true
      setTransition(dir > 0 ? 'leaving-left' : 'leaving-right')
      setTimeout(() => {
        setIndex(nextIndex)
        setFlipped(false)
        setTransition(dir > 0 ? 'entering-left' : 'entering-right')
        setTimeout(() => {
          setTransition(null)
          animatingRef.current = false
        }, SLIDE_MS)
      }, SLIDE_MS)
    },
    [index, order.length],
  )

  const flip = useCallback(() => {
    if (!animatingRef.current) setFlipped((f) => !f)
  }, [])

  const next = useCallback(() => go(1), [go])
  const prev = useCallback(() => go(-1), [go])

  // --- Random card (short shake / button) ---
  const pickRandom = useCallback(() => {
    if (animatingRef.current) return
    if (order.length < 2) return
    animatingRef.current = true
    vibrate(100)
    setShuffleFx('riffle')
    const pool = order.map((_, i) => i).filter((i) => i !== index)
    const nextIdx = pool[Math.floor(Math.random() * pool.length)]
    setTimeout(() => {
      setIndex(nextIdx)
      setFlipped(false)
      setShuffleFx(null)
      animatingRef.current = false
    }, RIFFLE_MS)
  }, [index, order])

  // --- Reshuffle whole deck (long shake / button) ---
  const reshuffle = useCallback(() => {
    if (animatingRef.current) return
    animatingRef.current = true
    vibrate([100, 50, 100, 50, 200])
    setShuffleFx('shuffle')
    setTimeout(() => {
      setOrder(shuffle(deck.cards.map((_, i) => i)))
      setIndex(0)
      setFlipped(false)
      setShuffleFx(null)
      animatingRef.current = false
    }, SHUFFLE_MS)
  }, [deck.cards])

  // --- Shake ---
  useShake({
    onShortShake: pickRandom,
    onLongShake: reshuffle,
    enabled: shakeOn && !infoOpen,
  })

  // Permission prompts must come from a tap, so ask on the first one.
  useEffect(() => {
    if (!shakeOn || motionGrantedRef.current) return
    const ask = async () => {
      window.removeEventListener('click', ask, true)
      const result = await requestMotionPermission()
      if (result === 'granted') {
        motionGrantedRef.current = true
      } else {
        setShakeOn(false)
        setShakeDenied(true)
      }
    }
    window.addEventListener('click', ask, true)
    return () => window.removeEventListener('click', ask, true)
  }, [shakeOn])

  const toggleShake = async () => {
    if (shakeOn) {
      setShakeOn(false)
      saveShakePref(false)
      return
    }
    if (!motionGrantedRef.current) {
      const result = await requestMotionPermission()
      if (result !== 'granted') {
        setShakeDenied(true)
        return
      }
      motionGrantedRef.current = true
    }
    setShakeDenied(false)
    setShakeOn(true)
    saveShakePref(true)
  }

  const shakeStatus = !shakeSupported
    ? UNSUPPORTED
    : shakeDenied
      ? 'Motion access was blocked. Allow it in your browser settings to use shake.'
      : null

  // --- Keyboard ---
  useEffect(() => {
    const onKey = (e) => {
      if (infoOpen) {
        if (e.key === 'Escape') setInfoOpen(false)
        return
      }
      if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') next()
      else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        setFlipped((f) => !f)
      } else if (e.key === 'r' || e.key === 'R') pickRandom()
      else if (e.key === 's' || e.key === 'S') reshuffle()
      else if (e.key === 'Escape') onBack()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev, pickRandom, reshuffle, onBack, infoOpen])

  const swipeHandlers = useSwipe({
    onSwipeLeft: next,
    onSwipeRight: prev,
  })

  const transitionClass = useMemo(() => {
    if (!transition) return ''
    return `is-${transition}`
  }, [transition])

  return (
    <main className="viewer">
      <Navigation
        onBack={onBack}
        onInfo={() => setInfoOpen(true)}
        current={index + 1}
        total={order.length}
      />

      {/* Card name sits above the card so it reads the same on both sides */}
      <h1 className="viewer__title" aria-live="polite">
        {currentCard.name}
      </h1>

      <div className="viewer__stage" {...swipeHandlers}>
        <button
          type="button"
          className="viewer__click-zone viewer__click-zone--left"
          onClick={(e) => {
            e.stopPropagation()
            prev()
          }}
          aria-label="Previous card"
        />
        <button
          type="button"
          className="viewer__click-zone viewer__click-zone--right"
          onClick={(e) => {
            e.stopPropagation()
            next()
          }}
          aria-label="Next card"
        />

        <FlipCard
          card={currentCard}
          flipped={flipped}
          onFlip={flip}
          transitionClass={transitionClass}
        />

        {shuffleFx && <ShuffleAnimation mode={shuffleFx} />}

        <div className="viewer__edge-hint viewer__edge-hint--left" aria-hidden="true">‹</div>
        <div className="viewer__edge-hint viewer__edge-hint--right" aria-hidden="true">›</div>
      </div>

      <button
        type="button"
        className="tool-btn tool-btn--primary"
        onClick={flip}
        aria-pressed={flipped}
      >
        ↻ Flip
      </button>

      <div className="viewer__tools">
        <button type="button" className="tool-btn" onClick={pickRandom}>
          ◆ Random
        </button>
        <button type="button" className="tool-btn" onClick={reshuffle}>
          ◇ Reshuffle
        </button>
      </div>

      {infoOpen && (
        <InfoPanel
          onClose={() => setInfoOpen(false)}
          shakeOn={shakeOn}
          shakeStatus={shakeStatus}
          onToggleShake={toggleShake}
        />
      )}
    </main>
  )
}

function vibrate(pattern) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern)
    } catch {
      /* ignore */
    }
  }
}

import { useEffect, useRef } from 'react'

export const UNSUPPORTED = 'Shake works on phones and tablets.'

// "How to use" sheet listing every way to move through the deck,
// plus the on/off switch for shake gestures.
export default function InfoPanel({ onClose, shakeOn, shakeStatus, onToggleShake }) {
  const closeRef = useRef(null)

  useEffect(() => {
    closeRef.current?.focus()
  }, [])

  const showComputer =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(hover: hover) and (pointer: fine)').matches

  return (
    <div className="info-overlay" onClick={onClose}>
      <div
        className="info-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="info-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="info-panel__close"
          onClick={onClose}
          aria-label="Close"
          ref={closeRef}
        >
          ×
        </button>

        <h2 id="info-title" className="info-panel__title">How to use the cards</h2>
        <div className="deco-rule" aria-hidden="true">
          <span className="deco-diamond" />
        </div>

        <ul className="info-list">
          <li><span className="info-list__how">Tap the card</span> or press <em>Flip</em> to turn it over and read the other side</li>
          <li><span className="info-list__how">Swipe left or right</span> for the next or previous card</li>
          <li><span className="info-list__how">Tap the left or right edge</span> of the card to step back or forward</li>
          <li><span className="info-list__how">Shake briefly</span> to draw a random card</li>
          <li><span className="info-list__how">Keep shaking</span> for a couple of seconds to reshuffle the whole deck</li>
          <li><span className="info-list__how">Random &amp; Reshuffle</span> buttons do the same as shaking</li>
          <li><span className="info-list__how">◁ Decks</span> takes you back to choose another deck</li>
        </ul>

        <div className="info-toggle">
          <div>
            <div className="info-toggle__label">Shake gestures</div>
            {shakeStatus && <div className="info-toggle__note">{shakeStatus}</div>}
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={shakeOn}
            aria-label="Shake gestures"
            className={`switch ${shakeOn ? 'is-on' : ''}`}
            onClick={onToggleShake}
            disabled={shakeStatus === UNSUPPORTED}
          >
            <span className="switch__knob" />
          </button>
        </div>

        {showComputer && (
          <>
            <h3 className="info-panel__subtitle">On a computer</h3>
            <ul className="info-list info-list--keys">
              <li><kbd>←</kbd> <kbd>→</kbd> previous / next card</li>
              <li><kbd>Space</kbd> or <kbd>Enter</kbd> flip the card</li>
              <li><kbd>R</kbd> random card · <kbd>S</kbd> reshuffle</li>
              <li><kbd>Esc</kbd> back to decks</li>
            </ul>
          </>
        )}

        <button type="button" className="tool-btn tool-btn--primary info-panel__done" onClick={onClose}>
          Got it
        </button>
      </div>
    </div>
  )
}

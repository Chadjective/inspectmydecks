import { useState } from 'react'
import { assetUrl } from '../utils/assetUrl.js'

const CARD_RATIO = 2 / 3
// Art within this much of the card's shape fills it edge to edge (trimming at
// most a sliver); anything further off is shown whole over the blurred backdrop.
const COVER_TOLERANCE = 0.07

export default function FlipCard({ card, flipped, onFlip, transitionClass }) {
  const imgSrc = assetUrl(card.image)
  const [imgFailed, setImgFailed] = useState(false)
  const [shownSrc, setShownSrc] = useState(imgSrc)
  const [cover, setCover] = useState(false)

  // Reset the image-error state when the card (and thus its image) changes —
  // otherwise one card with a missing image would force the fallback for every
  // card viewed after it. (React's recommended reset-on-prop-change pattern.)
  if (imgSrc !== shownSrc) {
    setShownSrc(imgSrc)
    setImgFailed(false)
    setCover(false)
  }

  return (
    <div
      className={[
        'flip-card',
        flipped ? 'is-flipped' : '',
        transitionClass || '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onFlip}
      role="button"
      aria-label={`${card.name}, tap to ${flipped ? 'see image' : 'read text'}`}
    >
      {/* IMAGE SIDE */}
      <div className="flip-card__face flip-card__face--front">
        {!imgFailed && imgSrc ? (
          <>
            {/* Blurred copy fills the card behind the full, uncropped image,
                since card art comes in many shapes (tall, square-ish, landscape). */}
            <img
              key={`${imgSrc}-backdrop`}
              className="flip-card__image-backdrop"
              src={imgSrc}
              alt=""
              aria-hidden="true"
              draggable={false}
            />
            <img
              key={imgSrc}
              className={`flip-card__image ${cover ? 'is-cover' : ''}`}
              src={imgSrc}
              alt={card.name}
              onLoad={(e) => {
                const { naturalWidth: w, naturalHeight: h } = e.currentTarget
                setCover(Math.abs(w / h / CARD_RATIO - 1) <= COVER_TOLERANCE)
              }}
              onError={() => setImgFailed(true)}
              draggable={false}
            />
          </>
        ) : (
          <div className="flip-card__image-fallback">
            <span>{card.name}</span>
          </div>
        )}
      </div>

      {/* TEXT SIDE */}
      <div className="flip-card__face flip-card__face--back">
        <CardTextSide card={card} />
      </div>
    </div>
  )
}

function CardTextSide({ card }) {
  return (
    <div className="card-text">
      <div className="card-text__type">{card.type}</div>
      <p className="card-text__description">{card.description}</p>

      <div className="deco-rule" aria-hidden="true">
        <span className="deco-diamond" />
      </div>

      <p className="card-text__body">{card.text}</p>

      {card.attribution ? (
        <p className="card-text__attribution">— {card.attribution}</p>
      ) : (
        <div className="deco-rule" aria-hidden="true">
          <span className="deco-diamond" />
        </div>
      )}
    </div>
  )
}

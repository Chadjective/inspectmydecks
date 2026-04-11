import { useState } from 'react'
import { assetUrl } from '../utils/assetUrl.js'

export default function FlipCard({ card, flipped, onFlip, transitionClass }) {
  const [imgFailed, setImgFailed] = useState(false)

  // Reset image error state when card changes
  const imgSrc = assetUrl(card.image)

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
          <img
            key={imgSrc}
            className="flip-card__image"
            src={imgSrc}
            alt={card.name}
            onError={() => setImgFailed(true)}
            draggable={false}
          />
        ) : (
          <div className="flip-card__image-fallback">
            <span>{card.name}</span>
          </div>
        )}
        <div className="flip-card__image-frame" aria-hidden="true" />
        <div className="flip-card__image-label">
          {String(card.number).padStart(2, '0')} · {card.name}
        </div>
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
      <h3 className="card-text__name">{card.name}</h3>
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

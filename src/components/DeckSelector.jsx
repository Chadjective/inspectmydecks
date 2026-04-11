import { useState } from 'react'
import { decks } from '../data/decks.js'
import { assetUrl } from '../utils/assetUrl.js'

export default function DeckSelector({ onSelect }) {
  return (
    <main className="deck-selector">
      <header className="deck-selector__header">
        <p className="deck-selector__eyebrow">Semillero</p>
        <h1 className="deck-selector__title">Choose a deck</h1>
        <p className="deck-selector__subtitle">
          A garden of questions, reflections, and quiet invitations.
        </p>
        <div className="deco-rule" style={{ marginTop: 20 }}>
          <span className="deco-diamond" />
        </div>
      </header>

      <section className="deck-grid">
        {decks.map((deck) => (
          <DeckCard key={deck.id} deck={deck} onSelect={onSelect} />
        ))}
      </section>
    </main>
  )
}

function DeckCard({ deck, onSelect }) {
  const [failed, setFailed] = useState(false)
  const hero = assetUrl(deck.heroImage)

  return (
    <button
      type="button"
      className="deck-card"
      onClick={() => onSelect(deck.id)}
      aria-label={`Open deck: ${deck.name}`}
    >
      {!failed && hero ? (
        <img
          className="deck-card__image"
          src={hero}
          alt=""
          onError={() => setFailed(true)}
          draggable={false}
        />
      ) : (
        <div className="deck-card__image-fallback" aria-hidden="true">
          ◆
        </div>
      )}
      <div className="deck-card__scrim" aria-hidden="true" />
      <div className="deck-card__body">
        <div className="deck-card__count">{deck.cards.length} cards</div>
        <h2 className="deck-card__name">{deck.name}</h2>
        <p className="deck-card__subtitle">{deck.subtitle}</p>
      </div>
    </button>
  )
}

export default function Navigation({ onBack, current, total, deckName }) {
  return (
    <nav className="nav" aria-label="Card navigation">
      <button
        type="button"
        className="nav__back"
        onClick={onBack}
        aria-label="Back to deck selection"
      >
        <span aria-hidden="true">◁</span>
        <span>Decks</span>
      </button>
      <span style={{ color: 'var(--ink-dim)' }}>{deckName}</span>
      <span className="nav__counter">
        {String(current).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </span>
    </nav>
  )
}

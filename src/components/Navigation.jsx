export default function Navigation({ onBack, onInfo, current, total }) {
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
      <div className="nav__right">
        <span className="nav__counter">
          {String(current).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
        <button
          type="button"
          className="nav__info"
          onClick={onInfo}
          aria-label="How to use the cards"
        >
          <span aria-hidden="true">i</span>
        </button>
      </div>
    </nav>
  )
}

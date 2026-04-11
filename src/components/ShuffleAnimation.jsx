// Overlay effect: rapid sequential card-edge flashes on top of the viewer.
// `mode` is 'riffle' (short, ~420ms) or 'shuffle' (long, ~820ms).
// `count` controls how many ghost cards animate.
export default function ShuffleAnimation({ mode = 'riffle', count = 6 }) {
  const cards = Array.from({ length: count })
  return (
    <div
      className={`shuffle-overlay is-${mode}`}
      aria-hidden="true"
    >
      {cards.map((_, i) => (
        <div
          key={i}
          className="shuffle-overlay__card"
          style={{ animationDelay: `${i * (mode === 'shuffle' ? 70 : 40)}ms` }}
        />
      ))}
    </div>
  )
}

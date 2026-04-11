import { useEffect, useState } from 'react'
import DeckSelector from './components/DeckSelector.jsx'
import CardViewer from './components/CardViewer.jsx'
import { getDeck } from './data/decks.js'

// Minimal hash-based router so GitHub Pages works with no server rewrites.
function readRoute() {
  const hash = window.location.hash.replace(/^#\/?/, '')
  if (!hash) return { view: 'decks' }
  const [kind, id] = hash.split('/')
  if (kind === 'deck' && id) return { view: 'viewer', deckId: id }
  return { view: 'decks' }
}

export default function App() {
  const [route, setRoute] = useState(readRoute)

  useEffect(() => {
    const onHash = () => setRoute(readRoute())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const goToDeck = (id) => {
    window.location.hash = `#/deck/${id}`
  }

  const goHome = () => {
    window.location.hash = ''
  }

  if (route.view === 'viewer') {
    const deck = getDeck(route.deckId)
    if (!deck) {
      return (
        <div className="app">
          <DeckSelector onSelect={goToDeck} />
        </div>
      )
    }
    return (
      <div className="app">
        <CardViewer deck={deck} onBack={goHome} />
      </div>
    )
  }

  return (
    <div className="app">
      <DeckSelector onSelect={goToDeck} />
    </div>
  )
}

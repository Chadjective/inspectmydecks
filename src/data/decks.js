import obscureGeometries from './obscure-geometries.json'
import fruits from './fruits.json'
import herbsAndSpices from './herbs-and-spices.json'
import trees from './trees.json'

// Central deck registry. Add new decks here — no other code changes needed.
export const decks = [obscureGeometries, fruits, herbsAndSpices, trees]

export function getDeck(id) {
  return decks.find((d) => d.id === id)
}

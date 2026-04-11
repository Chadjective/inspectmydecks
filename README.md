# Semillero — Digital Card Viewer

A digital viewer for the Semillero trauma-informed facilitation card deck.

## Develop

```bash
npm install
npm run dev
```

## Build for GitHub Pages

```bash
npm run build
```

Output goes to `/docs` so GitHub Pages can serve it directly from the `main` branch. Set the repo's Pages source to `main` → `/docs`.

If your repo isn't named `semillero`, pass the base path at build time:

```bash
VITE_BASE=/my-repo-name/ npm run build
```

## Adding a new deck

1. Add a JSON file to `src/data/` (follow the shape of `obscure-geometries.json`).
2. Drop card images into `public/images/{deck-id}/` as `{number}-{slug}.jpg`.
3. Add a hero image to `public/images/decks/{deck-id}-hero.jpg`.
4. Register the deck in `src/data/decks.js`.

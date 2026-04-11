// Resolves a relative asset path against Vite's BASE_URL so it works both
// locally and when deployed to a subpath on GitHub Pages.
export function assetUrl(path) {
  if (!path) return ''
  const base = import.meta.env.BASE_URL || '/'
  const cleaned = path.replace(/^\/+/, '')
  return base.endsWith('/') ? base + cleaned : base + '/' + cleaned
}

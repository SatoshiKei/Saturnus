/** Resolve public asset paths with Vite base URL. */
export function assetPath(relative: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, '/')
  const clean = relative.replace(/^\//, '')
  return `${base}${clean}`
}

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]'])

/** Ambiente local (dev server, preview em máquina de desenvolvimento). */
export function isLocalhostHost(): boolean {
  if (typeof window === 'undefined') return false
  return LOCAL_HOSTS.has(window.location.hostname)
}

/** Botões QA na bancada forense — só em `npm run dev` na máquina local. */
export function showForensicDevToolbar(): boolean {
  return import.meta.env.DEV && isLocalhostHost()
}

/** Galeria do menu: tudo liberado só em localhost (dev/QA). */
export function isSceneGalleryFullyUnlocked(): boolean {
  return isLocalhostHost()
}
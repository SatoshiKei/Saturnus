import { assetPath } from './assetPath'
import { sceneBackgrounds } from '../data/sceneIntros'
import type { LocationSceneId } from '../app/GameHubContext'

const W = 320
const H = 180
const HUB_BG = '/assets/scene/hub-office-bg.jpg'

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

/** Background representativo da cena (sem UI de overlay). */
export function resolveSceneBackgroundSrc(locationScene?: LocationSceneId | null): string {
  if (locationScene && locationScene in sceneBackgrounds) {
    return sceneBackgrounds[locationScene as keyof typeof sceneBackgrounds]
  }
  return HUB_BG
}

/**
 * Miniatura 16:9 a partir do fundo da localização estável.
 * Não captura menu/dev/notices — só o background da cena.
 */
export async function captureSaveThumbnail(opts?: {
  backgroundSrc?: string | null
  locationScene?: LocationSceneId | null
}): Promise<string | null> {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    const bg = opts?.backgroundSrc || resolveSceneBackgroundSrc(opts?.locationScene)
    const img = await loadImage(assetPath(bg))
    if (img) {
      const scale = Math.max(W / img.naturalWidth, H / img.naturalHeight)
      const dw = img.naturalWidth * scale
      const dh = img.naturalHeight * scale
      ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh)
    } else {
      ctx.fillStyle = '#141820'
      ctx.fillRect(0, 0, W, H)
      ctx.strokeStyle = 'rgba(226,223,213,0.12)'
      ctx.strokeRect(8, 8, W - 16, H - 16)
    }
    const g = ctx.createLinearGradient(0, 0, 0, H)
    g.addColorStop(0, 'rgba(6,8,11,0.12)')
    g.addColorStop(1, 'rgba(6,8,11,0.48)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)
    return canvas.toDataURL('image/jpeg', 0.68)
  } catch {
    return null
  }
}

import { assetPath } from './assetPath'

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

/** Miniatura leve: fundo da mesa + vinheta. Sem html2canvas. */
export async function captureSaveThumbnail(): Promise<string | null> {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    const img = await loadImage(assetPath(HUB_BG))
    if (img) {
      const scale = Math.max(W / img.naturalWidth, H / img.naturalHeight)
      const dw = img.naturalWidth * scale
      const dh = img.naturalHeight * scale
      ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh)
    } else {
      ctx.fillStyle = '#0a0d11'
      ctx.fillRect(0, 0, W, H)
    }
    const g = ctx.createLinearGradient(0, 0, 0, H)
    g.addColorStop(0, 'rgba(6,8,11,0.15)')
    g.addColorStop(1, 'rgba(6,8,11,0.55)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)
    return canvas.toDataURL('image/jpeg', 0.62)
  } catch {
    return null
  }
}

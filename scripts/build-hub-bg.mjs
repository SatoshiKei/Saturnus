/**
 * Monta o background da sala do delegado a partir do RAW (nunca sobrescrito):
 *   assets/backgrounds/raw/police/police-05-chief-office.jpg  (3543×2397, Pexels / Luke Dang)
 *
 * 1. recorta a borda de scan de filme;
 * 2. posiciona a mesa original da foto exatamente atrás da mesa de primeiro plano;
 * 3. estende lateral/base por espelhamento (áreas cobertas por vinheta/mesa);
 * 4. aplica o filtro Saturnus: desaturação, contraste, frio/neutro, leve perda de nitidez,
 *    compressão tonal, grain e vinheta discreta.
 *
 * Saída: 2560×1440 → assets/backgrounds/processed/police/police-05-chief-office.jpg
 *        e public/assets/scene/hub-office-bg.jpg
 */
import { mkdir, copyFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const input = join(root, 'assets/backgrounds/raw/police/police-05-chief-office.jpg')
const processed = join(root, 'assets/backgrounds/processed/police/police-05-chief-office.jpg')
const publicOut = join(root, 'public/assets/scene/hub-office-bg.jpg')

const OUT_W = 2560
const OUT_H = 1440
/** px de origem → px de saída */
const S = 0.72
/** recorte da borda do scan */
const CROP = { left: 70, top: 676, width: 3403 }
const SRC_BOTTOM = 2347

function noiseLayer(w, h, alpha = 22) {
  const buf = Buffer.alloc(w * h * 4)
  for (let i = 0; i < w * h; i++) {
    const v = 128 + Math.floor((Math.random() - 0.5) * 70)
    buf[i * 4] = v
    buf[i * 4 + 1] = v
    buf[i * 4 + 2] = v
    buf[i * 4 + 3] = alpha
  }
  return sharp(buf, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer()
}

const vignette = (w, h) =>
  Buffer.from(`
<svg width="${w}" height="${h}">
  <defs>
    <radialGradient id="v" cx="50%" cy="46%" r="78%">
      <stop offset="55%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.38"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#v)"/>
</svg>`)

async function main() {
  const srcH = SRC_BOTTOM - CROP.top
  const scaledW = Math.round(CROP.width * S)
  const scaledH = Math.round(srcH * S)
  const padX = Math.floor((OUT_W - scaledW) / 2)
  const padRight = OUT_W - scaledW - padX
  const padBottom = OUT_H - scaledH

  const base = await sharp(input)
    .rotate()
    .extract({ left: CROP.left, top: CROP.top, width: CROP.width, height: srcH })
    .resize(scaledW, scaledH, { kernel: 'lanczos3' })
    .extend({
      left: padX,
      right: padRight,
      bottom: padBottom,
      extendWith: 'mirror',
    })
    .modulate({ saturation: 0.42, brightness: 0.9 })
    .linear(1.1, -9)
    .recomb([
      [0.9, 0.06, 0.04],
      [0.02, 0.93, 0.05],
      [0.0, 0.1, 1.04],
    ])
    .blur(0.55)
    .toBuffer()

  const grain = await noiseLayer(OUT_W, OUT_H)
  await mkdir(dirname(processed), { recursive: true })
  await sharp(base)
    .composite([
      { input: grain, blend: 'overlay' },
      { input: vignette(OUT_W, OUT_H), blend: 'multiply' },
    ])
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(processed)
  await mkdir(dirname(publicOut), { recursive: true })
  await copyFile(processed, publicOut)
  console.log('ok', OUT_W, OUT_H, { padX, padRight, padBottom, scaledW, scaledH })
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

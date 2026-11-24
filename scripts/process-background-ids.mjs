/** Processa só ids do manifest (ex.: `node scripts/process-background-ids.mjs geraldo-bar sandra-home`). */
import { readFile, mkdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const ids = new Set(process.argv.slice(2))
if (!ids.size) {
  console.error('Usage: process-background-ids.mjs <manifest-id> ...')
  process.exit(1)
}

const manifest = JSON.parse(await readFile(join(root, 'assets/manifest/backgrounds.json'), 'utf8'))
const outRoot = join(root, 'assets/backgrounds/processed')

const vignetteSvg = (w, h) =>
  Buffer.from(`
<svg width="${w}" height="${h}">
  <defs>
    <radialGradient id="v" cx="50%" cy="50%" r="72%">
      <stop offset="50%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.42"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#v)"/>
</svg>`)

function toneForItem(item) {
  if (item.processDark) return { saturation: 0.6, brightness: 0.44 }
  if (item.processNightSource) return { saturation: 0.65, brightness: 0.72 }
  if (item.processNight) return { saturation: 0.58, brightness: 0.38 }
  return { saturation: 0.72, brightness: 0.96 }
}

async function processOne(inputPath, outputPath, item) {
  const meta = await sharp(inputPath).metadata()
  let input = sharp(inputPath).rotate()
  if (item.cropLandscape && meta.width && meta.height && meta.height > meta.width) {
    const cropH = Math.floor(meta.width * (9 / 16))
    const top = Math.max(0, Math.floor((meta.height - cropH) * 0.42))
    input = input.extract({
      left: 0,
      top,
      width: meta.width,
      height: Math.min(cropH, meta.height - top),
    })
  }
  const width = Math.min((await input.metadata()).width ?? 1920, 1920)

  let pipe = input.resize({ width, withoutEnlargement: true })
  pipe = pipe.modulate(toneForItem(item))

  const mid = await pipe
    .linear(1.06, -6)
    .blur(0.35)
    .recomb([
      [0.95, 0.05, 0.02],
      [0.03, 0.92, 0.05],
      [0.02, 0.06, 0.88],
    ])
    .toBuffer({ resolveWithObject: true })

  const w = mid.info.width
  const h = mid.info.height

  const noise = Buffer.alloc(w * h * 4)
  for (let i = 0; i < w * h; i++) {
    const v = 128 + Math.floor((Math.random() - 0.5) * 40)
    noise[i * 4] = v
    noise[i * 4 + 1] = v
    noise[i * 4 + 2] = v
    noise[i * 4 + 3] = 18
  }
  const grain = await sharp(noise, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer()

  await sharp(mid.data)
    .composite([
      { input: grain, blend: 'overlay' },
      { input: vignetteSvg(w, h), blend: 'multiply' },
    ])
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(outputPath)
}

for (const item of manifest.filter((m) => ids.has(m.id))) {
  const input = join(root, 'assets/backgrounds/raw', item.category, item.filename)
  const output = join(
    outRoot,
    item.category,
    item.filename.replace(/\.(jpg|jpeg|png)$/i, '.jpg'),
  )
  await mkdir(dirname(output), { recursive: true })
  await processOne(input, output, item)
  const tag = item.processDark ? 'dark' : item.processNightSource ? 'night-src' : item.processNight ? 'night' : ''
  console.log('processed', item.id, tag, '->', output)
}
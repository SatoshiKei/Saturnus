/**
 * Pipeline visual VN (foto real estilo Umineko/indie):
 * desaturação leve, contraste, blur sutil, vinheta, granulação, tom melancólico.
 * Nunca sobrescreve raw/.
 */
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { join, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const manifestPath = join(root, 'assets/manifest/backgrounds.json')
const rawRoot = join(root, 'assets/backgrounds/raw')
const outRoot = join(root, 'assets/backgrounds/processed')

const vignetteSvg = (w, h) => Buffer.from(`
<svg width="${w}" height="${h}">
  <defs>
    <radialGradient id="v" cx="50%" cy="50%" r="72%">
      <stop offset="50%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.42"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#v)"/>
</svg>`)

async function processOne(inputPath, outputPath) {
  const meta = await sharp(inputPath).metadata()
  const width = Math.min(meta.width ?? 1920, 1920)

  const mid = await sharp(inputPath)
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .modulate({ saturation: 0.72, brightness: 0.96 })
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

async function main() {
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
  const toProcess = manifest.filter((m) => m.process)
  await mkdir(outRoot, { recursive: true })

  const processed = []
  for (const item of toProcess) {
    const input = join(rawRoot, item.category, item.filename)
    const output = join(outRoot, item.category, item.filename.replace(/\.(jpg|jpeg|png)$/i, '.jpg'))
    try {
      await mkdir(dirname(output), { recursive: true })
      await processOne(input, output)
      processed.push({ id: item.id, output: relative(root, output).replace(/\\/g, '/') })
      console.log('processed', item.id)
    } catch (e) {
      console.error('skip', item.id, e.message)
    }
  }

  await writeFile(
    join(root, 'assets/manifest/process-log.json'),
    JSON.stringify({ at: new Date().toISOString(), processed }, null, 2),
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

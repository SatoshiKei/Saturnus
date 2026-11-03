import { mkdir, writeFile, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

async function download(url, dest) {
  const res = await fetch(url, { redirect: 'follow' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  await mkdir(dirname(dest), { recursive: true })
  await writeFile(dest, buf)
  return buf.length
}

async function fetchManifest(manifestPath, rawBase) {
  const list = JSON.parse(await readFile(manifestPath, 'utf8'))
  const log = []
  for (const item of list) {
    const dest = join(rawBase, item.category ?? 'misc', item.filename)
    const urls = [item.url, item.urlFallback].filter(Boolean)
    let ok = false
    let lastErr = ''
    for (const url of urls) {
      try {
        const bytes = await download(url, dest)
        log.push({ ...item, status: 'ok', bytes, usedUrl: url, localPath: dest.replace(root + '\\', '').replace(root + '/', '') })
        ok = true
        break
      } catch (e) {
        lastErr = String(e)
      }
    }
    if (!ok) {
      log.push({ ...item, status: 'failed', error: lastErr })
      console.error('FAIL', item.id, lastErr)
    } else {
      console.log('OK', item.id)
    }
  }
  return log
}

async function main() {
  const bgLog = await fetchManifest(
    join(root, 'assets/manifest/backgrounds.json'),
    join(root, 'assets/backgrounds/raw'),
  )
  const propLog = await fetchManifest(
    join(root, 'assets/manifest/props.json'),
    join(root, 'assets/props/raw'),
  )
  await mkdir(join(root, 'assets/backgrounds/processed'), { recursive: true })
  await mkdir(join(root, 'assets/props/processed'), { recursive: true })
  await mkdir(join(root, 'assets/references'), { recursive: true })
  await writeFile(
    join(root, 'assets/manifest/download-log.json'),
    JSON.stringify({ at: new Date().toISOString(), backgrounds: bgLog, props: propLog }, null, 2),
  )
  const failed = [...bgLog, ...propLog].filter((x) => x.status === 'failed').length
  console.log(`Done. Failed: ${failed}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

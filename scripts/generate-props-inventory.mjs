import { readFile, writeFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

async function main() {
  const manifest = JSON.parse(await readFile(join(root, 'assets/manifest/props.json'), 'utf8'))
  let log = { props: [] }
  try {
    const full = JSON.parse(await readFile(join(root, 'assets/manifest/download-log.json'), 'utf8'))
    log.props = full.props ?? []
  } catch {
    /* empty */
  }
  const byId = Object.fromEntries(log.props.map((p) => [p.id, p]))

  const lines = manifest.map((p) => {
    const st = byId[p.id]
    const raw = `assets/props/raw/${p.filename}`
    return `| ${p.filename} | ${raw} | ${p.source} | ${p.license} | ${p.tags?.join(', ')} | ${st?.status ?? '—'} | ${p.notes} |`
  })

  const md = `# Inventário de props — SATURNUS

Objetos para recorte/hotspot (não canon). Ver \`assets/manifest/props.json\`.

| Arquivo | Raw | Fonte | Licença | Tags | Download | Observações |
| --- | --- | --- | --- | --- | --- | --- |
${lines.join('\n')}
`
  await writeFile(join(root, 'docs/assets/props-inventory.md'), md, 'utf8')
  console.log('Wrote docs/assets/props-inventory.md')
}

main()

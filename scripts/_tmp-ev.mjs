import fs from 'fs'
const t = fs.readFileSync('src/data/game/seedEvidence.ts', 'utf8')
const hidden = new Set(
  [
    ...t
      .slice(t.indexOf('CATALOG_HIDDEN_IDS'), t.indexOf('for (const e of seedEvidenceCatalog)'))
      .matchAll(/'([^']+)'/g),
  ]
    .map((m) => m[1])
    .filter((x) => !x.includes('CATALOG')),
)
const start = t.indexOf('export const seedEvidenceCatalog')
const end = t.indexOf('\n]', start)
const catalog = t.slice(start, end)
const parts = catalog.split(/\n  \},\n  \{/)
const rows = []
for (const part of parts) {
  const id = part.match(/id: '([^']+)'/)?.[1]
  if (!id) continue
  const title = part.match(/title:\s*'([^']*)'/)?.[1] ?? ''
  const type = part.match(/type: '([^']+)'/)?.[1] ?? ''
  if (!hidden.has(id)) rows.push({ id, title, type })
}
fs.writeFileSync('scripts/_tmp-ev.json', JSON.stringify({ count: rows.length, rows }, null, 2))
console.log(rows.length, 'audio', rows.filter((r) => r.type === 'audio').length, 'hidden', hidden.size)

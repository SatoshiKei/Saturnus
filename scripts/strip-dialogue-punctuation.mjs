/**
 * Remove em/en dashes and semicolons from in-world dialogue strings.
 * Usage: node scripts/strip-dialogue-punctuation.mjs
 */
import fs from 'fs'
import path from 'path'

const ROOT = path.join(import.meta.dirname, '..')
const SCAN_DIRS = [
  path.join(ROOT, 'src/data'),
  path.join(ROOT, 'src/components/story'),
  path.join(ROOT, 'src/components/investigation'),
]

const SKIP_BASENAMES = new Set(['MariCompanionHost.tsx', 'MariWorkbenchHints.tsx'])

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory() && e.name !== 'node_modules') walk(p, acc)
    else if (/\.tsx?$/.test(e.name)) acc.push(p)
  }
  return acc
}

function cleanDialogue(s) {
  return s
    .replace(/\s*[\u2014\u2013]\s*/g, ', ')
    .replace(/;\s*/g, ', ')
    .replace(/\s+,/g, ',')
    .replace(/,\s*,+/g, ', ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

const reKeyed =
  /(text|thought|body|message|label|hint|choiceHint|continueLabel|openingLine|closingLine|lastPreview|summary|choiceHint):\s*'((?:\\.|[^'\\])*)'/g

const reBlockLine = /^\s*'((?:\\.|[^'\\])*)',?\s*$/

function shouldSkipLine(line) {
  if (/lastTime:\s*'/.test(line)) return true
  if (/start:\s*'—'/.test(line)) return true
  if (/lastPreview.*'—'/.test(line)) return true
  if (/: '—'/.test(line) && !/text:/.test(line)) return true
  return false
}

function isNarrativeFile(filePath) {
  const rel = path.relative(ROOT, filePath).replace(/\\/g, '/')
  if (SKIP_BASENAMES.has(path.basename(filePath))) return false
  if (!rel.startsWith('src/data/') && !rel.startsWith('src/components/story/')) {
    if (rel.startsWith('src/components/investigation/')) {
      return /^Mari/.test(path.basename(filePath))
    }
    return false
  }
  if (rel.includes('/game/seedDocuments')) return false
  if (rel.includes('/game/seedEvidence')) return false
  if (rel.includes('/game/seedStory')) return false
  if (rel.includes('/game/seedAchievements')) return false
  if (rel.includes('/linkBoard/')) return false
  if (rel.includes('/forensic/')) return false
  if (/puzzle\d|Puzzle\.ts$/i.test(rel) || /\/block\d+\/\w*[Pp]uzzle/.test(rel)) return false
  return true
}

let fileCount = 0
let changeCount = 0

for (const dir of SCAN_DIRS) {
  if (!fs.existsSync(dir)) continue
  for (const file of walk(dir)) {
    if (!isNarrativeFile(file)) continue

    let content = fs.readFileSync(file, 'utf8')
    let changed = false

    content = content.replace(reKeyed, (match, _key, inner) => {
      if (!/[;\u2014\u2013]/.test(inner)) return match
      const next = cleanDialogue(inner)
      if (next === inner) return match
      changeCount++
      changed = true
      return match.replace(inner, next)
    })

    const lines = content.split('\n')
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (shouldSkipLine(line)) continue
      const m = line.match(reBlockLine)
      if (!m) continue
      const inner = m[1]
      if (!/[;\u2014\u2013]/.test(inner)) continue
      const next = cleanDialogue(inner)
      if (next === inner) continue
      lines[i] = line.replace(inner, next)
      changeCount++
      changed = true
    }

    if (changed) {
      fs.writeFileSync(file, lines.join('\n'))
      fileCount++
      console.log('updated', path.relative(ROOT, file))
    }
  }
}

console.log(`Done: ${fileCount} files, ${changeCount} strings.`)
import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'

const ROOT = resolve(process.cwd())

/** Documentos canônicos atuais — não podem apresentar a pasta da Júlia como canon. */
const ACTIVE_DOCS = [
  'docs/WALKTHROUGH.md',
  'docs/WALKTHROUGH.txt',
  'docs/WALKTHROUGH_GUIA.md',
  'docs/SATURNUS_SPEC_WALKTHROUGH.md',
  'docs/story/BLOCK_01_DISAPPEARANCE.md',
  'docs/audits/SATURNUS_SEMANTIC_AUDIT.md',
]

const LEGACY_MARKERS = ['LEGACY', 'OUTDATED', 'histórico', 'snapshot']

describe('Julia folder — canon docs scrub', () => {
  it('walkthroughs/story ativos não pedem recolher pasta da Júlia', () => {
    for (const rel of ACTIVE_DOCS) {
      const path = resolve(ROOT, rel)
      let text: string
      try {
        text = readFileSync(path, 'utf8')
      } catch {
        // SEMANTIC_AUDIT pode ainda estar sendo reescrito; skip se ausente.
        continue
      }
      expect(text, rel).not.toMatch(/recolher pasta (deixada com |entregue a )?J[uú]lia/i)
      expect(text, rel).not.toMatch(/task_julia_folder/)
      // Menções históricas de auditoria ok se marcadas; pendências de pasta como objetivo ativo não.
      if (/pasta que J[uú]lia guardava/i.test(text) || /pasta da J[uú]lia/i.test(text)) {
        expect(text, `${rel} should mark legacy or scrub`).toMatch(
          new RegExp(`(${LEGACY_MARKERS.join('|')}|removid|n[aã]o (é|e) canon|runtime já)`, 'i'),
        )
      }
    }
  })

  it('runtime player-facing handlers não adicionam julia_kept_folder', () => {
    const handlersDir = resolve(ROOT, 'src/game/story')
    const files = readdirSync(handlersDir).filter((f) => f.endsWith('Handlers.ts'))
    for (const f of files) {
      const text = readFileSync(resolve(handlersDir, f), 'utf8')
      expect(text, f).not.toMatch(/addEvidence',\s*id:\s*'julia_kept_folder'/)
      expect(text, f).not.toMatch(/task_julia_folder/)
    }
  })
})

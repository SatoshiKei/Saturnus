import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { seedAchievements } from '../../src/data/game/seedAchievements'
import { buildStateFromActions } from '../../src/game/state/gameSave'
import { getCumulativeActions } from '../../src/game/story/devCheckpointCatalog'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

function stateAt(checkpointId: string) {
  return buildStateFromActions(getCumulativeActions(checkpointId))
}

const PUZZLE_ACHIEVEMENTS = [
  'ach-cassini-division',
  'ach-iapetus',
  'ach-rings',
  'ach-janus-epimetheus',
  'ach-saturnalia',
  'ach-hexagon',
  'ach-shepherd-moons',
  'ach-enceladus',
  'ach-cassini-huygens',
  'ach-ordem-aneis',
  'ach-rotacao-saturno',
  'ach-memoria',
] as const

const FUTURE_SPOILERS = [
  'morsa_was_andre',
  'scale_links_callsign_to_augusto',
  'mariana_confirmed_dead',
  'final_audio_impossible_provenance',
  'memory_word_revealed',
  'ricardo_was_henrique_valenca',
] as const

describe('progressão canônica DEV', () => {
  it('alcança os nove blocos e o final', () => {
    const end = stateAt('b09-end')
    for (const flag of [
      'block01_complete',
      'block02_complete',
      'block03_complete',
      'block04_complete',
      'block05_complete',
      'block06_complete',
      'block07_complete',
      'block08_complete',
      'block09_complete',
      'saturnus_complete',
    ]) {
      expect(end.flags[flag], flag).toBe(true)
    }
    expect(end.flags.block09_memory_done).toBe(true)
    expect(end.evidenceOwned).toContain('memory_word_revealed')
  })

  it('os doze puzzles ficam concluídos no estado final, na ordem dos checkpoints', () => {
    const steps: { id: string; flag: string }[] = [
      { id: 'b01-after-call', flag: 'block01_emergency_provisional' },
      { id: 'b02-vertice-unlocked', flag: 'block02_rafael_forward_provisional' },
      { id: 'b02-nico-identified', flag: 'block02_rings_provisional' },
      { id: 'b03-janus-done', flag: 'block03_janus_done' },
      { id: 'b03-saturnalia-done', flag: 'block03_saturnalia_done' },
      { id: 'b04-hex-done', flag: 'block04_hexagon_done' },
      { id: 'b06-pastor-done', flag: 'block06_pastor_done' },
      { id: 'b07-enceladus-done', flag: 'block07_enceladus_done' },
      { id: 'b07-end', flag: 'block07_cassini_done' },
      { id: 'b08-rings-done', flag: 'block08_morsa_continuity_confirmed' },
      { id: 'b08-rotation-done', flag: 'block08_rotation_done' },
      { id: 'b09-end', flag: 'block09_memory_done' },
    ]
    let previousIndex = -1
    const catalogOrder = steps.map((s) => s.id)
    for (const step of steps) {
      const idx = catalogOrder.indexOf(step.id)
      expect(idx).toBeGreaterThan(previousIndex)
      previousIndex = idx
      expect(stateAt(step.id).flags[step.flag], `${step.id} → ${step.flag}`).toBe(true)
    }

    const end = stateAt('b09-end')
    for (const id of PUZZLE_ACHIEVEMENTS) {
      const def = seedAchievements.find((a) => a.id === id)
      expect(def, id).toBeTruthy()
      expect(def!.unlocked(end), id).toBe(true)
      expect(end.achievementUnlocks[id], id).toBeTruthy()
    }
  })

  it('Saturnalia não identifica Samuel', () => {
    const s = stateAt('b03-saturnalia-done')
    expect(s.flags.block03_saturnalia_done).toBe(true)
    expect(s.people.morsa.status).toBe('identified')
    expect(s.people.samuel.status).not.toBe('identified')
    expect(s.people.samuel.status).not.toBe('located')
    expect(s.evidenceOwned).not.toContain('morsa_was_andre')
  })

  it('não revela Morsa=André, VTR-14, morte ou MEMÓRIA antes do marco', () => {
    const beforeMorsa = stateAt('b08-rings-timeline')
    expect(beforeMorsa.evidenceOwned).not.toContain('morsa_was_andre')
    expect(beforeMorsa.flags.block08_morsa_continuity_confirmed).toBeFalsy()

    const beforeScale = stateAt('b08-rotation-done')
    expect(beforeScale.evidenceOwned).not.toContain('scale_links_callsign_to_augusto')
    expect(beforeScale.flags.block08_augusto_linked).toBeFalsy()

    const beforeHenrique = stateAt('b07-ricardo-found')
    expect(beforeHenrique.evidenceOwned).not.toContain('ricardo_was_henrique_valenca')
    expect(beforeHenrique.evidenceOwned).not.toContain('henrique_named_by_aster')
    expect(beforeHenrique.people.henrique?.status ?? 'unknown').not.toBe('identified')

    const beforeDeath = stateAt('b09-roberto-messages')
    expect(beforeDeath.evidenceOwned).not.toContain('mariana_confirmed_dead')
    expect(beforeDeath.flags.block09_mariana_dead).toBeFalsy()

    const beforeMemory = stateAt('b09-memory-ready')
    expect(beforeMemory.evidenceOwned).not.toContain('final_audio_impossible_provenance')
    expect(beforeMemory.evidenceOwned).not.toContain('memory_word_revealed')
    expect(beforeMemory.flags.block09_memory_done).toBeFalsy()

    const early = stateAt('b04-start')
    for (const id of FUTURE_SPOILERS) {
      expect(early.evidenceOwned, id).not.toContain(id)
    }
  })
})

describe('assets públicos referenciados', () => {
  it('todo path /assets/ citado no runtime existe em public/', () => {
    const roots = [
      'src/forensic',
      'src/data',
      'src/components/investigation',
      'src/components/story',
    ]
    const missing: string[] = []
    const seen = new Set<string>()
    const re = /['"`](\/assets\/[^'"`\s?#]+\.[a-zA-Z0-9]{2,5})['"`]/g

    function walk(dir: string) {
      for (const name of readdirSync(dir)) {
        const full = path.join(dir, name)
        if (statSync(full).isDirectory()) {
          walk(full)
          continue
        }
        if (!/\.(ts|tsx|json)$/.test(name)) continue
        const text = readFileSync(full, 'utf8')
        for (const match of text.matchAll(re)) {
          const url = match[1]
          if (url.includes('${') || seen.has(url)) continue
          seen.add(url)
          const file = path.join(root, 'public', decodeURIComponent(url.replace(/^\//, '')))
          if (!statExists(file)) missing.push(`${url}  ←  ${path.relative(root, full)}`)
        }
      }
    }

    for (const rel of roots) walk(path.join(root, rel))

    for (let i = 0; i < 10; i++) {
      const id = `RC_SLOT_0${i}`
      const url = `/assets/audio/forensic/puzzle05/${id}.mp3`
      const file = path.join(root, 'public', url.replace(/^\//, ''))
      if (!statExists(file)) missing.push(`${url}  ←  puzzle05 slot`)
    }

    const rings = readFileSync(path.join(root, 'src/data/block08/ringsPuzzle.ts'), 'utf8').replaceAll(
      '${P10_ASSETS}',
      '/assets/block08/rings/p10',
    )
    for (const match of rings.matchAll(/\/assets\/[^'"`\n]+?\.(?:png|wav|mp3|ogg|json|pcap)/g)) {
      const url = match[0]
      if (seen.has(url)) continue
      seen.add(url)
      const file = path.join(root, 'public', decodeURIComponent(url.replace(/^\//, '')))
      if (!statExists(file)) missing.push(`${url}  ←  ringsPuzzle.ts`)
    }

    expect(missing, missing.join('\n')).toEqual([])
    expect(seen.size).toBeGreaterThan(20)
  })

  it('Puzzle 10 não referencia BG-03', () => {
    const rings = readFileSync(path.join(root, 'src/data/block08/ringsPuzzle.ts'), 'utf8')
    const reveal = readFileSync(
      path.join(root, 'src/components/investigation/MorsaCctvReveal.tsx'),
      'utf8',
    )
    expect(`${rings}\n${reveal}`).not.toMatch(/BG-03/)
  })
})

function statExists(file: string) {
  try {
    return statSync(file).isFile()
  } catch {
    return false
  }
}

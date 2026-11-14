import { describe, expect, it } from 'vitest'
import {
  __resetCanonicalManifestCache,
  buildCanonicalCheckpointState,
  canonicalCampaignProgress,
  CANONICAL_STORY_MANIFEST,
  validateCanonicalManifest,
} from '../../src/game/story/canonicalStoryManifest'
import { DEV_CHECKPOINTS } from '../../src/game/story/devCheckpointCatalog'
import {
  getInvestigationState,
  loadDevCheckpointState,
} from '../../src/game/state/investigationStore'
import type { InvestigationState, PersonStatus } from '../../src/game/types'

const ORDER = CANONICAL_STORY_MANIFEST.map((c) => c.id)
const at = (id: string) => buildCanonicalCheckpointState(id)

/** Ordem de força dos status de pessoa (o registro só avança). */
const PERSON_RANK: Record<PersonStatus, number> = {
  mentioned: 1,
  identified: 2,
  located: 3,
  contactable: 4,
  interviewed: 5,
}

function rank(s: InvestigationState, id: string) {
  const status = s.people[id]?.status
  return status ? PERSON_RANK[status] : 0
}

/** Datas ISO (`new Date()` em contradições/timeline) variam entre replays; o resto é determinístico. */
function normalized(s: InvestigationState) {
  return JSON.parse(
    JSON.stringify(s, (_k, v) =>
      typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(v) ? '<iso>' : v,
    ),
  )
}

describe('manifesto canônico DEV STORY', () => {
  it('valida: mesma ordem/IDs do catálogo e nenhuma interação fora de hora', () => {
    const v = validateCanonicalManifest()
    expect(v.orderMismatch).toEqual([])
    expect(v.issues).toEqual([])
    expect(v.checkpointCount).toBe(DEV_CHECKPOINTS.length)
    expect(v.checkpointCount).toBe(90)
  })

  it('cada checkpoint é monotônico em relação ao anterior (nada some ao avançar)', () => {
    let prev: InvestigationState | null = null
    for (const id of ORDER) {
      const cur = at(id)
      if (prev) {
        for (const e of prev.evidenceOwned) expect(cur.evidenceOwned, `${id} perdeu ${e}`).toContain(e)
        for (const d of prev.documentsOwned) expect(cur.documentsOwned, `${id} perdeu ${d}`).toContain(d)
        for (const c of prev.callsDone) expect(cur.callsDone, `${id} perdeu ${c}`).toContain(c)
        for (const a of Object.keys(prev.achievementUnlocks ?? {})) {
          expect(cur.achievementUnlocks?.[a], `${id} perdeu ${a}`).toBeTruthy()
        }
        for (const p of Object.keys(prev.people)) {
          expect(rank(cur, p), `${id} regrediu ${p}`).toBeGreaterThanOrEqual(rank(prev, p))
        }
        for (const t of prev.tasks.filter((t) => t.completed)) {
          const now = cur.tasks.find((x) => x.id === t.id)
          if (now) expect(now.completed, `${id} reabriu ${t.id}`).toBe(true)
        }
      }
      prev = cur
    }
  })

  it('avançar → voltar → avançar reconstrói do zero, sem vazamento de descobertas futuras', () => {
    const late = at('b08-end')
    const early = at('b03-after-nico')
    for (const e of ['morsa_was_andre', 'scale_links_callsign_to_augusto', 'anon_audio_ricardo_name']) {
      expect(late.evidenceOwned).toContain(e)
      expect(early.evidenceOwned, e).not.toContain(e)
    }
    expect(early.forensicDerivedArtifacts?.['cassini-stream-b']).toBeUndefined()
    expect(early.flags.block07_cassini_done).toBeFalsy()

    // Repetir em ordem arbitrária produz exatamente o mesmo estado.
    const again = at('b03-after-nico')
    expect(again).toEqual(early)
    __resetCanonicalManifestCache()
    expect(normalized(at('b03-after-nico'))).toEqual(normalized(early))
    expect(normalized(at('b08-end'))).toEqual(normalized(late))
  })

  it('carregar checkpoint usa o pipeline de save/load e substitui o estado vivo', () => {
    loadDevCheckpointState(at('b07-end'))
    expect(getInvestigationState().forensicDerivedArtifacts?.['cassini-stream-b']).toBeTruthy()
    loadDevCheckpointState(at('b02-start'))
    const s = getInvestigationState()
    expect(s.forensicDerivedArtifacts?.['cassini-stream-b']).toBeUndefined()
    expect(s.flags.block07_cassini_done).toBeFalsy()
    expect(s.flags.block02_started).toBe(true)
    expect(s.discoveries).toEqual([])
  })

  it('estados mutáveis devolvidos são cópias (não contaminam o cache)', () => {
    const a = at('b05-start')
    a.flags.__poison = true
    a.evidenceOwned.push('__poison')
    const b = at('b05-start')
    expect(b.flags.__poison).toBeUndefined()
    expect(b.evidenceOwned).not.toContain('__poison')
  })

  it('progresso DEV reconhece o próprio checkpoint carregado', () => {
    for (const id of ['b01-after-bo', 'b03-janus-done', 'b06-pastor-done', 'b08-rings-done', 'b09-end']) {
      const p = canonicalCampaignProgress(at(id).flags)
      expect(ORDER[p.currentIndex], id).toBe(id)
    }
  })
})

describe('marcos canônicos por checkpoint', () => {
  const expectations: {
    id: string
    has?: { flags?: string[]; evidence?: string[]; docs?: string[]; calls?: string[]; ach?: string[] }
    lacks?: { flags?: string[]; evidence?: string[]; docs?: string[] }
    people?: Record<string, PersonStatus>
    activeTasks?: string[]
    doneTasks?: string[]
    artifacts?: string[]
    noArtifacts?: string[]
  }[] = [
    {
      id: 'b01-start',
      lacks: { flags: ['block01_bo_registered'], evidence: ['emergency_call_restored', 'rec_vtx_old_01'] },
      noArtifacts: ['cassini-stream-b'],
    },
    {
      id: 'b01-after-call',
      has: { flags: ['block01_emergency_provisional'], evidence: ['emergency_call_restored'], ach: ['ach-cassini-division'] },
      lacks: { flags: ['block01_hospital_done'] },
    },
    {
      id: 'b01-end',
      has: { flags: ['block01_complete', 'block01_hospital_done'] },
    },
    {
      id: 'b02-vertice-unlocked',
      has: {
        flags: ['block02_rafael_forward_provisional'],
        evidence: ['rafael_audio_reply', 'rafael_recording_vertice_tag', 'mariana_club_recording_missing'],
        ach: ['ach-iapetus'],
      },
      lacks: { flags: ['block02_vertice_archive', 'block02_rafael_club_received'], evidence: ['rec_vtx_old_01'] },
    },
    {
      id: 'b02-archive-ready',
      has: { flags: ['block02_vertice_archive'], docs: ['doc-vertice-escala'] },
      lacks: {
        flags: ['block02_rafael_club_received', 'block02_rings_provisional', 'block02_vertice_set_crossref'],
        evidence: ['rec_vtx_old_01', 'nico_dj_identified'],
      },
      people: { rafael: 'identified' },
    },
    {
      id: 'b02-after-rafael-audio',
      has: { flags: ['block02_rafael_club_received'], evidence: ['rec_vtx_old_01'] },
      lacks: { flags: ['block02_rings_provisional'], evidence: ['rec_vtx_fingerprint_transition', 'nico_dj_identified'] },
    },
    {
      id: 'b02-rings-provisional',
      has: {
        flags: ['block02_rings_provisional'],
        evidence: ['rec_vtx_fingerprint_transition'],
        ach: ['ach-rings'],
      },
      lacks: { flags: ['block02_vertice_set_crossref'], evidence: ['nico_dj_identified', 'rec_vtx_set_nico_match'] },
      activeTasks: ['task_vertice_cross_reference'],
    },
    {
      id: 'b02-nico-identified',
      has: {
        flags: ['block02_vertice_set_crossref', 'block03_nico_search_unlocked'],
        evidence: ['nico_dj_identified', 'rec_vtx_set_nico_match'],
        ach: ['ach-rings'],
      },
      people: { nico: 'identified' },
      lacks: { flags: ['block02_complete'] },
    },
    {
      id: 'b02-convergence',
      has: { flags: ['block02_complete'] },
      activeTasks: ['task_locate_nico'],
    },
    {
      id: 'b03-after-nico',
      people: { nico: 'interviewed' },
      lacks: { flags: ['block03_janus_done'] },
    },
    {
      id: 'b03-saturnalia-done',
      has: { flags: ['block03_complete'], ach: ['ach-saturnalia'] },
      lacks: { evidence: ['morsa_was_andre'] },
    },
    {
      id: 'b04-after-andre',
      people: { andre: 'interviewed', samuel: 'interviewed' },
      lacks: { flags: ['block04_hex_spectrograms_inspected'] },
    },
    {
      id: 'b04-hex-done',
      has: { flags: ['block04_hex_spectrograms_inspected'] },
      lacks: { flags: ['block04_hexagon_done'], evidence: ['hidden_diary_recovered'] },
    },
    {
      id: 'b04-diary-open',
      has: { flags: ['block04_hexagon_done'], evidence: ['hidden_diary_recovered'], ach: ['ach-hexagon'] },
      doneTasks: ['task_unlock_diary'],
    },
    {
      id: 'b05-elisa-reviewed',
      has: {
        flags: ['block05_elisa_review_done'],
        evidence: ['elisa_argument_jealousy', 'elisa_weak_alibi', 'elisa_lookalike_near_fall'],
      },
      people: { sandra: 'identified' },
    },
    {
      id: 'b06-pastor-done',
      has: { flags: ['block06_pastor_done'], docs: ['doc-tabela-logistica-g17n'], ach: ['ach-shepherd-moons'] },
    },
    {
      id: 'b07-morsa-memory',
      has: { evidence: ['anon_hospital_burst_audio'] },
      lacks: { flags: ['block07_enceladus_done'], evidence: ['anon_audio_ricardo_name'] },
    },
    {
      id: 'b07-enceladus-done',
      has: { evidence: ['anon_audio_ricardo_name'], ach: ['ach-enceladus'] },
    },
    {
      id: 'b07-ricardo-found',
      people: { ricardo: 'identified' },
      lacks: { evidence: ['henrique_named_by_aster'] },
    },
    {
      id: 'b07-after-cecilia',
      people: { cecilia: 'interviewed', henrique: 'identified' },
      lacks: { flags: ['block07_cassini_done'] },
      noArtifacts: ['cassini-stream-b'],
    },
    {
      id: 'b07-end',
      has: { flags: ['block07_cassini_done', 'block07_complete'], ach: ['ach-cassini-huygens'] },
      artifacts: ['cassini-stream-b'],
    },
    {
      id: 'b08-rings-timeline',
      has: { flags: ['block08_rings_timeline_solved'] },
      lacks: { flags: ['block08_morsa_continuity_confirmed'], evidence: ['morsa_was_andre'] },
    },
    {
      id: 'b08-rings-done',
      has: { evidence: ['morsa_was_andre'], ach: ['ach-ordem-aneis'] },
    },
    {
      id: 'b08-after-denis',
      people: { denis: 'interviewed' },
      has: { calls: ['call-parts-jaguar-lead', 'call-detran-jaguar'] },
    },
    {
      id: 'b08-bia-rui',
      people: { mauro: 'interviewed', bia: 'interviewed', rui: 'interviewed' },
    },
    {
      id: 'b08-rotation-done',
      has: { flags: ['block08_rotation_done'] },
      lacks: { evidence: ['scale_links_callsign_to_augusto'] },
    },
    {
      id: 'b08-end',
      has: { evidence: ['scale_links_callsign_to_augusto'], ach: ['ach-rotacao-saturno'] },
    },
    {
      id: 'b09-memory-ready',
      lacks: { flags: ['block09_memory_done'], evidence: ['memory_word_revealed'] },
      artifacts: ['cassini-stream-b'],
    },
    {
      id: 'b09-end',
      has: { flags: ['block09_complete', 'saturnus_complete', 'block09_memory_done'], ach: ['ach-memoria'] },
    },
  ]

  for (const e of expectations) {
    it(e.id, () => {
      const s = at(e.id)
      for (const f of e.has?.flags ?? []) expect(s.flags[f], `flag ${f}`).toBe(true)
      for (const x of e.has?.evidence ?? []) expect(s.evidenceOwned, `evidência ${x}`).toContain(x)
      for (const d of e.has?.docs ?? []) expect(s.documentsOwned, `doc ${d}`).toContain(d)
      for (const c of e.has?.calls ?? []) expect(s.callsDone, `ligação ${c}`).toContain(c)
      for (const a of e.has?.ach ?? []) expect(s.achievementUnlocks?.[a], `conquista ${a}`).toBeTruthy()
      for (const f of e.lacks?.flags ?? []) expect(s.flags[f], `flag futura ${f}`).toBeFalsy()
      for (const x of e.lacks?.evidence ?? []) expect(s.evidenceOwned, `evidência futura ${x}`).not.toContain(x)
      for (const d of e.lacks?.docs ?? []) expect(s.documentsOwned, `doc futuro ${d}`).not.toContain(d)
      for (const [p, status] of Object.entries(e.people ?? {})) {
        expect(rank(s, p), `${p} ≥ ${status} (atual ${s.people[p]?.status})`).toBeGreaterThanOrEqual(
          PERSON_RANK[status],
        )
      }
      for (const t of e.activeTasks ?? []) {
        expect(s.tasks.find((x) => x.id === t)?.completed, `tarefa ativa ${t}`).toBe(false)
      }
      for (const t of e.doneTasks ?? []) {
        expect(s.tasks.find((x) => x.id === t)?.completed, `tarefa concluída ${t}`).toBe(true)
      }
      for (const a of e.artifacts ?? []) expect(s.forensicDerivedArtifacts?.[a], `artefato ${a}`).toBeTruthy()
      for (const a of e.noArtifacts ?? []) expect(s.forensicDerivedArtifacts?.[a], `artefato futuro ${a}`).toBeFalsy()
    })
  }
})

describe('bancada: fontes só após aquisição', () => {
  /** Primeira aquisição de cada arquivo de áudio/captura no caminho principal. */
  const SOURCES: { evidence: string; acquiredAt: string }[] = [
    // P2 (celular de Mariana): já presente desde o BO/celular; não é reenviado por Rafael.
    { evidence: 'rec_vtx_old_01', acquiredAt: 'b02-after-rafael-audio' },
    { evidence: 'rec_vtx_fingerprint_transition', acquiredAt: 'b02-rings-provisional' },
    { evidence: 'nico_dj_identified', acquiredAt: 'b02-nico-identified' },
    { evidence: 'nico_recording_booth', acquiredAt: 'b03-after-nico' },
    { evidence: 'livia_radio_archive_raw', acquiredAt: 'b03-after-livia' },
    { evidence: 'hex_audio_unk_01', acquiredAt: 'b04-hex-received' },
    { evidence: 'valter_group_active_intercepts', acquiredAt: 'b06-valter-trail' },
    { evidence: 'anon_hospital_burst_audio', acquiredAt: 'b07-morsa-memory' },
    { evidence: 'henrique_rtp_capture', acquiredAt: 'b07-after-cecilia' },
    { evidence: 'protest_heterogeneous_sources', acquiredAt: 'b07-end' },
    { evidence: 'rui_police_approach_records', acquiredAt: 'b08-bia-rui' },
    { evidence: 'mariana_recent_recording_claim', acquiredAt: 'b09-memory-ready' },
  ]

  it('a chamada de emergência já está no caso desde o início', () => {
    expect(at('b01-start').evidenceOwned).toContain('emergency_call_raw')
  })

  for (const src of SOURCES) {
    it(`${src.evidence} aparece em ${src.acquiredAt} e não antes`, () => {
      const idx = ORDER.indexOf(src.acquiredAt)
      expect(idx).toBeGreaterThan(0)
      expect(at(src.acquiredAt).evidenceOwned).toContain(src.evidence)
      for (const earlier of ORDER.slice(0, idx)) {
        expect(at(earlier).evidenceOwned, `${src.evidence} vazou em ${earlier}`).not.toContain(src.evidence)
      }
    })
  }
})

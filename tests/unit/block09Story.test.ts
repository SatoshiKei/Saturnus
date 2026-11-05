import { describe, expect, it } from 'vitest'
import {
  MEMORY_SEGMENTS,
  MEMORY_WORD,
  isMemoryProvenanceComplete,
} from '../../src/data/block09/memoryPuzzle'
import { createInitialState } from '../../src/game/state/initialState'
import { applyStoryActions } from '../../src/game/story/actions'
import { runStoryEngine } from '../../src/game/story/engine'
import { runPoliceSearch } from '../../src/game/search/runSearch'
import {
  __setStateForTests,
  getInvestigationState,
  openDocument,
  resetGame,
} from '../../src/game/state/investigationStore'
import { block09EntryActions } from '../../src/game/story/block09DevCheckpoints'
import {
  compareHenriqueMarianaSystem,
  findOtherDisappearances,
  finishTrailDiscovery,
  mapOmitidoAssistance,
  onDeathReflectionDone,
  onMarianaChatOpened,
  onMemoryPuzzleSolved,
  onPostDeathMessageRead,
  onRobertoExposed,
  onSaturnusFinalReflectionDone,
  reconstructPhysicalTrail,
  registerAugustoAnomalies,
  rereadDiaryOmitido,
  weighMarianaMessageImpossibilities,
} from '../../src/game/story/block09Handlers'
import { MARIANA_CHAT_ID } from '../../src/data/block09/marianaMessages'

function seed() {
  resetGame()
  __setStateForTests(runStoryEngine(applyStoryActions(createInitialState(), block09EntryActions)))
}

describe('Bloco 9 — progressão', () => {
  it('inicia a partir do fim do Bloco 8', () => {
    resetGame()
    let s = applyStoryActions(createInitialState(), [
      { type: 'setFlag', id: 'block08_complete', value: true },
      {
        type: 'replaceTasks',
        tasks: [
          { id: 'task_how_mariana_knew', label: 'Como Mariana descobriu tudo isso?', completed: false },
        ],
      },
    ])
    s = runStoryEngine(s)
    expect(s.flags.block09_started).toBe(true)
    expect(s.flags.block09_compare_unlocked).toBe(true)
    expect(s.tasks.some((t) => t.id === 'task_compare_omitido_system')).toBe(true)
  })

  it('O Omitido → diário → assistência → Roberto → mensagens', () => {
    seed()
    compareHenriqueMarianaSystem()
    let s = getInvestigationState()
    expect(s.flags.block09_omitido_named).toBe(true)
    expect(s.evidenceOwned).toContain('omitido_named_in_records')
    expect(s.evidenceOwned).toContain('mariana_used_same_system_months')
    expect(s.evidenceOwned).toContain('omitido_guided_not_answered')
    expect(s.people.omitido?.status).toBe('identified')
    expect(s.hypotheses.hyp_omitido_guided_mariana?.state).toBe('confirmed')

    rereadDiaryOmitido()
    mapOmitidoAssistance()
    s = getInvestigationState()
    expect(s.evidenceOwned).toContain('diary_partly_staged_ambiguity')
    expect(s.evidenceOwned).toContain('disappearance_plan_mariana_with_omitido')
    expect(s.flags.block09_roberto_search_unlocked).toBe(true)

    const { hits } = runPoliceSearch('roberto', getInvestigationState())
    expect(hits.some((h) => h.documentId === 'doc-roberto-denuncia')).toBe(true)

    onRobertoExposed()
    s = getInvestigationState()
    expect(s.evidenceOwned).toContain('omitido_timed_roberto_denunciation')
    expect(s.evidenceOwned).toContain('augusto_placed_into_case')
    expect(s.hypotheses.hyp_augusto_was_placed?.state).toBe('confirmed')
    expect(s.phones.augusto.unlockedChatIds).toContain(MARIANA_CHAT_ID)

    onMarianaChatOpened()
    s = getInvestigationState()
    expect(s.flags.block09_messages_wave1_read).toBe(true)
    expect(s.flags.block09_messages_wave2).toBe(true)
    expect(s.evidenceOwned).toContain('messages_as_mariana_convincing')
    expect((s.chatProgress[MARIANA_CHAT_ID]?.messages ?? []).length).toBeGreaterThan(0)
  })

  it('impossibilidades → trilha → morte → pós-morte → outros → Augusto → Puzzle 12 → MEMÓRIA', () => {
    seed()
    compareHenriqueMarianaSystem()
    rereadDiaryOmitido()
    mapOmitidoAssistance()
    onRobertoExposed()
    onMarianaChatOpened()

    weighMarianaMessageImpossibilities()
    let s = getInvestigationState()
    expect(s.evidenceOwned).toContain('messages_know_post_disappearance_facts')

    reconstructPhysicalTrail()
    s = getInvestigationState()
    expect(s.evidenceOwned).toContain('physical_trail_last_movements')
    expect(s.locations['trilha-final']?.status).toBe('visitAvailable')

    finishTrailDiscovery()
    s = getInvestigationState()
    expect(s.flags.block09_mariana_dead).toBe(true)
    expect(s.evidenceOwned).toContain('mariana_confirmed_dead')
    expect(s.flags.block09_refl_death_pending).toBe(true)

    onDeathReflectionDone()
    onMarianaChatOpened()
    s = getInvestigationState()
    expect(s.flags.block09_post_death_message_read).toBe(true)
    expect(s.evidenceOwned).toContain('system_speaks_as_mariana_after_death')

    findOtherDisappearances()
    registerAugustoAnomalies()
    s = getInvestigationState()
    expect(s.evidenceOwned).toContain('other_disappearances_pattern')
    expect(s.evidenceOwned).toContain('augusto_was_observed')
    expect(s.flags.block09_memory_available).toBe(true)
    expect(s.evidenceOwned).toContain('mariana_recent_recording_claim')

    const wrong: Record<string, string> = {}
    for (const seg of MEMORY_SEGMENTS) wrong[seg.id] = 'apartment'
    expect(isMemoryProvenanceComplete(wrong)).toBe(false)

    const right: Record<string, string> = {}
    for (const seg of MEMORY_SEGMENTS) right[seg.id] = seg.trueSource
    expect(isMemoryProvenanceComplete(right)).toBe(true)

    onMemoryPuzzleSolved()
    s = getInvestigationState()
    expect(s.flags.block09_memory_done).toBe(true)
    expect(s.evidenceOwned).toContain('final_audio_impossible_provenance')
    expect(s.evidenceOwned).toContain('memory_word_revealed')
    expect(s.flags.block09_memory_word_shown).toBe(true)
    expect(MEMORY_WORD).toBe('MEMÓRIA')

    // Overlay dismiss + reflexão final
    openDocument('doc-omitido-interface') // no-op side path
    __setStateForTests(
      applyStoryActions(getInvestigationState(), [
        { type: 'setFlag', id: 'block09_memory_word_dismissed', value: true },
      ]),
    )
    onSaturnusFinalReflectionDone()
    s = getInvestigationState()
    expect(s.flags.block09_complete).toBe(true)
    expect(s.flags.saturnus_complete).toBe(true)
    expect(s.tasks.some((t) => t.id === 'task_saturnus_memory' && t.completed)).toBe(true)
  })
})

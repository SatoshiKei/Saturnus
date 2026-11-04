import { HEX_EVIDENCE_IDS } from '../../data/block04/hexagonPuzzle'
import { dispatchActions, getInvestigationState } from '../state/investigationStore'
import type { StoryActionRef } from '../types'

export function onSamuelCurrentRecordFound() {
  const s = getInvestigationState()
  if (s.flags.block04_samuel_located) return
  dispatchActions([
    { type: 'setFlag', id: 'block04_samuel_located', value: true },
    { type: 'discoverPerson', id: 'samuel', status: 'located' },
    { type: 'discoverPerson', id: 'samuel', status: 'contactable' },
    { type: 'completeTask', id: 'task_identify_morsa' },
    {
      type: 'addTask',
      id: 'task_interview_samuel',
      label: 'Ouvir Samuel sobre Morsa e os protestos',
    },
  ])
}

export function finishSamuelInterview() {
  const s = getInvestigationState()
  if (s.flags.block04_samuel_interview_done) return
  dispatchActions([
    { type: 'setFlag', id: 'block04_samuel_interview_done', value: true },
    { type: 'discoverPerson', id: 'samuel', status: 'interviewed' },
    { type: 'addEvidence', id: 'samuel_confirms_morsa' },
    { type: 'addEvidence', id: 'mariana_sought_samuel' },
    { type: 'addEvidence', id: 'mariana_morsa_timing' },
    { type: 'completeTask', id: 'task_interview_samuel' },
    { type: 'setFlag', id: 'block04_andre_records_unlocked', value: true },
    {
      type: 'addTask',
      id: 'task_andre_visits',
      label: 'Verificar registros de visita Mariana × André',
    },
    {
      type: 'linkHypothesis',
      hypothesisId: 'hyp_morsa_key',
      evidenceId: 'samuel_confirms_morsa',
      role: 'support',
    },
  ])
}

export function onMarianaAndreVisitRecordFound() {
  const s = getInvestigationState()
  if (s.flags.block04_andre_visit_found) return
  dispatchActions([
    { type: 'setFlag', id: 'block04_andre_visit_found', value: true },
    { type: 'completeTask', id: 'task_andre_visits' },
    { type: 'unlockLocation', id: 'presidio', status: 'visitAvailable' },
    { type: 'discoverPerson', id: 'andre', status: 'contactable' },
    {
      type: 'addTask',
      id: 'task_interview_andre',
      label: 'Visitar André na unidade prisional',
    },
  ])
}

export function finishAndreInterview() {
  const s = getInvestigationState()
  if (s.flags.block04_andre_interview_done) return
  dispatchActions([
    { type: 'setFlag', id: 'block04_andre_interview_done', value: true },
    { type: 'discoverPerson', id: 'andre', status: 'interviewed' },
    { type: 'addEvidence', id: 'andre_confirms_shift' },
    { type: 'addEvidence', id: 'andre_told_her_to_stop' },
    { type: 'addEvidence', id: 'andre_no_maralto_link' },
    { type: 'completeTask', id: 'task_interview_andre' },
    { type: 'unlockLocation', id: 'presidio', status: 'visited' },
    { type: 'addHypothesis', id: 'hyp_andre_manipulating' },
    {
      type: 'linkHypothesis',
      hypothesisId: 'hyp_andre_manipulating',
      evidenceId: 'andre_confirms_shift',
      role: 'support',
    },
    {
      type: 'linkHypothesis',
      hypothesisId: 'hyp_andre_manipulating',
      evidenceId: 'mariana_andre_visit_record',
      role: 'support',
    },
    { type: 'setFlag', id: 'block04_chronology_search_unlocked', value: true },
    {
      type: 'addTask',
      id: 'task_check_andre_chronology',
      label: 'Cruzar cronologia: André × contato desconhecido',
    },
  ])
}

export function onAndreChronologyMismatchFound() {
  const s = getInvestigationState()
  if (s.flags.block04_andre_chronology_done) return
  const actions: StoryActionRef[] = [
    { type: 'setFlag', id: 'block04_andre_chronology_done', value: true },
    { type: 'completeTask', id: 'task_check_andre_chronology' },
    { type: 'updateHypothesis', id: 'hyp_andre_manipulating', state: 'weakened' },
    {
      type: 'linkHypothesis',
      hypothesisId: 'hyp_andre_manipulating',
      evidenceId: 'andre_contact_chronology_mismatch',
      role: 'contradict',
    },
    { type: 'setFlag', id: 'block04_hex_received', value: true },
    { type: 'pushProvocation', id: 'prov_hex_six' },
    ...HEX_EVIDENCE_IDS.map((id) => ({ type: 'addEvidence' as const, id })),
    { type: 'setFlag', id: 'block04_hexagon_available', value: true },
    {
      type: 'addTask',
      id: 'task_hexagon',
      label: 'Analisar os seis áudios anônimos (bancada)',
    },
  ]
  dispatchActions(actions)
}

/**
 * Puzzle 6 — Hexágono (placeholder).
 * TODO(puzzle-06): inspeção de metadata + grafo A→D→B→F→C→E→A.
 */
export function runProvisionalHexagonSolve() {
  const s = getInvestigationState()
  if (s.flags.block04_hexagon_done) return
  if (!HEX_EVIDENCE_IDS.every((id) => s.evidenceOwned.includes(id))) return
  dispatchActions([
    { type: 'setFlag', id: 'block04_hexagon_done', value: true },
    { type: 'addEvidence', id: 'hex_phrase_recovered' },
    { type: 'completeTask', id: 'task_hexagon' },
    { type: 'setFlag', id: 'block04_forensics_unlocked', value: true },
    {
      type: 'addTask',
      id: 'task_phone_forensics',
      label: 'Perícia: procurar o que a tela omite no celular de Mariana',
    },
  ])
}

/** Perícia direcionada — não é exploração aleatória do launcher. */
export function runPhoneHiddenAppForensics() {
  const s = getInvestigationState()
  if (s.flags.block04_forensics_done) return
  if (!s.flags.block04_forensics_unlocked) return
  dispatchActions([
    { type: 'setFlag', id: 'block04_forensics_done', value: true },
    { type: 'addEvidence', id: 'hidden_app_detected' },
    { type: 'addEvidence', id: 'hidden_diary_recovered' },
    { type: 'revealHiddenApps', device: 'mariana' },
    { type: 'discoverPassword', which: 'diary' },
    { type: 'completeTask', id: 'task_phone_forensics' },
    {
      type: 'addTask',
      id: 'task_read_diary',
      label: 'Consultar o diário oculto de Mariana',
    },
  ])
}

export function onDiaryEntryRead(entryId: string, unlocksUnknown: boolean) {
  const s = getInvestigationState()
  const actions: StoryActionRef[] = []

  if (entryId === 'diary-forget' || entryId === 'diary-others') {
    if (!s.evidenceOwned.includes('diary_memory_fear')) {
      actions.push({ type: 'addEvidence', id: 'diary_memory_fear' })
    }
  }
  if (entryId === 'diary-julia-a' || entryId === 'diary-julia-b') {
    if (!s.evidenceOwned.includes('diary_julia_contradiction')) {
      actions.push(
        { type: 'addEvidence', id: 'diary_julia_contradiction' },
        { type: 'addHypothesis', id: 'hyp_julia_manipulating' },
        {
          type: 'linkHypothesis',
          hypothesisId: 'hyp_julia_manipulating',
          evidenceId: 'diary_julia_contradiction',
          role: 'support',
        },
      )
    }
  }

  if (unlocksUnknown && !s.flags.block04_unknown_recording_unlocked) {
    actions.push(
      { type: 'setFlag', id: 'block04_unknown_recording_unlocked', value: true },
      {
        type: 'addTask',
        id: 'task_unknown_recording',
        label: 'Localizar e ouvir CHK_UNK (Downloads)',
      },
    )
  }

  if (!s.flags.block04_diary_opened) {
    actions.push(
      { type: 'setFlag', id: 'block04_diary_opened', value: true },
      { type: 'completeTask', id: 'task_read_diary' },
    )
  }

  if (actions.length) dispatchActions(actions)
}

export function onUnknownRecordingFound() {
  const s = getInvestigationState()
  if (s.flags.block04_unknown_recording_found) return
  if (!s.flags.block04_unknown_recording_unlocked) return
  dispatchActions([
    { type: 'setFlag', id: 'block04_unknown_recording_found', value: true },
    { type: 'addEvidence', id: 'unknown_contact_recording' },
    { type: 'completeTask', id: 'task_unknown_recording' },
    {
      type: 'addTask',
      id: 'task_analyze_unknown',
      label: 'Analisar a gravação do contato desconhecido',
    },
  ])
}

export function onUnknownRecordingAnalyzed() {
  const s = getInvestigationState()
  if (s.flags.block04_unknown_analyzed) return
  if (!s.evidenceOwned.includes('unknown_contact_recording')) return
  dispatchActions([
    { type: 'setFlag', id: 'block04_unknown_analyzed', value: true },
    { type: 'addEvidence', id: 'unknown_knows_mariana' },
    { type: 'completeTask', id: 'task_analyze_unknown' },
    { type: 'addHypothesis', id: 'hyp_memory_interference' },
    {
      type: 'linkHypothesis',
      hypothesisId: 'hyp_memory_interference',
      evidenceId: 'unknown_knows_mariana',
      role: 'support',
    },
    {
      type: 'linkHypothesis',
      hypothesisId: 'hyp_memory_interference',
      evidenceId: 'diary_memory_fear',
      role: 'support',
    },
    { type: 'setFlag', id: 'block04_complete', value: true },
    {
      type: 'replaceTasks',
      tasks: [
        {
          id: 'task_press_nico',
          label: 'Pressionar Nico sobre o que omitiu da Noite X',
          completed: false,
        },
      ],
    },
  ])
}

export function applyBlock04SearchHit(evidenceId: string) {
  if (!evidenceId) return
  if (evidenceId === 'samuel_current_record') onSamuelCurrentRecordFound()
  if (evidenceId === 'mariana_andre_visit_record') onMarianaAndreVisitRecordFound()
  if (evidenceId === 'andre_contact_chronology_mismatch') onAndreChronologyMismatchFound()
}

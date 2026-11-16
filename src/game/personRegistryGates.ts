import {
  HEX_DELIVERY_EVIDENCE_ID,
  HEX_LEGACY_FRAGMENT_EVIDENCE_IDS,
  migrateHexEvidenceOwned,
} from '../data/block04/hexagonPuzzle'
import { knowsTerm } from './knowledge/knownTerms'
import { withKnownTermsFromFlags } from './knowledge/seedTermsFromFlags'
import { applyStoryActions } from './story/actions'
import type { InvestigationState } from './types'

/**
 * Flags que precisam estar ativas antes de uma pessoa aparecer no caderno / terminal (Pessoas).
 * (A visibilidade no caderno NÃO libera conversa: chegar até a pessoa depende de telefone,
 * endereço ou instituição descobertos por documentos.)
 */
export const personRegistryFlag: Record<string, string> = {
  elisa: 'block02_elisa_search_unlocked',
  andre: 'block02_elisa_search_unlocked',
  nico: 'block02_vertice_set_crossref',
  lucas: 'block02_paula_chat_done',
  iara: 'block02_vertice_iara',
  sandro: 'block02_vertice_sandro',
  caio: 'block02_vertice_caio',
  livia: 'block03_maralto_researched',
  morsa: 'block03_saturnalia_done',
  /** Samuel: ocorrência/detidos (ou visita acidental Marcelo) — não Saturnalia sozinho. */
  samuel: 'block04_samuel_search_unlocked',
  jana: 'block05_jana_search_unlocked',
  geraldo: 'block06_geraldo_search_unlocked',
  valter: 'block06_jana_followup_done',
  miro: 'block06_valter_trail_done',
  sandra: 'block07_sandra_search_unlocked',
  ricardo: 'block07_ricardo_found',
  henrique: 'block07_henrique_identified',
  cecilia: 'block07_henrique_trail_done',
  mauro: 'block08_mauro_located',
  denis: 'block08_denis_contact_unlocked',
  bia: 'block08_mauro_interview_done',
  rui: 'block08_bia_interview_done',
  omitido: 'block09_omitido_named',
  roberto: 'block09_roberto_search_unlocked',
}

export function isPersonVisibleInRegistry(personId: string, inv: InvestigationState): boolean {
  if (personId === 'augusto') return false
  if (personId === 'marcelo') {
    return (
      knowsTerm(inv, 'marcelo') ||
      inv.people.marcelo?.status !== 'mentioned' ||
      Boolean(inv.flags.marcelo_address_found)
    )
  }

  // Jana: calendário / early / busca Elisa.
  if (personId === 'jana') {
    return (
      Boolean(inv.flags.block05_jana_search_unlocked) ||
      Boolean(inv.flags.jana_early_done) ||
      Boolean(inv.flags.calendar_jana_examined) ||
      knowsTerm(inv, 'jana') ||
      inv.people.jana?.status === 'located' ||
      inv.people.jana?.status === 'interviewed' ||
      inv.people.jana?.status === 'contactable'
    )
  }

  // Geraldo: calendário / early / autos Vértice.
  if (personId === 'geraldo') {
    return (
      Boolean(inv.flags.block06_geraldo_search_unlocked) ||
      Boolean(inv.flags.geraldo_early_done) ||
      Boolean(inv.flags.calendar_geraldo_examined) ||
      Boolean(inv.flags.geraldo_vertice_known) ||
      knowsTerm(inv, 'geraldo') ||
      inv.people.geraldo?.status === 'located' ||
      inv.people.geraldo?.status === 'interviewed' ||
      inv.people.geraldo?.status === 'contactable'
    )
  }

  // Samuel: lista de detidos / ficha / visita acidental — nunca só Saturnalia.
  if (personId === 'samuel') {
    return (
      Boolean(inv.flags.block04_samuel_search_unlocked) ||
      Boolean(inv.flags.samuel_accidental_done) ||
      knowsTerm(inv, 'samuel') ||
      inv.people.samuel?.status === 'located' ||
      inv.people.samuel?.status === 'interviewed' ||
      inv.people.samuel?.status === 'contactable'
    )
  }

  // Sandra: testemunha nos autos (Elisa) — não só após Miro.
  if (personId === 'sandra') {
    return (
      Boolean(inv.flags.block07_sandra_search_unlocked) ||
      knowsTerm(inv, 'sandra') ||
      inv.people.sandra?.status === 'located' ||
      inv.people.sandra?.status === 'interviewed' ||
      inv.people.sandra?.status === 'contactable'
    )
  }

  // Elisa / André: só após Lucas (flag ou termo conhecido via Lucas).
  if (personId === 'elisa' || personId === 'andre') {
    return (
      Boolean(inv.flags.block02_elisa_search_unlocked) ||
      knowsTerm(inv, 'elisa') ||
      inv.people.elisa?.status === 'identified' ||
      inv.people.elisa?.status === 'located' ||
      inv.people.elisa?.status === 'interviewed'
    )
  }

  const need = personRegistryFlag[personId]
  if (!need) return true
  if (inv.flags[need]) return true
  // Lucas: evidência e flag são aplicados juntos; reparar saves antigos ou desync.
  if (personId === 'lucas') {
    return (
      inv.evidenceOwned.includes('paula_leads_lucas') ||
      inv.people.lucas?.status === 'contactable' ||
      inv.people.lucas?.status === 'interviewed'
    )
  }
  // Lívia pode já ter sido identificada em saves antigos.
  if (personId === 'livia') return inv.people.livia?.status !== 'mentioned'
  return false
}

/** Corrige estado quando a evidência existe mas flags de Bloco 2 não foram gravadas. */
export function repairInvestigationState(state: InvestigationState): InvestigationState {
  let next = state

  const hexOwned = migrateHexEvidenceOwned(next.evidenceOwned)
  const legacy = new Set(HEX_LEGACY_FRAGMENT_EVIDENCE_IDS)
  const hexMigrated =
    hexOwned.length !== next.evidenceOwned.length ||
    hexOwned.some((id, i) => id !== next.evidenceOwned[i])
  if (hexMigrated) {
    const legacySeen = next.audioSeen.some((id) => legacy.has(id))
    let audioSeen = next.audioSeen.filter((id) => !legacy.has(id))
    if (legacySeen && !audioSeen.includes(HEX_DELIVERY_EVIDENCE_ID)) {
      audioSeen = [...audioSeen, HEX_DELIVERY_EVIDENCE_ID]
    }
    next = { ...next, evidenceOwned: hexOwned, audioSeen }
  }

  if (state.evidenceOwned.includes('paula_leads_lucas') && !state.flags.block02_paula_chat_done) {
    const lucas = state.people.lucas
    next = {
      ...next,
      flags: { ...next.flags, block02_paula_chat_done: true },
      people: lucas
        ? {
            ...next.people,
            lucas: {
              ...lucas,
              status: lucas.status === 'mentioned' ? 'contactable' : lucas.status,
            },
          }
        : next.people,
    }
  }

  // B2: Perícia/diário — revelar ícone no iPhone; saves com diário já aberto não pedem PIN de novo.
  const diaryDone =
    next.phones.mariana.diaryUnlocked ||
    next.flags.block04_forensics_done ||
    next.flags.block04_diary_opened
  const forensicsDone =
    next.flags.block04_forensics_access || diaryDone || next.flags.diary_package_known
  if (forensicsDone) {
    const apps = next.phones.mariana.installedAppIds
    const needApp = !apps.includes('hidden-diary')
    const needFlag = !next.flags.block04_diary_icon_revealed
    const needUnlock = diaryDone && !next.phones.mariana.diaryUnlocked
    if (needApp || needFlag || needUnlock) {
      next = {
        ...next,
        flags: {
          ...next.flags,
          block04_diary_icon_revealed: true,
          ...(diaryDone
            ? { block04_forensics_access: true, block04_forensics_done: true }
            : {}),
        },
        phones: {
          ...next.phones,
          mariana: {
            ...next.phones.mariana,
            diaryUnlocked: diaryDone ? true : next.phones.mariana.diaryUnlocked,
            installedAppIds: needApp ? [...apps, 'hidden-diary'] : apps,
          },
        },
      }
    }
  }

  const TASK_LABEL_PATCH: Record<string, string> = {
    task_rafael_recording: 'Encontrar a gravação perdida',
    task_rafael_venue_staff: 'Descobrir a origem da gravação',
  }
  const REMOVED_TASK_IDS = new Set([
    'task_selective_lapses',
    'task_why_mariana_session',
    'task_continue_elisa_case',
    'task_contact_radio_costeira',
    'task_locate_livia',
    'task_andre_visits',
    'task_get_club_from_rafael',
    'task_research_maralto',
    'task_locate_nico',
    'task_weigh_mariana_messages',
    'task_how_mariana_knew',
    'task_mariana_contact_chronology',
    'task_compare_phone_files',
  ])
  const liviaInterviewSatisfied = (s: InvestigationState) =>
    Boolean(s.flags.block03_livia_interview_done) ||
    s.evidenceOwned.includes('livia_radio_archive_raw') ||
    Boolean(s.flags.block03_saturnalia_available) ||
    Boolean(s.flags.block03_saturnalia_done)

  const nicoInterviewSatisfied = (s: InvestigationState) =>
    Boolean(s.flags.block03_nico_interview_done) ||
    Boolean(s.flags.block03_janus_done) ||
    liviaInterviewSatisfied(s) ||
    Boolean(s.flags.block03_saturnalia_done) ||
    Boolean(s.flags.block03_complete) ||
    Boolean(s.flags.block04_started) ||
    s.evidenceOwned.includes('nico_recording_booth')

  if (nicoInterviewSatisfied(next) && !next.flags.block03_nico_interview_done) {
    next = {
      ...next,
      flags: { ...next.flags, block03_nico_interview_done: true },
    }
  }

  const owned = new Set(next.evidenceOwned)
  let tasks = (next.tasks ?? []).filter((t) => {
    if (t.id === 'task_get_club_from_rafael') return false
    if (REMOVED_TASK_IDS.has(t.id)) return false
    return true
  })
  if (nicoInterviewSatisfied(next) || next.flags.nico_early_done) {
    tasks = tasks.map((t) =>
      t.id === 'task_talk_nico' && !t.completed ? { ...t, completed: true } : t,
    )
  }
  if (liviaInterviewSatisfied(next)) {
    tasks = tasks.map((t) =>
      t.id === 'task_talk_livia' && !t.completed ? { ...t, completed: true } : t,
    )
  }
  if (next.flags.block04_andre_chronology_done) {
    tasks = tasks.map((t) =>
      t.id === 'task_check_andre_chronology' && !t.completed ? { ...t, completed: true } : t,
    )
  }
  {
    const byId = new Map<string, (typeof tasks)[number]>()
    for (const t of tasks) {
      const prev = byId.get(t.id)
      if (!prev || (!prev.completed && t.completed)) byId.set(t.id, t)
    }
    tasks = [...byId.values()]
  }
  if (owned.has('rec_vtx_old_01')) {
    tasks = tasks.map((t) =>
      (t.id === 'task_rafael_recording' || t.id === 'task_get_club_from_rafael') && !t.completed
        ? { ...t, completed: true }
        : t,
    )
  }
  next = {
    ...next,
    tasks: tasks.map((t) => (TASK_LABEL_PATCH[t.id] ? { ...t, label: TASK_LABEL_PATCH[t.id]! } : t)),
  }

  if (next.flags.block05_maralto_reflection_done && !next.flags.block05_compare_done) {
    const repair: import('./types').StoryActionRef[] = [
      { type: 'setFlag', id: 'block05_chronology_action_unlocked', value: true },
      { type: 'setFlag', id: 'block05_chronology_done', value: true },
      { type: 'addEvidence', id: 'mariana_sought_people_before' },
      { type: 'setFlag', id: 'block05_compare_unlocked', value: true },
      { type: 'setFlag', id: 'block05_compare_done', value: true },
      { type: 'addEvidence', id: 'phone_files_depend_on_order' },
      { type: 'setFlag', id: 'block05_coincidence_reflection_done', value: true },
      { type: 'setFlag', id: 'block05_refl_coincidence_pending', value: false },
      { type: 'setFlag', id: 'refl-b05-coincidence_seen', value: true },
      { type: 'removeTask', id: 'task_mariana_contact_chronology' },
      { type: 'removeTask', id: 'task_compare_phone_files' },
      { type: 'setFlag', id: 'block05_emergency_revisit_unlocked', value: true },
    ]
    if (!next.tasks.some((t) => t.id === 'task_revisit_emergency_entry')) {
      repair.push({
        type: 'addTask',
        id: 'task_revisit_emergency_entry',
        label: 'Por que a polícia entrou no apartamento de Mariana?',
      })
    }
    next = applyStoryActions(next, repair)
  }

  const janaVisitPending =
    (next.tasks.some((t) => t.id === 'task_talk_jana' && !t.completed) &&
      !next.flags.block05_jana_interview_done) ||
    (next.tasks.some((t) => t.id === 'task_press_jana_again' && !t.completed) &&
      !next.flags.block06_jana_followup_done)
  const janaLoc = next.locations['jana-casa']
  if (janaVisitPending && janaLoc && janaLoc.status !== 'visitAvailable') {
    next = applyStoryActions(next, [
      { type: 'unlockLocation', id: 'jana-casa', status: 'visitAvailable' },
    ])
  }

  return withKnownTermsFromFlags(next)
}

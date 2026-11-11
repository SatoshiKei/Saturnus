import { dispatchActions, getInvestigationState } from '../state/investigationStore'
import type { StoryActionRef } from '../types'

/** Calendário — examinar “Encontrar Jana Ribeiro” (sem EvidenceCard). */
export function onCalendarJanaExamined() {
  const s = getInvestigationState()
  if (s.flags.calendar_jana_examined) return
  const actions: StoryActionRef[] = [
    { type: 'setFlag', id: 'calendar_jana_examined', value: true },
    { type: 'discoverSearchTerm', term: 'jana' },
    { type: 'discoverPerson', id: 'jana', status: 'identified' },
  ]
  if (s.locations['jana-casa']?.status === 'unknown') {
    actions.push({ type: 'unlockLocation', id: 'jana-casa', status: 'visitAvailable' })
  }
  dispatchActions(actions)
}

/** Calendário — examinar “Bar do Geraldo” (sem EvidenceCard). */
export function onCalendarGeraldoExamined() {
  const s = getInvestigationState()
  if (s.flags.calendar_geraldo_examined) return
  const actions: StoryActionRef[] = [
    { type: 'setFlag', id: 'calendar_geraldo_examined', value: true },
    { type: 'discoverSearchTerm', term: 'geraldo' },
    { type: 'discoverPerson', id: 'geraldo', status: 'identified' },
  ]
  if (s.locations['geraldo-casa']?.status === 'unknown') {
    actions.push({ type: 'unlockLocation', id: 'geraldo-casa', status: 'visitAvailable' })
  }
  dispatchActions(actions)
}

export function finishJanaEarlyInterview() {
  const s = getInvestigationState()
  const markVisited = { type: 'unlockLocation' as const, id: 'jana-casa', status: 'visited' as const }
  if (s.flags.jana_early_done) {
    if (s.locations['jana-casa']?.status === 'visitAvailable' && !s.flags.block05_nico_followup_done) {
      dispatchActions([markVisited])
    }
    return
  }
  dispatchActions([
    { type: 'setFlag', id: 'jana_early_done', value: true },
    { type: 'discoverPerson', id: 'jana', status: 'interviewed' },
    markVisited,
  ])
}

export function finishGeraldoEarlyInterview() {
  const s = getInvestigationState()
  const markVisited = {
    type: 'unlockLocation' as const,
    id: 'geraldo-casa',
    status: 'visited' as const,
  }
  if (s.flags.geraldo_early_done) {
    if (
      s.locations['geraldo-casa']?.status === 'visitAvailable' &&
      !s.flags.block06_geraldo_search_unlocked &&
      !s.flags.geraldo_vertice_known
    ) {
      dispatchActions([markVisited])
    }
    return
  }
  dispatchActions([
    { type: 'setFlag', id: 'geraldo_early_done', value: true },
    { type: 'discoverPerson', id: 'geraldo', status: 'interviewed' },
    markVisited,
  ])
}

/** Após visita acidental + material Maralto incompleto → teoria de retaliação. */
export function maybeQueueMaraltoRetaliationTheory() {
  const s = getInvestigationState()
  if (s.flags.theory_maralto_retaliation_pending) return
  if (!s.flags.samuel_accidental_done) return
  if (!s.flags.block03_livia_interview_done && !s.flags.block03_maralto_researched) return
  dispatchActions([{ type: 'setFlag', id: 'theory_maralto_retaliation_pending', value: true }])
}

export function finishSamuelAccidentalInterview() {
  const s = getInvestigationState()
  const markVisited = {
    type: 'unlockLocation' as const,
    id: 'samuel-casa',
    status: 'visited' as const,
  }
  if (s.flags.samuel_accidental_done) {
    if (
      s.locations['samuel-casa']?.status === 'visitAvailable' &&
      !s.flags.block04_samuel_search_unlocked
    ) {
      dispatchActions([markVisited])
    }
    return
  }
  // Sem discoverPerson/samuel search term — flavour only; Saturnalia recontextualiza depois.
  dispatchActions([{ type: 'setFlag', id: 'samuel_accidental_done', value: true }, markVisited])
  maybeQueueMaraltoRetaliationTheory()
}

/** Nota n-sess: Augusto passa a conhecer hvalenca cedo. */
export function onHvalencaNoteRead() {
  const s = getInvestigationState()
  if (s.flags.hvalenca_note_known) return
  dispatchActions([
    { type: 'setFlag', id: 'hvalenca_note_known', value: true },
    { type: 'discoverSearchTerm', term: 'hvalenca' },
  ])
}

export function isJanaEarlyVisit(s = getInvestigationState()) {
  return (
    !s.flags.block05_jana_interview_done &&
    !s.flags.block05_nico_followup_done &&
    !s.flags.block05_jana_search_unlocked
  )
}

export function isGeraldoEarlyVisit(s = getInvestigationState()) {
  return (
    !s.flags.block06_geraldo_interview_done &&
    !s.flags.block06_geraldo_search_unlocked &&
    !s.flags.geraldo_vertice_known
  )
}

export function isSamuelAccidentalVisit(s = getInvestigationState()) {
  return (
    !s.flags.block04_samuel_interview_done &&
    !s.flags.block04_samuel_search_unlocked &&
    Boolean(s.flags.marcelo_address_found)
  )
}

/** Nico no Titã antes de Lucas introduzir Elisa. */
export function isNicoEarlyVisit(s = getInvestigationState()) {
  return (
    !s.flags.block03_nico_interview_done &&
    !s.flags.block02_elisa_search_unlocked &&
    !s.searchTermsDiscovered.some((t) => t.toLowerCase() === 'elisa')
  )
}

export function finishNicoEarlyInterview() {
  const s = getInvestigationState()
  const markVisited = { type: 'unlockLocation' as const, id: 'titan', status: 'visited' as const }
  if (s.flags.nico_early_done) {
    if (s.locations.titan?.status === 'visitAvailable' && isNicoEarlyVisit(s)) {
      dispatchActions([markVisited])
    }
    return
  }
  dispatchActions([
    { type: 'setFlag', id: 'nico_early_done', value: true },
    { type: 'discoverPerson', id: 'nico', status: 'interviewed' },
    markVisited,
  ])
}

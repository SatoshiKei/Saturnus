import { knowsTerm } from './knowledge/knownTerms'
import { withKnownTermsFromFlags } from './knowledge/seedTermsFromFlags'
import type { InvestigationState } from './types'

/**
 * Flags que precisam estar ativas antes de uma pessoa aparecer no caderno / terminal (Pessoas).
 * (A visibilidade no caderno NÃO libera conversa: chegar até a pessoa depende de telefone,
 * endereço ou instituição descobertos por documentos.)
 */
export const personRegistryFlag: Record<string, string> = {
  elisa: 'block02_elisa_search_unlocked',
  andre: 'block02_elisa_search_unlocked',
  nico: 'block02_vertice_archive',
  lucas: 'block02_paula_chat_done',
  iara: 'block02_vertice_iara',
  sandro: 'block02_vertice_sandro',
  caio: 'block02_vertice_caio',
  livia: 'block03_maralto_researched',
  morsa: 'block03_saturnalia_done',
  /** Samuel: Saturnalia OU visita acidental (Marcelo). */
  samuel: 'block03_saturnalia_done',
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

  // Samuel: Saturnalia / protestos OU visita acidental.
  if (personId === 'samuel') {
    return (
      Boolean(inv.flags.block03_saturnalia_done) ||
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

  return withKnownTermsFromFlags(next)
}

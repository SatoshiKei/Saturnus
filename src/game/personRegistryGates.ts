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
  samuel: 'block03_saturnalia_done',
  jana: 'block05_jana_search_unlocked',
  geraldo: 'block06_geraldo_search_unlocked',
  valter: 'block06_jana_followup_done',
  miro: 'block06_valter_trail_done',
  sandra: 'block07_sandra_search_unlocked',
  ricardo: 'block07_ricardo_found',
  henrique: 'block07_henrique_identified',
  cecilia: 'block07_henrique_trail_done',
  mauro: 'block08_vehicle_search_unlocked',
  denis: 'block08_mauro_interview_done',
  bia: 'block08_bia_search_unlocked',
  rui: 'block08_rui_search_unlocked',
  omitido: 'block09_omitido_named',
  roberto: 'block09_roberto_search_unlocked',
}

export function isPersonVisibleInRegistry(personId: string, inv: InvestigationState): boolean {
  if (personId === 'augusto') return false
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
  const forensicsDone = next.flags.block04_forensics_access || diaryDone
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

  return next
}

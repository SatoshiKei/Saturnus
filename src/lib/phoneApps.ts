import { appDefinitions } from '../data/game/seedApps'
import type { InvestigationState } from '../game/types'
import type { PhoneAppId } from '../types/phone'

/** Perícia restaurou o pacote — ou save antigo já tinha acesso/desbloqueio. */
export function isHiddenDiaryRevealed(state: InvestigationState): boolean {
  return Boolean(
    state.flags.block04_diary_icon_revealed ||
      state.flags.block04_forensics_access ||
      state.phones.mariana.diaryUnlocked,
  )
}

export function visibleAppsForDevice(
  device: 'mariana' | 'augusto',
  state: InvestigationState,
): PhoneAppId[] {
  const phone = state.phones[device]
  const ids = phone.installedAppIds.filter((id) => {
    const def = appDefinitions.find((a) => a.id === id)
    if (!def) return true
    if (def.device !== 'both' && def.device !== device) return false
    if (id === 'hidden-diary') return isHiddenDiaryRevealed(state)
    return true
  }) as PhoneAppId[]

  // Save antigo: Perícia já feita, app ainda não instalado na lista.
  if (
    device === 'mariana' &&
    isHiddenDiaryRevealed(state) &&
    !ids.includes('hidden-diary')
  ) {
    ids.push('hidden-diary')
  }

  return ids
}

export function isAppInstalled(device: 'mariana' | 'augusto', appId: string, state: InvestigationState) {
  return state.phones[device].installedAppIds.includes(appId)
}

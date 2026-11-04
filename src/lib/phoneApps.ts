import { appDefinitions } from '../data/game/seedApps'
import type { InvestigationState } from '../game/types'
import type { PhoneAppId } from '../types/phone'

export function visibleAppsForDevice(
  device: 'mariana' | 'augusto',
  state: InvestigationState,
): PhoneAppId[] {
  const phone = state.phones[device]
  const ids = phone.installedAppIds.filter((id) => {
    const def = appDefinitions.find((a) => a.id === id)
    if (!def) return true
    if (def.device !== 'both' && def.device !== device) return false
    // O diário nunca aparece no launcher: só existe via acesso forense (Perícia).
    if (id === 'hidden-diary') return false
    return true
  })
  return ids as PhoneAppId[]
}

export function isAppInstalled(device: 'mariana' | 'augusto', appId: string, state: InvestigationState) {
  return state.phones[device].installedAppIds.includes(appId)
}

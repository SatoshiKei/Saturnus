import { describe, expect, it, beforeEach } from 'vitest'
import {
  devApply,
  getInvestigationState,
  installMarianaApp,
  loadGame,
  resetGame,
  saveGame,
  tryDiaryPin,
} from '../../src/game/state/investigationStore'

describe('investigation store', () => {
  beforeEach(() => resetGame())

  it('blocks wavelab install without account password discovery', () => {
    expect(installMarianaApp('wavelab-mobile')).toBe('needs-password')
  })

  it('installs wavelab after password discovered', () => {
    devApply([{ type: 'discoverPassword', which: 'marianaAccount' }])
    expect(installMarianaApp('wavelab-mobile')).toBe('ok')
    expect(getInvestigationState().phones.mariana.installedAppIds).toContain('wavelab-mobile')
  })

  it('diary PIN is refused until forensic access exists and never auto-fills', () => {
    expect(tryDiaryPin('481526')).toBe('locked')
    devApply([{ type: 'setFlag', id: 'block04_forensics_access', value: true }])
    expect(tryDiaryPin('123456')).toBe('wrong')
    expect(getInvestigationState().phones.mariana.diaryPasswordAttempts).toBe(1)
    expect(tryDiaryPin('481526')).toBe('unlocked')
    expect(getInvestigationState().phones.mariana.diaryUnlocked).toBe(true)
  })

  it('diary state survives save and reload', () => {
    devApply([{ type: 'setFlag', id: 'block04_forensics_access', value: true }])
    tryDiaryPin('481526')
    saveGame()
    resetGame()
    expect(getInvestigationState().phones.mariana.diaryUnlocked).toBeFalsy()
    // resetGame limpa o save; regrava e recarrega
    devApply([{ type: 'setFlag', id: 'block04_forensics_access', value: true }])
    tryDiaryPin('481526')
    saveGame()
    expect(loadGame()).toBe(true)
    expect(getInvestigationState().phones.mariana.diaryUnlocked).toBe(true)
    expect(getInvestigationState().flags.block04_forensics_access).toBe(true)
  })
})

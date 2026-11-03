import { describe, expect, it, beforeEach } from 'vitest'
import {
  getInvestigationState,
  installMarianaApp,
  resetGame,
  devApply,
  tryDiaryPassword,
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

  it('diary requires password discovery before unlock', () => {
    expect(tryDiaryPassword('demo-diary')).toBe('needs-discovery')
    devApply([{ type: 'discoverPassword', which: 'diary' }])
    expect(tryDiaryPassword('wrong')).toBe('wrong')
    expect(tryDiaryPassword('demo-diary')).toBe('unlocked')
  })
})

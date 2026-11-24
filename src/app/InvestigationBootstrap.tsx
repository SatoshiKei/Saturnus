import { useEffect, type ReactNode } from 'react'
import { unlockSfxAudio } from '../lib/sfx'
import { addPlayTime, loadGame } from '../game/state/investigationStore'
import { MainMenuOverlay } from '../components/investigation/MainMenuOverlay'
import { DevStoryPanel } from '../components/investigation/DevStoryPanel'
import { PlayerCampaignPanel } from '../components/investigation/PlayerCampaignPanel'
import { DiscoveryHost } from '../components/investigation/DiscoveryHost'
import { useUiState } from './uiStore'

export function InvestigationBootstrap({ children }: { children: ReactNode }) {
  const { shell } = useUiState()

  useEffect(() => {
    loadGame()
  }, [])

  useEffect(() => {
    const prime = () => unlockSfxAudio()
    window.addEventListener('pointerdown', prime, { capture: true })
    window.addEventListener('keydown', prime, { capture: true })
    return () => {
      window.removeEventListener('pointerdown', prime, { capture: true })
      window.removeEventListener('keydown', prime, { capture: true })
    }
  }, [])

  useEffect(() => {
    if (shell !== 'playing') return
    let last = Date.now()
    const id = window.setInterval(() => {
      const now = Date.now()
      const delta = now - last
      last = now
      if (delta > 0 && delta < 15000) addPlayTime(delta)
    }, 5000)
    return () => {
      window.clearInterval(id)
      const now = Date.now()
      const delta = now - last
      if (delta > 0 && delta < 15000) addPlayTime(delta)
    }
  }, [shell])

  return (
    <>
      {children}
      <MainMenuOverlay />
      <DiscoveryHost />
      <PlayerCampaignPanel />
      {import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEV_PANEL === 'true' ? (
        <DevStoryPanel />
      ) : null}
    </>
  )
}

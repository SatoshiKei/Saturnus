import { useEffect, type ReactNode } from 'react'
import { addPlayTime, loadGame } from '../game/state/investigationStore'
import { MainMenuOverlay } from '../components/investigation/MainMenuOverlay'
import { DevStoryPanel } from '../components/investigation/DevStoryPanel'
import { DiscoveryHost } from '../components/investigation/DiscoveryHost'
import { useUiState } from './uiStore'

export function InvestigationBootstrap({ children }: { children: ReactNode }) {
  const { shell } = useUiState()

  useEffect(() => {
    loadGame()
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
      {import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEV_PANEL === 'true' ? (
        <DevStoryPanel />
      ) : null}
    </>
  )
}

import { useEffect, type ReactNode } from 'react'
import { loadGame } from '../game/state/investigationStore'
import { MainMenuOverlay } from '../components/investigation/MainMenuOverlay'
import { DevStoryPanel } from '../components/investigation/DevStoryPanel'
import { ToastHost } from '../components/investigation/ToastHost'

export function InvestigationBootstrap({ children }: { children: ReactNode }) {
  useEffect(() => {
    loadGame()
  }, [])

  return (
    <>
      {children}
      <MainMenuOverlay />
      <ToastHost />
      {import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEV_PANEL === 'true' ? (
        <DevStoryPanel />
      ) : null}
    </>
  )
}

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { HubPanel } from '../game/types'

export type LocationSceneId = 'hospital' | 'vertice' | 'lucas' | null

interface GameHubContextValue {
  hubPanel: HubPanel
  openHub: (panel: HubPanel) => void
  closeHub: () => void
  phoneDevice: 'mariana' | 'augusto'
  setPhoneDevice: (d: 'mariana' | 'augusto') => void
  locationScene: LocationSceneId
  openLocationScene: (id: NonNullable<LocationSceneId>) => void
  closeLocationScene: () => void
}

const GameHubContext = createContext<GameHubContextValue | null>(null)

export function GameHubProvider({ children }: { children: ReactNode }) {
  const [hubPanel, setHubPanel] = useState<HubPanel>(null)
  const [phoneDevice, setPhoneDevice] = useState<'mariana' | 'augusto'>('mariana')
  const [locationScene, setLocationScene] = useState<LocationSceneId>(null)

  const openHub = useCallback((panel: HubPanel) => setHubPanel(panel), [])
  const closeHub = useCallback(() => setHubPanel(null), [])
  const openLocationScene = useCallback((id: NonNullable<LocationSceneId>) => {
    setLocationScene(id)
    setHubPanel(null)
  }, [])
  const closeLocationScene = useCallback(() => setLocationScene(null), [])

  const value = useMemo(
    () => ({
      hubPanel,
      openHub,
      closeHub,
      phoneDevice,
      setPhoneDevice,
      locationScene,
      openLocationScene,
      closeLocationScene,
    }),
    [hubPanel, openHub, closeHub, phoneDevice, locationScene, openLocationScene, closeLocationScene],
  )

  return <GameHubContext.Provider value={value}>{children}</GameHubContext.Provider>
}

export function useGameHub() {
  const ctx = useContext(GameHubContext)
  if (!ctx) throw new Error('useGameHub outside provider')
  return ctx
}

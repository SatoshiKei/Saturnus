import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from 'react'
import type { SceneId } from '../../../data/sceneIntros'
import {
  resolveReflectionBgm,
  resolveVnBgmScene,
  type VnBgmSpec,
} from '../../../data/audio/vnBgmCatalog'
import { unlockSfxAudio } from '../../../lib/sfx'
import { vnBgmPlay, vnBgmSetDuck, vnBgmStop } from '../../../lib/vnBgmEngine'

type VnBgmContextValue = {
  setDuck: (on: boolean) => void
}

const noop = { setDuck: () => undefined }

const VnBgmContext = createContext<VnBgmContextValue>(noop)

export function useVnBgmDuck() {
  return useContext(VnBgmContext)
}

export function VnBgmProvider({
  sceneKey,
  reflectionId,
  sceneId,
  children,
}: {
  sceneKey?: string | null
  reflectionId?: string
  sceneId?: SceneId
  children: ReactNode
}) {
  const setDuck = useCallback((on: boolean) => vnBgmSetDuck(on), [])

  const spec: VnBgmSpec | null = useMemo(() => {
    if (reflectionId) return resolveReflectionBgm(reflectionId, sceneId)
    if (sceneKey) return resolveVnBgmScene(sceneKey)
    return null
  }, [reflectionId, sceneId, sceneKey])

  const key = reflectionId ? `refl:${reflectionId}` : sceneKey ? `scene:${sceneKey}` : ''

  useEffect(() => {
    if (!spec || !key) return
    unlockSfxAudio()
    vnBgmPlay(key, spec)
    return () => vnBgmStop()
  }, [key, spec])

  const value = useMemo(() => ({ setDuck }), [setDuck])

  return <VnBgmContext.Provider value={value}>{children}</VnBgmContext.Provider>
}
import { createContext, useContext, type ReactNode } from 'react'

const GalleryPlaybackContext = createContext(false)

export function GalleryPlaybackProvider({ active, children }: { active: boolean; children: ReactNode }) {
  return <GalleryPlaybackContext.Provider value={active}>{children}</GalleryPlaybackContext.Provider>
}

export function useGalleryPlayback() {
  return useContext(GalleryPlaybackContext)
}
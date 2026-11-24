import type { CSSProperties, ReactNode } from 'react'
import { vnBgmKeyFromTestId } from '../../../data/audio/vnBgmCatalog'
import { VnSceneHistoryProvider } from '../../../lib/vnSceneHistory'
import { VNTopBar } from './VNTopBar'
import { VnBgmProvider } from './VnBgmContext'
import '../../../styles/visual-novel.css'

export function VNSceneShell({
  title,
  onClose,
  testId,
  backgroundStyle,
  bgmSceneKey,
  children,
}: {
  title: string
  onClose: () => void
  testId: string
  backgroundStyle: CSSProperties
  /** Chave em `vnBgmCatalog` (`opening`, `vn-hospital`, …). Sobrescreve mapa por `testId`. */
  bgmSceneKey?: string
  children: ReactNode
}) {
  const bgmKey = bgmSceneKey ?? vnBgmKeyFromTestId(testId) ?? undefined
  return (
    <VnSceneHistoryProvider sceneTitle={title}>
      <VnBgmProvider sceneKey={bgmKey ?? null}>
        <div className="vn-scene" data-testid={testId} style={backgroundStyle}>
          <VNTopBar title={title} onClose={onClose} />
          {children}
        </div>
      </VnBgmProvider>
    </VnSceneHistoryProvider>
  )
}

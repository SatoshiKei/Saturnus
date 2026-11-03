import type { CSSProperties, ReactNode } from 'react'
import { VNTopBar } from './VNTopBar'
import '../../../styles/visual-novel.css'

export function VNSceneShell({
  title,
  onClose,
  testId,
  backgroundStyle,
  children,
}: {
  title: string
  onClose: () => void
  testId: string
  backgroundStyle: CSSProperties
  children: ReactNode
}) {
  return (
    <div className="vn-scene" data-testid={testId} style={backgroundStyle}>
      <VNTopBar title={title} onClose={onClose} />
      {children}
    </div>
  )
}

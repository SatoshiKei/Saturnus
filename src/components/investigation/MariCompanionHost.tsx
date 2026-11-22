import { useCallback, useEffect, useState } from 'react'
import { pickMariCompanionBeat, type MariCompanionBeat } from '../../data/companion/mariCompanion'
import { useInvestigation } from '../../game/hooks/useInvestigation'
import { setFlag } from '../../game/state/investigationStore'
import { portraitSrcForStory } from '../../lib/characterSprites'
import { VnSceneHistoryProvider } from '../../lib/vnSceneHistory'
import { VisualNovelDialog } from '../story/VisualNovelDialog'
import '../../styles/visual-novel.css'
import '../../styles/mari-companion.css'

interface MariCompanionHostProps {
  /** Hub livre: sem painel, telefone, cena ou reflexão. */
  hubIdle: boolean
}

/**
 * Piloto: Mari no hub livre (cotidiano — papel secundário).
 * Dicas na Bancada durante puzzles: planejadas; ver docs/companion/MARI_HUB_COMPANION.md.
 */
export function MariCompanionHost({ hubIdle }: MariCompanionHostProps) {
  const inv = useInvestigation()
  const [active, setActive] = useState<MariCompanionBeat | null>(null)
  const [lineIndex, setLineIndex] = useState(0)

  useEffect(() => {
    if (!hubIdle) return
    if (active) return
    const next = pickMariCompanionBeat({ flags: inv.flags, locations: inv.locations })
    if (!next) return
    const t = window.setTimeout(() => {
      setActive(next)
      setLineIndex(0)
    }, 700)
    return () => window.clearTimeout(t)
  }, [hubIdle, inv.flags, inv.locations, active])

  const dismiss = useCallback(() => {
    if (!active) return
    setFlag(active.seenFlag, true)
    setActive(null)
    setLineIndex(0)
  }, [active])

  if (!active) return null

  const line = active.lines[lineIndex]
  const last = lineIndex >= active.lines.length - 1
  const portraitId = line.portraitId ?? 'mari'
  const side = portraitId === 'augusto' ? 'left' : 'right'

  return (
    <VnSceneHistoryProvider sceneTitle="Mari">
      <div className="mari-companion" data-testid="mari-companion" data-beat={active.id}>
        <div className="mari-companion__veil" aria-hidden />
        <VisualNovelDialog
          speaker={line.speaker}
          text={line.text}
          narration={line.narration}
          portraitId={portraitId}
          portraitSrc={portraitSrcForStory(portraitId)}
          portraitSide={side}
          forcePortrait
          terminalBeat={last}
          onContinue={() => {
            if (!last) setLineIndex((i) => i + 1)
            else dismiss()
          }}
        />
      </div>
    </VnSceneHistoryProvider>
  )
}

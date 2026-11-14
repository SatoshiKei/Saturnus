import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useInvestigation } from '../../game/hooks/useInvestigation'
import { boardBounds, buildLinkBoard } from '../../game/board/buildLinkBoard'
import { fitRect, transformCss, type BoardViewport } from '../../game/board/boardTransform'
import { LinkBoardCanvas } from './LinkBoardCanvas'

/** Zoom máximo da miniatura: com pouco conteúdo, não ampliar os cartões demais. */
export const THUMBNAIL_MAX_ZOOM = 0.42
const DEFAULT_THUMB_VIEWPORT: BoardViewport = { width: 372, height: 276 }

/**
 * Miniatura do quadro: mesmo `buildLinkBoard(inv)` e mesma renderização do quadro completo,
 * com `interactive=false` e escala calculada para caber na área de cortiça.
 */
export function LinkBoardThumbnail({
  fallbackViewport = DEFAULT_THUMB_VIEWPORT,
}: {
  fallbackViewport?: BoardViewport
}) {
  const inv = useInvestigation()
  const hostRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<BoardViewport>(fallbackViewport)

  const layout = useMemo(() => buildLinkBoard(inv), [inv])

  useLayoutEffect(() => {
    const el = hostRef.current
    if (!el) return
    const read = () => {
      // offsetWidth ignora transforms de ancestrais (a cena escala via CSS).
      if (el.offsetWidth > 0 && el.offsetHeight > 0) {
        setSize((prev) =>
          prev.width === el.offsetWidth && prev.height === el.offsetHeight
            ? prev
            : { width: el.offsetWidth, height: el.offsetHeight },
        )
      }
    }
    read()
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(read)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const transform = useMemo(
    () => fitRect(boardBounds(layout.nodes, 40), size, { padding: 8, maxZoom: THUMBNAIL_MAX_ZOOM }),
    [layout.nodes, size],
  )

  return (
    <div className="lb-thumb" ref={hostRef} data-testid="link-board-thumbnail" data-node-count={layout.nodes.length}>
      <div className="lb-thumb__layer" style={{ transform: transformCss(transform) }} data-zoom={transform.z.toFixed(3)}>
        <LinkBoardCanvas layout={layout} interactive={false} scale="thumbnail" />
      </div>
    </div>
  )
}

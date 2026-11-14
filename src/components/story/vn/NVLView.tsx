import { useLayoutEffect, useRef } from 'react'
import type { VnLine } from '../VisualNovelDialog'
import { useVnSceneHistory } from '../../../lib/vnSceneHistory'

function NvlBlock({ line }: { line: VnLine }) {
  return (
    <div className="vn-nvl__block">
      {line.speaker ? <p className="vn-nvl__speaker">{line.speaker.toUpperCase()}</p> : null}
      <p className="vn-nvl__text">{line.text}</p>
    </div>
  )
}

export function NVLView({
  pageLines,
  pageIndex,
  pageCount,
  onAdvance,
  onClose,
}: {
  pageLines: VnLine[]
  pageIndex: number
  pageCount: number
  onAdvance: () => void
  onClose: () => void
}) {
  const atEnd = pageIndex >= pageCount - 1
  return (
    <div
      className="vn-nvl"
      data-testid="vn-nvl"
      onClick={onAdvance}
      role="presentation"
    >
      <div className="vn-nvl__veil" aria-hidden />
      <div className="vn-nvl__column" onClick={() => onAdvance()}>
        <div className="vn-nvl__page" key={pageIndex}>
          {pageLines.map((line, i) => (
            <NvlBlock key={`${pageIndex}-${i}`} line={line} />
          ))}
        </div>
        <div className="vn-nvl__foot">
          {atEnd ? (
            <button
              type="button"
              className="vn-nvl__close"
              onClick={(e) => {
                e.stopPropagation()
                onClose()
              }}
            >
              Voltar ao diálogo
            </button>
          ) : (
            <span className="vn-nvl__next-hint">Clique ou Espaço para continuar</span>
          )}
          <span className="vn-adv__next vn-nvl__chevron" aria-hidden />
        </div>
      </div>
    </div>
  )
}

export function BacklogView({
  lines,
  onClose,
}: {
  lines: VnLine[]
  onClose: () => void
}) {
  const sceneHistory = useVnSceneHistory()
  const scrollRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [lines])

  const sceneTitle = sceneHistory?.sceneTitle?.trim() || 'Cena'

  return (
    <div className="vn-backlog" data-testid="vn-backlog" data-vn-history-scroll>
      <div className="vn-nvl__veil" aria-hidden />
      <header className="vn-backlog__bar">
        <div className="vn-backlog__titles">
          <span className="vn-backlog__scene">{sceneTitle}</span>
          <span className="vn-backlog__sub">Falas desta cena · role para cima</span>
        </div>
        <button type="button" className="vn-backlog__close" onClick={onClose}>
          Fechar
        </button>
      </header>
      <div ref={scrollRef} className="vn-backlog__scroll">
        {lines.map((line, i) => (
          <NvlBlock key={i} line={line} />
        ))}
      </div>
    </div>
  )
}

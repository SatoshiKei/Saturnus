import type { DragEvent } from 'react'
import type { ForensicSource } from '../forensicTypes'
import { fmtTime } from '../forensicEngine'

const DRAG_MIME = 'application/x-saturnus-fw-source'

export function forensicsSourceDragId(e: DragEvent): string | null {
  return e.dataTransfer.getData(DRAG_MIME) || null
}

export function FileBrowser({
  sources,
  activeId,
  onSelect,
  onDragSource,
}: {
  sources: ForensicSource[]
  activeId: string | null
  onSelect: (id: string) => void
  onDragSource?: (id: string) => void
}) {
  return (
    <div className="fw-files">
      <div className="fw-pane-h">Files</div>
      <ul className="fw-files__list">
        {sources.map((s) => (
          <li key={s.id}>
            <div
              className="fw-file"
              data-testid={`fw-file-${s.id}`}
              data-active={s.id === activeId}
            >
              <button
                type="button"
                className="fw-file__open"
                onClick={() => onSelect(s.id)}
              >
                <span className="fw-file__icon" aria-hidden>
                  ⌁
                </span>
                <span className="fw-file__body">
                  <span className="fw-file__name">{s.displayName ?? s.filename}</span>
                  <span className="fw-file__meta">
                    {s.type} · {fmtTime(s.durationSec)}
                  </span>
                </span>
              </button>
              {s.audio ? (
                <span
                  className="fw-file__grip"
                  title="Arrastar para Compare"
                  draggable
                  data-testid={`fw-file-drag-${s.id}`}
                  onDragStart={(e) => {
                    e.dataTransfer.setData(DRAG_MIME, s.id)
                    e.dataTransfer.effectAllowed = 'copy'
                    onDragSource?.(s.id)
                  }}
                />
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
import type { ForensicSource } from '../forensicTypes'
import { fmtTime } from '../forensicEngine'

export function FileBrowser({
  sources,
  activeId,
  onSelect,
}: {
  sources: ForensicSource[]
  activeId: string | null
  onSelect: (id: string) => void
}) {
  return (
    <div className="fw-files">
      <div className="fw-pane-h">Files</div>
      <ul className="fw-files__list">
        {sources.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              className="fw-file"
              data-testid={`fw-file-${s.id}`}
              data-active={s.id === activeId}
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
          </li>
        ))}
      </ul>
    </div>
  )
}

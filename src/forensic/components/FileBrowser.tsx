import { useMemo, useState, type DragEvent } from 'react'
import type { ForensicSource } from '../forensicTypes'
import { fmtTime } from '../forensicEngine'

const DRAG_MIME = 'application/x-saturnus-fw-source'

export function forensicsSourceDragId(e: DragEvent): string | null {
  return e.dataTransfer.getData(DRAG_MIME) || null
}

function bundledChildIds(sources: ForensicSource[]): Set<string> {
  const child = new Set<string>()
  for (const s of sources) {
    for (const id of s.childSourceIds ?? []) child.add(id)
  }
  return child
}

function sourceById(sources: ForensicSource[], id: string): ForensicSource | undefined {
  return sources.find((s) => s.id === id)
}

function SourceRow({
  s,
  activeId,
  depth,
  onSelect,
  onDragSource,
}: {
  s: ForensicSource
  activeId: string | null
  depth: number
  onSelect: (id: string) => void
  onDragSource?: (id: string) => void
}) {
  const isBundle = Boolean(s.childSourceIds?.length) && !s.audio
  return (
    <div
      className="fw-file"
      data-testid={`fw-file-${s.id}`}
      data-active={s.id === activeId}
      data-depth={depth}
      style={depth ? { paddingLeft: `${0.35 + depth * 0.65}em` } : undefined}
    >
      <button
        type="button"
        className="fw-file__open"
        onClick={() => onSelect(s.id)}
        disabled={isBundle}
        aria-disabled={isBundle}
      >
        <span className="fw-file__icon" aria-hidden>
          {isBundle ? '▣' : '⌁'}
        </span>
        <span className="fw-file__body">
          <span className="fw-file__name">{s.displayName ?? s.filename}</span>
          <span className="fw-file__meta">
            {isBundle
              ? `save · ${s.childSourceIds?.length ?? 0} files`
              : `${s.type} · ${fmtTime(s.durationSec)}`}
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
  )
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
  const hidden = useMemo(() => bundledChildIds(sources), [sources])
  const roots = useMemo(() => sources.filter((s) => !hidden.has(s.id)), [sources, hidden])
  const bundleRoots = roots.filter((s) => (s.childSourceIds?.length ?? 0) > 0)
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    for (const b of bundleRoots) init[b.id] = true
    return init
  })

  const toggleBundle = (id: string) => {
    setExpanded((e) => ({ ...e, [id]: !e[id] }))
  }

  return (
    <div className="fw-files">
      <div className="fw-pane-h">Files</div>
      <ul className="fw-files__list">
        {roots.map((s) => {
          const children = s.childSourceIds ?? []
          const isBundle = children.length > 0
          const open = isBundle ? (expanded[s.id] ?? true) : false
          return (
            <li key={s.id} className={isBundle ? 'fw-files__group' : undefined}>
              {isBundle ? (
                <div
                  className="fw-file fw-file--bundle"
                  data-testid={`fw-bundle-${s.id}`}
                  data-expanded={open}
                >
                  <button
                    type="button"
                    className="fw-file__toggle"
                    aria-expanded={open}
                    aria-label={open ? 'Recolher entrega' : 'Expandir entrega'}
                    onClick={() => toggleBundle(s.id)}
                  >
                    {open ? '▾' : '▸'}
                  </button>
                  <button
                    type="button"
                    className="fw-file__open"
                    onClick={() => toggleBundle(s.id)}
                  >
                    <span className="fw-file__icon fw-file__icon--save" aria-hidden>
                      ▣
                    </span>
                    <span className="fw-file__body">
                      <span className="fw-file__name">{s.displayName ?? s.filename}</span>
                      <span className="fw-file__meta">
                        save · {children.length} files
                      </span>
                    </span>
                  </button>
                </div>
              ) : (
                <SourceRow
                  s={s}
                  activeId={activeId}
                  depth={0}
                  onSelect={onSelect}
                  onDragSource={onDragSource}
                />
              )}
              {isBundle && open ? (
                <ul className="fw-files__children">
                  {children.map((cid) => {
                    const child = sourceById(sources, cid)
                    if (!child) return null
                    return (
                      <li key={cid}>
                        <SourceRow
                          s={child}
                          activeId={activeId}
                          depth={1}
                          onSelect={onSelect}
                          onDragSource={onDragSource}
                        />
                      </li>
                    )
                  })}
                </ul>
              ) : null}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
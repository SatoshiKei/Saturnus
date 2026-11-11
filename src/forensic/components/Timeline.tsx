import { useRef } from 'react'
import type { Marker, SelectionRange } from '../forensicTypes'
import { fmtTime } from '../forensicEngine'

export function Timeline({
  durationSec,
  playheadSec,
  waveform,
  zoom,
  selection,
  markers,
  waveformZoomY,
  onSeek,
  onSelect,
  onZoom,
}: {
  durationSec: number
  playheadSec: number
  waveform: number[]
  zoom: number
  selection: SelectionRange | null
  markers: Marker[]
  waveformZoomY: number
  onSeek: (sec: number) => void
  onSelect: (sel: SelectionRange | null) => void
  onZoom: (z: number) => void
}) {
  const drag = useRef<{ a: number; selecting: boolean } | null>(null)
  const visibleDur = durationSec / Math.max(0.25, zoom)

  const secFromClientX = (el: HTMLElement, clientX: number) => {
    const rect = el.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    return x * visibleDur
  }

  return (
    <div className="fw-timeline">
      <div className="fw-pane-h">
        TIMELINE
        <span className="fw-timeline__zoom">
          <button type="button" onClick={() => onZoom(Math.max(0.5, zoom / 1.25))} title="Zoom out">
            −
          </button>
          <span>{zoom.toFixed(2)}×</span>
          <button type="button" onClick={() => onZoom(Math.min(8, zoom * 1.25))} title="Zoom in">
            +
          </button>
        </span>
      </div>
      <div className="fw-ruler" aria-hidden>
        {Array.from({ length: 9 }, (_, i) => {
          const t = (i / 8) * visibleDur
          return (
            <span key={i} style={{ left: `${(i / 8) * 100}%` }}>
              {fmtTime(t)}
            </span>
          )
        })}
      </div>
      <div
        className="fw-wave-stage"
        role="slider"
        aria-valuemin={0}
        aria-valuemax={durationSec}
        aria-valuenow={playheadSec}
        tabIndex={0}
        onPointerDown={(e) => {
          const el = e.currentTarget
          el.setPointerCapture(e.pointerId)
          const t = secFromClientX(el, e.clientX)
          drag.current = { a: t, selecting: e.shiftKey }
          if (e.shiftKey) onSelect({ startSec: t, endSec: t })
          else onSeek(t)
        }}
        onPointerMove={(e) => {
          if (!drag.current) return
          const t = secFromClientX(e.currentTarget, e.clientX)
          if (drag.current.selecting) {
            const a = drag.current.a
            onSelect({
              startSec: Math.min(a, t),
              endSec: Math.max(a, t),
            })
          } else {
            onSeek(t)
          }
        }}
        onPointerUp={() => {
          drag.current = null
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') onSeek(Math.max(0, playheadSec - 0.5))
          if (e.key === 'ArrowRight') onSeek(Math.min(durationSec, playheadSec + 0.5))
        }}
      >
        <svg className="fw-wave" viewBox={`0 0 ${waveform.length} 100`} preserveAspectRatio="none">
          {waveform.map((h, i) => (
            <rect
              key={i}
              x={i}
              y={50 - h * 46 * waveformZoomY}
              width="0.85"
              height={Math.max(1, h * 92 * waveformZoomY)}
              rx="0.2"
              data-played={i / waveform.length < playheadSec / durationSec}
            />
          ))}
        </svg>
        {selection && (
          <div
            className="fw-sel"
            style={{
              left: `${(selection.startSec / visibleDur) * 100}%`,
              width: `${((selection.endSec - selection.startSec) / visibleDur) * 100}%`,
            }}
          />
        )}
        {markers.map((m) => (
          <div
            key={m.id}
            className="fw-marker"
            style={{ left: `${(m.timeSec / visibleDur) * 100}%` }}
            title={m.label || fmtTime(m.timeSec)}
          />
        ))}
        <div
          className="fw-playhead"
          style={{ left: `${(playheadSec / visibleDur) * 100}%` }}
        />
      </div>
      <p className="fw-timeline__hint">Shift+arrastar para seleção temporal · clique para seek</p>
    </div>
  )
}

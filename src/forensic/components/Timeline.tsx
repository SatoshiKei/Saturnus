import { useRef } from 'react'
import type { Marker, SelectionRange } from '../forensicTypes'
import { fmtTime } from '../forensicEngine'

function fmtRuler(sec: number): string {
  const s = Math.max(0, sec)
  const m = Math.floor(s / 60)
  const r = Math.floor(s - m * 60)
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`
}

export interface TimelineLane {
  id: string
  label: string
  waveform: number[]
  startSec: number
  durationSec: number
}

export function Timeline({
  durationSec,
  playheadSec,
  waveform,
  zoom,
  selection,
  markers,
  waveformZoomY,
  viewMode,
  spectrogram,
  unavailableFromSec = null,
  lanes,
  onSeek,
  onSelect,
  onZoom,
  onViewMode,
  onWaveformZoomY,
  onLaneOffset,
}: {
  durationSec: number
  playheadSec: number
  waveform: number[]
  zoom: number
  selection: SelectionRange | null
  markers: Marker[]
  waveformZoomY: number
  viewMode: 'waveform' | 'spectrogram'
  spectrogram?: { cols: number; rows: number; values: number[]; maxHz: number }
  /** Região após este tempo não decodifica (container danificado). */
  unavailableFromSec?: number | null
  lanes?: TimelineLane[]
  onSeek: (sec: number) => void
  onSelect: (sel: SelectionRange | null) => void
  onZoom: (z: number) => void
  onViewMode: (mode: 'waveform' | 'spectrogram') => void
  onWaveformZoomY: (z: number) => void
  /** Arraste horizontal de uma lane (novo startSec absoluto). */
  onLaneOffset?: (laneId: string, nextStartSec: number) => void
}) {
  const drag = useRef<{ a: number; selecting: boolean } | null>(null)
  const laneDrag = useRef<{ id: string; originStart: number; pointer0: number } | null>(null)
  const visibleDur = durationSec / Math.max(0.25, zoom)
  const majorTicks = 9
  const minorPerMajor = 4
  const multi = Boolean(lanes && lanes.length > 1)

  const secFromClientX = (el: HTMLElement, clientX: number) => {
    const rect = el.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    return x * visibleDur
  }

  return (
    <div className="fw-timeline">
      <div className="fw-timeline__bar">
        <span className="fw-timeline__label">Timeline</span>
        <div className="fw-view-toggle" role="group" aria-label="Timeline view">
          <button
            type="button"
            data-active={viewMode === 'waveform'}
            onClick={() => onViewMode('waveform')}
          >
            Waveform
          </button>
          <button
            type="button"
            data-active={viewMode === 'spectrogram'}
            disabled={!spectrogram || multi}
            onClick={() => onViewMode('spectrogram')}
          >
            Spectrogram
          </button>
        </div>
        <span className="fw-timeline__zoom">
          <button type="button" className="fw-icon-btn" onClick={() => onZoom(Math.max(0.5, zoom / 1.25))} title="Zoom out">
            −
          </button>
          <span>{zoom.toFixed(2)}×</span>
          <button type="button" className="fw-icon-btn" onClick={() => onZoom(Math.min(8, zoom * 1.25))} title="Zoom in">
            +
          </button>
        </span>
        <label className="fw-wave-y" title="Vertical waveform zoom">
          Y
          <input
            type="range"
            min={0.5}
            max={3}
            step={0.1}
            value={waveformZoomY}
            onChange={(e) => onWaveformZoomY(Number(e.target.value))}
          />
        </label>
      </div>

      <div className="fw-ruler" aria-hidden>
        {Array.from({ length: majorTicks }, (_, i) => {
          const t = (i / (majorTicks - 1)) * visibleDur
          return (
            <span key={`m-${i}`} className="fw-ruler__major" style={{ left: `${(i / (majorTicks - 1)) * 100}%` }}>
              {fmtRuler(t)}
            </span>
          )
        })}
        {Array.from({ length: (majorTicks - 1) * minorPerMajor }, (_, i) => {
          const seg = Math.floor(i / minorPerMajor)
          const sub = (i % minorPerMajor) + 1
          const frac = (seg + sub / minorPerMajor) / (majorTicks - 1)
          return <i key={`n-${i}`} className="fw-ruler__minor" style={{ left: `${frac * 100}%` }} />
        })}
        <div className="fw-playhead fw-playhead--ruler" style={{ left: `${(playheadSec / visibleDur) * 100}%` }} />
        {markers.map((m) => (
          <div
            key={m.id}
            className="fw-marker"
            style={{ left: `${(m.timeSec / visibleDur) * 100}%` }}
            title={m.label || fmtTime(m.timeSec)}
          />
        ))}
      </div>

      {multi ? (
        <div className="fw-multi" data-testid="timeline-multitrack">
          {lanes!.map((lane) => (
            <div
              key={lane.id}
              className="fw-multi__lane"
              data-testid={`timeline-lane-${lane.id}`}
              onPointerDown={(e) => {
                if (!onLaneOffset) return
                const el = e.currentTarget
                el.setPointerCapture(e.pointerId)
                laneDrag.current = {
                  id: lane.id,
                  originStart: lane.startSec,
                  pointer0: secFromClientX(el, e.clientX),
                }
              }}
              onPointerMove={(e) => {
                if (!laneDrag.current || laneDrag.current.id !== lane.id || !onLaneOffset) return
                const t = secFromClientX(e.currentTarget, e.clientX)
                const delta = t - laneDrag.current.pointer0
                onLaneOffset(lane.id, Math.max(0, laneDrag.current.originStart + delta))
              }}
              onPointerUp={() => {
                laneDrag.current = null
              }}
            >
              <span className="fw-multi__label">{lane.label}</span>
              <div
                className="fw-multi__wave-wrap"
                style={{
                  left: `${(lane.startSec / visibleDur) * 100}%`,
                  width: `${(lane.durationSec / visibleDur) * 100}%`,
                }}
              >
                <svg
                  className="fw-wave fw-wave--lane"
                  viewBox={`0 0 ${Math.max(1, lane.waveform.length)} 100`}
                  preserveAspectRatio="none"
                >
                  {lane.waveform.map((h, i) => (
                    <rect
                      key={i}
                      x={i}
                      y={50 - h * 46 * waveformZoomY}
                      width="0.85"
                      height={Math.max(1, h * 92 * waveformZoomY)}
                      rx="0.15"
                    />
                  ))}
                </svg>
              </div>
            </div>
          ))}
          <div
            className="fw-playhead fw-playhead--multi"
            style={{ left: `${(playheadSec / visibleDur) * 100}%` }}
          />
        </div>
      ) : (
        <div
          className="fw-wave-stage"
          data-mode={viewMode}
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
          {viewMode === 'spectrogram' && spectrogram ? (
            <svg
              className="fw-wave fw-wave--spec"
              viewBox={`0 0 ${spectrogram.cols} ${spectrogram.rows}`}
              preserveAspectRatio="none"
              aria-label={`Spectrogram 0–${spectrogram.maxHz} Hz`}
            >
              {spectrogram.values.map((v, i) => {
                const c = i % spectrogram.cols
                const r = Math.floor(i / spectrogram.cols)
                return (
                  <rect
                    key={i}
                    x={c}
                    y={spectrogram.rows - 1 - r}
                    width="1"
                    height="1"
                    opacity={0.12 + v * 0.88}
                  />
                )
              })}
            </svg>
          ) : (
            <svg className="fw-wave" viewBox={`0 0 ${waveform.length} 100`} preserveAspectRatio="none">
              {waveform.map((h, i) => {
                const played = i / waveform.length < playheadSec / Math.max(0.001, durationSec)
                return (
                  <rect
                    key={i}
                    x={i}
                    y={50 - h * 46 * waveformZoomY}
                    width="0.85"
                    height={Math.max(1, h * 92 * waveformZoomY)}
                    rx="0.15"
                    data-played={played}
                  />
                )
              })}
            </svg>
          )}
          {unavailableFromSec != null && unavailableFromSec < durationSec ? (
            <div
              className="fw-unavailable"
              style={{
                left: `${(unavailableFromSec / visibleDur) * 100}%`,
                width: `${((durationSec - unavailableFromSec) / visibleDur) * 100}%`,
              }}
              title="Region not decoded"
            />
          ) : null}
          {selection && (
            <div
              className="fw-sel"
              style={{
                left: `${(selection.startSec / visibleDur) * 100}%`,
                width: `${((selection.endSec - selection.startSec) / visibleDur) * 100}%`,
              }}
            >
              <i className="fw-sel__handle fw-sel__handle--l" />
              <i className="fw-sel__handle fw-sel__handle--r" />
            </div>
          )}
          <div
            className="fw-playhead"
            style={{ left: `${(playheadSec / visibleDur) * 100}%` }}
          />
        </div>
      )}
      <p className="fw-timeline__hint">
        {multi
          ? 'Drag a track horizontally to adjust time offset · Timing tab for clock tools'
          : 'Shift+drag to select · click to seek'}
      </p>
    </div>
  )
}

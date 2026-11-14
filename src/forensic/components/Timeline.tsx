import { useEffect, useRef, type MutableRefObject } from 'react'
import type { Marker, SelectionRange } from '../forensicTypes'
import { fmtTime } from '../forensicEngine'
import type { PlayheadLiveClock } from '../playheadLive'
import { forensicsSourceDragId } from './FileBrowser'

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
  playheadLive,
  playing = false,
  compareSlots,
  onCompareDrop,
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
  /** Atualização da agulha no DOM durante play (sem re-render do workbench). */
  playheadLive?: MutableRefObject<PlayheadLiveClock>
  playing?: boolean
  compareSlots?: { a: string | null; b: string | null }
  onCompareDrop?: (slot: 'A' | 'B', sourceId: string) => void
}) {
  const rootRef = useRef<HTMLDivElement>(null)
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

  const playPct = (sec: number) => `${(sec / Math.max(0.001, visibleDur)) * 100}%`

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const apply = (sec: number) => {
      const left = playPct(sec)
      for (const el of root.querySelectorAll<HTMLElement>('.fw-playhead')) {
        el.style.left = left
      }
    }
    apply(playheadSec)
    const live = playheadLive?.current
    if (!live?.playing) return
    let raf = 0
    const tick = () => {
      apply(live.timelineSec())
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playheadSec, visibleDur, playing, playheadLive])

  return (
    <div className="fw-timeline" ref={rootRef}>
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
            data-testid="timeline-spectrogram"
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

      {compareSlots && onCompareDrop ? (
        <div className="fw-compare-slots" data-testid="fw-compare-slots">
          {(['A', 'B'] as const).map((slot) => (
            <div
              key={slot}
              className="fw-compare-slot"
              data-slot={slot}
              onDragOver={(e) => {
                e.preventDefault()
                e.dataTransfer.dropEffect = 'copy'
              }}
              onDrop={(e) => {
                e.preventDefault()
                const id = forensicsSourceDragId(e)
                if (id) onCompareDrop(slot, id)
              }}
            >
              <span className="fw-compare-slot__label">{slot}</span>
              <span className="fw-compare-slot__file">
                {slot === 'A' ? compareSlots.a ?? '— arrastar áudio —' : compareSlots.b ?? '— arrastar áudio —'}
              </span>
            </div>
          ))}
        </div>
      ) : null}

      {multi ? (
        <div className="fw-multi fw-multi--compare" data-testid="timeline-multitrack">
          {lanes!.map((lane) => (
            <div
              key={lane.id}
              className="fw-multi__lane"
              data-testid={`timeline-lane-${lane.id}`}
              onPointerMove={(e) => {
                if (!laneDrag.current || laneDrag.current.id !== lane.id || !onLaneOffset) return
                const t = secFromClientX(e.currentTarget, e.clientX)
                const delta = t - laneDrag.current.pointer0
                onLaneOffset(lane.id, laneDrag.current.originStart + delta)
              }}
              onPointerUp={() => {
                if (laneDrag.current?.id === lane.id) laneDrag.current = null
              }}
            >
              <span className="fw-multi__label">{lane.label}</span>
              {onLaneOffset ? (
                <span
                  className="fw-multi__grip"
                  title="Arrastar linha temporal"
                  onPointerDown={(e) => {
                    const row = e.currentTarget.closest('.fw-multi__lane') as HTMLElement | null
                    if (!row) return
                    row.setPointerCapture(e.pointerId)
                    laneDrag.current = {
                      id: lane.id,
                      originStart: lane.startSec,
                      pointer0: secFromClientX(row, e.clientX),
                    }
                    e.stopPropagation()
                  }}
                />
              ) : null}
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
          ? 'Protuberância na faixa = arrastar no tempo · soltar áudio nos slots A/B'
          : 'Shift+drag to select · click to seek'}
      </p>
    </div>
  )
}

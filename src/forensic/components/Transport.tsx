import { PLAYBACK_RATES } from '../forensicTypes'
import { fmtTime } from '../forensicEngine'
import type { SelectionRange } from '../forensicTypes'

function fmtPrecise(sec: number): string {
  const s = Math.max(0, sec)
  const m = Math.floor(s / 60)
  const r = s - m * 60
  return `${String(m).padStart(2, '0')}:${r.toFixed(3).padStart(6, '0')}`
}

export function Transport({
  playing,
  playheadSec,
  durationSec,
  loop,
  rate,
  selection,
  bypass,
  onPlay,
  onPause,
  onStop,
  onSeek,
  onLoop,
  onRate,
  onSkipSelStart,
  onSkipSelEnd,
  onBypass,
  onReset,
}: {
  playing: boolean
  playheadSec: number
  durationSec: number
  loop: boolean
  rate: number
  selection: SelectionRange | null
  bypass: boolean
  onPlay: () => void
  onPause: () => void
  onStop: () => void
  onSeek?: (sec: number) => void
  onLoop: (v: boolean) => void
  onRate: (r: number) => void
  onSkipSelStart: () => void
  onSkipSelEnd: () => void
  onBypass: (v: boolean) => void
  onReset: () => void
}) {
  const selDur = selection ? selection.endSec - selection.startSec : null
  const max = Math.max(0.001, durationSec)

  return (
    <div className="fw-transport" data-testid="fw-transport">
      <div className="fw-transport__row fw-transport__row--primary">
        <div className="fw-transport__controls">
          <button
            type="button"
            className="fw-icon-btn"
            disabled={!selection}
            onClick={onSkipSelStart}
            title="Selection start"
          >
            ⇤
          </button>
          <button
            type="button"
            className="fw-icon-btn fw-icon-btn--play"
            data-testid="fw-play-pause"
            onClick={playing ? onPause : onPlay}
            title={playing ? 'Pause' : 'Play'}
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? '❚❚' : '▶'}
          </button>
          <button
            type="button"
            className="fw-icon-btn fw-icon-btn--stop"
            data-testid="fw-stop"
            onClick={onStop}
            title="Stop"
            aria-label="Stop"
          >
            ■
          </button>
          <button
            type="button"
            className="fw-icon-btn"
            disabled={!selection}
            onClick={onSkipSelEnd}
            title="Selection end"
          >
            ⇥
          </button>
          <button
            type="button"
            className="fw-chip"
            data-on={loop}
            aria-pressed={loop}
            title="Loop"
            onClick={() => onLoop(!loop)}
          >
            ↺
          </button>
        </div>

        <div className="fw-transport__time" aria-live="polite">
          <span className="fw-transport__now">{fmtPrecise(playheadSec)}</span>
          <span className="fw-transport__sep">/</span>
          <span className="fw-transport__dur">{fmtTime(durationSec)}</span>
        </div>

        <label className="fw-transport__rate">
          <select
            className="fw-select"
            value={rate}
            onChange={(e) => onRate(Number(e.target.value))}
            aria-label="Playback speed"
          >
            {PLAYBACK_RATES.map((r) => (
              <option key={r} value={r}>
                {r.toFixed(2)}x
              </option>
            ))}
          </select>
        </label>

        {selDur != null && (
          <span className="fw-transport__sel" title="Selection duration">
            Sel {selDur.toFixed(3)}s
          </span>
        )}

        <div className="fw-transport__trail">
          <button
            type="button"
            className="fw-chip"
            data-on={bypass}
            aria-pressed={bypass}
            title="Bypass processing"
            onClick={() => onBypass(!bypass)}
          >
            Bypass
          </button>
          <button type="button" className="fw-btn fw-btn--ghost" onClick={onReset}>
            Reset
          </button>
        </div>
      </div>

      {onSeek ? (
        <div className="fw-transport__seek">
          <input
            type="range"
            className="fw-transport__scrub"
            data-testid="fw-transport-seek"
            min={0}
            max={max}
            step={0.01}
            value={Math.min(playheadSec, max)}
            aria-label="Seek"
            onChange={(e) => onSeek(Number(e.target.value))}
          />
        </div>
      ) : null}
    </div>
  )
}

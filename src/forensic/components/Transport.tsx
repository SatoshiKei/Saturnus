import { PLAYBACK_RATES } from '../forensicTypes'
import { fmtTime } from '../forensicEngine'
import type { SelectionRange } from '../forensicTypes'

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
  onLoop: (v: boolean) => void
  onRate: (r: number) => void
  onSkipSelStart: () => void
  onSkipSelEnd: () => void
  onBypass: (v: boolean) => void
  onReset: () => void
}) {
  return (
    <div className="fw-transport">
      <div className="fw-pane-h">TRANSPORT</div>
      <div className="fw-transport__row">
        <button type="button" className="fw-btn" onClick={playing ? onPause : onPlay}>
          {playing ? 'Pause' : 'Play'}
        </button>
        <button type="button" className="fw-btn" onClick={onStop}>
          Stop
        </button>
        <label className="fw-tog">
          <input type="checkbox" checked={loop} onChange={(e) => onLoop(e.target.checked)} />
          Loop
        </label>
        <button
          type="button"
          className="fw-btn"
          disabled={!selection}
          onClick={onSkipSelStart}
          title="Ir ao início da seleção"
        >
          ⇤ Sel
        </button>
        <button
          type="button"
          className="fw-btn"
          disabled={!selection}
          onClick={onSkipSelEnd}
          title="Ir ao fim da seleção"
        >
          Sel ⇥
        </button>
        <label className="fw-rate">
          Speed
          <select value={rate} onChange={(e) => onRate(Number(e.target.value))}>
            {PLAYBACK_RATES.map((r) => (
              <option key={r} value={r}>
                {r.toFixed(2)}x
              </option>
            ))}
          </select>
        </label>
        <span className="fw-time">
          {fmtTime(playheadSec)} / {fmtTime(durationSec)}
        </span>
      </div>
      <div className="fw-transport__row">
        <label className="fw-tog" title="Compara original sem processamento">
          <input type="checkbox" checked={bypass} onChange={(e) => onBypass(e.target.checked)} />
          BYPASS PROCESSING
        </label>
        <button type="button" className="fw-btn fw-btn--ghost" onClick={onReset}>
          Reset session
        </button>
      </div>
    </div>
  )
}

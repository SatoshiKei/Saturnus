import type { TrackRuntime } from '../forensicTypes'

export function TrackRow({
  track,
  name,
  channel,
  selected,
  onChange,
}: {
  track: TrackRuntime
  name: string
  channel?: string
  selected?: boolean
  onChange: (patch: Partial<TrackRuntime>) => void
}) {
  return (
    <div className="fw-track" data-muted={track.mute} data-selected={selected}>
      <span className="fw-track__name" title={channel}>
        {name}
      </span>
      <button
        type="button"
        className="fw-chip"
        data-on={track.mute}
        title="Mute"
        aria-pressed={track.mute}
        onClick={() => onChange({ mute: !track.mute })}
      >
        M
      </button>
      <button
        type="button"
        className="fw-chip"
        data-on={track.solo}
        title="Solo"
        aria-pressed={track.solo}
        onClick={() => onChange({ solo: !track.solo })}
      >
        S
      </button>
      <label className="fw-track__ctrl" title="Gain (dB)">
        <input
          type="range"
          min={-24}
          max={12}
          step={0.5}
          value={track.gainDb}
          onChange={(e) => onChange({ gainDb: Number(e.target.value) })}
        />
        <span className="fw-track__val">{track.gainDb.toFixed(1)}</span>
      </label>
      <label className="fw-track__ctrl" title="Pan">
        <input
          type="range"
          min={-100}
          max={100}
          step={1}
          value={track.pan}
          onChange={(e) => onChange({ pan: Number(e.target.value) })}
        />
      </label>
      <button
        type="button"
        className="fw-chip"
        data-on={track.visible}
        title="Visibility"
        aria-pressed={track.visible}
        onClick={() => onChange({ visible: !track.visible })}
      >
        V
      </button>
    </div>
  )
}

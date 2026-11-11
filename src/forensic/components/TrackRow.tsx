import type { TrackRuntime } from '../forensicTypes'

export function TrackRow({
  track,
  name,
  channel,
  onChange,
}: {
  track: TrackRuntime
  name: string
  channel?: string
  onChange: (patch: Partial<TrackRuntime>) => void
}) {
  return (
    <div className="fw-track" data-muted={track.mute}>
      <span className="fw-track__name" title={channel}>
        {name}
      </span>
      <label className="fw-track__tog" title="Mute">
        <input
          type="checkbox"
          checked={track.mute}
          onChange={(e) => onChange({ mute: e.target.checked })}
        />
        M
      </label>
      <label className="fw-track__tog" title="Solo">
        <input
          type="checkbox"
          checked={track.solo}
          onChange={(e) => onChange({ solo: e.target.checked })}
        />
        S
      </label>
      <label className="fw-track__gain" title="Gain (dB)">
        G
        <input
          type="range"
          min={-24}
          max={12}
          step={0.5}
          value={track.gainDb}
          onChange={(e) => onChange({ gainDb: Number(e.target.value) })}
        />
        <span>{track.gainDb.toFixed(1)}</span>
      </label>
      <label className="fw-track__pan" title="Pan">
        P
        <input
          type="range"
          min={-100}
          max={100}
          step={1}
          value={track.pan}
          onChange={(e) => onChange({ pan: Number(e.target.value) })}
        />
      </label>
      <label className="fw-track__tog" title="Visibility">
        <input
          type="checkbox"
          checked={track.visible}
          onChange={(e) => onChange({ visible: e.target.checked })}
        />
        V
      </label>
    </div>
  )
}

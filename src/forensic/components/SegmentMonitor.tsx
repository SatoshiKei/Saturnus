import {
  formatSegmentMonitorLine,
  opaqueSegmentLabel,
  segmentRecoveryPhase,
} from '../opaqueSegmentId'
import type { RecoveredSpeechEntry, SpeechSegment } from '../forensicTypes'
import type { SegmentClarity } from '../forensicEngine'

/**
 * Log de segmentos player-facing: IDs opacos + x/y ou ✓.
 * Nunca mostra texto da transcrição (isso é Recovered Speech após audição).
 */
export function SegmentMonitor({
  segments,
  clarity,
  recovered,
  heardIds,
}: {
  segments: SpeechSegment[]
  clarity: SegmentClarity[]
  recovered: RecoveredSpeechEntry[]
  /** Segmentos em que o playhead já habitou a região inteligível. */
  heardIds: Set<string>
}) {
  if (!segments.length) return null
  const recoveredIds = new Set(recovered.map((r) => r.segmentId))
  const clarityById = new Map(clarity.map((c) => [c.segmentId, c]))

  return (
    <section className="fw-analysis-log" data-testid="fw-analysis-log" aria-label="Analysis log">
      <div className="fw-analysis-log__head">Signal monitor</div>
      <ul className="fw-analysis-log__list">
        {segments.map((seg) => {
          const c = clarityById.get(seg.id)
          const score = c?.clarityScore ?? 0
          const threshold = c?.threshold ?? seg.clarityThreshold
          const phase = segmentRecoveryPhase({
            clarityScore: score,
            threshold,
            heard: heardIds.has(seg.id) || recoveredIds.has(seg.id),
            recovered: recoveredIds.has(seg.id),
          })
          const opaqueId = opaqueSegmentLabel(seg.id)
          const line = formatSegmentMonitorLine({
            opaqueId,
            clarityScore: score,
            threshold,
            phase,
          })
          return (
            <li
              key={seg.id}
              className="fw-analysis-log__row"
              data-testid={`segment-monitor-${seg.id}`}
              data-phase={phase}
              data-opaque={opaqueId}
            >
              <span className="fw-mono">{line}</span>
            </li>
          )
        })}
      </ul>
      <p className="fw-analysis-log__hint">
        Markers react to processing quality. Transcript appears in Recovered Speech only after the
        intelligible region is heard.
      </p>
    </section>
  )
}

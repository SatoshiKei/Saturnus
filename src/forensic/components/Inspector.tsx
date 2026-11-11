import type { ReactNode } from 'react'
import type {
  ForensicInspectorTab,
  ForensicSource,
  ForensicUiState,
  Marker,
  ProcessParams,
  RecoveredSpeechEntry,
} from '../forensicTypes'
import { INSPECTOR_TABS } from '../forensicTypes'
import { fmtTime, type SegmentClarity } from '../forensicEngine'

const HELP: Record<string, string> = {
  Gain: 'Ajusta amplitude linear da seleção ou da faixa ativa (dB).',
  Normalize: 'Aproxima o pico da região a um alvo em dBFS.',
  Pan: 'Posicionamento estéreo (−100 L … +100 R).',
  'High Pass': 'Atenua frequências abaixo do cutoff.',
  'Low Pass': 'Atenua frequências acima do cutoff.',
  'Band Pass': 'Mantém a faixa entre Low e High Hz.',
  Notch: 'Reduz uma faixa estreita em torno de uma frequência central.',
  Equalizer: 'Ganho por bandas fixas.',
  'Noise Profile':
    'Captura características espectrais da região selecionada para uso em processos de redução baseados em referência.',
  'Spectral Reduction':
    'Aplica redução baseada no perfil de ruído capturado. Requer um Noise Profile ativo.',
  Reverse: 'Inverte a região ou clip previsto pelo dataset.',
  Fade: 'Envelope linear de entrada/saída.',
}

function Tip({ name }: { name: string }) {
  return (
    <span className="fw-tip" title={HELP[name] ?? name}>
      ?
    </span>
  )
}

function Section({
  title,
  tip,
  children,
}: {
  title: string
  tip?: string
  children: ReactNode
}) {
  return (
    <details className="fw-sec" open>
      <summary>
        {title}
        {tip ? <Tip name={tip} /> : null}
      </summary>
      <div className="fw-sec__body">{children}</div>
    </details>
  )
}

function ParamRow({
  label,
  value,
  min,
  max,
  step,
  unit,
  disabled,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit?: string
  disabled?: boolean
  onChange: (v: number) => void
}) {
  const display =
    Math.abs(step) >= 1 && Number.isInteger(step)
      ? String(value)
      : value.toFixed(step < 0.1 ? 2 : 1)
  return (
    <div className="fw-param" data-disabled={disabled}>
      <span className="fw-param__label">{label}</span>
      <input
        className="fw-param__slider"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <label className="fw-param__value">
        <input
          type="number"
          value={display}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        {unit ? <span>{unit}</span> : null}
      </label>
    </div>
  )
}

export function Inspector({
  tab,
  onTab,
  source,
  ui,
  onProcess,
  onCaptureProfile,
  onActivateProfile,
  onAddMarker,
  onCompare,
  sources,
  showHelp,
  onToggleHelp,
  recoveredSpeech,
  clarityDebug,
}: {
  tab: ForensicInspectorTab
  onTab: (t: ForensicInspectorTab) => void
  source: ForensicSource | undefined
  ui: ForensicUiState
  onProcess: (patch: Partial<ProcessParams>) => void
  onCaptureProfile: () => void
  onActivateProfile: (id: string) => void
  onAddMarker: (m: Omit<Marker, 'id'>) => void
  onCompare: (a: string | null, b: string | null) => void
  sources: ForensicSource[]
  showHelp: boolean
  onToggleHelp: () => void
  recoveredSpeech: RecoveredSpeechEntry[]
  clarityDebug?: SegmentClarity[]
}) {
  const p = ui.process
  const hasProfile = Boolean(ui.activeNoiseProfileId)
  const activeProfile = ui.noiseProfiles.find((np) => np.id === ui.activeNoiseProfileId)

  return (
    <div className="fw-inspector">
      <div className="fw-inspector__head">
        <span className="fw-pane-h">Inspector</span>
        <button type="button" className="fw-btn fw-btn--ghost" onClick={onToggleHelp}>
          Help
        </button>
      </div>
      {showHelp && (
        <div className="fw-help">
          <p>Descrições técnicas das ferramentas. Não há orientação de caso.</p>
          <ul>
            {Object.entries(HELP).map(([k, v]) => (
              <li key={k}>
                <strong>{k}</strong> — {v}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="fw-tabs" role="tablist">
        {INSPECTOR_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            data-active={tab === t.id}
            className="fw-tab"
            onClick={() => onTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="fw-inspector__body">
        {tab === 'process' && (
          <div className="fw-panel">
            <Section title="Gain" tip="Gain">
              <ParamRow label="Gain" value={p.gainDb} min={-24} max={24} step={0.5} unit="dB" onChange={(v) => onProcess({ gainDb: v })} />
            </Section>
            <Section title="Normalize" tip="Normalize">
              <ParamRow label="Target peak" value={p.normalizePeak} min={-24} max={0} step={0.5} unit="dB" onChange={(v) => onProcess({ normalizePeak: v })} />
            </Section>
            <Section title="Pan" tip="Pan">
              <ParamRow label="Pan" value={p.pan} min={-100} max={100} step={1} onChange={(v) => onProcess({ pan: v })} />
            </Section>
            <Section title="High pass" tip="High Pass">
              <ParamRow label="Cutoff" value={p.highPassHz} min={20} max={8000} step={1} unit="Hz" onChange={(v) => onProcess({ highPassHz: v })} />
              <ParamRow label="Slope" value={p.highPassSlope} min={6} max={48} step={6} unit="dB/oct" onChange={(v) => onProcess({ highPassSlope: v })} />
            </Section>
            <Section title="Low pass" tip="Low Pass">
              <ParamRow label="Cutoff" value={p.lowPassHz} min={200} max={20000} step={1} unit="Hz" onChange={(v) => onProcess({ lowPassHz: v })} />
              <ParamRow label="Slope" value={p.lowPassSlope} min={6} max={48} step={6} unit="dB/oct" onChange={(v) => onProcess({ lowPassSlope: v })} />
            </Section>
            <Section title="Band pass" tip="Band Pass">
              <ParamRow label="Low" value={p.bandPassLowHz} min={20} max={20000} step={1} unit="Hz" onChange={(v) => onProcess({ bandPassLowHz: v })} />
              <ParamRow label="High" value={p.bandPassHighHz} min={20} max={20000} step={1} unit="Hz" onChange={(v) => onProcess({ bandPassHighHz: v })} />
            </Section>
            <Section title="Notch filter" tip="Notch">
              <ParamRow label="Center" value={p.notchCenterHz} min={50} max={8000} step={1} unit="Hz" onChange={(v) => onProcess({ notchCenterHz: v })} />
              <ParamRow label="Width" value={p.notchWidthHz} min={10} max={2000} step={1} unit="Hz" onChange={(v) => onProcess({ notchWidthHz: v })} />
              <ParamRow label="Reduction" value={p.notchReductionDb} min={-48} max={0} step={0.5} unit="dB" onChange={(v) => onProcess({ notchReductionDb: v })} />
            </Section>
            <Section title="Equalizer" tip="Equalizer">
              <div className="fw-eq">
                {Object.entries(p.eqBands).map(([band, gain]) => (
                  <label key={band} className="fw-eq__band">
                    <span>{band}</span>
                    <input
                      type="range"
                      min={-12}
                      max={12}
                      step={0.5}
                      value={gain}
                      onChange={(e) =>
                        onProcess({ eqBands: { ...p.eqBands, [band]: Number(e.target.value) } })
                      }
                    />
                    <span>{gain.toFixed(1)}</span>
                  </label>
                ))}
              </div>
            </Section>
            <Section title="Noise profile" tip="Noise Profile">
              {!ui.noiseProfiles.length ? (
                <p className="fw-empty">No profile captured</p>
              ) : (
                <ul className="fw-profiles">
                  {ui.noiseProfiles.map((np) => (
                    <li key={np.id}>
                      <button
                        type="button"
                        className="fw-profile"
                        data-active={ui.activeNoiseProfileId === np.id}
                        onClick={() => onActivateProfile(np.id)}
                      >
                        <span className="fw-profile__name">{np.name}</span>
                        <span className="fw-profile__meta">
                          {fmtTime(np.startSec)} – {fmtTime(np.endSec)}
                          {' · '}
                          {(np.endSec - np.startSec).toFixed(2)} s
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {activeProfile && (
                <p className="fw-profile-active">
                  Profile · {fmtTime(activeProfile.startSec)} – {fmtTime(activeProfile.endSec)} ·{' '}
                  {(activeProfile.endSec - activeProfile.startSec).toFixed(2)} s
                </p>
              )}
              <button type="button" className="fw-btn" onClick={onCaptureProfile}>
                Capture profile
              </button>
            </Section>
            <Section title="Spectral reduction" tip="Spectral Reduction">
              {!hasProfile && <p className="fw-empty">Requires a captured noise profile.</p>}
              <ParamRow
                label="Reduction"
                value={p.spectralReduction}
                min={0}
                max={100}
                step={1}
                unit="%"
                disabled={!hasProfile}
                onChange={(v) => onProcess({ spectralReduction: v })}
              />
              <ParamRow
                label="Sensitivity"
                value={p.spectralSensitivity}
                min={0}
                max={100}
                step={1}
                onChange={(v) => onProcess({ spectralSensitivity: v })}
              />
              <ParamRow
                label="Smoothing"
                value={p.spectralSmoothing}
                min={0}
                max={100}
                step={1}
                onChange={(v) => onProcess({ spectralSmoothing: v })}
              />
            </Section>
            <Section title="Reverse" tip="Reverse">
              <button
                type="button"
                className="fw-chip"
                data-on={p.reverse}
                aria-pressed={p.reverse}
                onClick={() => onProcess({ reverse: !p.reverse })}
              >
                Apply reverse to selection
              </button>
            </Section>
            <Section title="Fade" tip="Fade">
              <ParamRow label="Fade in" value={p.fadeInSec} min={0} max={5} step={0.05} unit="s" onChange={(v) => onProcess({ fadeInSec: v })} />
              <ParamRow label="Fade out" value={p.fadeOutSec} min={0} max={5} step={0.05} unit="s" onChange={(v) => onProcess({ fadeOutSec: v })} />
            </Section>
            <button
              type="button"
              className="fw-btn fw-btn--ghost"
              onClick={() =>
                onProcess({
                  gainDb: 0,
                  pan: 0,
                  highPassHz: 20,
                  lowPassHz: 20000,
                  notchReductionDb: 0,
                  spectralReduction: 0,
                  reverse: false,
                  fadeInSec: 0,
                  fadeOutSec: 0,
                })
              }
            >
              Reset parameters
            </button>
          </div>
        )}

        {tab === 'analysis' && (
          <div className="fw-panel">
            <Section title="Waveform">
              <p className="fw-muted">Use the main timeline view toggle.</p>
            </Section>
            <Section title="Spectrogram">
              {source?.audio?.spectrogram ? (
                <SpectrogramView data={source.audio.spectrogram} duration={source.durationSec} />
              ) : (
                <p className="fw-empty">No spectrogram data for this source.</p>
              )}
            </Section>
            <Section title="Frequency analyzer">
              {source?.audio?.spectrum ? (
                <SpectrumView data={source.audio.spectrum} />
              ) : (
                <p className="fw-empty">No spectrum data.</p>
              )}
            </Section>
            <Section title="Markers">
              <button
                type="button"
                className="fw-btn"
                onClick={() => onAddMarker({ timeSec: ui.playheadSec, label: '' })}
              >
                Add marker @ playhead
              </button>
              <ul className="fw-markers">
                {ui.markers.map((m) => (
                  <li key={m.id}>
                    <span className="fw-mono">{fmtTime(m.timeSec)}</span> {m.label}
                  </li>
                ))}
              </ul>
            </Section>
            <Section title="Measure">
              {ui.selection ? (
                <p>
                  Selection duration{' '}
                  <strong className="fw-mono">
                    {(ui.selection.endSec - ui.selection.startSec).toFixed(3)} s
                  </strong>
                </p>
              ) : (
                <p className="fw-empty">Shift+drag on the timeline to measure.</p>
              )}
            </Section>
          </div>
        )}

        {tab === 'file' && (
          <div className="fw-panel">
            <dl className="fw-meta">
              {(source?.metadata ?? []).map((f) => (
                <div key={f.key}>
                  <dt>{f.label}</dt>
                  <dd className="fw-mono">{f.value || '—'}</dd>
                </div>
              ))}
              {!source?.metadata?.length && <p className="fw-empty">No metadata.</p>}
            </dl>
          </div>
        )}

        {tab === 'structure' && (
          <div className="fw-panel">
            {source?.structure?.blocks?.length ? (
              <>
                {source.structure.blocks.map((b) => (
                  <div key={b.id} className="fw-struct-block">
                    <strong>{b.label}</strong>
                    <dl className="fw-meta">
                      {b.fields.map((f) => (
                        <div key={f.key}>
                          <dt>{f.label}</dt>
                          <dd className="fw-mono">{f.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ))}
                {source.structure.canRebuild && (
                  <button type="button" className="fw-btn">
                    Rebuild container
                  </button>
                )}
              </>
            ) : (
              <p className="fw-empty fw-empty--center">
                {source?.structure?.emptyMessage ??
                  'No editable structure for this source.'}
              </p>
            )}
          </div>
        )}

        {tab === 'packets' && (
          <div className="fw-panel">
            {source?.packets?.rows?.length ? (
              <>
                <div className="fw-packet-tools">
                  <label className="fw-inline">
                    Sort by
                    <select className="fw-select" defaultValue="index">
                      <option value="index">Index</option>
                      <option value="arrival">Arrival</option>
                      <option value="sequence">Sequence</option>
                    </select>
                  </label>
                  <button type="button" className="fw-btn">
                    Build stream from selection
                  </button>
                </div>
                <table className="fw-table">
                  <thead>
                    <tr>
                      <th>Index</th>
                      <th>Arrival</th>
                      <th>Seq</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {source.packets.rows.map((r) => (
                      <tr key={r.index}>
                        <td className="fw-mono">{r.index}</td>
                        <td className="fw-mono">{r.arrival ?? '—'}</td>
                        <td className="fw-mono">{r.sequence ?? '—'}</td>
                        <td>{r.status ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            ) : (
              <p className="fw-empty fw-empty--center">
                {source?.packets?.emptyMessage ??
                  'No packet structure for this source.'}
              </p>
            )}
          </div>
        )}

        {tab === 'timing' && (
          <div className="fw-panel">
            <dl className="fw-meta">
              <div>
                <dt>Source duration</dt>
                <dd className="fw-mono">{source ? fmtTime(source.durationSec) : '—'}</dd>
              </div>
              <div>
                <dt>Current playhead</dt>
                <dd className="fw-mono">{fmtTime(ui.playheadSec)}</dd>
              </div>
              <div>
                <dt>Selection duration</dt>
                <dd className="fw-mono">
                  {ui.selection
                    ? `${(ui.selection.endSec - ui.selection.startSec).toFixed(3)} s`
                    : '—'}
                </dd>
              </div>
              {source?.timing?.sourceClock && (
                <div>
                  <dt>Source clock</dt>
                  <dd className="fw-mono">{source.timing.sourceClock}</dd>
                </div>
              )}
            </dl>
          </div>
        )}

        {tab === 'compare' && (
          <div className="fw-panel">
            <label className="fw-inline fw-inline--stack">
              Source A
              <select
                className="fw-select"
                value={ui.compareSourceA ?? ''}
                onChange={(e) => onCompare(e.target.value || null, ui.compareSourceB)}
              >
                <option value="">—</option>
                {sources.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.filename}
                  </option>
                ))}
              </select>
            </label>
            <label className="fw-inline fw-inline--stack">
              Source B
              <select
                className="fw-select"
                value={ui.compareSourceB ?? ''}
                onChange={(e) => onCompare(ui.compareSourceA, e.target.value || null)}
              >
                <option value="">—</option>
                {sources.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.filename}
                  </option>
                ))}
              </select>
            </label>
            {!ui.compareSourceA || !ui.compareSourceB ? (
              <p className="fw-empty fw-empty--center">Select two sources to compare.</p>
            ) : (
              <p className="fw-muted">
                Overlay / metadata / fingerprint — available when both sources have data.
              </p>
            )}
          </div>
        )}

        {tab === 'notes' && (
          <div className="fw-panel">
            <Section title="Recovered Speech">
              {!recoveredSpeech.length ? (
                <p className="fw-empty" data-testid="recovered-speech-empty">
                  No intelligible speech recovered.
                </p>
              ) : (
                <ul className="fw-recovered" data-testid="recovered-speech-list">
                  {[...recoveredSpeech]
                    .sort((a, b) => a.startSec - b.startSec)
                    .map((entry) => (
                      <li key={entry.segmentId} className="fw-recovered__item">
                        <span className="fw-mono">{fmtTime(entry.startSec)}</span>
                        <span className="fw-recovered__text">“{entry.text}”</span>
                      </li>
                    ))}
                </ul>
              )}
              <p className="fw-muted">
                Passive monitor — fragments appear when the signal is clear enough for a reliable transcript.
              </p>
            </Section>
            {import.meta.env.DEV && clarityDebug?.length ? (
              <Section title="DEV — segment clarity">
                <ul className="fw-recovered fw-recovered--debug">
                  {clarityDebug.map((c) => {
                    const seg = source?.speechSegments?.find((s) => s.id === c.segmentId)
                    return (
                      <li key={c.segmentId} className="fw-mono">
                        <div>{(seg?.text ?? c.segmentId).toUpperCase()}</div>
                        <div>
                          center {c.centerContribution.toFixed(2)} depth {c.depthContribution.toFixed(2)}{' '}
                          width {c.widthContribution.toFixed(2)} noise {c.noiseContribution.toFixed(2)}
                        </div>
                        <div>
                          voiceGain {c.effectiveVoiceGain.toFixed(2)} maskGain {c.effectiveMaskGain.toFixed(2)}
                        </div>
                        <div>
                          clarity {c.clarityScore.toFixed(2)} / threshold {c.threshold.toFixed(2)}{' '}
                          {c.unlocked ? 'UNLOCKED' : 'LOCKED'}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </Section>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}

function SpectrogramView({
  data,
  duration,
}: {
  data: { cols: number; rows: number; values: number[]; maxHz: number }
  duration: number
}) {
  return (
    <div className="fw-spec-wrap">
      <svg
        className="fw-spec"
        viewBox={`0 0 ${data.cols} ${data.rows}`}
        preserveAspectRatio="none"
        aria-label={`Espectrograma 0–${data.maxHz} Hz, ${duration}s`}
      >
        {data.values.map((v, i) => {
          const c = i % data.cols
          const r = Math.floor(i / data.cols)
          return (
            <rect
              key={i}
              x={c}
              y={data.rows - 1 - r}
              width="1"
              height="1"
              opacity={0.1 + v * 0.9}
            />
          )
        })}
      </svg>
      <p className="fw-muted">
        0–{data.maxHz} Hz · open in timeline for full width
      </p>
    </div>
  )
}

function SpectrumView({
  data,
}: {
  data: { frequencies: number[]; magnitudes: number[] }
}) {
  const w = 320
  const h = 120
  const maxF = data.frequencies[data.frequencies.length - 1] || 4000
  const pts = data.frequencies
    .map((f, i) => {
      const x = (f / maxF) * w
      const y = h - data.magnitudes[i]! * (h - 6)
      return `${x},${y}`
    })
    .join(' ')
  return (
    <div className="fw-spectrum-wrap">
      <svg className="fw-spectrum" viewBox={`0 0 ${w} ${h}`} aria-label="Frequency × Magnitude">
        <g className="fw-spectrum__grid" aria-hidden>
          {[0.25, 0.5, 0.75].map((g) => (
            <line key={g} x1="0" x2={w} y1={h * g} y2={h * g} />
          ))}
        </g>
        <polyline fill="none" stroke="currentColor" strokeWidth="1.4" points={pts} />
      </svg>
      <p className="fw-muted">Frequency × Magnitude</p>
    </div>
  )
}

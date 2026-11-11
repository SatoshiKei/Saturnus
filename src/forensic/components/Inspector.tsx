import type {
  ForensicInspectorTab,
  ForensicSource,
  ForensicUiState,
  Marker,
  ProcessParams,
} from '../forensicTypes'
import { INSPECTOR_TABS } from '../forensicTypes'
import { fmtTime } from '../forensicEngine'

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

function Num({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit?: string
  onChange: (v: number) => void
}) {
  return (
    <label className="fw-field">
      <span>
        {label}
        {unit ? ` (${unit})` : ''}
      </span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
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
  onNotes,
  onCompare,
  sources,
  showHelp,
  onToggleHelp,
}: {
  tab: ForensicInspectorTab
  onTab: (t: ForensicInspectorTab) => void
  source: ForensicSource | undefined
  ui: ForensicUiState
  onProcess: (patch: Partial<ProcessParams>) => void
  onCaptureProfile: () => void
  onActivateProfile: (id: string) => void
  onAddMarker: (m: Omit<Marker, 'id'>) => void
  onNotes: (text: string) => void
  onCompare: (a: string | null, b: string | null) => void
  sources: ForensicSource[]
  showHelp: boolean
  onToggleHelp: () => void
}) {
  const p = ui.process
  const hasProfile = Boolean(ui.activeNoiseProfileId)

  return (
    <div className="fw-inspector">
      <div className="fw-pane-h">
        INSPECTOR
        <button type="button" className="fw-btn fw-btn--ghost" onClick={onToggleHelp}>
          HELP
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
            <h4>
              Gain <Tip name="Gain" />
            </h4>
            <Num label="Gain" value={p.gainDb} min={-24} max={24} step={0.5} unit="dB" onChange={(v) => onProcess({ gainDb: v })} />
            <h4>
              Normalize <Tip name="Normalize" />
            </h4>
            <Num
              label="Target peak"
              value={p.normalizePeak}
              min={-24}
              max={0}
              step={0.5}
              unit="dB"
              onChange={(v) => onProcess({ normalizePeak: v })}
            />
            <h4>
              Pan <Tip name="Pan" />
            </h4>
            <Num label="Pan" value={p.pan} min={-100} max={100} step={1} onChange={(v) => onProcess({ pan: v })} />
            <h4>
              High Pass <Tip name="High Pass" />
            </h4>
            <Num label="Cutoff" value={p.highPassHz} min={20} max={8000} step={1} unit="Hz" onChange={(v) => onProcess({ highPassHz: v })} />
            <Num label="Slope" value={p.highPassSlope} min={6} max={48} step={6} unit="dB/oct" onChange={(v) => onProcess({ highPassSlope: v })} />
            <h4>
              Low Pass <Tip name="Low Pass" />
            </h4>
            <Num label="Cutoff" value={p.lowPassHz} min={200} max={20000} step={1} unit="Hz" onChange={(v) => onProcess({ lowPassHz: v })} />
            <Num label="Slope" value={p.lowPassSlope} min={6} max={48} step={6} unit="dB/oct" onChange={(v) => onProcess({ lowPassSlope: v })} />
            <h4>
              Band Pass <Tip name="Band Pass" />
            </h4>
            <Num label="Low" value={p.bandPassLowHz} min={20} max={20000} step={1} unit="Hz" onChange={(v) => onProcess({ bandPassLowHz: v })} />
            <Num label="High" value={p.bandPassHighHz} min={20} max={20000} step={1} unit="Hz" onChange={(v) => onProcess({ bandPassHighHz: v })} />
            <h4>
              Notch <Tip name="Notch" />
            </h4>
            <Num label="Center" value={p.notchCenterHz} min={50} max={8000} step={1} unit="Hz" onChange={(v) => onProcess({ notchCenterHz: v })} />
            <Num label="Width" value={p.notchWidthHz} min={10} max={2000} step={1} unit="Hz" onChange={(v) => onProcess({ notchWidthHz: v })} />
            <Num
              label="Reduction"
              value={p.notchReductionDb}
              min={-48}
              max={0}
              step={0.5}
              unit="dB"
              onChange={(v) => onProcess({ notchReductionDb: v })}
            />
            <h4>
              Equalizer <Tip name="Equalizer" />
            </h4>
            <div className="fw-eq">
              {Object.entries(p.eqBands).map(([band, gain]) => (
                <label key={band}>
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
            <h4>
              Noise Profile <Tip name="Noise Profile" />
            </h4>
            <button type="button" className="fw-btn" onClick={onCaptureProfile}>
              CAPTURE PROFILE
            </button>
            <ul className="fw-profiles">
              {ui.noiseProfiles.map((np) => (
                <li key={np.id}>
                  <button
                    type="button"
                    className="fw-btn fw-btn--ghost"
                    data-active={ui.activeNoiseProfileId === np.id}
                    onClick={() => onActivateProfile(np.id)}
                  >
                    {np.name} · {fmtTime(np.startSec)}–{fmtTime(np.endSec)}
                  </button>
                </li>
              ))}
            </ul>
            <h4>
              Spectral Reduction <Tip name="Spectral Reduction" />
            </h4>
            {!hasProfile && <p className="fw-muted">Requer um Noise Profile capturado.</p>}
            <label className="fw-field">
              <span>Reduction %</span>
              <input
                type="range"
                min={0}
                max={100}
                value={p.spectralReduction}
                disabled={!hasProfile}
                onChange={(e) => onProcess({ spectralReduction: Number(e.target.value) })}
              />
              <span>{p.spectralReduction}</span>
            </label>
            <Num
              label="Sensitivity"
              value={p.spectralSensitivity}
              min={0}
              max={100}
              step={1}
              onChange={(v) => onProcess({ spectralSensitivity: v })}
            />
            <Num
              label="Smoothing"
              value={p.spectralSmoothing}
              min={0}
              max={100}
              step={1}
              onChange={(v) => onProcess({ spectralSmoothing: v })}
            />
            <h4>
              Reverse <Tip name="Reverse" />
            </h4>
            <label className="fw-tog">
              <input
                type="checkbox"
                checked={p.reverse}
                onChange={(e) => onProcess({ reverse: e.target.checked })}
              />
              Apply reverse to selection
            </label>
            <h4>
              Fade <Tip name="Fade" />
            </h4>
            <Num label="Fade In" value={p.fadeInSec} min={0} max={5} step={0.05} unit="s" onChange={(v) => onProcess({ fadeInSec: v })} />
            <Num label="Fade Out" value={p.fadeOutSec} min={0} max={5} step={0.05} unit="s" onChange={(v) => onProcess({ fadeOutSec: v })} />
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
            <h4>Waveform</h4>
            <p className="fw-muted">Sempre disponível na timeline.</p>
            <h4>Spectrogram</h4>
            {source?.audio?.spectrogram ? (
              <SpectrogramView data={source.audio.spectrogram} duration={source.durationSec} />
            ) : (
              <p className="fw-muted">Sem dados de espectrograma para esta fonte.</p>
            )}
            <h4>Frequency Analyzer</h4>
            {source?.audio?.spectrum ? (
              <SpectrumView data={source.audio.spectrum} />
            ) : (
              <p className="fw-muted">Sem dados de espectro.</p>
            )}
            <h4>Markers</h4>
            <button
              type="button"
              className="fw-btn"
              onClick={() =>
                onAddMarker({ timeSec: ui.playheadSec, label: '' })
              }
            >
              Add marker @ playhead
            </button>
            <ul className="fw-markers">
              {ui.markers.map((m) => (
                <li key={m.id}>
                  {fmtTime(m.timeSec)} {m.label}
                </li>
              ))}
            </ul>
            <h4>Measure</h4>
            {ui.selection ? (
              <p>
                Selection duration:{' '}
                <strong>{(ui.selection.endSec - ui.selection.startSec).toFixed(3)} s</strong>
              </p>
            ) : (
              <p className="fw-muted">Selecione uma região na timeline (Shift+arrastar).</p>
            )}
          </div>
        )}

        {tab === 'file' && (
          <div className="fw-panel">
            <h4>File properties</h4>
            <dl className="fw-meta">
              {(source?.metadata ?? []).map((f) => (
                <div key={f.key}>
                  <dt>{f.label}</dt>
                  <dd>{f.value || '—'}</dd>
                </div>
              ))}
              {!source?.metadata?.length && <p className="fw-muted">Sem metadados.</p>}
            </dl>
          </div>
        )}

        {tab === 'structure' && (
          <div className="fw-panel">
            <h4>STRUCTURE</h4>
            {source?.structure?.blocks?.length ? (
              <>
                {source.structure.blocks.map((b) => (
                  <div key={b.id} className="fw-struct-block">
                    <strong>{b.label}</strong>
                    <dl className="fw-meta">
                      {b.fields.map((f) => (
                        <div key={f.key}>
                          <dt>{f.label}</dt>
                          <dd>{f.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ))}
                {source.structure.canRebuild && (
                  <button type="button" className="fw-btn">
                    REBUILD CONTAINER
                  </button>
                )}
              </>
            ) : (
              <p className="fw-muted">
                {source?.structure?.emptyMessage ??
                  'Este formato não expõe blocos editáveis.'}
              </p>
            )}
          </div>
        )}

        {tab === 'packets' && (
          <div className="fw-panel">
            <h4>PACKETS</h4>
            {source?.packets?.rows?.length ? (
              <>
                <div className="fw-packet-tools">
                  <label>
                    Sort by
                    <select defaultValue="index">
                      <option value="index">Index</option>
                      <option value="arrival">Arrival</option>
                      <option value="sequence">Sequence</option>
                    </select>
                  </label>
                  <button type="button" className="fw-btn">
                    Build Stream From Selection
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
                        <td>{r.index}</td>
                        <td>{r.arrival ?? '—'}</td>
                        <td>{r.sequence ?? '—'}</td>
                        <td>{r.status ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            ) : (
              <p className="fw-muted">
                {source?.packets?.emptyMessage ??
                  'Nenhuma estrutura de pacotes disponível para esta fonte.'}
              </p>
            )}
          </div>
        )}

        {tab === 'timing' && (
          <div className="fw-panel">
            <h4>TIMING</h4>
            <dl className="fw-meta">
              <div>
                <dt>Source duration</dt>
                <dd>{source ? fmtTime(source.durationSec) : '—'}</dd>
              </div>
              <div>
                <dt>Current playhead</dt>
                <dd>{fmtTime(ui.playheadSec)}</dd>
              </div>
              <div>
                <dt>Selection duration</dt>
                <dd>
                  {ui.selection
                    ? `${(ui.selection.endSec - ui.selection.startSec).toFixed(3)} s`
                    : '—'}
                </dd>
              </div>
              {source?.timing?.sourceClock && (
                <div>
                  <dt>Source clock</dt>
                  <dd>{source.timing.sourceClock}</dd>
                </div>
              )}
            </dl>
          </div>
        )}

        {tab === 'compare' && (
          <div className="fw-panel">
            <h4>COMPARE</h4>
            <label className="fw-field">
              <span>Source A</span>
              <select
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
            <label className="fw-field">
              <span>Source B</span>
              <select
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
              <p className="fw-muted">Selecione duas fontes para comparação.</p>
            ) : (
              <p className="fw-muted">Overlay / metadata / fingerprint — disponível quando ambas as fontes tiverem dados.</p>
            )}
          </div>
        )}

        {tab === 'notes' && (
          <div className="fw-panel">
            <h4>NOTES / TRANSCRIPTION</h4>
            <textarea
              className="fw-notes"
              value={ui.transcriptionNotes}
              onChange={(e) => onNotes(e.target.value)}
              rows={12}
              placeholder="Registre trechos identificados…"
              spellCheck={false}
            />
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
        0–{data.maxHz} Hz · cursor/zoom básico via timeline
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
  const h = 100
  const maxF = data.frequencies[data.frequencies.length - 1] || 4000
  const pts = data.frequencies
    .map((f, i) => {
      const x = (f / maxF) * w
      const y = h - data.magnitudes[i]! * (h - 4)
      return `${x},${y}`
    })
    .join(' ')
  return (
    <div>
      <svg className="fw-spectrum" viewBox={`0 0 ${w} ${h}`} aria-label="Frequency × Magnitude">
        <polyline fill="none" stroke="currentColor" strokeWidth="1.2" points={pts} />
      </svg>
      <p className="fw-muted">Frequency × Magnitude</p>
    </div>
  )
}

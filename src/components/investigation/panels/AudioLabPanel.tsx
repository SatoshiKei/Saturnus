import { useEffect, useMemo, useRef, useState } from 'react'
import { seedAnalysisModules } from '../../../data/game/seedAnalysisModules'
import { useInvestigation } from '../../../game/hooks/useInvestigation'
import type { Evidence } from '../../../game/types'
import { assetPath } from '../../../lib/assetPath'
import { evidenceOriginLabel, evidenceSourceLabel, evidenceTypeLabel } from '../../../lib/labels'
import { runProvisionalEmergencyAnalysis } from '../../../game/story/block01Handlers'
import { runProvisionalRafaelForwardAnalysis } from '../../../game/story/block02Handlers'
import {
  runProvisionalJanusSync,
  runProvisionalSaturnaliaReconstruct,
} from '../../../game/story/block03Handlers'
import {
  onUnknownRecordingAnalyzed,
  runProvisionalHexagonSolve,
} from '../../../game/story/block04Handlers'
import { HEX_CYCLE, HEX_NODES, HEX_PHRASE } from '../../../data/block04/hexagonPuzzle'
import { GamePanel } from '../../ui/GamePanel'

/** PRNG determinístico a partir do id — a forma de onda é estável entre sessões. */
function seeded(id: string) {
  let s = 0
  for (let i = 0; i < id.length; i++) s = (s * 31 + id.charCodeAt(i)) >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

function Waveform({ id, progress, dim }: { id: string; progress: number; dim?: boolean }) {
  const bars = useMemo(() => {
    const r = seeded(id)
    return Array.from({ length: 110 }, (_, i) => {
      const env = 0.25 + 0.75 * Math.abs(Math.sin(i / 9 + r() * 0.8))
      return Math.max(0.06, env * (0.35 + r() * 0.65))
    })
  }, [id])
  return (
    <svg className="aw-wave" viewBox="0 0 440 100" preserveAspectRatio="none" aria-hidden data-dim={dim}>
      {bars.map((h, i) => (
        <rect
          key={i}
          x={i * 4}
          y={50 - h * 46}
          width="2.4"
          height={h * 92}
          rx="1"
          data-played={i / bars.length < progress}
        />
      ))}
      <line x1={progress * 440} x2={progress * 440} y1="0" y2="100" className="aw-wave__head" />
    </svg>
  )
}

function Spectrogram({ id }: { id: string }) {
  const cells = useMemo(() => {
    const r = seeded(id + 'spec')
    return Array.from({ length: 22 * 48 }, (_, i) => {
      const row = Math.floor(i / 48)
      const low = 1 - row / 22
      return Math.min(1, r() * 0.55 * (0.4 + low) + (r() > 0.93 ? 0.4 : 0))
    })
  }, [id])
  return (
    <svg className="aw-spec" viewBox="0 0 48 22" preserveAspectRatio="none" aria-label="Espectrograma demonstrativo">
      {cells.map((v, i) => (
        <rect key={i} x={i % 48} y={21 - Math.floor(i / 48)} width="1" height="1" opacity={0.08 + v * 0.9} />
      ))}
    </svg>
  )
}

function fmt(sec?: number) {
  if (!sec) return '—'
  return `${Math.floor(sec / 60)}:${String(Math.round(sec % 60)).padStart(2, '0')}`
}

/**
 * Bancada de áudio/forense (AudioWorkbench).
 * Novos módulos: adicionar em `seedAnalysisModules` e, se necessário, um renderer abaixo.
 */
export function AudioWorkbench({ onClose }: { onClose: () => void }) {
  const inv = useInvestigation()
  const emergencyProvisionalDone = inv.flags.block01_emergency_provisional
  const rafaelForwardProvisionalDone = inv.flags.block02_rafael_forward_provisional
  const janusDone = inv.flags.block03_janus_done
  const saturnaliaDone = inv.flags.block03_saturnalia_done
  const hexagonDone = inv.flags.block04_hexagon_done
  const hasJanusPair =
    inv.evidenceOwned.includes('nico_recording_booth') &&
    inv.evidenceOwned.includes('nico_recording_portable')
  const hasHexSet = HEX_NODES.every((n) => inv.evidenceOwned.includes(n.evidenceId))
  const files = inv.evidenceOwned
    .map((id) => inv.evidence[id])
    .filter((e): e is Evidence => Boolean(e) && (e.type === 'audio' || e.type === 'derived'))

  const [sel, setSel] = useState<string | null>(null)
  const [moduleId, setModuleId] = useState('metadata')
  const [exportMsg, setExportMsg] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const current = files.find((f) => f.id === sel) ?? files[0]
  const showJanus =
    hasJanusPair &&
    (current?.id === 'nico_recording_booth' || current?.id === 'nico_recording_portable')
  const showSaturnalia = current?.id === 'livia_radio_archive_raw'
  const showHexagon =
    hasHexSet && HEX_NODES.some((n) => n.evidenceId === current?.id)
  const showUnknownAnalyze = current?.id === 'unknown_contact_recording'
  const blocked = Boolean(current && (current.exportable === false || current.deviceLocked))
  const playable = Boolean(current?.audioSrc) && !blocked

  useEffect(() => {
    audioRef.current?.pause()
    setPlaying(false)
    setProgress(0)
    setExportMsg(null)
  }, [current?.id])

  useEffect(() => () => audioRef.current?.pause(), [])

  const toggle = () => {
    if (!current?.audioSrc || !playable) return
    if (!audioRef.current) {
      const a = new Audio(assetPath(current.audioSrc))
      a.addEventListener('timeupdate', () => setProgress(a.duration ? a.currentTime / a.duration : 0))
      a.addEventListener('ended', () => {
        setPlaying(false)
        setProgress(0)
      })
      audioRef.current = a
    }
    const a = audioRef.current
    if (a.paused) {
      void a.play().catch(() => setPlaying(false))
      setPlaying(true)
    } else {
      a.pause()
      setPlaying(false)
    }
  }

  const select = (id: string) => {
    audioRef.current?.pause()
    audioRef.current = null
    setSel(id)
  }

  const modules = seedAnalysisModules
  const activeModule = modules.find((m) => m.id === moduleId) ?? modules[0]
  const accepted = current ? activeModule.accepts.includes(current.type) : false

  return (
    <GamePanel
      title="Bancada de áudio"
      kicker="Análise forense"
      variant="workbench"
      testId="hub-audio-lab"
      onClose={onClose}
    >
      <div className="aw" data-testid="audio-lab">
        <aside className="aw-files" aria-label="Arquivos">
          <h3 className="aw-h">Arquivos</h3>
          {files.length === 0 ? <p className="aw-empty">Nenhum áudio reunido.</p> : null}
          <ul>
            {files.map((f) => {
              const lock = f.exportable === false || f.deviceLocked
              return (
                <li key={f.id}>
                  <button
                    type="button"
                    className="aw-file"
                    data-active={f.id === current?.id}
                    onClick={() => select(f.id)}
                  >
                    <span className="aw-file__name">
                      {f.displayFileName ?? f.title}
                    </span>
                    <span className="aw-file__meta">
                      {fmt(f.durationSec)} ·{' '}
                      {lock ? (
                        <b className="aw-lock" data-testid={`export-blocked-${f.id}`}>
                          protegido no aparelho
                        </b>
                      ) : (
                        'disponível'
                      )}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </aside>

        <section className="aw-main">
          {current ? (
            <>
              <div className="aw-scope" data-locked={blocked}>
                <Waveform id={current.id} progress={progress} dim={blocked} />
                {blocked ? (
                  <div className="aw-scope__lock">
                    <strong>Conteúdo protegido</strong>
                    <span>Criptografado e vinculado ao aparelho de origem.</span>
                  </div>
                ) : null}
              </div>

              <div className="aw-transport">
                <button
                  type="button"
                  className="aw-play"
                  disabled={!playable}
                  onClick={toggle}
                  aria-label={playing ? 'Pausar' : 'Reproduzir'}
                >
                  {playing ? '❚❚' : '▶'}
                </button>
                <span className="aw-time">{fmt(current.durationSec)}</span>
                <button
                  type="button"
                  className="aw-export"
                  data-testid={`export-attempt-${current.id}`}
                  onClick={() =>
                    setExportMsg(
                      blocked
                        ? 'Exportação recusada: o arquivo está criptografado e a chave pertence ao aparelho apreendido. A cópia não pode ser aberta nesta estação.'
                        : 'Arquivo já disponível nesta estação.',
                    )
                  }
                >
                  Exportar para a estação
                </button>
              </div>
              {exportMsg ? (
                <p className="aw-msg" data-blocked={blocked} role="status">
                  {exportMsg}
                </p>
              ) : null}

              {current.id === 'emergency_call_raw' && current.puzzleMeta?.implementation === 'placeholder' ? (
                <div className="aw-provisional" data-testid="emergency-provisional-panel">
                  <p className="aw-provisional__note">
                    Restauração automática provisória — a análise forense definitiva substituirá este fluxo.
                  </p>
                  <button
                    type="button"
                    className="aw-provisional__go"
                    data-testid="emergency-provisional-analysis"
                    disabled={emergencyProvisionalDone}
                    onClick={() => runProvisionalEmergencyAnalysis()}
                  >
                    {emergencyProvisionalDone ? 'Análise provisória concluída' : 'Análise provisória'}
                  </button>
                  {inv.evidenceOwned.includes('emergency_call_restored') ? (
                    <blockquote className="aw-provisional__transcript">
                      “…eu preciso…”, “…ele tá aqui…”, “…eu não consigo…”, “…não lembra…”
                    </blockquote>
                  ) : null}
                </div>
              ) : null}

              {current.id === 'rafael_forward_from_mariana' &&
              current.puzzleMeta?.implementation === 'placeholder' ? (
                <div className="aw-provisional" data-testid="rafael-forward-provisional-panel">
                  <p className="aw-provisional__note">
                    Análise provisória (puzzle-03 placeholder) — substituída pelo fluxo forense definitivo
                    depois.
                  </p>
                  <button
                    type="button"
                    className="aw-provisional__go"
                    data-testid="rafael-forward-provisional-analysis"
                    disabled={rafaelForwardProvisionalDone}
                    onClick={() => runProvisionalRafaelForwardAnalysis()}
                  >
                    {rafaelForwardProvisionalDone
                      ? 'Análise provisória concluída'
                      : 'Análise provisória (vinheta Vértice)'}
                  </button>
                  {inv.evidenceOwned.includes('rafael_recording_vertice_tag') ? (
                    <blockquote className="aw-provisional__transcript">
                      Vinheta parcialmente recuperada: “…Vértice…”
                    </blockquote>
                  ) : null}
                </div>
              ) : null}

              {showJanus ? (
                <div className="aw-orbit" data-testid="janus-provisional-panel">
                  <p className="aw-orbit__title">Sessão Janus / Epimetheus</p>
                  <p className="aw-provisional__note">
                    Duas órbitas temporais da mesma noite. Relógios divergem; âncoras acústicas coincidem.
                    Placeholder — a sincronização definitiva usará correlação de forma de onda.
                  </p>
                  <div className="aw-orbit__tracks">
                    <div>
                      <p className="aw-orbit__label">Fonte A — cabine · clock +00:00 (errado)</p>
                      <Waveform id="nico_recording_booth" progress={0.42} />
                    </div>
                    <div>
                      <p className="aw-orbit__label">Fonte B — portátil · clock −00:00 (errado)</p>
                      <Waveform id="nico_recording_portable" progress={0.58} dim />
                    </div>
                  </div>
                  <button
                    type="button"
                    className="aw-provisional__go"
                    data-testid="janus-provisional-sync"
                    disabled={janusDone || !hasJanusPair}
                    onClick={() => runProvisionalJanusSync()}
                  >
                    {janusDone ? 'Alinhamento provisório concluído' : 'Alinhar âncoras (provisório)'}
                  </button>
                  {janusDone ? (
                    <blockquote className="aw-provisional__transcript">
                      Resultado: pelo menos um horário da cronologia original da Noite X veio de dispositivo
                      não sincronizado. Inconsistência verificável — não absolvição.
                    </blockquote>
                  ) : null}
                </div>
              ) : null}

              {showSaturnalia ? (
                <div className="aw-orbit" data-testid="saturnalia-provisional-panel">
                  <p className="aw-orbit__title">Sessão Saturnalia</p>
                  <p className="aw-provisional__note">
                    Buffer circular: batches escritos do mais recente ao mais antigo. Placeholder — a
                    reconstrução definitiva inverterá a ordem interna de cada grupo.
                  </p>
                  <ul className="aw-orbit__batches" aria-label="Fragmentos">
                    <li>Batch 02 · frag C → B → A</li>
                    <li>Batch 01 · frag F → E → D</li>
                    <li>Batch 03 · frag H → G</li>
                  </ul>
                  <p className="aw-orbit__log">log: WRITE_REV · group_id · ts_skew</p>
                  <button
                    type="button"
                    className="aw-provisional__go"
                    data-testid="saturnalia-provisional-rebuild"
                    disabled={saturnaliaDone}
                    onClick={() => runProvisionalSaturnaliaReconstruct()}
                  >
                    {saturnaliaDone
                      ? 'Reconstrução provisória concluída'
                      : 'Inverter batches (provisório)'}
                  </button>
                  {saturnaliaDone ? (
                    <blockquote className="aw-provisional__transcript">
                      Núcleo mascarado nos protestos. Apelido recorrente: “Morsa”. Identidade desconhecida.
                    </blockquote>
                  ) : null}
                </div>
              ) : null}

              {showHexagon ? (
                <div className="aw-hex" data-testid="hexagon-provisional-panel">
                  <p className="aw-orbit__title">Sessão Hexágono</p>
                  <p className="aw-provisional__note">
                    Seis nós. Cada irregularidade aponta para outro arquivo. Ciclo definitivo:{' '}
                    {HEX_CYCLE.join(' → ')} → A. Placeholder — a mecânica real usará metadata e
                    relações técnicas.
                  </p>
                  <div className="aw-hex__graph" aria-hidden>
                    {HEX_CYCLE.map((id, i) => (
                      <span key={id} className="aw-hex__node">
                        {id}
                        {i < HEX_CYCLE.length - 1 ? <span className="aw-hex__edge">→</span> : null}
                      </span>
                    ))}
                    <span className="aw-hex__edge">→ A</span>
                  </div>
                  <ul className="aw-orbit__batches">
                    {HEX_NODES.map((n) => (
                      <li key={n.id}>
                        {n.id} · {n.displayName} · {n.anomaly}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    className="aw-provisional__go"
                    data-testid="hexagon-provisional-solve"
                    disabled={hexagonDone || !hasHexSet}
                    onClick={() => runProvisionalHexagonSolve()}
                  >
                    {hexagonDone ? 'Ciclo fechado — frase recuperada' : 'Fechar ciclo (provisório)'}
                  </button>
                  {hexagonDone ? (
                    <blockquote className="aw-provisional__transcript">{HEX_PHRASE}</blockquote>
                  ) : null}
                </div>
              ) : null}

              {showUnknownAnalyze ? (
                <div className="aw-orbit" data-testid="unknown-recording-panel">
                  <p className="aw-orbit__title">Contato sem nome</p>
                  <p className="aw-provisional__note">
                    Voz tratada. Familiaridade excessiva. Não declarar vilania — apenas assimetria de
                    memória.
                  </p>
                  <button
                    type="button"
                    className="aw-provisional__go"
                    data-testid="unknown-recording-analyze"
                    disabled={Boolean(inv.flags.block04_unknown_analyzed)}
                    onClick={() => onUnknownRecordingAnalyzed()}
                  >
                    {inv.flags.block04_unknown_analyzed
                      ? 'Análise registrada'
                      : 'Registrar leitura forense'}
                  </button>
                </div>
              ) : null}

              <nav className="aw-modules" aria-label="Módulos de análise">
                {modules.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className="aw-module"
                    data-active={m.id === moduleId}
                    data-locked={!m.unlocked}
                    disabled={!m.unlocked}
                    onClick={() => setModuleId(m.id)}
                    title={m.unlocked ? m.description : 'Módulo ainda não disponível'}
                  >
                    {m.title}
                  </button>
                ))}
              </nav>

              <div className="aw-panel">
                {blocked ? (
                  <p className="aw-empty">
                    A análise exige o conteúdo no aparelho. Um aplicativo compatível pode operar
                    diretamente sobre ele.
                  </p>
                ) : !accepted ? (
                  <p className="aw-empty">Este módulo não se aplica ao item selecionado.</p>
                ) : activeModule.id === 'spectrogram' ? (
                  <Spectrogram id={current.id} />
                ) : activeModule.id === 'metadata' ? (
                  <dl className="aw-dl">
                    <dt>Tipo</dt>
                    <dd>{evidenceTypeLabel[current.type]}</dd>
                    <dt>Natureza</dt>
                    <dd>{evidenceOriginLabel(current.originalOrDerived)}</dd>
                    <dt>Origem</dt>
                    <dd>{evidenceSourceLabel(current)}</dd>
                    <dt>Duração</dt>
                    <dd>{fmt(current.durationSec)}</dd>
                    <dt>Exportável</dt>
                    <dd>{current.exportable === false ? 'não' : 'sim'}</dd>
                  </dl>
                ) : (
                  <p className="aw-empty">{activeModule.description}</p>
                )}
              </div>
            </>
          ) : (
            <p className="aw-empty aw-empty--big">
              Sem material para analisar. Reúna áudios nos aparelhos e no caso.
            </p>
          )}
        </section>
      </div>
    </GamePanel>
  )
}

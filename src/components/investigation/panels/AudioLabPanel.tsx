import { useEffect, useMemo, useRef, useState } from 'react'
import { seedAnalysisModules } from '../../../data/game/seedAnalysisModules'
import { useInvestigation } from '../../../game/hooks/useInvestigation'
import type { Evidence } from '../../../game/types'
import { assetPath } from '../../../lib/assetPath'
import { evidenceOriginLabel, evidenceSourceLabel, evidenceTypeLabel } from '../../../lib/labels'
import { runProvisionalEmergencyAnalysis } from '../../../game/story/block01Handlers'
import {
  markForensicContainerState,
  markForensicSpeechRecovered,
  resetForensicSpeechProgress,
} from '../../../game/state/investigationStore'
import {
  runProvisionalRafaelForwardAnalysis,
  runProvisionalRingsAnalysis,
} from '../../../game/story/block02Handlers'
import { ForensicWorkbench } from '../../../forensic/ForensicWorkbench'
import { getForensicSessionForEvidence } from '../../../forensic/forensicRegistry'
import { puzzleIdForEvidence } from '../../../forensic/canonicalPuzzleCompletion'
import { DevPuzzleToolbar } from '../../../forensic/DevPuzzleToolbar'
import {
  runJanusEpimetheusAnalysis,
  runSaturnaliaReconstruct,
} from '../../../game/story/block03Handlers'
import {
  onUnknownRecordingAnalyzed,
  runHexagonSpectrogramSurvey,
} from '../../../game/story/block04Handlers'
import { runShepherdMoonsExtract } from '../../../game/story/block06Handlers'
import { onCassiniSolved, onEnceladusSolved } from '../../../game/story/block07Handlers'
import { markAudioSeen } from '../../../game/state/investigationStore'
import { HEX_FILES, hexFileByEvidence } from '../../../data/block04/hexagonPuzzle'
import { GamePanel } from '../../ui/GamePanel'
import { RingsSession } from './RingsSession'
import { RotationSession } from './RotationSession'
import { MemorySession } from './MemorySession'

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

type AnalysisState = 'none' | 'pending' | 'done'
type Filter = 'all' | 'new' | 'pending' | 'done'

const filters: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'new', label: 'Novos' },
  { id: 'pending', label: 'Em análise' },
  { id: 'done', label: 'Analisados' },
]

function analysisState(id: string, flags: Record<string, boolean>): AnalysisState {
  if (id === 'emergency_call_raw') return flags.block01_emergency_provisional ? 'done' : 'pending'
  if (id === 'rafael_voice_to_augusto' || id === 'rafael_audio_reply')
    return flags.block02_rafael_forward_provisional ? 'done' : 'pending'
  if (id === 'rec_vtx_old_01') return flags.block02_rings_provisional ? 'done' : 'pending'
  if (id === 'nico_recording_booth') return flags.block03_janus_done ? 'done' : 'pending'
  if (id === 'livia_radio_archive_raw') return flags.block03_saturnalia_done ? 'done' : 'pending'
  if (HEX_FILES.some((n) => n.evidenceId === id)) return flags.block04_hexagon_done ? 'done' : 'pending'
  if (id === 'unknown_contact_recording') return flags.block04_unknown_analyzed ? 'done' : 'pending'
  if (id === 'valter_group_active_intercepts') return flags.block06_pastor_done ? 'done' : 'pending'
  if (id === 'anon_hospital_burst_audio') return flags.block07_enceladus_done ? 'done' : 'pending'
  if (id === 'henrique_rtp_capture') return flags.block07_cassini_done ? 'done' : 'pending'
  if (id === 'protest_heterogeneous_sources') return flags.block08_rings_done ? 'done' : 'pending'
  if (id === 'rui_police_approach_records') return flags.block08_rotation_done ? 'done' : 'pending'
  if (id === 'mariana_recent_recording_claim') return flags.block09_memory_done ? 'done' : 'pending'
  return 'none'
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
  // Mais recente primeiro (ordem de aquisição invertida).
  const hasRafaelForward = inv.evidenceOwned.includes('rafael_voice_to_augusto')
  const allFiles = [...inv.evidenceOwned]
    .reverse()
    .map((id) => inv.evidence[id])
    .filter(
      (e): e is Evidence =>
        Boolean(e) &&
        // Só material sonoro ou sessão reconstruível — nunca laudo/hipótese/documento.
        (e.type === 'audio' || Boolean(e.puzzleMeta)) &&
        // Mesmo áudio IAPETUS: uma entrada só (preferir o forward se existir).
        !(e.id === 'rafael_audio_reply' && hasRafaelForward),
    )
  const [filter, setFilter] = useState<Filter>('all')
  const isNew = (id: string) => !inv.audioSeen.includes(id)
  const files = allFiles.filter((f) => {
    if (filter === 'new') return isNew(f.id)
    if (filter === 'pending') return analysisState(f.id, inv.flags) === 'pending'
    if (filter === 'done') return analysisState(f.id, inv.flags) === 'done'
    return true
  })
  const newCount = allFiles.filter((f) => isNew(f.id)).length

  const [sel, setSel] = useState<string | null>(null)
  const [moduleId, setModuleId] = useState('metadata')
  const [exportMsg, setExportMsg] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [devRemount, setDevRemount] = useState(0)
  const [ringsRevealRequest, setRingsRevealRequest] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const current = allFiles.find((f) => f.id === sel)
  const hexFile = current ? hexFileByEvidence(current.id) : undefined
  const showRings =
    Boolean(inv.flags.block08_rings_available) && current?.id === 'protest_heterogeneous_sources'
  const showRotation =
    Boolean(inv.flags.block08_rotation_available) && current?.id === 'rui_police_approach_records'
  const showMemory =
    Boolean(inv.flags.block09_memory_available) && current?.id === 'mariana_recent_recording_claim'
  const showUnknownAnalyze = current?.id === 'unknown_contact_recording'
  const blocked = Boolean(current && (current.exportable === false || current.deviceLocked))
  const playable = Boolean(current?.audioSrc) && !blocked

  useEffect(() => {
    audioRef.current?.pause()
    setPlaying(false)
    setProgress(0)
    setExportMsg(null)
    setRingsRevealRequest(0)
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
    markAudioSeen(id)
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
          <h3 className="aw-h">
            Arquivos
            {newCount > 0 ? (
              <span className="new-badge aw-h__new" data-testid="audio-new-count">
                {newCount} novo{newCount > 1 ? 's' : ''}
              </span>
            ) : null}
          </h3>
          <div className="aw-filters" role="tablist" aria-label="Filtro de arquivos">
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={filter === f.id}
                className="aw-filter"
                data-active={filter === f.id}
                data-testid={`audio-filter-${f.id}`}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
          {allFiles.length === 0 ? <p className="aw-empty">Nenhum áudio reunido.</p> : null}
          {allFiles.length > 0 && files.length === 0 ? (
            <p className="aw-empty">Nenhum arquivo neste filtro.</p>
          ) : null}
          <ul data-testid="audio-file-list">
            {files.map((f) => {
              const lock = f.exportable === false || f.deviceLocked
              const st = analysisState(f.id, inv.flags)
              return (
                <li key={f.id}>
                  <button
                    type="button"
                    className="aw-file"
                    data-active={f.id === current?.id}
                    data-new={isNew(f.id)}
                    data-testid={`audio-file-${f.id}`}
                    onClick={() => select(f.id)}
                  >
                    <span className="aw-file__name">
                      {f.displayFileName ?? f.title}
                      {isNew(f.id) ? (
                        <span className="new-badge" data-testid={`audio-new-${f.id}`}>
                          NOVO
                        </span>
                      ) : null}
                    </span>
                    <span className="aw-file__meta">
                      {fmt(f.durationSec)} ·{' '}
                      {lock ? (
                        <b className="aw-lock" data-testid={`export-blocked-${f.id}`}>
                          protegido no aparelho
                        </b>
                      ) : st === 'pending' ? (
                        'em análise'
                      ) : st === 'done' ? (
                        'analisado'
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
              {(() => {
                const forensicSession = getForensicSessionForEvidence(current.id)
                if (forensicSession) {
                  const puzzleId = puzzleIdForEvidence(current.id)
                  const specialized =
                    puzzleId === 'P10' ? (
                      showRings ? <RingsSession revealRequest={ringsRevealRequest} /> : null
                    ) : puzzleId === 'P11' ? (
                      showRotation ? <RotationSession /> : null
                    ) : puzzleId === 'P12' ? (
                      showMemory ? <MemorySession /> : null
                    ) : null
                  const done =
                    puzzleId === 'P10' || puzzleId === 'P11' || puzzleId === 'P12'
                      ? analysisState(current.id, inv.flags) === 'done'
                      : forensicSession.completion?.onCompleteAction ===
                    'runProvisionalRafaelForwardAnalysis'
                      ? Boolean(inv.flags.block02_rafael_forward_provisional)
                      : forensicSession.completion?.onCompleteAction ===
                          'runProvisionalRingsAnalysis'
                        ? Boolean(inv.flags.block02_rings_provisional)
                        : forensicSession.completion?.onCompleteAction ===
                            'runJanusEpimetheusAnalysis'
                          ? Boolean(inv.flags.block03_janus_done)
                          : forensicSession.completion?.onCompleteAction ===
                              'runSaturnaliaReconstruct'
                            ? Boolean(inv.flags.block03_saturnalia_done)
                            : forensicSession.completion?.onCompleteAction ===
                                'runHexagonSpectrogramSurvey'
                              ? Boolean(inv.flags.block04_hexagon_done)
                              : forensicSession.completion?.onCompleteAction ===
                                  'runShepherdMoonsExtract'
                                ? Boolean(inv.flags.block06_pastor_extracted)
                                : forensicSession.completion?.onCompleteAction ===
                                    'runEnceladusAnalysis'
                                  ? Boolean(inv.flags.block07_enceladus_done)
                                  : forensicSession.completion?.onCompleteAction ===
                                      'runCassiniHuygensAnalysis'
                                    ? Boolean(inv.flags.block07_cassini_done)
                                    : emergencyProvisionalDone
                  const containerState = inv.forensicContainerState?.[current.id]
                  return (
                    <ForensicWorkbench
                      key={`${forensicSession.id === 'puzzle-06-hexagon' ? 'puzzle-06-hexagon' : current.id}:${devRemount}`}
                      session={forensicSession}
                      specializedWorkspace={specialized ?? undefined}
                      devToolbar={
                        import.meta.env.DEV && puzzleId ? (
                          <DevPuzzleToolbar
                            puzzleId={puzzleId}
                            onApplied={() => setDevRemount((n) => n + 1)}
                            onPlayReveal={() => setRingsRevealRequest((n) => n + 1)}
                          />
                        ) : undefined
                      }
                      fileNameBadge={current.displayFileName ?? current.title}
                      initialSourceId={hexFile?.id}
                      completed={done}
                      recoveredSpeech={inv.forensicRecoveredSpeech?.[current.id] ?? []}
                      containerRebuilt={containerState?.rebuilt}
                      structureSequences={containerState?.sequences}
                      onClose={onClose}
                      onSegmentRecovered={(entry) =>
                        markForensicSpeechRecovered(current.id, entry)
                      }
                      onContainerStateChange={(state) =>
                        markForensicContainerState(current.id, state)
                      }
                      onDevResetPuzzle={() => resetForensicSpeechProgress(current.id)}
                      onPuzzleComplete={() => {
                        const action = forensicSession.completion?.onCompleteAction
                        if (action === 'runProvisionalRafaelForwardAnalysis') {
                          runProvisionalRafaelForwardAnalysis()
                        } else if (action === 'runProvisionalRingsAnalysis') {
                          runProvisionalRingsAnalysis()
                        } else if (action === 'runJanusEpimetheusAnalysis') {
                          runJanusEpimetheusAnalysis()
                        } else if (action === 'runSaturnaliaReconstruct') {
                          runSaturnaliaReconstruct()
                        } else if (action === 'runHexagonSpectrogramSurvey') {
                          runHexagonSpectrogramSurvey()
                        } else if (action === 'runShepherdMoonsExtract') {
                          runShepherdMoonsExtract()
                        } else if (action === 'runEnceladusAnalysis') {
                          onEnceladusSolved()
                        } else if (action === 'runCassiniHuygensAnalysis') {
                          onCassiniSolved()
                        } else {
                          runProvisionalEmergencyAnalysis()
                        }
                      }}
                    />
                  )
                }
                return null
              })()}

              {!getForensicSessionForEvidence(current.id) ? (
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
                </>
              ) : null}

              {!getForensicSessionForEvidence(current.id) && current.id === 'rafael_voice_to_augusto' &&
              current.puzzleMeta?.implementation === 'placeholder' ? (
                <div className="aw-provisional" data-testid="rafael-forward-provisional-panel">
                  <p className="aw-provisional__note">
                    Áudio encaminhado, com perda de qualidade. Há um trecho inicial que o filtro de ruído pode
                    recuperar.
                  </p>
                  <button
                    type="button"
                    className="aw-provisional__go"
                    data-testid="rafael-forward-provisional-analysis"
                    disabled={rafaelForwardProvisionalDone}
                    onClick={() => runProvisionalRafaelForwardAnalysis()}
                  >
                    {rafaelForwardProvisionalDone ? 'Trecho inicial recuperado' : 'Recuperar trecho inicial'}
                  </button>
                  {inv.evidenceOwned.includes('rafael_recording_vertice_tag') ? (
                    <blockquote className="aw-provisional__transcript">
                      Vinheta parcialmente recuperada: “…Vértice…”
                    </blockquote>
                  ) : null}
                </div>
              ) : null}

              {!getForensicSessionForEvidence(current.id) && showUnknownAnalyze ? (
                <div className="aw-orbit" data-testid="unknown-recording-panel">
                  <p className="aw-orbit__title">Contato sem nome</p>
                  <p className="aw-provisional__note">
                    Gravação tratada. A voz usa referências da rotina de Mariana; não há identificação de
                    falante.
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

              {!getForensicSessionForEvidence(current.id) ? (
                <>
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
                    title={m.unlocked ? m.description : 'Módulo indisponível nesta estação'}
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
              ) : null}
            </>
          ) : (
            <p className="aw-empty aw-empty--big" data-testid="audio-no-selection">
              {allFiles.length
                ? 'Selecione um arquivo na lista para ouvir e analisar.'
                : 'Sem material para analisar. Reúna áudios nos aparelhos e no caso.'}
            </p>
          )}
        </section>
      </div>
    </GamePanel>
  )
}

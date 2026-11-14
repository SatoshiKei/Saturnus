import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import '../styles/forensic-workbench.css'
import { ForensicAudioEngine } from './forensicAudio'
import {
  captureNoiseProfile,
  computeRecoveryMetrics,
  computeStemGains,
  createInitialUiState,
  effectivePlayableUntil,
  estimateTempoFromSelection,
  evaluateSegmentClarity,
  fileMetadataForContainer,
  fmtTime,
  getActiveSource,
  linkSources,
  rebuildContainer,
  resetProcess,
  resolveStructurePages,
  approximateTrackCorrelation,
  assembleClipSequence,
  clockSyncComplete,
  clockSyncOffsetValid,
  clipSequenceComplete,
  buildDerivedRfSource,
  cycleDifferenceComplete,
  fingerprintArchiveComplete,
  createDerivedRtpStream,
  evaluateCommonPatternSelection,
  evaluateCycleDifference,
  evaluateRfExtraction,
  evaluateRtpReconstruction,
  filterPacketRows,
  findSimilarCycleRegions,
  fmtClockOffset,
  relativeSourceOffsetSec,
  rfChannelExtractComplete,
  rtpStreamSeparationComplete,
  speechRecoveryComplete,
  spectrogramSurveyComplete,
  structureSequenceValid,
  voiceSpansFromSource,
  type SegmentClarity,
} from './forensicEngine'
import { loadPuzzle09PacketRows } from './puzzles/puzzle09CassiniHuygens'
import {
  PUZZLE03_CANONICAL_SESSION_ID,
  PUZZLE03_SET_SESSIONS,
  PUZZLE03_TRACK_A_ID,
  PUZZLE03_TRACK_B_ID,
  puzzle03TechnicalChainReady,
  queryVerticeArchive,
  searchFingerprintCatalog,
  sessionListHidesOperatorNames,
  summarizeTransition,
} from './puzzles/puzzle03Fingerprint'
import type {
  ForensicSession,
  ForensicSource,
  ForensicUiState,
  ProcessParams,
  RecoveredSpeechEntry,
  StemId,
  TrackRuntime,
} from './forensicTypes'
import { FileBrowser } from './components/FileBrowser'
import { Timeline } from './components/Timeline'
import { TrackRow } from './components/TrackRow'
import { Transport } from './components/Transport'
import { Inspector } from './components/Inspector'
import { buildCassiniStreamBArtifact } from './derivedArtifact'
import { getInvestigationState, markForensicDerivedArtifact } from '../game/state/investigationStore'

export function ForensicWorkbench({
  session,
  fileNameBadge,
  initialSourceId,
  onClose,
  onPuzzleComplete,
  completed,
  recoveredSpeech: recoveredProp,
  onSegmentRecovered,
  containerRebuilt: containerRebuiltProp,
  structureSequences: structureSequencesProp,
  onContainerStateChange,
  onDevResetPuzzle,
  onSpectrogramViewed,
  specializedWorkspace,
  hideTimeline,
}: {
  session: ForensicSession
  fileNameBadge?: string
  /** Source id a ativar ao abrir (ex.: evidência selecionada na bancada). */
  initialSourceId?: string
  onClose: () => void
  onPuzzleComplete?: () => void
  completed?: boolean
  recoveredSpeech?: RecoveredSpeechEntry[]
  onSegmentRecovered?: (entry: RecoveredSpeechEntry) => void
  containerRebuilt?: boolean
  structureSequences?: Record<string, number>
  onContainerStateChange?: (state: {
    rebuilt: boolean
    sequences: Record<string, number>
  }) => void
  /** DEV: reset completo do progresso do puzzle (structure + findings + completion). */
  onDevResetPuzzle?: () => void
  /** Chamado quando o jogador abre Spectrogram num source. */
  onSpectrogramViewed?: (sourceId: string) => void
  /** Conteúdo especializado (P10–P12) no workspace central; Timeline some se omitido com hideTimeline. */
  specializedWorkspace?: ReactNode
  /** Esconde a Timeline genérica (default: true quando specializedWorkspace está definido). */
  hideTimeline?: boolean
}) {
  const suppressTimeline = hideTimeline ?? Boolean(specializedWorkspace)
  const [ui, setUi] = useState<ForensicUiState>(() => {
    const initial = createInitialUiState(session, recoveredProp ?? [])
    const active =
      initialSourceId && session.sources.some((s) => s.id === initialSourceId)
        ? initialSourceId
        : initial.activeSourceId
    return {
      ...initial,
      activeSourceId: active,
      containerRebuilt: containerRebuiltProp ?? false,
      structureSequences: structureSequencesProp ?? {},
    }
  })
  const [showHelp, setShowHelp] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [timelineView, setTimelineView] = useState<'waveform' | 'spectrogram'>('waveform')
  const [measuredWave, setMeasuredWave] = useState<number[] | null>(null)
  const [measuredSpec, setMeasuredSpec] = useState<{
    cols: number
    rows: number
    values: number[]
    maxHz: number
  } | null>(null)
  const [clarityDebug, setClarityDebug] = useState<SegmentClarity[]>([])
  const [extraSources, setExtraSources] = useState<ForensicSource[]>([])
  const [hydratedPacketRows, setHydratedPacketRows] = useState<
    import('./forensicTypes').PacketRow[] | null
  >(null)
  const engineRef = useRef<ForensicAudioEngine | null>(null)
  const completedRef = useRef(false)
  const holdRef = useRef<Record<string, number>>({})
  const showDebug = import.meta.env.DEV

  useEffect(() => {
    if (session.completion?.kind !== 'rtp-stream-separation') return
    let cancelled = false
    void loadPuzzle09PacketRows()
      .then((rows) => {
        if (!cancelled) setHydratedPacketRows(rows)
      })
      .catch((err) => {
        console.error(err)
        if (!cancelled) setStatus('Failed to load packet capture table.')
      })
    return () => {
      cancelled = true
    }
  }, [session.completion?.kind, session.id])

  const liveSession = useMemo(() => {
    const sources = session.sources.map((s) => {
      if (!hydratedPacketRows || !s.rtpStreams) return s
      return {
        ...s,
        packets: { ...s.packets, rows: hydratedPacketRows, emptyMessage: undefined },
      }
    })
    return { ...session, sources: [...sources, ...extraSources] }
  }, [session, extraSources, hydratedPacketRows])
  const source = getActiveSource(liveSession, ui)
  /** Fonte com áudio para transport/timeline (registros de set não têm stems). */
  const playbackSource = source?.audio
    ? source
    : liveSession.sources.find((s) => s.audio) ?? source
  const audioSources = liveSession.sources.filter((s) => s.audio)
  const isClockSync = session.completion?.kind === 'clock-sync'
  const rfCapture =
    source?.rfCapture ?? liveSession.sources.find((s) => s.rfCapture)?.rfCapture ?? null
  const playableUntil = effectivePlayableUntil(playbackSource, ui.containerRebuilt)
  const spanDuration = isClockSync
    ? Math.max(
        ...audioSources.map(
          (s) =>
            (s.timelineOriginSec ?? 0) +
            (ui.sourceOffsets[s.id] ?? 0) +
            s.durationSec,
        ),
        playbackSource?.durationSec ?? 0,
        630,
      )
    : (playbackSource?.durationSec ?? 0)
  const duration = spanDuration
  const waveform = measuredWave ?? playbackSource?.audio?.waveform ?? []
  const spectrogram = measuredSpec ?? playbackSource?.audio?.spectrogram
  const syncPair = audioSources.length >= 2 ? [audioSources[0], audioSources[1]] : null
  const placementDelta = syncPair
    ? relativeSourceOffsetSec(syncPair[0], syncPair[1], ui.sourceOffsets)
    : 0
  const correlation = approximateTrackCorrelation(
    placementDelta,
    session.completion?.offsetToleranceSec ?? 0.2,
  )
  const offsetValid = isClockSync ? clockSyncOffsetValid(session, ui) : false
  const expectedOffset = session.completion?.expectedOffsetSec ?? 450
  const structurePages = resolveStructurePages(
    source,
    ui.structureSequences,
    ui.containerRebuilt,
  )
  const sequenceValid = structureSequenceValid(source, ui.structureSequences)
  const fileMetadata = fileMetadataForContainer(source, ui.containerRebuilt)
  const fileLabel = fileNameBadge ?? source?.filename ?? '—'
  const channels =
    source?.metadata?.find((m) => m.key === 'channels')?.value ??
    (playbackSource?.audio?.channels === 1
      ? 'Mono'
      : playbackSource?.audio?.channels
        ? String(playbackSource.audio.channels)
        : '—')
  const sampleRate =
    source?.metadata?.find((m) => m.key === 'sampleRate')?.value ??
    (playbackSource?.audio?.sampleRate ? `${playbackSource.audio.sampleRate} Hz` : '—')

  useEffect(() => {
    const eng = new ForensicAudioEngine()
    engineRef.current = eng
    eng.setTickHandler((t) =>
      setUi((u) => {
        const still = eng.isPlaying()
        if (u.playing && !still) return { ...u, playheadSec: t, playing: false }
        return { ...u, playheadSec: t }
      }),
    )
    eng.setWaveformHandler((peaks) => setMeasuredWave(peaks))
    eng.setSpectrogramHandler((spec) => setMeasuredSpec(spec))
    return () => {
      eng.dispose()
      engineRef.current = null
    }
  }, [])

  useEffect(() => {
    engineRef.current?.setPlayableUntil(
      playbackSource?.containerPlayback ? playableUntil : null,
    )
  }, [playableUntil, playbackSource?.containerPlayback])

  useEffect(() => {
    setMeasuredWave(null)
    setMeasuredSpec(null)
    setTimelineView('waveform')
  }, [playbackSource?.id])

  useEffect(() => {
    if (!recoveredProp) return
    setUi((u) => ({ ...u, recoveredSpeech: recoveredProp }))
  }, [recoveredProp])

  useEffect(() => {
    const eng = engineRef.current
    if (!eng || !playbackSource?.audio) return
    void eng.loadAsset(
      playbackSource.audio,
      playbackSource.durationSec,
      playbackSource.speechSegments ?? [],
    )
  }, [
    playbackSource?.id,
    playbackSource?.audio,
    playbackSource?.durationSec,
    playbackSource?.speechSegments,
  ])

  useEffect(() => {
    const eng = engineRef.current
    if (!eng) return
    const track = Object.values(ui.tracks)[0]
    const muted = Boolean(track?.mute) && !track?.solo
    const anySolo = Object.values(ui.tracks).some((t) => t.solo)
    const effectiveMute = anySolo ? !track?.solo : muted
    const profile =
      ui.noiseProfiles.find((p) => p.id === ui.activeNoiseProfileId) ?? null
    const process: ProcessParams = {
      ...ui.process,
      pan: track?.pan ?? ui.process.pan,
      gainDb: ui.process.gainDb + (track?.gainDb ?? 0),
    }
    eng.applyProcess(process, profile, effectiveMute, ui.selection)
  }, [ui.process, ui.tracks, ui.activeNoiseProfileId, ui.noiseProfiles, ui.selection])

  const processRef = useRef(ui.process)
  const profileRef = useRef(
    ui.noiseProfiles.find((p) => p.id === ui.activeNoiseProfileId) ?? null,
  )
  const recoveredRef = useRef(ui.recoveredSpeech)
  const playingRef = useRef(ui.playing)
  const rebuiltRef = useRef(ui.containerRebuilt)
  const playableRef = useRef(playableUntil)
  processRef.current = ui.process
  profileRef.current =
    ui.noiseProfiles.find((p) => p.id === ui.activeNoiseProfileId) ?? null
  recoveredRef.current = ui.recoveredSpeech
  playingRef.current = ui.playing
  rebuiltRef.current = ui.containerRebuilt
  playableRef.current = playableUntil

  // P08: after Difference, residual has no speech yet. Playing the residual
  // attaches an evaluable segment; Recovered Speech still unlocks only via listen hold.
  useEffect(() => {
    if (!ui.cycleDifferenceDone) return
    if (ui.activeSourceId !== 'derived-enceladus-residual') return
    if (!ui.playing) return
    const cfg = session.sources[0]?.cycleAnalysis
    if (!cfg?.recoveredSpeech) return
    setExtraSources((prev) => {
      const residual = prev.find((s) => s.id === 'derived-enceladus-residual')
      if (!residual || (residual.speechSegments?.length ?? 0) > 0) return prev
      return prev.map((s) =>
        s.id !== 'derived-enceladus-residual'
          ? s
          : {
              ...s,
              speechSegments: [
                {
                  id: cfg.recoveredSpeech.segmentId,
                  text: cfg.recoveredSpeech.text,
                  startSec: 0.15,
                  durationSec: Math.min(cfg.cycleSec - 0.25, 2.2),
                  clarityThreshold: 0.05,
                  recoveryWeights: { center: 0.25, depth: 0.25, width: 0.25, noise: 0.25 },
                  voiceWeight: 1,
                },
              ],
            },
      )
    })
  }, [ui.cycleDifferenceDone, ui.activeSourceId, ui.playing, session.sources])

  // Unlock só enquanto o playhead percorre o trecho com clareza suficiente.
  // Só configurar sliders (sem ouvir) NÃO registra Recovered Speech.
  useEffect(() => {
    if (!source?.speechSegments?.length) return
    const base: Record<StemId, number> = {
      FILE: 1,
      CORRUPTED_BASE: 1,
      VOICE: 1,
      BACKGROUND_NOISE: 1,
      TONE_1700: 1,
      VOCAL_DEBRIS: 1,
      CLICKS: 1,
    }
    for (const stem of source.audio?.stems ?? []) base[stem.id] = stem.initialGain
    const rules = { notch: source.audio?.notch, spectral: source.audio?.spectral }
    const holdNeed = source.audio?.recovery?.unlockHoldSec ?? 0.7
    const segments = source.speechSegments
    const edgePad = 0.05

    let raf = 0
    let last = performance.now()
    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const eng = engineRef.current
      const playing = Boolean(playingRef.current && eng?.isPlaying())
      const playhead = eng ? eng.getCurrentTime() : 0
      const unlocked = new Set(recoveredRef.current.map((r) => r.segmentId))
      const rows = segments.map((seg) =>
        evaluateSegmentClarity(
          seg,
          processRef.current,
          profileRef.current,
          base,
          rules,
          unlocked.has(seg.id),
        ),
      )
      setClarityDebug(rows)
      const nextUnlocks: RecoveredSpeechEntry[] = []
      for (const row of rows) {
        const seg = segments.find((s) => s.id === row.segmentId)!
        if (unlocked.has(row.segmentId)) {
          holdRef.current[row.segmentId] = holdNeed
          continue
        }
        const inSegment =
          playhead >= seg.startSec - edgePad &&
          playhead <= seg.startSec + seg.durationSec + edgePad
        const structureReady = !seg.requiresContainerRebuild || rebuiltRef.current
        // Trechos pós-boundary só existem no decode após rebuild.
        const reachable = playhead <= playableRef.current + 0.08
        const clearEnough = seg.requiresContainerRebuild
          ? structureReady
          : row.clarityScore >= row.threshold
        if (playing && inSegment && clearEnough && reachable && structureReady) {
          const need = Math.min(holdNeed, Math.max(0.35, seg.durationSec * 0.75))
          holdRef.current[row.segmentId] = (holdRef.current[row.segmentId] ?? 0) + dt
          if ((holdRef.current[row.segmentId] ?? 0) >= need) {
            nextUnlocks.push({
              segmentId: seg.id,
              text: seg.text,
              startSec: seg.startSec,
              unlockedAt: Date.now(),
            })
            unlocked.add(seg.id)
          }
        } else if (!clearEnough) {
          // Configs ruins zeram o progresso; sair do trecho só pausa o acumulador.
          holdRef.current[row.segmentId] = 0
        }
      }
      if (nextUnlocks.length) {
        setUi((u) => {
          const recoveredSpeech = [...u.recoveredSpeech]
          for (const entry of nextUnlocks) {
            if (!recoveredSpeech.some((r) => r.segmentId === entry.segmentId)) {
              recoveredSpeech.push(entry)
              onSegmentRecovered?.(entry)
            }
          }
          recoveredSpeech.sort((a, b) => a.startSec - b.startSec)
          return { ...u, recoveredSpeech }
        })
      }
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [source?.id, source?.speechSegments, source?.audio, onSegmentRecovered])

  useEffect(() => {
    if (completed || completedRef.current || !onPuzzleComplete) return
    const completion = session.completion
    if (!completion) return
    if (completion.kind === 'speech-recovery') {
      if (!source?.speechSegments) return
      if (!speechRecoveryComplete(ui.recoveredSpeech, source.speechSegments)) return
    } else if (completion.kind === 'container-rebuild') {
      if (!ui.containerRebuilt) return
      if (!structureSequenceValid(source, ui.structureSequences)) return
      const required = completion.requireSpeechSegmentIds ?? []
      const have = new Set(ui.recoveredSpeech.map((r) => r.segmentId))
      if (!required.every((id) => have.has(id))) return
    } else if (completion.kind === 'source-link') {
      if (!ui.linkedSetSourceId) return
      if (completion.correctSetSourceId && ui.linkedSetSourceId !== completion.correctSetSourceId)
        return
    } else if (completion.kind === 'clock-sync') {
      if (!clockSyncComplete(session, ui)) return
    } else if (completion.kind === 'clip-sequence') {
      if (!clipSequenceComplete(session, ui)) return
    } else if (completion.kind === 'spectrogram-survey') {
      if (!spectrogramSurveyComplete(session, ui)) return
    } else if (completion.kind === 'rf-channel-extract') {
      if (!rfChannelExtractComplete(session, ui)) return
    } else if (completion.kind === 'cycle-difference') {
      if (!cycleDifferenceComplete(session, ui)) return
    } else if (completion.kind === 'fingerprint-archive') {
      if (!fingerprintArchiveComplete(session, ui)) return
    } else if (completion.kind === 'rtp-stream-separation') {
      if (!rtpStreamSeparationComplete(session, ui)) return
    } else {
      return
    }
    completedRef.current = true
    onPuzzleComplete()
    setStatus('Análise registrada no caderno de investigação.')
  }, [
    ui.recoveredSpeech,
    ui.containerRebuilt,
    ui.structureSequences,
    ui.linkedSetSourceId,
    ui.sourceOffsets,
    ui.formalizedClockOffsetSec,
    ui.correctedSetTime,
    ui.findingUnlocked,
    ui.clipSequence,
    ui.sequenceAssembled,
    ui.spectrogramViewedSourceIds,
    ui.rfExtracted,
    ui.rfExtractionQuality,
    ui.cycleDifferenceDone,
    ui.streamARecovered,
    ui.streamBRecovered,
    ui.fingerprintAId,
    ui.fingerprintBId,
    ui.transitionOrder,
    ui.openedArchiveSessionId,
    ui.recoveredSpeech,
    source?.speechSegments,
    source,
    session,
    session.completion,
    completed,
    onPuzzleComplete,
  ])

  const patchUi = (patch: Partial<ForensicUiState>) => setUi((u) => ({ ...u, ...patch }))
  const patchProcess = (patch: Partial<ProcessParams>) =>
    setUi((u) => ({ ...u, process: { ...u.process, ...patch } }))

  const play = async () => {
    const eng = engineRef.current
    if (!eng) return
    const from =
      ui.loop && ui.selection ? ui.selection.startSec : ui.playheadSec
    await eng.play(from, ui.loop, ui.selection)
    eng.setPlaybackRate(ui.playbackRate)
    const profile =
      ui.noiseProfiles.find((p) => p.id === ui.activeNoiseProfileId) ?? null
    eng.applyProcess(ui.process, profile, false, ui.selection)
    patchUi({ playing: true })
  }

  const pause = () => {
    engineRef.current?.pause()
    patchUi({ playing: false, playheadSec: engineRef.current?.getCurrentTime() ?? ui.playheadSec })
  }

  const stop = () => {
    engineRef.current?.stop()
    patchUi({ playing: false, playheadSec: 0 })
  }

  const seek = (sec: number) => {
    engineRef.current?.seek(sec)
    patchUi({ playheadSec: sec })
  }

  return (
    <div className="fw" data-testid="forensic-workbench">
      <header className="fw-top">
        <div className="fw-top__identity">
          <span className="fw-top__app">Forensic Workbench</span>
          <span className="fw-top__file">{fileLabel}</span>
          <span className="fw-top__meta">
            <span>{fmtTime(duration)}</span>
            <span>{channels}</span>
            <span>{sampleRate}</span>
          </span>
        </div>
        <button type="button" className="fw-btn fw-btn--ghost" onClick={onClose}>
          Fechar
        </button>
      </header>

      <div className="fw-grid">
        <aside className="fw-side">
          <FileBrowser
            sources={liveSession.sources}
            activeId={ui.activeSourceId}
            onSelect={(id) => {
              stop()
              const src = liveSession.sources.find((s) => s.id === id)
              const tracks: Record<string, TrackRuntime> = {}
              for (const t of src?.tracks ?? []) {
                tracks[t.id] = {
                  id: t.id,
                  mute: false,
                  solo: false,
                  gainDb: t.gainDb ?? 0,
                  pan: t.pan ?? 0,
                  visible: t.visible,
                }
              }
              patchUi({ activeSourceId: id, tracks, playheadSec: 0 })
            }}
          />
          <div className="fw-tracks">
            <div className="fw-pane-h">Tracks</div>
            {(isClockSync ? audioSources : playbackSource ? [playbackSource] : []).flatMap((src) =>
              (src.tracks ?? [])
                .filter((t) => t.visible)
                .map((t) => (
                  <div key={`${src.id}-${t.id}`} className="fw-track-block">
                    <TrackRow
                      name={isClockSync ? `${t.name}` : t.name}
                      channel={isClockSync ? src.filename : t.channel}
                      selected={src.id === ui.activeSourceId}
                      track={
                        ui.tracks[t.id] ?? {
                          id: t.id,
                          mute: false,
                          solo: false,
                          gainDb: 0,
                          pan: 0,
                          visible: true,
                        }
                      }
                      onChange={(patch) =>
                        setUi((u) => ({
                          ...u,
                          tracks: {
                            ...u.tracks,
                            [t.id]: {
                              ...(u.tracks[t.id] ?? {
                                id: t.id,
                                mute: false,
                                solo: false,
                                gainDb: 0,
                                pan: 0,
                                visible: true,
                              }),
                              ...patch,
                            },
                          },
                        }))
                      }
                    />
                    {isClockSync ? (
                      <label className="fw-track-offset">
                        Time offset
                        <input
                          type="number"
                          step={0.05}
                          data-testid={`track-offset-${src.id}`}
                          value={ui.sourceOffsets[src.id] ?? 0}
                          onChange={(e) => {
                            const v = Number(e.target.value)
                            setUi((u) => ({
                              ...u,
                              sourceOffsets: { ...u.sourceOffsets, [src.id]: v },
                              formalizedClockOffsetSec: null,
                              correctedSetTime: null,
                              findingUnlocked: false,
                            }))
                          }}
                        />
                        <span className="fw-mono">s</span>
                      </label>
                    ) : null}
                  </div>
                )),
            )}
          </div>
        </aside>

        <div className="fw-center">
          <main className="fw-main">
            {specializedWorkspace ? (
              <div className="fw-specialized" data-testid="fw-specialized-workspace">
                {specializedWorkspace}
              </div>
            ) : null}
            {!suppressTimeline ? (
              <Timeline
                durationSec={duration}
                playheadSec={ui.playheadSec}
                waveform={waveform}
                zoom={ui.zoom}
                selection={ui.selection}
                markers={ui.markers}
                waveformZoomY={ui.waveformZoomY}
                viewMode={timelineView}
                spectrogram={spectrogram}
                unavailableFromSec={
                  playbackSource?.containerPlayback && !ui.containerRebuilt ? playableUntil : null
                }
                lanes={
                  isClockSync
                    ? audioSources.map((s) => ({
                        id: s.id,
                        label: s.filename,
                        waveform: s.audio?.waveform ?? [],
                        startSec: (s.timelineOriginSec ?? 0) + (ui.sourceOffsets[s.id] ?? 0),
                        durationSec: s.durationSec,
                      }))
                    : undefined
                }
                onSeek={seek}
                onSelect={(selection) => patchUi({ selection })}
                onZoom={(zoom) => patchUi({ zoom })}
                onViewMode={(mode) => {
                  setTimelineView(mode)
                  if (mode === 'spectrogram' && playbackSource?.id) {
                    const id = playbackSource.id
                    setUi((u) => {
                      if (u.spectrogramViewedSourceIds.includes(id)) return u
                      return {
                        ...u,
                        spectrogramViewedSourceIds: [...u.spectrogramViewedSourceIds, id],
                      }
                    })
                    onSpectrogramViewed?.(id)
                  }
                }}
                onWaveformZoomY={(waveformZoomY) => patchUi({ waveformZoomY })}
                onLaneOffset={
                  isClockSync
                    ? (laneId, nextStartSec) => {
                        const src = audioSources.find((s) => s.id === laneId)
                        if (!src) return
                        const offset = nextStartSec - (src.timelineOriginSec ?? 0)
                        setUi((u) => ({
                          ...u,
                          sourceOffsets: { ...u.sourceOffsets, [laneId]: offset },
                          formalizedClockOffsetSec: null,
                          correctedSetTime: null,
                          findingUnlocked: false,
                        }))
                      }
                    : undefined
                }
              />
            ) : null}
          </main>
          <Transport
            playing={ui.playing}
            playheadSec={ui.playheadSec}
            durationSec={duration}
            loop={ui.loop}
            rate={ui.playbackRate}
            selection={ui.selection}
            bypass={ui.process.bypass}
            onPlay={() => void play()}
            onPause={pause}
            onStop={stop}
            onLoop={(loop) => {
              patchUi({ loop })
              engineRef.current?.setLoop(loop, ui.selection)
            }}
            onRate={(playbackRate) => {
              patchUi({ playbackRate })
              engineRef.current?.setPlaybackRate(playbackRate)
            }}
            onSkipSelStart={() => ui.selection && seek(ui.selection.startSec)}
            onSkipSelEnd={() => ui.selection && seek(ui.selection.endSec)}
            onBypass={(bypass) => patchProcess({ bypass })}
            onReset={() => {
              stop()
              setUi((u) => resetProcess(u))
              holdRef.current = {}
              setStatus(null)
            }}
          />
        </div>

        <Inspector
          tab={ui.inspectorTab}
          onTab={(inspectorTab) => patchUi({ inspectorTab })}
          source={source}
          ui={ui}
          sources={session.sources}
          showHelp={showHelp}
          onToggleHelp={() => setShowHelp((v) => !v)}
          onProcess={patchProcess}
          recoveredSpeech={ui.recoveredSpeech}
          clarityDebug={showDebug ? clarityDebug : undefined}
          structurePages={structurePages}
          fileMetadata={fileMetadata}
          onSelectStructurePage={(id) => patchUi({ selectedStructurePageId: id })}
          onStructureSequence={(pageId, sequence) => {
            setUi((u) => {
              const structureSequences = { ...u.structureSequences, [pageId]: sequence }
              onContainerStateChange?.({
                rebuilt: false,
                sequences: structureSequences,
              })
              return {
                ...u,
                structureSequences,
                containerRebuilt: false,
                rebuildStatus: null,
              }
            })
          }}
          onRebuildContainer={() => {
            const result = rebuildContainer(source, ui.structureSequences)
            setUi((u) => {
              const next = {
                ...u,
                rebuildCount: u.rebuildCount + 1,
                rebuildStatus: result.message,
                containerRebuilt: result.ok,
              }
              onContainerStateChange?.({
                rebuilt: result.ok,
                sequences: u.structureSequences,
              })
              return next
            })
            setStatus(result.message)
            if (result.ok) {
              engineRef.current?.setPlayableUntil(
                source?.containerPlayback?.containerDurationSec ?? null,
              )
            }
          }}
          onCaptureProfile={() => {
            const ideal = source?.audio?.recovery
              ? {
                  startSec: source.audio.recovery.idealProfileStartSec,
                  endSec: source.audio.recovery.idealProfileEndSec,
                }
              : undefined
            const result = captureNoiseProfile(
              ui.selection,
              source?.noiseRegions,
              ui.noiseProfiles,
              voiceSpansFromSource(source),
              ideal,
            )
            if (!result.ok) {
              setStatus('Selecione uma região na timeline antes de capturar o perfil.')
              return
            }
            setUi((u) => ({
              ...u,
              noiseProfiles: [...u.noiseProfiles, result.profile],
              activeNoiseProfileId: result.profile.id,
            }))
            setStatus(`Perfil capturado: ${result.profile.name}`)
          }}
          onActivateProfile={(id) => patchUi({ activeNoiseProfileId: id })}
          onAddMarker={({ timeSec, label }) =>
            setUi((u) => ({
              ...u,
              markers: [
                ...u.markers,
                { id: `m-${u.markers.length + 1}-${Date.now()}`, timeSec, label },
              ],
            }))
          }
          onCompare={(compareSourceA, compareSourceB) =>
            patchUi({ compareSourceA, compareSourceB })
          }
          clipSequenceTools={
            session.completion?.kind === 'clip-sequence'
              ? {
                  order: ui.clipSequence,
                  onMove: (index, dir) => {
                    setUi((u) => {
                      const next = [...u.clipSequence]
                      const j = index + dir
                      if (j < 0 || j >= next.length) return u
                      const tmp = next[index]!
                      next[index] = next[j]!
                      next[j] = tmp
                      return {
                        ...u,
                        clipSequence: next,
                        sequenceAssembled: false,
                        assembleStatus: null,
                      }
                    })
                  },
                  onAssemble: () => {
                    const result = assembleClipSequence(session, ui.clipSequence)
                    setUi((u) => ({
                      ...u,
                      sequenceAssembled: result.ok,
                      assembleStatus: result.message,
                    }))
                    setStatus(result.message)
                  },
                }
              : undefined
          }
          clockSync={
            isClockSync
              ? {
                  correlation,
                  offsetValid,
                  expectedOffsetSec: expectedOffset,
                  placementDeltaSec: placementDelta,
                  currentClockOffsetSec: expectedOffset,
                  onFormalizeOffset: () => {
                    if (!offsetValid) {
                      setStatus('Alignment insufficient to formalize clock difference.')
                      return
                    }
                    setUi((u) => ({
                      ...u,
                      formalizedClockOffsetSec: expectedOffset,
                    }))
                    setStatus(`Clock difference: ${fmtClockOffset(expectedOffset)}`)
                  },
                  onApplyClockCorrection: () => {
                    if (ui.formalizedClockOffsetSec == null) {
                      setStatus('Formalize clock difference before applying correction.')
                      return
                    }
                    const setLog =
                      session.completion?.setLogVerticeTime ?? '01:16:00'
                    const offset = ui.formalizedClockOffsetSec
                    // Deriva do alinhamento formalizado — não injeta string narrativa.
                    const parts = setLog.split(':').map(Number)
                    const base =
                      (parts[0] ?? 0) * 3600 + (parts[1] ?? 0) * 60 + (parts[2] ?? 0)
                    const total = base + Math.round(offset)
                    const h = Math.floor(total / 3600) % 24
                    const min = Math.floor((total % 3600) / 60)
                    const sec = total % 60
                    const corrected = `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
                    setUi((u) => ({
                      ...u,
                      correctedSetTime: corrected,
                      findingUnlocked: true,
                    }))
                    setStatus(`Set log ${setLog} (Vertice) + ${fmtClockOffset(offset)} → ${corrected} real`)
                  },
                  onSetTimingReference: (id) => patchUi({ timingReferenceSourceId: id }),
                  onSetSourceOffset: (id, sec) =>
                    setUi((u) => ({
                      ...u,
                      sourceOffsets: { ...u.sourceOffsets, [id]: sec },
                      formalizedClockOffsetSec: null,
                      correctedSetTime: null,
                      findingUnlocked: false,
                    })),
                }
              : undefined
          }
          onEstimateTempo={() => {
            const audioSrc =
              session.sources.find((s) => s.audio && s.tempoRegions?.length) ?? source
            const result = estimateTempoFromSelection(audioSrc, ui.selection)
            if (!result.ok) {
              setStatus(result.reason)
              patchUi({ tempoEstimate: null })
              return
            }
            patchUi({
              tempoEstimate: {
                bpm: result.bpm,
                confidence: result.confidence,
                windowSec: result.windowSec,
              },
            })
            setStatus(`Estimated tempo ${result.bpm.toFixed(1)} BPM (${result.confidence})`)
          }}
          onFingerprintSearch={
            session.completion?.kind === 'fingerprint-archive'
              ? () => {
                  if (!ui.selection) {
                    setStatus('Select a temporal region before Fingerprint Search.')
                    patchUi({ fingerprintStatus: 'Selection required.' })
                    return
                  }
                  const audioSrc =
                    session.sources.find((s) => s.audio && s.tempoRegions?.length) ?? source
                  const tempo = estimateTempoFromSelection(audioSrc, ui.selection)
                  const tempoBpm = tempo.ok ? tempo.bpm : null
                  const hits = searchFingerprintCatalog(
                    ui.selection.startSec,
                    ui.selection.endSec,
                    tempoBpm,
                  )
                  const strong = hits.find((h) => h.strong)
                  setUi((u) => {
                    let fingerprintAId = u.fingerprintAId
                    let fingerprintBId = u.fingerprintBId
                    if (strong?.trackId === PUZZLE03_TRACK_A_ID) fingerprintAId = strong.trackId
                    if (strong?.trackId === PUZZLE03_TRACK_B_ID) fingerprintBId = strong.trackId
                    const transitionOrder = summarizeTransition(fingerprintAId, fingerprintBId)
                    const archiveUnlocked = Boolean(fingerprintAId || fingerprintBId)
                    const filterIds = [fingerprintAId, fingerprintBId].filter(Boolean) as string[]
                    const matched = queryVerticeArchive({
                      trackIds: filterIds,
                      requireOrderedAdjacent:
                        transitionOrder === 'A→B' && filterIds.length === 2,
                    })
                    return {
                      ...u,
                      fingerprintLastHits: hits.map((h) => ({
                        trackId: h.trackId,
                        title: h.title,
                        versionLabel: h.versionLabel,
                        confidence: h.confidence,
                        strong: h.strong,
                        reason: h.reason,
                      })),
                      fingerprintAId,
                      fingerprintBId,
                      transitionOrder,
                      archiveUnlocked,
                      archiveFilterTrackIds: filterIds,
                      archiveRequireOrdered: transitionOrder === 'A→B' && filterIds.length === 2,
                      archiveMatchedSessionIds: matched.map((s) => s.id),
                      fingerprintStatus: strong
                        ? `Match: ${strong.title} · ${strong.versionLabel}`
                        : hits[0]
                          ? `Low confidence — ${hits[0].reason}`
                          : 'No catalog match.',
                      archiveStatus:
                        transitionOrder === 'A→B'
                          ? 'Ordered transition A→B established — filter archive by adjacency.'
                          : archiveUnlocked
                            ? 'Archive available — identify both beds to refine.'
                            : null,
                    }
                  })
                  setStatus(
                    strong
                      ? `Fingerprint: ${strong.title}`
                      : 'Fingerprint Search — no strong match for this selection.',
                  )
                }
              : undefined
          }
          onArchiveQuery={
            session.completion?.kind === 'fingerprint-archive'
              ? (opts) => {
                  const filterIds =
                    opts?.trackIds ??
                    ([ui.fingerprintAId, ui.fingerprintBId].filter(Boolean) as string[])
                  const requireOrdered =
                    opts?.requireOrdered ??
                    (summarizeTransition(ui.fingerprintAId, ui.fingerprintBId) === 'A→B' &&
                      filterIds.length === 2)
                  const matched = queryVerticeArchive({
                    trackIds: filterIds,
                    requireOrderedAdjacent: requireOrdered,
                  })
                  patchUi({
                    archiveFilterTrackIds: filterIds,
                    archiveRequireOrdered: requireOrdered,
                    archiveMatchedSessionIds: matched.map((s) => s.id),
                    archiveStatus: `${matched.length} session(s) in archive view.`,
                  })
                }
              : undefined
          }
          onOpenArchiveSession={
            session.completion?.kind === 'fingerprint-archive'
              ? (sessionId) => {
                  const chainReady = puzzle03TechnicalChainReady({
                    fingerprintAId: ui.fingerprintAId,
                    fingerprintBId: ui.fingerprintBId,
                    transitionOrder: ui.transitionOrder,
                  })
                  if (!chainReady) {
                    setStatus('Establish A→B fingerprints before relying on a set record.')
                    patchUi({
                      openedArchiveSessionId: sessionId,
                      archiveStatus:
                        'Opening records without A→B chain does not conclude the analysis.',
                    })
                    return
                  }
                  patchUi({
                    openedArchiveSessionId: sessionId,
                    archiveStatus:
                      sessionId === PUZZLE03_CANONICAL_SESSION_ID
                        ? 'Matching session opened — cabine operator on record.'
                        : 'Session opened — track order does not match A→B adjacency.',
                  })
                  setStatus(
                    sessionId === PUZZLE03_CANONICAL_SESSION_ID
                      ? 'Vertice set record opened.'
                      : 'Set record opened.',
                  )
                }
              : undefined
          }
          archiveSessions={
            session.completion?.kind === 'fingerprint-archive'
              ? (() => {
                  const ids = new Set(
                    ui.archiveMatchedSessionIds.length
                      ? ui.archiveMatchedSessionIds
                      : PUZZLE03_SET_SESSIONS.map((s) => s.id),
                  )
                  const list = PUZZLE03_SET_SESSIONS.filter((s) => ids.has(s.id))
                  return {
                    unlocked: ui.archiveUnlocked,
                    rows: sessionListHidesOperatorNames(list),
                    openedId: ui.openedArchiveSessionId,
                    openedDetail: ui.openedArchiveSessionId
                      ? PUZZLE03_SET_SESSIONS.find((s) => s.id === ui.openedArchiveSessionId) ?? null
                      : null,
                  }
                })()
              : undefined
          }
          onLinkSource={() => {
            const result = linkSources(session, ui.compareSourceA, ui.compareSourceB)
            setUi((u) => ({
              ...u,
              linkStatus: result.message,
              linkedSetSourceId: result.complete ? result.linkedSetId : u.linkedSetSourceId,
            }))
            setStatus(result.message)
          }}
          onRfSelectBand={(centerMhz, bandwidthMhz) => {
            if (!rfCapture) return
            const result = evaluateRfExtraction(rfCapture, centerMhz, bandwidthMhz)
            setUi((u) => ({
              ...u,
              rfCenterMhz: centerMhz,
              rfBandwidthMhz: bandwidthMhz,
              rfExtractionQuality: result.quality,
              rfHiddenOverlap: result.hiddenOverlap,
              rfStatus: null,
            }))
          }}
          onExtractChannel={() => {
            if (!rfCapture || ui.rfCenterMhz == null || ui.rfBandwidthMhz == null) return
            const result = evaluateRfExtraction(rfCapture, ui.rfCenterMhz, ui.rfBandwidthMhz)
            if (!result.ok) {
              setUi((u) => ({
                ...u,
                rfExtractionQuality: result.quality,
                rfHiddenOverlap: result.hiddenOverlap,
                rfStatus: result.message,
              }))
              setStatus(result.message)
              return
            }
            const derived = buildDerivedRfSource(rfCapture)
            setExtraSources((prev) =>
              prev.some((s) => s.id === derived.id) ? prev : [...prev, derived],
            )
            setUi((u) => ({
              ...u,
              rfExtracted: true,
              rfDerivedSourceId: derived.id,
              rfExtractionQuality: result.quality,
              rfHiddenOverlap: result.hiddenOverlap,
              rfStatus: result.message,
              activeSourceId: derived.id,
            }))
            setStatus(result.message)
          }}
          onFindSimilar={() => {
            const cfg = source?.cycleAnalysis
            if (!cfg) return
            const result = findSimilarCycleRegions(cfg, ui.selection)
            setUi((u) => ({
              ...u,
              similarRegions: result.regions,
              cycleAnalysisStatus: result.message,
              markers: result.regions.map((r, i) => ({
                id: `sim-${i}-${r.cycleIndex}`,
                timeSec: r.startSec,
                label: '',
              })),
            }))
            setStatus(result.message)
          }}
          onToggleReferenceCycle={(cycleIndex) => {
            setUi((u) => {
              const has = u.referenceCycleIndexes.includes(cycleIndex)
              return {
                ...u,
                referenceCycleIndexes: has
                  ? u.referenceCycleIndexes.filter((i) => i !== cycleIndex)
                  : [...u.referenceCycleIndexes, cycleIndex],
                commonPatternQuality: null,
                cycleDifferenceDone: false,
              }
            })
          }}
          onBuildCommonPattern={() => {
            const cfg = source?.cycleAnalysis
            if (!cfg) return
            const result = evaluateCommonPatternSelection(cfg, ui.referenceCycleIndexes)
            setUi((u) => ({
              ...u,
              commonPatternQuality: result.quality,
              cycleAnalysisStatus: result.message,
            }))
            setStatus(result.message)
          }}
          onSetDifferenceTarget={(cycleIndex) => {
            setUi((u) => ({
              ...u,
              differenceTargetIndex: cycleIndex,
              differenceQuality: null,
              ricardoClarity: null,
              cycleDifferenceDone: false,
            }))
          }}
          onApplyDifference={() => {
            const cfg = source?.cycleAnalysis
            if (!cfg) return
            const result = evaluateCycleDifference(
              cfg,
              ui.differenceTargetIndex,
              ui.referenceCycleIndexes,
              ui.commonPatternQuality,
            )
            setUi((u) => ({
              ...u,
              differenceQuality: result.quality,
              ricardoClarity: result.ricardoClarity,
              cycleAnalysisStatus: result.message,
              // Passo técnico ok; texto Recovered Speech só após ouvir o residual.
              cycleDifferenceDone: result.ok,
            }))
            if (result.ok && cfg.residualPreviewSrc) {
              const residualId = 'derived-enceladus-residual'
              // Difference only produces residual audio. Recovered Speech ("Ricardo")
              // is attached after the player listens / analyzes the residual.
              const residual: ForensicSource = {
                id: residualId,
                filename: 'AUD_0008_DIFFERENCE.wav',
                displayName: 'Difference residual (derived)',
                type: 'audio',
                durationSec: cfg.cycleSec,
                tracks: [
                  { id: 'master', name: 'MASTER', channel: '1 / mono', visible: true, gainDb: 0, pan: 0 },
                ],
                speechSegments: [],
                audio: {
                  sampleRate: 44100,
                  channels: 1,
                  seed: 8,
                  waveform: Array.from({ length: 96 }, (_, i) => 0.12 + Math.sin(i / 5) * 0.08),
                  stems: [
                    {
                      id: 'FILE',
                      kind: 'file',
                      initialGain: 1,
                      src: cfg.residualPreviewSrc,
                    },
                  ],
                },
              }
              setExtraSources((prev) => {
                const rest = prev.filter((s) => s.id !== residualId)
                return [...rest, residual]
              })
              patchUi({ activeSourceId: residualId })
              setStatus('Residual derived — play it to evaluate recoverable speech.')
            } else {
              setStatus(result.message)
            }
          }}
          onPacketSort={(sort) => patchUi({ packetSort: sort })}
          onPacketSsrcFilter={(ssrc) =>
            patchUi({ packetSsrcFilter: ssrc, selectedPacketIndexes: [] })
          }
          onTogglePacketSelect={(index) => {
            setUi((u) => {
              const has = u.selectedPacketIndexes.includes(index)
              return {
                ...u,
                selectedPacketIndexes: has
                  ? u.selectedPacketIndexes.filter((i) => i !== index)
                  : [...u.selectedPacketIndexes, index],
              }
            })
          }}
          onSelectVisiblePackets={() => {
            const rows = source?.packets?.rows ?? []
            const visible = filterPacketRows(rows, ui.packetSsrcFilter)
            patchUi({ selectedPacketIndexes: visible.map((r) => r.index) })
          }}
          onClearPacketSelection={() => patchUi({ selectedPacketIndexes: [] })}
          onCreateStreamFromSelection={() => {
            const rows = source?.packets?.rows ?? []
            const result = createDerivedRtpStream(
              rows,
              ui.selectedPacketIndexes,
              ui.packetSort,
              ui.derivedRtpStreams.length + 1,
            )
            if (!result.ok || !result.stream) {
              patchUi({ packetStatus: result.message })
              setStatus(result.message)
              return
            }
            setUi((u) => ({
              ...u,
              derivedRtpStreams: [...u.derivedRtpStreams, result.stream!],
              activeDerivedStreamId: result.stream!.id,
              packetStatus: result.message,
            }))
            setStatus(result.message)
          }}
          onSelectDerivedStream={(id) => patchUi({ activeDerivedStreamId: id })}
          onReconstructAudio={() => {
            const cfg = source?.rtpStreams
            const rows = source?.packets?.rows ?? []
            const stream = ui.derivedRtpStreams.find((s) => s.id === ui.activeDerivedStreamId)
            if (!cfg || !stream) return
            const result = evaluateRtpReconstruction(cfg, stream, rows, ui.packetSort)
            setUi((u) => {
              const derivedRtpStreams = u.derivedRtpStreams.map((s) =>
                s.id === stream.id
                  ? {
                      ...s,
                      orderQuality: result.quality,
                      sortMode: result.sortMode,
                      packetIndexes: result.orderedIndexes,
                      reconstructed: true,
                      audioSrc: result.audioSrc,
                    }
                  : s,
              )
              let streamARecovered = u.streamARecovered
              let streamBRecovered = u.streamBRecovered
              let streamAOrderQuality = u.streamAOrderQuality
              let streamBOrderQuality = u.streamBOrderQuality
              if (result.isStreamA) {
                streamAOrderQuality = result.quality
                if (result.ok) streamARecovered = true
              }
              if (result.isStreamB) {
                streamBOrderQuality = result.quality
                if (result.ok) streamBRecovered = true
              }
              return {
                ...u,
                derivedRtpStreams,
                streamARecovered,
                streamBRecovered,
                streamAOrderQuality,
                streamBOrderQuality,
                packetStatus: result.message,
              }
            })
            if (result.ok && result.isStreamB && result.audioSrc) {
              const inv = getInvestigationState()
              markForensicDerivedArtifact(
                buildCassiniStreamBArtifact({
                  audioSrc: result.audioSrc,
                  createdAtMs: inv.playTimeMs ?? Date.now(),
                  reconstructionOrder:
                    ui.packetSort === 'sequence'
                      ? 'sequence'
                      : ui.packetSort === 'time'
                        ? 'time'
                        : 'capture',
                  ssrc: stream.ssrc,
                  parentSourceId: source?.id ?? 'hv_session_capture',
                }),
              )
            }
            if (result.audioSrc) {
              const derived: ForensicSource = {
                id: `derived-${stream.id}`,
                filename: `${stream.label}.wav`,
                displayName: `${stream.label} (reconstructed)`,
                type: 'audio',
                durationSec: result.isStreamB ? 63 : 46,
                tracks: [
                  { id: 'master', name: 'MASTER', channel: '1 / mono', visible: true, gainDb: 0, pan: 0 },
                ],
                audio: {
                  sampleRate: cfg.sampleRate,
                  channels: 1,
                  seed: 0,
                  waveform: Array.from({ length: 128 }, (_, i) => Math.sin(i / 7) * 0.2),
                  stems: [{ id: 'FILE', kind: 'file', initialGain: 1, src: result.audioSrc }],
                },
              }
              setExtraSources((prev) => {
                const rest = prev.filter((s) => s.id !== derived.id)
                return [...rest, derived]
              })
              patchUi({ activeSourceId: derived.id })
            }
            setStatus(result.message)
          }}
        />
      </div>
      {showDebug ? (
        <ForensicDebug
          source={source}
          session={session}
          ui={ui}
          clarity={clarityDebug}
          playableUntil={playableUntil}
          sequenceValid={sequenceValid}
          onDevResetPuzzle={
            onDevResetPuzzle
              ? () => {
                  stop()
                  holdRef.current = {}
                  completedRef.current = false
                  onDevResetPuzzle()
                  setUi((u) => ({
                    ...createInitialUiState(session, []),
                    process: u.process,
                    tracks: u.tracks,
                    inspectorTab: u.inspectorTab,
                    containerRebuilt: false,
                    structureSequences: {},
                    rebuildStatus: null,
                    rebuildCount: 0,
                    recoveredSpeech: [],
                    linkedSetSourceId: null,
                    linkStatus: null,
                    tempoEstimate: null,
                  }))
                  engineRef.current?.setPlayableUntil(
                    source?.containerPlayback?.damagedPlayableUntilSec ?? null,
                  )
                  setStatus('DEV: puzzle reset.')
                }
              : undefined
          }
        />
      ) : null}
      {status && <div className="fw-status">{status}</div>}
    </div>
  )
}

function ForensicDebug({
  source,
  session,
  ui,
  clarity,
  playableUntil,
  sequenceValid,
  onDevResetPuzzle,
}: {
  source: ReturnType<typeof getActiveSource>
  session: ForensicSession
  ui: ForensicUiState
  clarity: SegmentClarity[]
  playableUntil: number
  sequenceValid: boolean
  onDevResetPuzzle?: () => void
}) {
  if (!source) return null
  const base: Record<StemId, number> = {
    FILE: 1,
    CORRUPTED_BASE: 1,
    VOICE: 1,
    BACKGROUND_NOISE: 1,
    TONE_1700: 1,
    VOCAL_DEBRIS: 1,
    CLICKS: 1,
  }
  for (const stem of source.audio?.stems ?? []) base[stem.id] = stem.initialGain
  const profile = ui.noiseProfiles.find((p) => p.id === ui.activeNoiseProfileId) ?? null
  const metrics = computeRecoveryMetrics(ui.process, profile, source.audio?.notch)
  const gains = computeStemGains(base, ui.process, profile, {
    notch: source.audio?.notch,
    spectral: source.audio?.spectral,
  })
  const pages = resolveStructurePages(source, ui.structureSequences, ui.containerRebuilt)
  const crcValid = pages.length > 0 && pages.every((p) => p.crcStatus === 'valid')
  const corruptPage = source.structure?.rebuildRule?.corruptPageId
    ? pages.find((p) => p.id === source.structure?.rebuildRule?.corruptPageId)
    : undefined
  const decodedDuration = effectivePlayableUntil(source, ui.containerRebuilt)
  const containerDuration =
    source.containerPlayback?.containerDurationSec ?? source.durationSec
  const isRings = session.completion?.kind === 'fingerprint-archive'
  const isJanus = session.completion?.kind === 'clock-sync'
  const isSaturnalia = session.completion?.kind === 'clip-sequence'
  const isHexagon = session.completion?.kind === 'spectrogram-survey'
  const isShepherd = session.completion?.kind === 'rf-channel-extract'
  const isEnceladus = session.completion?.kind === 'cycle-difference'
  const isCassiniHuygens = session.completion?.kind === 'rtp-stream-separation'
  const recording = session.sources.find((s) => s.tempoRegions?.length)
  const audioPair = session.sources.filter((s) => s.audio)
  const a = audioPair[0]
  const b = audioPair[1]
  const placement = a && b ? relativeSourceOffsetSec(a, b, ui.sourceOffsets) : 0
  const corr = approximateTrackCorrelation(
    placement,
    session.completion?.offsetToleranceSec ?? 0.2,
  )
  return (
    <div className="fw-debug" data-testid="forensic-debug">
      {isCassiniHuygens ? (
        <>
          <span>packetCount {session.sources[0]?.packets?.rows?.length ?? '—'}</span>
          <span>streamA SSRC {session.sources[0]?.rtpStreams?.ssrcA ?? '—'}</span>
          <span>streamB SSRC {session.sources[0]?.rtpStreams?.ssrcB ?? '—'}</span>
          <span>selectedSSRC {ui.packetSsrcFilter ?? '—'}</span>
          <span>streamAOrderQuality {ui.streamAOrderQuality?.toFixed(3) ?? '—'}</span>
          <span>streamBOrderQuality {ui.streamBOrderQuality?.toFixed(3) ?? '—'}</span>
          <span>
            sequenceErrors{' '}
            {ui.activeDerivedStreamId
              ? (
                  1 -
                  (ui.derivedRtpStreams.find((s) => s.id === ui.activeDerivedStreamId)?.orderQuality ??
                    0)
                ).toFixed(3)
              : '—'}
          </span>
          <span>
            reconstructionQuality{' '}
            {(
              ui.derivedRtpStreams.find((s) => s.id === ui.activeDerivedStreamId)?.orderQuality ?? null
            )?.toFixed(3) ?? '—'}
          </span>
          <span>streamARecovered {String(ui.streamARecovered)}</span>
          <span>streamBRecovered {String(ui.streamBRecovered)}</span>
          <span>puzzleComplete {String(rtpStreamSeparationComplete(session, ui))}</span>
          {onDevResetPuzzle ? (
            <button type="button" className="fw-btn" data-testid="dev-reset-puzzle" onClick={onDevResetPuzzle}>
              DEV reset puzzle
            </button>
          ) : null}
        </>
      ) : isEnceladus ? (
        <>
          <span>expectedCycleDuration {session.sources[0]?.cycleAnalysis?.cycleSec ?? '—'}</span>
          <span>detectedRegions {ui.similarRegions.length}</span>
          <span>selectedReferenceCycles {ui.referenceCycleIndexes.join(',') || '—'}</span>
          <span>anomalyCycle {(session.sources[0]?.cycleAnalysis?.anomalyCycleIndex ?? 0) + 1}</span>
          <span>commonPatternQuality {ui.commonPatternQuality?.toFixed(3) ?? '—'}</span>
          <span>differenceQuality {ui.differenceQuality?.toFixed(3) ?? '—'}</span>
          <span>ricardoClarity {ui.ricardoClarity?.toFixed(3) ?? '—'}</span>
          <span>recovered {String(ui.recoveredSpeech.some((r) => r.text === 'Ricardo'))}</span>
          <span>puzzleComplete {String(cycleDifferenceComplete(session, ui))}</span>
          {onDevResetPuzzle ? (
            <button type="button" className="fw-btn" data-testid="dev-reset-puzzle" onClick={onDevResetPuzzle}>
              DEV reset puzzle
            </button>
          ) : null}
        </>
      ) : isShepherd ? (
        <>
          <span>knownChannelA {session.sources[0]?.rfCapture?.channels.find((c) => c.id === 'A')?.centerMhz ?? '—'}</span>
          <span>hiddenChannelB {session.sources[0]?.rfCapture?.extract.hiddenCenterMhz ?? '—'}</span>
          <span>knownChannelC {session.sources[0]?.rfCapture?.channels.find((c) => c.id === 'C')?.centerMhz ?? '—'}</span>
          <span>selectedFrequency {ui.rfCenterMhz ?? '—'}</span>
          <span>selectedBandwidth {ui.rfBandwidthMhz ?? '—'}</span>
          <span>hiddenChannelOverlap {ui.rfHiddenOverlap?.toFixed(3) ?? '—'}</span>
          <span>extractionQuality {ui.rfExtractionQuality?.toFixed(3) ?? '—'}</span>
          <span>G17N recovered {String(ui.rfExtracted)}</span>
          <span>23:40 recovered {String(ui.rfExtracted)}</span>
          <span>locationCrossReferenced — (document)</span>
          <span>puzzleComplete {String(rfChannelExtractComplete(session, ui))}</span>
          {onDevResetPuzzle ? (
            <button type="button" className="fw-btn" data-testid="dev-reset-puzzle" onClick={onDevResetPuzzle}>
              DEV reset puzzle
            </button>
          ) : null}
        </>
      ) : isHexagon ? (
        <>
          {(
            [
              ['UNK_01', 'IV'],
              ['UNK_02', 'VIII'],
              ['UNK_03', 'I'],
              ['UNK_04', 'V'],
              ['UNK_05', 'II'],
              ['UNK_06', 'VI'],
            ] as const
          ).map(([id, sym]) => (
            <span key={id}>
              {id} expectedSymbol {sym}
              {ui.spectrogramViewedSourceIds.includes(id) ? ' · viewed' : ''}
            </span>
          ))}
          <span>expectedPin 481526</span>
          <span>surveyComplete {String(spectrogramSurveyComplete(session, ui))}</span>
          {onDevResetPuzzle ? (
            <button type="button" className="fw-btn" data-testid="dev-reset-puzzle" onClick={onDevResetPuzzle}>
              DEV reset puzzle
            </button>
          ) : null}
        </>
      ) : isSaturnalia ? (
        <>
          <span>expectedOrder {(session.completion?.expectedSourceOrder ?? []).join('→')}</span>
          <span>currentOrder {ui.clipSequence.join('→')}</span>
          <span>nextWriteSlot 06</span>
          <span>
            sequenceValid{' '}
            {String(
              ui.clipSequence.length === (session.completion?.expectedSourceOrder?.length ?? -1) &&
                ui.clipSequence.every(
                  (id, i) => id === session.completion?.expectedSourceOrder?.[i],
                ),
            )}
          </span>
          <span>puzzleComplete {String(ui.sequenceAssembled)}</span>
          {onDevResetPuzzle ? (
            <button type="button" className="fw-btn" data-testid="dev-reset-puzzle" onClick={onDevResetPuzzle}>
              DEV reset puzzle
            </button>
          ) : null}
        </>
      ) : isJanus ? (
        <>
          <span>sourceAReferenceTime {a?.timing?.eventClockAtDj ?? '—'}</span>
          <span>sourceBInternalTime {b?.timing?.eventClockAtDj ?? '—'}</span>
          <span>expectedOffset = +{session.completion?.expectedOffsetSec ?? 450} s</span>
          <span>
            currentOffset{' '}
            {a && b
              ? Math.abs((a.timelineOriginSec ?? 0) - (b.timelineOriginSec ?? 0))
              : '—'}
          </span>
          <span>placementDelta {placement.toFixed(3)}</span>
          <span>correlation {corr.toFixed(3)}</span>
          <span>offsetValid {String(clockSyncOffsetValid(session, ui))}</span>
          <span>correctedSetTime {ui.correctedSetTime ?? '—'}</span>
          <span>sandraApproxTime ~01:16</span>
          <span>findingUnlocked {String(ui.findingUnlocked)}</span>
          <span>formalizedClockOffsetSec {ui.formalizedClockOffsetSec ?? '—'}</span>
          {onDevResetPuzzle ? (
            <button type="button" className="fw-btn" data-testid="dev-reset-puzzle" onClick={onDevResetPuzzle}>
              DEV reset puzzle
            </button>
          ) : null}
        </>
      ) : isRings ? (
        <>
          <span>actualPreTempo {recording?.tempoRegions?.find((t) => t.id === 'pre')?.bpm ?? '—'}</span>
          <span>actualPostTempo {recording?.tempoRegions?.find((t) => t.id === 'post')?.bpm ?? '—'}</span>
          <span>djStart {recording?.tempoRegions ? '72.000' : '—'}</span>
          <span>djEnd {recording?.tempoRegions ? '90.678' : '—'}</span>
          <span>correctSetId {session.completion?.correctSetSourceId ?? '—'}</span>
          <span>selectedSetId {ui.linkedSetSourceId ?? ui.compareSourceB ?? '—'}</span>
          <span>puzzleComplete {String(Boolean(ui.linkedSetSourceId && ui.linkedSetSourceId === session.completion?.correctSetSourceId))}</span>
          {onDevResetPuzzle ? (
            <button type="button" className="fw-btn" data-testid="dev-reset-puzzle" onClick={onDevResetPuzzle}>
              DEV reset puzzle
            </button>
          ) : null}
        </>
      ) : source.containerPlayback ? (
        <>
          <span>containerValid {String(ui.containerRebuilt && sequenceValid)}</span>
          <span>sequenceValid {String(sequenceValid)}</span>
          <span>crcValid {String(crcValid)}</span>
          <span>decodedDuration {decodedDuration.toFixed(3)}</span>
          <span>containerDuration {containerDuration.toFixed(3)}</span>
          <span>playableUntil {playableUntil.toFixed(3)}</span>
          <span>rebuildCount {ui.rebuildCount}</span>
          {corruptPage ? (
            <span>
              page {corruptPage.index} expectedSequence:{' '}
              {corruptPage.expectedSequence ?? '—'} currentSequence: {corruptPage.sequence}
            </span>
          ) : null}
          {onDevResetPuzzle ? (
            <button type="button" className="fw-btn" data-testid="dev-reset-puzzle" onClick={onDevResetPuzzle}>
              DEV reset puzzle
            </button>
          ) : null}
        </>
      ) : (
        <>
          <span>center {metrics.centerAccuracy.toFixed(3)}</span>
          <span>depth {metrics.notchDepthEffect.toFixed(3)}</span>
          <span>widthQ {metrics.notchWidthQuality.toFixed(3)}</span>
          <span>profileQ {metrics.noiseProfileQuality.toFixed(3)}</span>
          <span>profileDur {metrics.profileDuration.toFixed(2)}s</span>
          <span>voiceContam {metrics.voiceContamination.toFixed(3)}</span>
          <span>nre {metrics.noiseReductionEffect.toFixed(3)}</span>
          <span>voiceDmg {metrics.voiceDamage.toFixed(3)}</span>
          <span>corrupted {gains.CORRUPTED_BASE.toFixed(3)}</span>
          <span>cleanBus {gains.VOICE.toFixed(3)}</span>
        </>
      )}
      {clarity.map((c) => {
        const seg = source.speechSegments?.find((s) => s.id === c.segmentId)
        // Não vazar spoiler: texto só depois do unlock.
        const label = c.unlocked ? (seg?.text ?? c.segmentId) : c.segmentId
        return (
          <span key={c.segmentId}>
            {label.toUpperCase()} v{c.effectiveVoiceGain.toFixed(2)} m
            {c.effectiveMaskGain.toFixed(2)} {c.clarityScore.toFixed(2)}/{c.threshold.toFixed(2)}
            {c.unlocked ? ' ✓' : ''}
          </span>
        )
      })}
    </div>
  )
}

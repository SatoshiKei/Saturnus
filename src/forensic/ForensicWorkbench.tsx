import { useEffect, useMemo, useRef, useState } from 'react'
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
  evaluateCommonPatternSelection,
  evaluateCycleDifference,
  evaluateRfExtraction,
  findSimilarCycleRegions,
  fmtClockOffset,
  relativeSourceOffsetSec,
  rfChannelExtractComplete,
  speechRecoveryComplete,
  spectrogramSurveyComplete,
  structureSequenceValid,
  voiceSpansFromSource,
  type SegmentClarity,
} from './forensicEngine'
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
}) {
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
  const engineRef = useRef<ForensicAudioEngine | null>(null)
  const completedRef = useRef(false)
  const holdRef = useRef<Record<string, number>>({})
  const showDebug = import.meta.env.DEV

  const liveSession = useMemo(
    () => ({ ...session, sources: [...session.sources, ...extraSources] }),
    [session, extraSources],
  )
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
    eng.applyProcess(process, profile, effectiveMute)
  }, [ui.process, ui.tracks, ui.activeNoiseProfileId, ui.noiseProfiles])

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
    eng.applyProcess(ui.process, profile, false)
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
                    const corrected = session.completion?.correctedRealTime ?? '01:23:30'
                    setUi((u) => ({
                      ...u,
                      correctedSetTime: corrected,
                      findingUnlocked: true,
                    }))
                    setStatus(
                      `Set log ${session.completion?.setLogVerticeTime ?? '01:16:00'} → ${corrected} real`,
                    )
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
            setUi((u) => {
              let recoveredSpeech = u.recoveredSpeech
              let cycleDifferenceDone = u.cycleDifferenceDone
              if (result.ok) {
                const seg = cfg.recoveredSpeech
                if (!recoveredSpeech.some((r) => r.segmentId === seg.segmentId)) {
                  recoveredSpeech = [
                    ...recoveredSpeech,
                    {
                      segmentId: seg.segmentId,
                      text: seg.text,
                      startSec: seg.startSec,
                      unlockedAt: Date.now(),
                    },
                  ]
                  onSegmentRecovered?.({
                    segmentId: seg.segmentId,
                    text: seg.text,
                    startSec: seg.startSec,
                    unlockedAt: Date.now(),
                  })
                }
                cycleDifferenceDone = true
              }
              return {
                ...u,
                differenceQuality: result.quality,
                ricardoClarity: result.ricardoClarity,
                cycleAnalysisStatus: result.message,
                recoveredSpeech,
                cycleDifferenceDone,
              }
            })
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
  const isRings = session.completion?.kind === 'source-link'
  const isJanus = session.completion?.kind === 'clock-sync'
  const isSaturnalia = session.completion?.kind === 'clip-sequence'
  const isHexagon = session.completion?.kind === 'spectrogram-survey'
  const isShepherd = session.completion?.kind === 'rf-channel-extract'
  const isEnceladus = session.completion?.kind === 'cycle-difference'
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
      {isEnceladus ? (
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

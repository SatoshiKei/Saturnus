import { useEffect, useRef, useState } from 'react'
import '../styles/forensic-workbench.css'
import { ForensicAudioEngine } from './forensicAudio'
import {
  captureNoiseProfile,
  computeRecoveryMetrics,
  computeStemGains,
  createInitialUiState,
  effectivePlayableUntil,
  evaluateSegmentClarity,
  fileMetadataForContainer,
  fmtTime,
  getActiveSource,
  rebuildContainer,
  resetProcess,
  resolveStructurePages,
  speechRecoveryComplete,
  structureSequenceValid,
  voiceSpansFromSource,
  type SegmentClarity,
} from './forensicEngine'
import type {
  ForensicSession,
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
  onClose,
  onPuzzleComplete,
  completed,
  recoveredSpeech: recoveredProp,
  onSegmentRecovered,
  containerRebuilt: containerRebuiltProp,
  structureSequences: structureSequencesProp,
  onContainerStateChange,
  onDevResetPuzzle,
}: {
  session: ForensicSession
  fileNameBadge?: string
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
}) {
  const [ui, setUi] = useState<ForensicUiState>(() => {
    const initial = createInitialUiState(session, recoveredProp ?? [])
    return {
      ...initial,
      containerRebuilt: containerRebuiltProp ?? false,
      structureSequences: structureSequencesProp ?? {},
    }
  })
  const [showHelp, setShowHelp] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [timelineView, setTimelineView] = useState<'waveform' | 'spectrogram'>('waveform')
  const [measuredWave, setMeasuredWave] = useState<number[] | null>(null)
  const [clarityDebug, setClarityDebug] = useState<SegmentClarity[]>([])
  const engineRef = useRef<ForensicAudioEngine | null>(null)
  const completedRef = useRef(false)
  const holdRef = useRef<Record<string, number>>({})
  const showDebug = import.meta.env.DEV

  const source = getActiveSource(session, ui)
  const playableUntil = effectivePlayableUntil(source, ui.containerRebuilt)
  const duration = source?.durationSec ?? 0
  const waveform = measuredWave ?? source?.audio?.waveform ?? []
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
    (source?.audio?.channels === 1 ? 'Mono' : source?.audio?.channels ? String(source.audio.channels) : '—')
  const sampleRate =
    source?.metadata?.find((m) => m.key === 'sampleRate')?.value ??
    (source?.audio?.sampleRate ? `${source.audio.sampleRate} Hz` : '—')

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
    return () => {
      eng.dispose()
      engineRef.current = null
    }
  }, [])

  useEffect(() => {
    engineRef.current?.setPlayableUntil(
      source?.containerPlayback ? playableUntil : null,
    )
  }, [playableUntil, source?.containerPlayback])

  useEffect(() => {
    setMeasuredWave(null)
  }, [source?.id])

  useEffect(() => {
    if (!recoveredProp) return
    setUi((u) => ({ ...u, recoveredSpeech: recoveredProp }))
  }, [recoveredProp])

  useEffect(() => {
    const eng = engineRef.current
    if (!eng || !source?.audio) return
    void eng.loadAsset(source.audio, source.durationSec, source.speechSegments ?? [])
  }, [source?.id, source?.audio, source?.durationSec, source?.speechSegments])

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
    source?.speechSegments,
    source,
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
            sources={session.sources}
            activeId={ui.activeSourceId}
            onSelect={(id) => {
              stop()
              const src = session.sources.find((s) => s.id === id)
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
            {source?.tracks
              ?.filter((t) => t.visible)
              .map((t) => (
                <TrackRow
                  key={t.id}
                  name={t.name}
                  channel={t.channel}
                  selected
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
                        [t.id]: { ...u.tracks[t.id]!, ...patch },
                      },
                    }))
                  }
                />
              ))}
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
              spectrogram={source?.audio?.spectrogram}
              unavailableFromSec={
                source?.containerPlayback && !ui.containerRebuilt ? playableUntil : null
              }
              onSeek={seek}
              onSelect={(selection) => patchUi({ selection })}
              onZoom={(zoom) => patchUi({ zoom })}
              onViewMode={setTimelineView}
              onWaveformZoomY={(waveformZoomY) => patchUi({ waveformZoomY })}
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
        />
      </div>
      {showDebug && source?.audio ? (
        <ForensicDebug
          source={source}
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
  ui,
  clarity,
  playableUntil,
  sequenceValid,
  onDevResetPuzzle,
}: {
  source: NonNullable<ReturnType<typeof getActiveSource>>
  ui: ForensicUiState
  clarity: SegmentClarity[]
  playableUntil: number
  sequenceValid: boolean
  onDevResetPuzzle?: () => void
}) {
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
  return (
    <div className="fw-debug" data-testid="forensic-debug">
      {source.containerPlayback ? (
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

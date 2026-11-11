import { useEffect, useRef, useState } from 'react'
import '../styles/forensic-workbench.css'
import { ForensicAudioEngine } from './forensicAudio'
import {
  captureNoiseProfile,
  computeStemGains,
  createInitialUiState,
  fmtTime,
  getActiveSource,
  notchToneEffect,
  resetProcess,
  transcriptionComplete,
  voiceSpansFromSource,
} from './forensicEngine'
import type {
  ForensicSession,
  ForensicSource,
  ForensicUiState,
  ProcessParams,
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
}: {
  session: ForensicSession
  fileNameBadge?: string
  onClose: () => void
  onPuzzleComplete?: () => void
  completed?: boolean
}) {
  const [ui, setUi] = useState<ForensicUiState>(() => createInitialUiState(session))
  const [showHelp, setShowHelp] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [timelineView, setTimelineView] = useState<'waveform' | 'spectrogram'>('waveform')
  const [measuredWave, setMeasuredWave] = useState<number[] | null>(null)
  const engineRef = useRef<ForensicAudioEngine | null>(null)
  const completedRef = useRef(false)
  const showDebug = import.meta.env.DEV

  const source = getActiveSource(session, ui)
  const duration = source?.durationSec ?? 0
  const waveform = measuredWave ?? source?.audio?.waveform ?? []
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
    eng.setTickHandler((t) => setUi((u) => ({ ...u, playheadSec: t })))
    eng.setWaveformHandler((peaks) => setMeasuredWave(peaks))
    return () => {
      eng.dispose()
      engineRef.current = null
    }
  }, [])

  useEffect(() => {
    setMeasuredWave(null)
  }, [source?.id])

  useEffect(() => {
    const eng = engineRef.current
    if (!eng || !source?.audio) return
    void eng.loadAsset(source.audio, source.durationSec)
  }, [source?.id, source?.audio, source?.durationSec])

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

  useEffect(() => {
    if (completed || completedRef.current || !onPuzzleComplete) return
    if (!source?.transcription) return
    if (transcriptionComplete(ui.transcriptionNotes, source.transcription)) {
      completedRef.current = true
      onPuzzleComplete()
      setStatus('Análise registrada no caderno de investigação.')
    }
  }, [ui.transcriptionNotes, source?.transcription, completed, onPuzzleComplete])

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
          onCaptureProfile={() => {
            const result = captureNoiseProfile(
              ui.selection,
              source?.noiseRegions,
              ui.noiseProfiles,
              voiceSpansFromSource(source),
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
          onNotes={(transcriptionNotes) => patchUi({ transcriptionNotes })}
          onCompare={(compareSourceA, compareSourceB) =>
            patchUi({ compareSourceA, compareSourceB })
          }
        />
      </div>
      {showDebug && source?.audio ? <ForensicDebug source={source} ui={ui} /> : null}
      {status && <div className="fw-status">{status}</div>}
    </div>
  )
}

function ForensicDebug({ source, ui }: { source: ForensicSource; ui: ForensicUiState }) {
  const base: Record<StemId, number> = {
    VOICE: 1,
    BACKGROUND_NOISE: 1,
    TONE_1700: 1,
    VOCAL_DEBRIS: 1,
    CLICKS: 1,
  }
  for (const stem of source.audio?.stems ?? []) base[stem.id] = stem.initialGain
  const profile = ui.noiseProfiles.find((p) => p.id === ui.activeNoiseProfileId) ?? null
  const gains = computeStemGains(base, ui.process, profile, {
    notch: source.audio?.notch,
    spectral: source.audio?.spectral,
  })
  const notch = source.audio?.notch
    ? notchToneEffect(
        ui.process.notchCenterHz,
        ui.process.notchReductionDb,
        ui.process.notchWidthHz,
        source.audio.notch,
      )
    : 0
  return (
    <div className="fw-debug" data-testid="forensic-debug">
      <span>voiceGain {gains.VOICE.toFixed(3)}</span>
      <span>noiseGain {gains.BACKGROUND_NOISE.toFixed(3)}</span>
      <span>toneGain {gains.TONE_1700.toFixed(3)}</span>
      <span>profileQuality {(profile?.qualityScore ?? 0).toFixed(3)}</span>
      <span>notchEffectiveness {notch.toFixed(3)}</span>
    </div>
  )
}

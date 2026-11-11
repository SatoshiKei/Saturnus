import { useEffect, useRef, useState } from 'react'
import { ForensicAudioEngine } from './forensicAudio'
import {
  captureNoiseProfile,
  createInitialUiState,
  getActiveSource,
  resetProcess,
  transcriptionComplete,
} from './forensicEngine'
import type {
  ForensicSession,
  ForensicUiState,
  ProcessParams,
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
  const engineRef = useRef<ForensicAudioEngine | null>(null)
  const completedRef = useRef(false)

  const source = getActiveSource(session, ui)
  const duration = source?.durationSec ?? 0
  const waveform = source?.audio?.waveform ?? []

  useEffect(() => {
    const eng = new ForensicAudioEngine()
    engineRef.current = eng
    eng.setTickHandler((t) => setUi((u) => ({ ...u, playheadSec: t })))
    return () => {
      eng.dispose()
      engineRef.current = null
    }
  }, [])

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
        <div>
          <strong>{session.title}</strong>
          <span className="fw-top__file">{fileNameBadge ?? source?.filename ?? '—'}</span>
        </div>
        <button type="button" className="fw-btn" onClick={onClose}>
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
            <div className="fw-pane-h">TRACKS</div>
            {source?.tracks
              ?.filter((t) => t.visible)
              .map((t) => (
                <TrackRow
                  key={t.id}
                  name={t.name}
                  channel={t.channel}
                  track={ui.tracks[t.id] ?? {
                    id: t.id,
                    mute: false,
                    solo: false,
                    gainDb: 0,
                    pan: 0,
                    visible: true,
                  }}
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

        <main className="fw-main">
          <Timeline
            durationSec={duration}
            playheadSec={ui.playheadSec}
            waveform={waveform}
            zoom={ui.zoom}
            selection={ui.selection}
            markers={ui.markers}
            waveformZoomY={ui.waveformZoomY}
            onSeek={seek}
            onSelect={(selection) => patchUi({ selection })}
            onZoom={(zoom) => patchUi({ zoom })}
          />
          <label className="fw-wave-y">
            Waveform Y
            <input
              type="range"
              min={0.5}
              max={3}
              step={0.1}
              value={ui.waveformZoomY}
              onChange={(e) => patchUi({ waveformZoomY: Number(e.target.value) })}
            />
          </label>
        </main>

        <div className="fw-bottom">
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
      </div>
      {status && <div className="fw-status">{status}</div>}
    </div>
  )
}

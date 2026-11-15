import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  CHK_UNK_AUDIO_SRC,
  CHK_UNK_DISPLAY_NAME,
  CHK_UNK_PLAYER_SUBTITLE,
  CHK_UNK_PLAYER_TITLE,
} from '../../data/block04/chkUnkRecording'
import { onUnknownRecordingAnalyzed } from '../../game/story/block04Handlers'
import { useInvestigation } from '../../game/hooks/useInvestigation'
import { assetPath } from '../../lib/assetPath'

function fmt(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) return '0:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

function waveHeights(seed: string) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return Array.from({ length: 80 }, (_, i) => {
    h = (h * 1664525 + 1013904223 + i) >>> 0
    return 0.18 + (h % 1000) / 1000 * 0.82
  })
}

export function ChkUnkAudioViewer({ onClose }: { onClose: () => void }) {
  const inv = useInvestigation()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [current, setCurrent] = useState(0)
  const [analyzed, setAnalyzed] = useState(Boolean(inv.flags.block04_unknown_analyzed))
  const bars = useMemo(() => waveHeights(CHK_UNK_AUDIO_SRC), [])
  const progress = duration > 0 ? current / duration : 0

  const tryCompleteListen = useCallback(() => {
    if (analyzed) return
    if (!inv.evidenceOwned.includes('unknown_contact_recording')) return
    onUnknownRecordingAnalyzed()
    setAnalyzed(true)
  }, [analyzed, inv.evidenceOwned])

  useEffect(() => {
    const a = new Audio(assetPath(CHK_UNK_AUDIO_SRC))
    const onMeta = () => setDuration(a.duration || 0)
    const onTime = () => setCurrent(a.currentTime)
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onEnd = () => {
      setPlaying(false)
      setCurrent(0)
      tryCompleteListen()
    }
    a.addEventListener('loadedmetadata', onMeta)
    a.addEventListener('timeupdate', onTime)
    a.addEventListener('play', onPlay)
    a.addEventListener('pause', onPause)
    a.addEventListener('ended', onEnd)
    audioRef.current = a
    return () => {
      a.pause()
      a.removeEventListener('loadedmetadata', onMeta)
      a.removeEventListener('timeupdate', onTime)
      a.removeEventListener('play', onPlay)
      a.removeEventListener('pause', onPause)
      a.removeEventListener('ended', onEnd)
      audioRef.current = null
    }
  }, [tryCompleteListen])

  const toggle = () => {
    const a = audioRef.current
    if (!a) return
    if (a.paused) void a.play().catch(() => setPlaying(false))
    else a.pause()
  }

  const seekTo = (sec: number) => {
    const a = audioRef.current
    if (!a || !duration) return
    const t = Math.max(0, Math.min(duration, sec))
    a.currentTime = t
    setCurrent(t)
  }

  const seek = (ratio: number) => seekTo(ratio * duration)

  const skip = (delta: number) => seekTo(current + delta)

  return (
    <div className="ios-audio-viewer" data-testid="chk-unk-player" role="dialog" aria-modal="true">
      <header className="ios-audio-viewer__head">
        <button type="button" className="ios-audio-viewer__done" onClick={onClose}>
          Concluído
        </button>
      </header>
      <div className="ios-audio-viewer__body">
        <div className="ios-audio-viewer__hero">
          <div className="ios-audio-viewer__art" aria-hidden>
            <span className="ios-audio-viewer__glyph">♪</span>
          </div>
          <h2 className="ios-audio-viewer__title">{CHK_UNK_PLAYER_TITLE}</h2>
          <p className="ios-audio-viewer__sub">{CHK_UNK_PLAYER_SUBTITLE}</p>
          <p className="ios-audio-viewer__file">{CHK_UNK_DISPLAY_NAME}</p>
        </div>
        <div className="ios-audio-viewer__wave" aria-hidden>
          {bars.map((h, i) => (
            <span
              key={i}
              style={{ height: `${h * 100}%` }}
              data-played={i / bars.length <= progress || undefined}
            />
          ))}
        </div>
      </div>
      <PlayerDock
        playing={playing}
        current={current}
        duration={duration}
        progress={progress}
        analyzed={analyzed}
        onToggle={toggle}
        onSeek={seek}
        onSkip={skip}
      />
    </div>
  )
}

function PlayerDock({
  playing,
  current,
  duration,
  progress,
  analyzed,
  onToggle,
  onSeek,
  onSkip,
}: {
  playing: boolean
  current: number
  duration: number
  progress: number
  analyzed: boolean
  onToggle: () => void
  onSeek: (ratio: number) => void
  onSkip: (delta: number) => void
}) {
  return (
    <div className="ios-audio-viewer__dock">
      <div className="ios-audio-viewer__scrub">
        <input
          type="range"
          min={0}
          max={1000}
          value={Math.round(progress * 1000)}
          aria-label="Posição na gravação"
          data-testid="chk-unk-scrub"
          onChange={(e) => onSeek(Number(e.target.value) / 1000)}
        />
        <div className="ios-audio-viewer__times">
          <span>{fmt(current)}</span>
          <span>{fmt(duration)}</span>
        </div>
      </div>
      <div className="ios-audio-viewer__transport">
        <button
          type="button"
          className="ios-audio-viewer__skip"
          data-testid="chk-unk-skip-back"
          aria-label="Voltar 15 segundos"
          onClick={() => onSkip(-15)}
        >
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
            <path
              fill="currentColor"
              d="M12 5V1L7 6l5 5V7c3.3 0 6 2.7 6 6s-2.7 6-6 6-6-2.7-6-6H4c0 4.4 3.6 8 8 8s8-3.6 8-8-3.6-8-8-8z"
            />
          </svg>
          <span className="ios-audio-viewer__skip-label">15</span>
        </button>
        <button
          type="button"
          className="ios-audio-viewer__play"
          data-testid="chk-unk-play"
          aria-label={playing ? 'Pausar' : 'Reproduzir'}
          onClick={onToggle}
        >
          {playing ? (
            <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden>
              <path fill="currentColor" d="M6 5h4v14H6V5zm8 0h4v14h-4V5z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="32" height="32" aria-hidden>
              <path fill="currentColor" d="M8 5v14l11-7L8 5z" />
            </svg>
          )}
        </button>
        <button
          type="button"
          className="ios-audio-viewer__skip"
          data-testid="chk-unk-skip-forward"
          aria-label="Avançar 15 segundos"
          onClick={() => onSkip(15)}
        >
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
            <path
              fill="currentColor"
              d="M12 5V1l5 5-5 5V7c-3.3 0-6 2.7-6 6s2.7 6 6 6 6-2.7 6-6h2c0 4.4-3.6 8-8 8s-8-3.6-8-8 3.6-8 8-8z"
            />
          </svg>
          <span className="ios-audio-viewer__skip-label">15</span>
        </button>
      </div>
      {analyzed ? (
        <p className="ios-audio-viewer__note" data-testid="chk-unk-heard">
          Gravação ouvida neste aparelho.
        </p>
      ) : null}
    </div>
  )
}
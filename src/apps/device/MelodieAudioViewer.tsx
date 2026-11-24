import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MELODIE_PHONE_AUDIO_SRC } from '../../data/block01/mariApartmentSceneAssets'
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
    return 0.18 + ((h % 1000) / 1000) * 0.82
  })
}

export function MelodieAudioViewer({ onClose }: { onClose: () => void }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [current, setCurrent] = useState(0)
  const bars = useMemo(() => waveHeights(MELODIE_PHONE_AUDIO_SRC), [])
  const progress = duration > 0 ? current / duration : 0

  useEffect(() => {
    const a = new Audio(assetPath(MELODIE_PHONE_AUDIO_SRC))
    const onMeta = () => setDuration(a.duration || 0)
    const onTime = () => setCurrent(a.currentTime)
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onEnd = () => {
      setPlaying(false)
      setCurrent(0)
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
  }, [])

  const toggle = useCallback(() => {
    const a = audioRef.current
    if (!a) return
    if (a.paused) void a.play().catch(() => setPlaying(false))
    else a.pause()
  }, [])

  const seek = useCallback(
    (ratio: number) => {
      const a = audioRef.current
      if (!a || duration <= 0) return
      a.currentTime = ratio * duration
    },
    [duration],
  )

  return (
    <div className="ios-audio-viewer" data-testid="melodie-audio-viewer" role="dialog" aria-modal="true">
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
          <h2 className="ios-audio-viewer__title">Melodie</h2>
          <p className="ios-audio-viewer__sub">Toque no aparelho</p>
          <p className="ios-audio-viewer__file">Melodie.mp3</p>
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
      <div className="ios-audio-viewer__dock">
        <div className="ios-audio-viewer__scrub">
          <input
            type="range"
            min={0}
            max={1000}
            value={Math.round(progress * 1000)}
            aria-label="Posição na faixa"
            data-testid="melodie-scrub"
            onChange={(e) => seek(Number(e.target.value) / 1000)}
          />
          <div className="ios-audio-viewer__times">
            <span>{fmt(current)}</span>
            <span>{fmt(duration)}</span>
          </div>
        </div>
        <button type="button" className="ios-audio-viewer__play" data-testid="melodie-play" onClick={toggle}>
          {playing ? 'Pausar' : 'Reproduzir'}
        </button>
      </div>
    </div>
  )
}
import { useEffect, useRef, useState } from 'react'
import { assetPath } from '../../lib/assetPath'
import type { ChatMessage } from '../../types/messaging'

type AudioMsg = Extract<ChatMessage, { kind: 'audio' }>

const SPEEDS = [1, 1.5, 2] as const

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function AudioMessage({
  message,
  onPlayStart,
}: {
  message: AudioMsg
  onPlayStart?: () => void
}) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [speedIdx, setSpeedIdx] = useState(0)
  const src = assetPath(message.audioSrc)
  const limit =
    message.playableUntilSec != null
      ? Math.min(message.durationSec, message.playableUntilSec)
      : message.durationSec

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.playbackRate = SPEEDS[speedIdx]
  }, [speedIdx])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.pause()
    audio.load()
    setPlaying(false)
    setProgress(0)
  }, [src])

  const toggle = async () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      await audio.play()
      setPlaying(true)
      onPlayStart?.()
    }
  }

  const cycleSpeed = () => setSpeedIdx((i) => (i + 1) % SPEEDS.length)

  return (
    <div className="wa-audio" data-testid="audio-message">
      <audio
        key={src}
        ref={audioRef}
        src={src}
        preload="metadata"
        onTimeUpdate={() => {
          const a = audioRef.current
          if (!a) return
          const denom = Math.max(0.001, limit)
          setProgress(Math.min(1, a.currentTime / denom))
          if (a.currentTime >= limit - 0.05) {
            a.pause()
            a.currentTime = limit
            setPlaying(false)
            setProgress(1)
          }
        }}
        onEnded={() => setPlaying(false)}
      />
      <button
        type="button"
        className="wa-audio__play"
        aria-label={playing ? 'Pausar áudio' : 'Reproduzir áudio'}
        onClick={toggle}
      >
        {playing ? '❚❚' : '▶'}
      </button>
      <div className="wa-audio__wave" aria-hidden>
        {Array.from({ length: 28 }, (_, i) => (
          <span
            key={i}
            className="wa-audio__bar"
            style={{
              height: `${30 + Math.sin(i * 0.7) * 18 + Math.cos(i * 0.3) * 10}%`,
              opacity: i / 28 <= progress ? 1 : 0.35,
            }}
          />
        ))}
      </div>
      <span className="wa-audio__duration">{formatDuration(limit)}</span>
      <button type="button" className="wa-audio__speed" onClick={cycleSpeed} aria-label="Velocidade">
        {SPEEDS[speedIdx]}×
      </button>
    </div>
  )
}

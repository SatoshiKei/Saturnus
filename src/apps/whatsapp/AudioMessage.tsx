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

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.playbackRate = SPEEDS[speedIdx]
  }, [speedIdx])

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
        ref={audioRef}
        src={assetPath(message.audioSrc)}
        preload="metadata"
        onTimeUpdate={() => {
          const a = audioRef.current
          if (!a?.duration) return
          setProgress(a.currentTime / a.duration)
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
      <span className="wa-audio__duration">{formatDuration(message.durationSec)}</span>
      <button type="button" className="wa-audio__speed" onClick={cycleSpeed} aria-label="Velocidade">
        {SPEEDS[speedIdx]}×
      </button>
    </div>
  )
}

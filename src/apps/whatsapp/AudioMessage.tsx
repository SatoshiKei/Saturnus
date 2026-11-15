import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { assetPath } from '../../lib/assetPath'
import type { ChatMessage } from '../../types/messaging'

type AudioMsg = Extract<ChatMessage, { kind: 'audio' }>

const SPEEDS = [1, 1.5, 2] as const

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

async function playWhenReady(audio: HTMLAudioElement): Promise<void> {
  try {
    await audio.play()
    return
  } catch {
    /* metadata ainda carregando — comum em MP3 grande */
  }
  await new Promise<void>((resolve, reject) => {
    if (audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      resolve()
      return
    }
    const onReady = () => {
      cleanup()
      resolve()
    }
    const onErr = () => {
      cleanup()
      reject(new Error('audio load failed'))
    }
    const cleanup = () => {
      audio.removeEventListener('canplay', onReady)
      audio.removeEventListener('error', onErr)
    }
    audio.addEventListener('canplay', onReady, { once: true })
    audio.addEventListener('error', onErr, { once: true })
  })
  await audio.play()
}

export function AudioMessage({
  message,
  onPlayStart,
  onPlayComplete,
}: {
  message: AudioMsg
  /** Dispara no início da reprodução (evidências leves). */
  onPlayStart?: () => void
  /** Dispara só quando o trecho exigido foi ouvido até o fim. */
  onPlayComplete?: () => void
}) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const prevSrcRef = useRef<string | null>(null)
  const narrativeSent = useRef(false)
  const completeSent = useRef(false)
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
    narrativeSent.current = false
    completeSent.current = false
    const audio = audioRef.current
    if (!audio) return
  }, [src])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (prevSrcRef.current === src) return
    const hadPrev = prevSrcRef.current != null
    prevSrcRef.current = src
    if (!hadPrev) return
    audio.pause()
    audio.load()
    setPlaying(false)
    setProgress(0)
  }, [src])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !onPlayStart) return
    const handlePlaying = () => {
      if (narrativeSent.current) return
      narrativeSent.current = true
      window.setTimeout(() => onPlayStart(), 0)
    }
    audio.addEventListener('playing', handlePlaying)
    return () => audio.removeEventListener('playing', handlePlaying)
  }, [onPlayStart, src])

  const toggle = async (e: MouseEvent) => {
    e.stopPropagation()
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      setPlaying(false)
      return
    }
    try {
      await playWhenReady(audio)
      setPlaying(true)
    } catch {
      setPlaying(false)
    }
  }

  const cycleSpeed = (e: MouseEvent) => {
    e.stopPropagation()
    setSpeedIdx((i) => (i + 1) % SPEEDS.length)
  }

  return (
    <div className="wa-audio" data-testid="audio-message">
      <audio
        ref={audioRef}
        src={src}
        preload="auto"
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
            if (onPlayComplete && !completeSent.current) {
              completeSent.current = true
              onPlayComplete()
            }
          }
        }}
        onPause={() => setPlaying(false)}
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
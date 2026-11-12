import { useCallback, useEffect, useState } from 'react'
import { resolveChatMediaSrc } from '../../lib/characterSprites'
import { MORSA_CCTV_BEATS, type MorsaCctvBeat } from '../../data/block08/morsaCctvBeats'
import { RING_CONTINUITY_FRAMES } from '../../data/block08/ringsPuzzle'
import { playSfx } from '../../lib/sfx'
import '../../styles/morsa-cctv.css'

export function MorsaCctvReveal({ onComplete }: { onComplete: () => void }) {
  const [index, setIndex] = useState(0)
  const [endPrimed, setEndPrimed] = useState(false)
  const [fading, setFading] = useState(false)
  const beat = MORSA_CCTV_BEATS[index]

  const finish = useCallback(() => {
    setFading(true)
    playSfx('fade')
    window.setTimeout(() => onComplete(), 600)
  }, [onComplete])

  const advance = useCallback(() => {
    if (fading) return
    if (index >= MORSA_CCTV_BEATS.length - 1) {
      if (!endPrimed) {
        setEndPrimed(true)
        return
      }
      finish()
      return
    }
    playSfx('ui')
    setIndex((i) => i + 1)
    setEndPrimed(false)
  }, [endPrimed, finish, fading, index])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        advance()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [advance])

  const frame =
    beat?.kind === 'cam'
      ? RING_CONTINUITY_FRAMES[beat.frameIndex]
      : RING_CONTINUITY_FRAMES[0]

  return (
    <div
      className={`morsa-cctv${fading ? ' morsa-cctv--out' : ''}`}
      data-testid="morsa-cctv-reveal"
      onClick={advance}
      role="presentation"
    >
      <div className="morsa-cctv__room" />
      <CctvBeatView beat={beat} frame={frame} />
      <footer className="morsa-cctv__hint">
        {index >= MORSA_CCTV_BEATS.length - 1 && endPrimed ? 'Encerrar' : 'Continuar'}
      </footer>
    </div>
  )
}

function CctvBeatView({
  beat,
  frame,
}: {
  beat: MorsaCctvBeat | undefined
  frame: (typeof RING_CONTINUITY_FRAMES)[number]
}) {
  if (!beat) return null
  if (beat.kind === 'pause') {
    return <div className="morsa-cctv__thought" style={{ opacity: 0.35 }}>…</div>
  }
  if (beat.kind === 'name') {
    return (
      <p className="morsa-cctv__name" data-testid="morsa-cctv-name">
        {beat.text}
      </p>
    )
  }
  if (beat.kind === 'thought') {
    return <p className="morsa-cctv__thought">{beat.text}</p>
  }

  const spriteIdx = beat.spriteIndex ?? 0
  const sprite = frame.sprites[Math.min(spriteIdx, frame.sprites.length - 1)]!
  const unmasked = !frame.masked && spriteIdx >= 2

  return (
    <figure className="morsa-cctv__feed" data-testid={`morsa-cctv-${frame.cameraId}`}>
      <div
        className="morsa-cctv__screen"
        style={{
          position: 'relative',
          overflow: 'hidden',
          filter: 'contrast(1.15) saturate(0.55) brightness(0.92)',
        }}
      >
        <img
          src={resolveChatMediaSrc(frame.bgSrc)}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.05)' }}
        />
        <img
          src={resolveChatMediaSrc(sprite)}
          alt=""
          data-testid={unmasked ? 'morsa-unmasked' : 'morsa-masked'}
          style={{
            position: 'absolute',
            bottom: '2%',
            left: `${28 + (spriteIdx % 4) * 3}%`,
            height: unmasked ? '78%' : '62%',
            imageRendering: 'pixelated',
            filter: 'blur(0.55px) contrast(1.25)',
            opacity: 0.92,
            transition: 'left 80ms steps(1)',
          }}
        />
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 3px)',
            pointerEvents: 'none',
          }}
        />
        <span className="morsa-cctv__badge">{frame.cameraId}</span>
        <span className="morsa-cctv__stamp">{frame.timeLabel}</span>
      </div>
      {beat.thought ? <figcaption>{beat.thought}</figcaption> : null}
    </figure>
  )
}

import { useEffect, useRef, useState } from 'react'

export const TIKTOK_RYAN_DANCE_SRC = '/assets/video/mariana/ryan-dance.mp4'

interface TikTokAppProps {
  onBack: () => void
}

/**
 * TikTok (só Mariana): abre direto no clip local, UI de feed vertical.
 * Voltar: home indicator do PhoneShell.
 */
export function TikTokApp(_props: TikTokAppProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(true)
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(128_400)
  const [muted, setMuted] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = muted
    const play = async () => {
      try {
        await v.play()
        setPlaying(true)
      } catch {
        setPlaying(false)
      }
    }
    void play()
  }, [muted])

  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      void v.play()
      setPlaying(true)
    } else {
      v.pause()
      setPlaying(false)
    }
  }

  const toggleLike = () => {
    setLiked((was) => {
      setLikes((n) => (was ? n - 1 : n + 1))
      return !was
    })
  }

  return (
    <div className="tt-app" data-testid="tiktok-app">
      <div className="tt-app__stage">
        <video
          ref={videoRef}
          className="tt-app__video"
          src={TIKTOK_RYAN_DANCE_SRC}
          playsInline
          loop
          autoPlay
          data-testid="tiktok-video"
          onTimeUpdate={(e) => {
            const el = e.currentTarget
            if (!el.duration) return
            setProgress(el.currentTime / el.duration)
          }}
          onClick={togglePlay}
        />
        {!playing ? (
          <button type="button" className="tt-app__play-hint" aria-label="Reproduzir" onClick={togglePlay}>
            ▶
          </button>
        ) : null}

        <header className="tt-app__top">
          <div className="tt-app__tabs" aria-hidden>
            <span>Seguindo</span>
            <span className="is-active">Para você</span>
          </div>
          <button
            type="button"
            className="tt-app__mute"
            aria-label={muted ? 'Ativar som' : 'Silenciar'}
            onClick={() => setMuted((m) => !m)}
          >
            <MuteIcon muted={muted} />
          </button>
        </header>

        <aside className="tt-app__rail" aria-label="Ações">
          <div className="tt-app__avatar" aria-hidden>
            F
          </div>
          <button
            type="button"
            className={`tt-app__action${liked ? ' is-liked' : ''}`}
            data-testid="tiktok-like"
            onClick={toggleLike}
          >
            <span aria-hidden>♥</span>
            <small>{formatCount(likes)}</small>
          </button>
          <button type="button" className="tt-app__action" tabIndex={-1}>
            <span aria-hidden>💬</span>
            <small>2.1K</small>
          </button>
          <button type="button" className="tt-app__action" tabIndex={-1}>
            <span aria-hidden>↗</span>
            <small>840</small>
          </button>
        </aside>

        <div className="tt-app__meta">
          <p className="tt-app__user">@fragcosplay</p>
          <p className="tt-app__caption">
            #comomeumachado #omitido
          </p>
          <p className="tt-app__sound">♪ I&apos;d Rather Sleep</p>
        </div>

        <div className="tt-app__progress" aria-hidden>
          <div className="tt-app__progress-fill" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>
    </div>
  )
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`
  return String(n)
}

/** Ícone flat estilo iOS / TikTok (sem emoji). */
function MuteIcon({ muted }: { muted: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="tt-app__mute-svg" aria-hidden>
      {muted ? (
        <>
          <path
            fill="currentColor"
            d="M4.5 9.2v5.6h3.4L13 20V4L7.9 9.2H4.5z"
          />
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            d="M16.2 9.2l4.6 4.6M20.8 9.2l-4.6 4.6"
          />
        </>
      ) : (
        <>
          <path
            fill="currentColor"
            d="M4.5 9.2v5.6h3.4L13 20V4L7.9 9.2H4.5z"
          />
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            d="M15.6 9.4a3.6 3.6 0 010 5.2M17.8 7.2a6.4 6.4 0 010 9.6"
          />
        </>
      )}
    </svg>
  )
}

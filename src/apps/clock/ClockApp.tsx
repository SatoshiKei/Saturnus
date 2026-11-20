import { useEffect, useMemo, useRef, useState } from 'react'

interface ClockAppProps {
  onBack: () => void
}

type ClockTab = 'world' | 'alarm' | 'stopwatch' | 'timer'

const WORLD_CITIES = [
  { id: 'costeira', label: 'Costeira', offsetHours: -3 },
  { id: 'sp', label: 'São Paulo', offsetHours: -3 },
  { id: 'lisboa', label: 'Lisboa', offsetHours: 0 },
  { id: 'utc', label: 'UTC', offsetHours: 0 },
] as const

const ALARMS_SEED = [
  { id: 'a1', time: '06:30', label: 'Manhã', on: true },
  { id: 'a2', time: '07:15', label: 'Segundo alarme', on: false },
  { id: 'a3', time: '22:00', label: 'Lembrete', on: true },
]

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

function formatCityTime(now: Date, offsetHours: number) {
  const utc = now.getTime() + now.getTimezoneOffset() * 60_000
  const local = new Date(utc + offsetHours * 3_600_000)
  return `${pad2(local.getHours())}:${pad2(local.getMinutes())}`
}

function formatMs(ms: number) {
  const total = Math.max(0, Math.floor(ms))
  const m = Math.floor(total / 60_000)
  const s = Math.floor((total % 60_000) / 1000)
  const cs = Math.floor((total % 1000) / 10)
  return `${pad2(m)}:${pad2(s)}.${pad2(cs)}`
}

function formatTimer(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${pad2(m)}:${pad2(s)}`
}

/**
 * Relógio estilo iOS: World Clock, Alarm, Stopwatch, Timer.
 */
export function ClockApp({ onBack }: ClockAppProps) {
  const [tab, setTab] = useState<ClockTab>('world')
  const [now, setNow] = useState(() => new Date())
  const [alarms, setAlarms] = useState(ALARMS_SEED)

  // Stopwatch
  const [swRunning, setSwRunning] = useState(false)
  const [swElapsed, setSwElapsed] = useState(0)
  const [laps, setLaps] = useState<number[]>([])
  const swOrigin = useRef(0)
  const swBase = useRef(0)

  // Timer
  const [timerMin, setTimerMin] = useState(5)
  const [timerSec, setTimerSec] = useState(0)
  const [timerLeft, setTimerLeft] = useState<number | null>(null)
  const [timerRunning, setTimerRunning] = useState(false)

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    if (!swRunning) return
    const id = window.setInterval(() => {
      setSwElapsed(swBase.current + (performance.now() - swOrigin.current))
    }, 32)
    return () => window.clearInterval(id)
  }, [swRunning])

  useEffect(() => {
    if (!timerRunning || timerLeft == null) return
    if (timerLeft <= 0) {
      setTimerRunning(false)
      setTimerLeft(0)
      return
    }
    const id = window.setTimeout(() => setTimerLeft((t) => (t == null ? t : t - 1)), 1000)
    return () => window.clearTimeout(id)
  }, [timerRunning, timerLeft])

  const startStopwatch = () => {
    swOrigin.current = performance.now()
    setSwRunning(true)
  }
  const pauseStopwatch = () => {
    swBase.current = swElapsed
    setSwRunning(false)
  }
  const resetStopwatch = () => {
    setSwRunning(false)
    setSwElapsed(0)
    swBase.current = 0
    setLaps([])
  }
  const lapStopwatch = () => {
    if (!swRunning && swElapsed === 0) return
    setLaps((prev) => [swElapsed, ...prev])
  }

  const startTimer = () => {
    const total = timerMin * 60 + timerSec
    if (total <= 0) return
    setTimerLeft(total)
    setTimerRunning(true)
  }

  const tabs = useMemo(
    () =>
      [
        { id: 'world' as const, label: 'Mundial' },
        { id: 'alarm' as const, label: 'Alarmes' },
        { id: 'stopwatch' as const, label: 'Cronômetro' },
        { id: 'timer' as const, label: 'Timer' },
      ] as const,
    [],
  )

  return (
    <div className="ios-clock" data-testid="clock-app">
      <header className="ios-app-header ios-app-header--clock">
        <button type="button" className="ios-app-header__back" data-testid="clock-back" onClick={onBack}>
          ‹ Início
        </button>
        <h1>{tabs.find((t) => t.id === tab)?.label ?? 'Relógio'}</h1>
      </header>

      <div className="ios-clock__body">
        {tab === 'world' ? (
          <ul className="ios-clock__world" data-testid="clock-world">
            {WORLD_CITIES.map((c) => (
              <li key={c.id} className="ios-clock__city">
                <div>
                  <p className="ios-clock__city-name">{c.label}</p>
                  <p className="ios-clock__city-meta">
                    Hoje, {c.offsetHours >= 0 ? `+${c.offsetHours}` : c.offsetHours} h
                  </p>
                </div>
                <p className="ios-clock__city-time">{formatCityTime(now, c.offsetHours)}</p>
              </li>
            ))}
          </ul>
        ) : null}

        {tab === 'alarm' ? (
          <ul className="ios-clock__alarms" data-testid="clock-alarms">
            {alarms.map((a) => (
              <li key={a.id} className="ios-clock__alarm">
                <div>
                  <p className="ios-clock__alarm-time">{a.time}</p>
                  <p className="ios-clock__alarm-label">{a.label}</p>
                </div>
                <button
                  type="button"
                  className={`ios-clock__toggle${a.on ? ' is-on' : ''}`}
                  aria-pressed={a.on}
                  data-testid={`alarm-toggle-${a.id}`}
                  onClick={() =>
                    setAlarms((prev) => prev.map((x) => (x.id === a.id ? { ...x, on: !x.on } : x)))
                  }
                >
                  <span className="ios-clock__toggle-knob" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        {tab === 'stopwatch' ? (
          <div className="ios-clock__stopwatch" data-testid="clock-stopwatch">
            <p className="ios-clock__big">{formatMs(swElapsed)}</p>
            <div className="ios-clock__actions">
              <button type="button" className="ios-clock__btn ios-clock__btn--muted" onClick={swRunning ? lapStopwatch : resetStopwatch}>
                {swRunning ? 'Volta' : 'Zerar'}
              </button>
              <button
                type="button"
                className={`ios-clock__btn ${swRunning ? 'ios-clock__btn--stop' : 'ios-clock__btn--go'}`}
                onClick={swRunning ? pauseStopwatch : startStopwatch}
              >
                {swRunning ? 'Pausar' : 'Iniciar'}
              </button>
            </div>
            {laps.length ? (
              <ul className="ios-clock__laps">
                {laps.map((lap, i) => (
                  <li key={`${lap}-${i}`}>
                    <span>Volta {laps.length - i}</span>
                    <span>{formatMs(lap)}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        {tab === 'timer' ? (
          <div className="ios-clock__timer" data-testid="clock-timer">
            {timerLeft != null ? (
              <>
                <p className="ios-clock__big">{formatTimer(timerLeft)}</p>
                <div className="ios-clock__actions">
                  <button
                    type="button"
                    className="ios-clock__btn ios-clock__btn--muted"
                    onClick={() => {
                      setTimerRunning(false)
                      setTimerLeft(null)
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className={`ios-clock__btn ${timerRunning ? 'ios-clock__btn--stop' : 'ios-clock__btn--go'}`}
                    data-testid="clock-timer-toggle"
                    onClick={() => setTimerRunning((r) => !r)}
                    disabled={timerLeft === 0}
                  >
                    {timerRunning ? 'Pausar' : 'Retomar'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="ios-clock__picker">
                  <label>
                    min
                    <input
                      type="number"
                      min={0}
                      max={59}
                      value={timerMin}
                      onChange={(e) => setTimerMin(Math.max(0, Math.min(59, Number(e.target.value) || 0)))}
                    />
                  </label>
                  <label>
                    seg
                    <input
                      type="number"
                      min={0}
                      max={59}
                      value={timerSec}
                      onChange={(e) => setTimerSec(Math.max(0, Math.min(59, Number(e.target.value) || 0)))}
                    />
                  </label>
                </div>
                <div className="ios-clock__actions">
                  <button type="button" className="ios-clock__btn ios-clock__btn--go" onClick={startTimer}>
                    Iniciar
                  </button>
                </div>
              </>
            )}
          </div>
        ) : null}
      </div>

      <nav className="ios-clock__tabs" aria-label="Abas do Relógio">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`ios-clock__tab${tab === t.id ? ' is-active' : ''}`}
            data-testid={`clock-tab-${t.id}`}
            onClick={() => setTab(t.id)}
          >
            <span className="ios-clock__tab-icon" aria-hidden>
              <ClockTabIcon id={t.id} />
            </span>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  )
}

function ClockTabIcon({ id }: { id: ClockTab }) {
  const stroke = 'currentColor'
  switch (id) {
    case 'world':
      return (
        <svg viewBox="0 0 24 24" className="ios-clock__tab-svg" aria-hidden>
          <circle cx="12" cy="12" r="9" fill="none" stroke={stroke} strokeWidth="1.7" />
          <path
            d="M3.5 12h17M12 3.5c2.8 2.6 2.8 14.4 0 17M12 3.5c-2.8 2.6-2.8 14.4 0 17"
            fill="none"
            stroke={stroke}
            strokeWidth="1.5"
          />
        </svg>
      )
    case 'alarm':
      return (
        <svg viewBox="0 0 24 24" className="ios-clock__tab-svg" aria-hidden>
          <circle cx="12" cy="13" r="7" fill="none" stroke={stroke} strokeWidth="1.7" />
          <path d="M12 13V9.5M12 13l3 2" fill="none" stroke={stroke} strokeWidth="1.7" strokeLinecap="round" />
          <path d="M5 5.5l2.2 2.2M19 5.5l-2.2 2.2" fill="none" stroke={stroke} strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      )
    case 'stopwatch':
      return (
        <svg viewBox="0 0 24 24" className="ios-clock__tab-svg" aria-hidden>
          <circle cx="12" cy="13.5" r="7" fill="none" stroke={stroke} strokeWidth="1.7" />
          <path d="M12 13.5V9.8M10 4.5h4" fill="none" stroke={stroke} strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      )
    case 'timer':
      return (
        <svg viewBox="0 0 24 24" className="ios-clock__tab-svg" aria-hidden>
          <circle cx="12" cy="13" r="7.2" fill="none" stroke={stroke} strokeWidth="1.7" />
          <path d="M12 13V8.8M9.2 4.8h5.6" fill="none" stroke={stroke} strokeWidth="1.7" strokeLinecap="round" />
          <path d="M16.8 7.2l1.4-1.4" fill="none" stroke={stroke} strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      )
  }
}

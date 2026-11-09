import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as PE, type WheelEvent } from 'react'
import { AppIcon, appLabel } from '../components/AppIcon'
import { usePhoneSession } from '../app/PhoneSessionContext'
import { useGameHub } from '../app/GameHubContext'
import { useInvestigation } from '../game/hooks/useInvestigation'
import { visibleAppsForDevice } from '../lib/phoneApps'
import { openApp } from '../lib/phoneRouter'
import { newContactIds } from '../lib/contactsSeen'
import type { PhoneAppId } from '../types/phone'

/** Apps comuns sem função no caso: tocar não faz nada (sem “bloqueado”). */
const COMMON_INERT = new Set<PhoneAppId>([
  'browser',
  'messages',
  'camera',
  'mail',
  'maps',
  'clock',
  'calculator',
  'weather',
])

/** No celular de Augusto só WhatsApp, Telefone e Ajustes têm função; o resto é cenário. */
const AUGUSTO_INERT = new Set<PhoneAppId>(['notes', 'photos', 'files', 'calendar'])

const DOCK: PhoneAppId[] = ['phone', 'whatsapp', 'messages', 'settings']
const COLS = 4
const ROWS = 3
const PAGE_SIZE = COLS * ROWS
const SNAP = 56

function unique(ids: PhoneAppId[]): PhoneAppId[] {
  const seen = new Set<PhoneAppId>()
  const out: PhoneAppId[] = []
  for (const id of ids) {
    if (seen.has(id)) continue
    seen.add(id)
    out.push(id)
  }
  return out
}

function pagesOf(ids: PhoneAppId[]): PhoneAppId[][] {
  if (!ids.length) return [[]]
  const pages: PhoneAppId[][] = []
  for (let i = 0; i < ids.length; i += PAGE_SIZE) pages.push(ids.slice(i, i + PAGE_SIZE))
  return pages
}

export function PhoneHome() {
  const { push } = usePhoneSession()
  const { phoneDevice } = useGameHub()
  const inv = useInvestigation()
  const gridApps = unique(visibleAppsForDevice(phoneDevice, inv))
  const phoneBadge = phoneDevice === 'augusto' ? newContactIds(inv).length : 0
  const dockApps = DOCK.filter((id) => gridApps.includes(id))
  const homeApps = gridApps.filter((id) => !dockApps.includes(id))
  const pages = useMemo(() => pagesOf(homeApps), [homeApps.join('|')])
  const pageCount = pages.length
  const [page, setPage] = useState(0)
  const [drag, setDrag] = useState(0)
  const dragging = useRef(false)
  const startX = useRef(0)
  const lastX = useRef(0)
  const skipClick = useRef(false)
  const boxRef = useRef<HTMLDivElement>(null)
  const [boxW, setBoxW] = useState(280)

  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    setBoxW(el.clientWidth || 280)
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => setBoxW(el.clientWidth || 280))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const current = Math.min(page, pageCount - 1)

  const inert = (id: PhoneAppId) =>
    COMMON_INERT.has(id) || (phoneDevice === 'augusto' && AUGUSTO_INERT.has(id))

  const launch = (id: PhoneAppId) => {
    if (inert(id)) return
    if (id === 'appstore') {
      push({ screen: 'appstore' })
      return
    }
    if (id === 'wavelab-mobile') {
      push({ screen: 'wavelab' })
      return
    }
    if (id === 'recorder') {
      push({ screen: 'recorder' })
      return
    }
    if (id === 'settings') {
      push({ screen: 'device-settings' })
      return
    }
    if (id === 'photos') {
      push({ screen: 'photos' })
      return
    }
    if (id === 'files') {
      push({ screen: 'files' })
      return
    }
    if (id === 'hidden-diary') {
      push(openApp('hidden-diary'))
      return
    }
    push(openApp(id))
  }

  const goPage = useCallback(
    (next: number) => {
      setPage(Math.max(0, Math.min(pageCount - 1, next)))
      setDrag(0)
    },
    [pageCount],
  )

  const onPointerDown = (e: PE<HTMLDivElement>) => {
    dragging.current = true
    skipClick.current = false
    startX.current = e.clientX
    lastX.current = e.clientX
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: PE<HTMLDivElement>) => {
    if (!dragging.current) return
    lastX.current = e.clientX
    const dx = e.clientX - startX.current
    if (Math.abs(dx) > 8) skipClick.current = true
    setDrag(dx)
  }

  const onPointerUp = (e: PE<HTMLDivElement>) => {
    if (!dragging.current) return
    dragging.current = false
    const dx = lastX.current - startX.current
    const width = e.currentTarget.clientWidth || 280
    if (dx <= -SNAP || dx < -width * 0.22) goPage(current + 1)
    else if (dx >= SNAP || dx > width * 0.22) goPage(current - 1)
    else setDrag(0)
  }

  const onWheel = (e: WheelEvent<HTMLDivElement>) => {
    if (Math.abs(e.deltaY) >= Math.abs(e.deltaX)) {
      e.preventDefault()
      return
    }
    if (Math.abs(e.deltaX) < 24) return
    e.preventDefault()
    goPage(current + (e.deltaX > 0 ? 1 : -1))
  }

  return (
    <div className="phone-home" data-testid="phone-home">
      <p className="phone-home__device-label" data-testid="phone-device-label">
        {phoneDevice === 'mariana' ? 'Aparelho — Mariana' : 'Aparelho — Augusto'}
      </p>
      <div className="phone-home__wallpaper" />
      <div
        ref={boxRef}
        className="phone-home__pages"
        data-testid="phone-home-pages"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
      >
        <div
          className="phone-home__track"
          data-dragging={dragging.current || undefined}
          style={{
            width: boxW * Math.max(1, pageCount),
            transform: `translateX(${-current * boxW + drag}px)`,
            transition: dragging.current ? 'none' : 'transform 280ms cubic-bezier(.22,.9,.3,1)',
          }}
        >
          {pages.map((apps, pi) => (
            <div
              key={pi}
              className="phone-home__grid"
              data-testid={`phone-home-page-${pi}`}
              style={{ width: boxW }}
            >
              {apps.map((id) => (
                <button
                  key={id}
                  type="button"
                  className="phone-home__app"
                  aria-label={appLabel(id)}
                  data-testid={`app-${id}`}
                  data-inert={inert(id) || undefined}
                  onClick={() => {
                    if (skipClick.current) return
                    launch(id)
                  }}
                >
                  <AppIcon appId={id} />
                  <span className="phone-home__app-label">{appLabel(id)}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
      {pageCount > 1 ? (
        <div className="phone-home__dots" data-testid="phone-home-dots">
          {pages.map((_, i) => (
            <button
              key={i}
              type="button"
              className="phone-home__dot"
              data-active={i === current || undefined}
              aria-label={`Página ${i + 1}`}
              onClick={() => goPage(i)}
            />
          ))}
        </div>
      ) : null}
      <div className="phone-home__dock">
        {dockApps.map((id) => (
          <button
            key={id}
            type="button"
            className="phone-home__dock-app"
            aria-label={appLabel(id)}
            data-testid={`app-${id}`}
            onClick={() => launch(id)}
          >
            <AppIcon appId={id} size="dock" />
            {id === 'phone' && phoneBadge > 0 ? (
              <span className="phone-home__badge" data-testid="phone-badge">
                {phoneBadge}
              </span>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  )
}

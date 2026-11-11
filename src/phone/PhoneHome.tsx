import { useEffect, useMemo, useRef, useState, type PointerEvent as PE } from 'react'
import { AppIcon, appLabel } from '../components/AppIcon'
import { usePhoneSession } from '../app/PhoneSessionContext'
import { useGameHub } from '../app/GameHubContext'
import { useInvestigation } from '../game/hooks/useInvestigation'
import { visibleAppsForDevice } from '../lib/phoneApps'
import { openApp } from '../lib/phoneRouter'
import { newContactIds } from '../lib/contactsSeen'
import type { PhoneAppId } from '../types/phone'

/** Apps de cenário sem tela própria: tocar não faz nada (sem “bloqueado”). */
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

const DOCK: PhoneAppId[] = ['phone', 'whatsapp', 'messages', 'settings']
const PAGE_SIZE = 12
/** Distância mínima antes de virar swipe (abaixo disso = clique). */
const SWIPE_ARM = 14

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
  const scrollerRef = useRef<HTMLDivElement>(null)
  const startX = useRef(0)
  const startScroll = useRef(0)
  const tracking = useRef(false)
  const armed = useRef(false)
  const suppressClick = useRef(false)

  useEffect(() => {
    setPage(0)
    const el = scrollerRef.current
    if (el && typeof el.scrollTo === 'function') el.scrollTo({ left: 0 })
  }, [phoneDevice])

  const launch = (id: PhoneAppId) => {
    if (COMMON_INERT.has(id)) return
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

  const pageWidth = () => scrollerRef.current?.clientWidth || 1

  const snapTo = (next: number, smooth = true) => {
    const clamped = Math.max(0, Math.min(pageCount - 1, next))
    setPage(clamped)
    const el = scrollerRef.current
    if (!el) return
    el.scrollTo({ left: clamped * el.clientWidth, behavior: smooth ? 'smooth' : 'auto' })
  }

  const onPointerDown = (e: PE<HTMLDivElement>) => {
    if (e.button !== 0) return
    const el = scrollerRef.current
    if (!el || pageCount <= 1) return
    tracking.current = true
    armed.current = false
    suppressClick.current = false
    startX.current = e.clientX
    startScroll.current = el.scrollLeft
  }

  const onPointerMove = (e: PE<HTMLDivElement>) => {
    if (!tracking.current) return
    const el = scrollerRef.current
    if (!el) return
    const dx = e.clientX - startX.current
    if (!armed.current) {
      if (Math.abs(dx) < SWIPE_ARM) return
      // Só agora vira gesto: captura pointer e cancela o próximo click.
      armed.current = true
      suppressClick.current = true
      el.setPointerCapture(e.pointerId)
    }
    el.scrollLeft = startScroll.current - dx
  }

  const endPointer = (e: PE<HTMLDivElement>) => {
    if (!tracking.current) return
    tracking.current = false
    const el = scrollerRef.current
    if (!el) return
    if (armed.current && el.hasPointerCapture?.(e.pointerId)) {
      el.releasePointerCapture(e.pointerId)
    }
    if (!armed.current) return
    const w = pageWidth()
    const origin = Math.round(startScroll.current / w)
    const dx = e.clientX - startX.current
    let next = origin
    if (dx < -w * 0.18) next = origin + 1
    else if (dx > w * 0.18) next = origin - 1
    else next = Math.round(el.scrollLeft / w)
    snapTo(next)
  }

  const onScroll = () => {
    if (tracking.current && armed.current) return
    const el = scrollerRef.current
    if (!el || el.clientWidth <= 0) return
    setPage(Math.max(0, Math.min(pageCount - 1, Math.round(el.scrollLeft / el.clientWidth))))
  }

  return (
    <div className="phone-home" data-testid="phone-home">
      <div className="phone-home__wallpaper" />
      <div
        ref={scrollerRef}
        className="phone-home__pages"
        data-testid="phone-home-pages"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
        onScroll={onScroll}
      >
        {pages.map((apps, pi) => (
          <div key={pi} className="phone-home__grid" data-testid={`phone-home-page-${pi}`}>
            {apps.map((id) => (
              <button
                key={id}
                type="button"
                className="phone-home__app"
                aria-label={appLabel(id)}
                data-testid={`app-${id}`}
                data-inert={COMMON_INERT.has(id) || undefined}
                onClick={() => {
                  if (suppressClick.current) {
                    suppressClick.current = false
                    return
                  }
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
      {pageCount > 1 ? (
        <div className="phone-home__dots" data-testid="phone-home-dots">
          {pages.map((_, i) => (
            <button
              key={i}
              type="button"
              className="phone-home__dot"
              data-active={i === page || undefined}
              aria-label={`Página ${i + 1}`}
              onClick={() => snapTo(i)}
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

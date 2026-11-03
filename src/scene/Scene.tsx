import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { deskEvidenceItems } from '../data/deskEvidence'
import { sceneObjects } from '../data/sceneComposition'
import { computeSceneScale } from '../lib/sceneLayout'
import { DESIGN_HEIGHT, DESIGN_WIDTH } from '../types/scene'
import type { SceneObjectDef } from '../types/scene'
import { usePhoneSession } from '../app/PhoneSessionContext'
import { useGameHub } from '../app/GameHubContext'
import { hintsAlreadySeen, markHintsSeen, useUiState } from '../app/uiStore'
import { useInvestigation } from '../game/hooks/useInvestigation'
import { PhoneShell } from '../phone/PhoneShell'
import { SceneObject } from './SceneObject'
import { HubOverlay } from '../components/investigation/HubOverlay'
import { CaseNotepad } from '../components/investigation/CaseNotepad'
import { ProvocationBanner } from '../components/investigation/ProvocationBanner'
import '../styles/tokens.css'
import '../styles/scene.css'

/** Atraso entre o clique no objeto e a abertura do painel (tempo da aproximação de câmera). */
const CAMERA_MS = 280

interface Camera {
  cx: number
  cy: number
  zoom: number
}

export function Scene() {
  const viewportRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(() => computeSceneScale(window.innerWidth, window.innerHeight))
  const { phoneOpen, openPhone, closePhone } = usePhoneSession()
  const { hubPanel, openHub, closeHub, setPhoneDevice } = useGameHub()
  const inv = useInvestigation()
  const { menuOpen } = useUiState()

  const [hoverId, setHoverId] = useState<string | null>(null)
  const [camera, setCamera] = useState<Camera | null>(null)
  const [hints, setHints] = useState(false)
  const pending = useRef<number | null>(null)

  useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setScale(computeSceneScale(width, height))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Dica de primeira vez: legendas nos objetos por alguns segundos, depois somem para sempre.
  useEffect(() => {
    if (menuOpen || hintsAlreadySeen()) return
    const show = window.setTimeout(() => setHints(true), 700)
    const hide = window.setTimeout(() => {
      setHints(false)
      markHintsSeen()
    }, 7500)
    return () => {
      window.clearTimeout(show)
      window.clearTimeout(hide)
    }
  }, [menuOpen])

  useEffect(() => () => {
    if (pending.current) window.clearTimeout(pending.current)
  }, [])

  const deskEvidence = useMemo(
    () =>
      deskEvidenceItems
        .filter(
          (d) => inv.evidenceOwned.includes(d.evidenceId) && !(d.hideWhenFlag && inv.flags[d.hideWhenFlag]),
        )
        .map((d) => d.object),
    [inv.evidenceOwned, inv.flags],
  )

  const objects = useMemo(() => [...sceneObjects, ...deskEvidence], [deskEvidence])

  const focusOn = useCallback((def: SceneObjectDef) => {
    const zoom = def.focusZoom ?? 1
    if (zoom <= 1) return
    const [ax, ay] = def.focusAnchor ?? [0.5, 0.5]
    setCamera({ cx: def.x + def.width * ax, cy: def.y + def.height * ay, zoom })
  }, [])

  const handleActivate = useCallback(
    (def: SceneObjectDef) => {
      setHoverId(null)
      setHints(false)
      const target = def.hubTarget
      if (!target) return
      if (target === 'mariana-phone' || target === 'augusto-phone') {
        setPhoneDevice(target === 'augusto-phone' ? 'augusto' : 'mariana')
        openPhone()
        return
      }
      if (pending.current) return
      focusOn(def)
      pending.current = window.setTimeout(
        () => {
          pending.current = null
          openHub(target)
        },
        (def.focusZoom ?? 1) > 1 ? CAMERA_MS : 0,
      )
    },
    [focusOn, openHub, openPhone, setPhoneDevice],
  )

  const handleCloseHub = useCallback(() => {
    closeHub()
    setCamera(null)
  }, [closeHub])

  // ESC fecha o celular
  useEffect(() => {
    if (!phoneOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePhone()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phoneOpen, closePhone])

  const s = scale.scale
  const z = camera?.zoom ?? 1
  let tx = 0
  let ty = 0
  if (camera) {
    tx = scale.width / 2 - camera.cx * s * z
    ty = scale.height / 2 - camera.cy * s * z
    tx = Math.min(0, Math.max(scale.width - DESIGN_WIDTH * s * z, tx))
    ty = Math.min(0, Math.max(scale.height - DESIGN_HEIGHT * s * z, ty))
  }

  const labelled = objects.filter((o) => o.label && (o.hubTarget || o.interactive))

  return (
    <div className="scene-viewport" ref={viewportRef} data-testid="investigation-scene">
      <div
        className={`scene-stage${phoneOpen ? ' scene-stage--phone-open' : ''}${hubPanel ? ' scene-stage--hub-open' : ''}`}
        style={
          {
            left: scale.offsetX,
            top: scale.offsetY,
            width: scale.width,
            height: scale.height,
            '--u': scale.scale,
          } as CSSProperties
        }
      >
        <div
          className="scene-canvas"
          style={{
            width: DESIGN_WIDTH,
            height: DESIGN_HEIGHT,
            transform: `translate(${tx}px, ${ty}px) scale(${s * z})`,
          }}
        >
          {objects.map((obj) => (
            <SceneObject key={obj.id} def={obj} onActivate={handleActivate} onHover={setHoverId} />
          ))}

          {/* legendas ficam fora dos elementos rotacionados para permanecer legíveis */}
          <div className="scene-labels" aria-hidden>
            {labelled.map((o) => {
              const hit = o.hit ?? [0, 0, 1, 1]
              const visible = hoverId === o.id || hints
              return (
                <span
                  key={o.id}
                  className="scene-label"
                  data-visible={visible}
                  data-hint={hints && hoverId !== o.id}
                  style={{
                    left: o.x + o.width * (hit[0] + hit[2] / 2),
                    top: o.y + o.height * hit[1] + 4,
                  }}
                >
                  {o.label}
                </span>
              )
            })}
          </div>
        </div>

        <div className="scene-hud">
          <p className="scene-hud__case" aria-hidden>
            Caso 0001/2026
          </p>
          <CaseNotepad />
          <ProvocationBanner />
        </div>

        {phoneOpen ? (
          <div className="scene-phone-overlay" data-testid="phone-overlay">
            <button
              type="button"
              className="scene-phone-overlay__backdrop"
              aria-label="Fechar telefone e voltar à mesa"
              onClick={closePhone}
            />
            <PhoneShell onClose={closePhone} scale={scale.scale} />
          </div>
        ) : null}

        <HubOverlay panel={hubPanel} onClose={handleCloseHub} />
      </div>
    </div>
  )
}

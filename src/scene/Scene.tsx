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
import { SceneObject, type ObjectFx } from './SceneObject'
import { newContactIds } from '../lib/contactsSeen'
import { startRing, stopLoop } from '../lib/sfx'
import { HubOverlay } from '../components/investigation/HubOverlay'
import { CaseNotepad } from '../components/investigation/CaseNotepad'
import { Block01Opening } from '../components/story/Block01Opening'
import { SceneRunner } from '../components/story/vn/SceneTransitions'
import type { LocationSceneId } from '../app/GameHubContext'
import { HospitalInterviewScene } from '../components/story/HospitalInterviewScene'
import { VerticeInterviewScene } from '../components/story/VerticeInterviewScene'
import { LucasInterviewScene } from '../components/story/LucasInterviewScene'
import { NicoInterviewScene } from '../components/story/NicoInterviewScene'
import { LiviaInterviewScene } from '../components/story/LiviaInterviewScene'
import { SamuelInterviewScene } from '../components/story/SamuelInterviewScene'
import { AndreInterviewScene } from '../components/story/AndreInterviewScene'
import { JanaInterviewScene } from '../components/story/JanaInterviewScene'
import { GeraldoInterviewScene } from '../components/story/GeraldoInterviewScene'
import { MiroInterviewScene } from '../components/story/MiroInterviewScene'
import { OperationScene } from '../components/story/OperationScene'
import { ReflectionView } from '../components/story/vn/SceneTransitions'
import { reflectionById } from '../data/reflections'
import { setFlag } from '../game/state/investigationStore'
import {
  onAndreStillGuiltyReflectionDone,
  onCoincidenceReflectionDone,
  onMaraltoReflectionDone,
  onPathReflectionDone,
} from '../game/story/block05Handlers'
import {
  onGeraldoReflectionDone,
  onMiroReflectionDone,
} from '../game/story/block06Handlers'
import { onMarianaPhoneClosed, onMarianaPhoneOpened } from '../game/story/block01Handlers'
import '../styles/tokens.css'
import '../styles/scene.css'
import '../styles/scene-transitions.css'

/** Atraso entre o clique no objeto e a abertura do painel (tempo da aproximação de câmera). */
const CAMERA_MS = 280

function renderLocationScene(id: NonNullable<LocationSceneId>, close: () => void) {
  switch (id) {
    case 'hospital':
      return <HospitalInterviewScene onClose={close} />
    case 'vertice':
      return <VerticeInterviewScene onClose={close} />
    case 'lucas':
      return <LucasInterviewScene onClose={close} />
    case 'nico':
      return <NicoInterviewScene onClose={close} />
    case 'livia':
      return <LiviaInterviewScene onClose={close} />
    case 'samuel':
      return <SamuelInterviewScene onClose={close} />
    case 'andre':
      return <AndreInterviewScene onClose={close} />
    case 'jana':
      return <JanaInterviewScene onClose={close} />
    case 'geraldo':
      return <GeraldoInterviewScene onClose={close} />
    case 'operation':
      return <OperationScene onClose={close} />
    case 'miro':
      return <MiroInterviewScene onClose={close} />
  }
}

function pendingSoloReflection(flags: Record<string, boolean>): string | null {
  if (flags.block05_refl_andre_pending && !flags['refl-b05-andre_seen']) return 'refl-b05-andre'
  if (flags.block05_refl_maralto_pending && !flags['refl-b05-maralto_seen']) return 'refl-b05-maralto'
  if (flags.block05_refl_coincidence_pending && !flags['refl-b05-coincidence_seen']) {
    return 'refl-b05-coincidence'
  }
  if (flags.block05_refl_path_pending && !flags['refl-b05-path_seen']) return 'refl-b05-path'
  if (flags.block06_refl_geraldo_pending && !flags['refl-b06-geraldo_seen']) return 'refl-b06-geraldo'
  if (flags.block06_refl_miro_pending && !flags['refl-b06-miro_seen']) return 'refl-b06-miro'
  return null
}

interface Camera {
  cx: number
  cy: number
  zoom: number
}

export function Scene() {
  const viewportRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(() => computeSceneScale(window.innerWidth, window.innerHeight))
  const { phoneOpen, openPhone, closePhone } = usePhoneSession()
  const {
    hubPanel,
    openHub,
    closeHub,
    setPhoneDevice,
    phoneDevice,
    locationScene,
    closeLocationScene,
  } = useGameHub()
  const inv = useInvestigation()
  const { menuOpen } = useUiState()
  const soloReflectionId = pendingSoloReflection(inv.flags)
  const soloReflectionDef = soloReflectionId ? reflectionById(soloReflectionId) : undefined

  const [hoverId, setHoverId] = useState<string | null>(null)
  const [camera, setCamera] = useState<Camera | null>(null)
  const [hints, setHints] = useState(false)
  const [returnFade, setReturnFade] = useState(false)
  const [openingDone, setOpeningDone] = useState(() => Boolean(inv.flags.block01_opening_seen))
  const pending = useRef<number | null>(null)

  useEffect(() => {
    if (inv.flags.block01_opening_seen) setOpeningDone(true)
  }, [inv.flags.block01_opening_seen])

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

  // Eventos físicos: o fixo toca (ligação recebida), o celular vibra (novo contato), a bancada ganha selo.
  const hexRinging = Boolean(inv.flags.block04_hex_call_pending) && !inv.flags.block04_hex_call_answered
  const newContacts = newContactIds(inv).length
  const unseenAudio = inv.evidenceOwned.filter(
    (id) => inv.evidence[id]?.type === 'audio' && !inv.audioSeen.includes(id),
  ).length
  const phoneBuzz = inv.discoveries[0]?.kind === 'contact'

  useEffect(() => {
    if (hexRinging && !menuOpen && !locationScene) startRing('landline')
    else stopLoop('landline')
    return () => stopLoop('landline')
  }, [hexRinging, menuOpen, locationScene])

  const fxFor = (def: { id: string; hubTarget?: string }): ObjectFx | undefined => {
    if (def.hubTarget === 'landline' && hexRinging) return { ringing: true, badge: 1 }
    if (def.hubTarget === 'audio-lab' && unseenAudio > 0) return { badge: unseenAudio }
    if (def.hubTarget === 'augusto-phone' && (newContacts > 0 || phoneBuzz)) {
      return { ringing: phoneBuzz, badge: newContacts || undefined }
    }
    return undefined
  }

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
        const device = target === 'augusto-phone' ? 'augusto' : 'mariana'
        setPhoneDevice(device)
        if (device === 'mariana') onMarianaPhoneOpened()
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

  /** Tela em preto: volta à mesa e clareia (nunca corta direto para a delegacia). */
  const handleSceneReturn = useCallback(() => {
    closeLocationScene()
    setReturnFade(true)
    window.setTimeout(() => setReturnFade(false), 950)
  }, [closeLocationScene])

  const handleCloseHub = useCallback(() => {
    closeHub()
    setCamera(null)
  }, [closeHub])

  const handleClosePhone = useCallback(() => {
    if (phoneDevice === 'mariana') onMarianaPhoneClosed()
    closePhone()
  }, [closePhone, phoneDevice])

  // ESC fecha o celular
  useEffect(() => {
    if (!phoneOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClosePhone()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phoneOpen, handleClosePhone])

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
            <SceneObject key={obj.id} def={obj} onActivate={handleActivate} onHover={setHoverId} fx={fxFor(obj)} />
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
        </div>

        {phoneOpen ? (
          <div className="scene-phone-overlay" data-testid="phone-overlay">
            <button
              type="button"
              className="scene-phone-overlay__backdrop"
              aria-label="Fechar telefone e voltar à mesa"
              onClick={handleClosePhone}
            />
            <PhoneShell onClose={handleClosePhone} scale={scale.scale} />
          </div>
        ) : null}

        {!menuOpen && !openingDone && !inv.flags.block01_opening_seen ? (
          <Block01Opening onDone={() => setOpeningDone(true)} />
        ) : null}

        {locationScene ? (
          <SceneRunner
            key={locationScene}
            sceneId={locationScene}
            onReturn={handleSceneReturn}
            renderScene={(close) => renderLocationScene(locationScene, close)}
          />
        ) : null}
        {!locationScene && !hubPanel && !phoneOpen && soloReflectionId && soloReflectionDef ? (
          <div className="tr-refl-layer" data-testid="block05-solo-reflection">
            <ReflectionView
              blocks={soloReflectionDef.blocks}
              background={soloReflectionDef.background}
              onDone={() => {
                setFlag(`${soloReflectionId}_seen`, true)
                if (soloReflectionId === 'refl-b05-andre') onAndreStillGuiltyReflectionDone()
                else if (soloReflectionId === 'refl-b05-maralto') onMaraltoReflectionDone()
                else if (soloReflectionId === 'refl-b05-coincidence') onCoincidenceReflectionDone()
                else if (soloReflectionId === 'refl-b05-path') onPathReflectionDone()
                else if (soloReflectionId === 'refl-b06-geraldo') onGeraldoReflectionDone()
                else if (soloReflectionId === 'refl-b06-miro') onMiroReflectionDone()
              }}
            />
          </div>
        ) : null}
        {returnFade ? <div className="tr-return" data-testid="vn-return-fade" aria-hidden /> : null}

        <HubOverlay panel={hubPanel} onClose={handleCloseHub} />
      </div>
    </div>
  )
}

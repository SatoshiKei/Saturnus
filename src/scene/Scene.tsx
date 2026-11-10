import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { deskEvidenceItems } from '../data/deskEvidence'
import { sceneObjects } from '../data/sceneComposition'
import { computeSceneScale } from '../lib/sceneLayout'
import { DESIGN_HEIGHT, DESIGN_WIDTH } from '../types/scene'
import type { SceneObjectDef } from '../types/scene'
import { usePhoneSession } from '../app/PhoneSessionContext'
import { useGameHub } from '../app/GameHubContext'
import {
  hintsAlreadySeen,
  markHintsSeen,
  openPauseMenu,
  setFullscreenScene,
  useUiState,
} from '../app/uiStore'
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
import { HospitalDepositScene } from '../components/story/HospitalDepositScene'
import { getInvestigationState } from '../game/state/investigationStore'
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
import { SandraInterviewScene } from '../components/story/SandraInterviewScene'
import { CeciliaInterviewScene } from '../components/story/CeciliaInterviewScene'
import { MauroInterviewScene } from '../components/story/MauroInterviewScene'
import { DenisInterviewScene } from '../components/story/DenisInterviewScene'
import { BiaInterviewScene } from '../components/story/BiaInterviewScene'
import { RuiInterviewScene } from '../components/story/RuiInterviewScene'
import { ReflectionView } from '../components/story/vn/SceneTransitions'
import { reflectionById } from '../data/reflections'
import { HUB_REFLECTION_BACKGROUND } from '../data/sceneIntros'
import { setFlag } from '../game/state/investigationStore'
import { afterReflectionComplete } from '../game/story/reflectionAftermath'
import { absorbLegacyB5MicroReflections } from '../game/story/block05Handlers'
import { TrailDiscoveryScene } from '../components/story/TrailDiscoveryScene'
import { MemoryWordOverlay } from '../components/investigation/MemoryWordOverlay'
import { onMarianaPhoneClosed, onMarianaPhoneOpened } from '../game/story/block01Handlers'
import '../styles/tokens.css'
import '../styles/scene.css'
import '../styles/scene-transitions.css'

/** Atraso entre o clique no objeto e a abertura do painel (tempo da aproximação de câmera). */
const CAMERA_MS = 280

function renderLocationScene(id: NonNullable<LocationSceneId>, close: () => void) {
  switch (id) {
    case 'hospital': {
      const b7 = getInvestigationState().flags
      if (b7.block07_hospital_deposit_unlocked && !b7.block07_hospital_deposit_done) {
        return <HospitalDepositScene onClose={close} />
      }
      return <HospitalInterviewScene onClose={close} />
    }
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
    case 'sandra':
      return <SandraInterviewScene onClose={close} />
    case 'cecilia':
      return <CeciliaInterviewScene onClose={close} />
    case 'mauro':
      return <MauroInterviewScene onClose={close} />
    case 'denis':
      return <DenisInterviewScene onClose={close} />
    case 'bia':
      return <BiaInterviewScene onClose={close} />
    case 'rui':
      return <RuiInterviewScene onClose={close} />
    case 'trail':
      return <TrailDiscoveryScene onClose={close} />
  }
}

function pendingSoloReflection(flags: Record<string, boolean>): string | null {
  if (flags.block05_refl_andre_pending && !flags['refl-b05-andre_seen']) return 'refl-b05-andre'
  if (flags.block05_refl_path_pending && !flags['refl-b05-path_seen']) return 'refl-b05-path'
  if (flags.block06_refl_geraldo_pending && !flags['refl-b06-geraldo_seen']) return 'refl-b06-geraldo'
  if (flags.block06_refl_miro_pending && !flags['refl-b06-miro_seen']) return 'refl-b06-miro'
  if (flags.block07_refl_sandra_pending && !flags['refl-b07-sandra_seen']) return 'refl-b07-sandra'
  if (flags.block07_refl_ricardo_dead_pending && !flags['refl-b07-ricardo-dead_seen']) {
    return 'refl-b07-ricardo-dead'
  }
  if (flags.block07_refl_notebook_pending && !flags['refl-b07-notebook_seen']) {
    return 'refl-b07-notebook'
  }
  if (flags.block07_refl_hv_pending && !flags['refl-b07-hv_seen']) {
    return 'refl-b07-hv'
  }
  if (flags.block07_refl_henrique_reveal_pending && !flags['refl-b07-henrique-reveal_seen']) {
    return 'refl-b07-henrique-reveal'
  }
  if (flags.block07_refl_tech_pending && !flags['refl-b07-tech_seen']) return 'refl-b07-tech'
  if (flags.block08_refl_morsa_pending && !flags['refl-b08-morsa_seen']) return 'refl-b08-morsa'
  if (flags.block08_refl_andre_pending && !flags['refl-b08-andre_seen']) return 'refl-b08-andre'
  if (flags.block08_refl_accident_pending && !flags['refl-b08-accident_seen']) return 'refl-b08-accident'
  if (flags.block08_refl_final_pending && !flags['refl-b08-final_seen']) return 'refl-b08-final'
  if (flags.block09_refl_omitido_pending && !flags['refl-b09-omitido_seen']) return 'refl-b09-omitido'
  if (flags.block09_refl_messages_pending && !flags['refl-b09-messages_seen']) {
    return 'refl-b09-messages'
  }
  if (flags.block09_refl_death_pending && !flags['refl-b09-death_seen']) return 'refl-b09-death'
  if (flags.block09_refl_augusto_pending && !flags['refl-b09-augusto_seen']) {
    return 'refl-b09-augusto'
  }
  if (
    flags.block09_refl_final_pending &&
    flags.block09_memory_word_dismissed &&
    !flags['refl-b09-final_seen']
  ) {
    return 'refl-b09-final'
  }
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
  const { menuOpen, shell } = useUiState()
  const soloReflectionId = pendingSoloReflection(inv.flags)
  const soloReflectionDef = soloReflectionId ? reflectionById(soloReflectionId) : undefined

  useEffect(() => {
    absorbLegacyB5MicroReflections()
  }, [inv.flags.block05_refl_maralto_pending, inv.flags.block05_refl_coincidence_pending])

  const [hoverId, setHoverId] = useState<string | null>(null)
  const [camera, setCamera] = useState<Camera | null>(null)
  const [hints, setHints] = useState(false)
  const [returnFade, setReturnFade] = useState(false)
  const [openingDone, setOpeningDone] = useState(() => Boolean(inv.flags.block01_opening_seen))
  const pending = useRef<number | null>(null)

  const cinematic = Boolean(locationScene || (soloReflectionId && soloReflectionDef))
  const overlaysLocked = Boolean(cinematic || returnFade)
  const soloReflectionActive = Boolean(!locationScene && soloReflectionId && soloReflectionDef)

  // Pausar discoveries enquanto a reflection solo cobre o hub.
  useEffect(() => {
    if (!soloReflectionActive) return
    setFullscreenScene(true)
    return () => setFullscreenScene(false)
  }, [soloReflectionActive])

  useEffect(() => {
    if (!cinematic) return
    closePhone()
    closeHub()
    setCamera(null)
    if (pending.current) {
      window.clearTimeout(pending.current)
      pending.current = null
    }
  }, [cinematic, closePhone, closeHub])

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
  const contactDiscovery = inv.discoveries[0]?.kind === 'contact' ? inv.discoveries[0] : null
  const phoneBuzz = Boolean(
    contactDiscovery && !inv.contacts[contactDiscovery.refId ?? '']?.institution,
  )

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

  // ESC fecha o celular; sem overlay, abre o menu de pausa.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (phoneOpen) {
        handleClosePhone()
        return
      }
      if (shell !== 'playing' || cinematic || hubPanel || !openingDone) return
      openPauseMenu()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phoneOpen, handleClosePhone, shell, cinematic, hubPanel, openingDone])

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

        {phoneOpen && !overlaysLocked ? (
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
        {soloReflectionActive && soloReflectionId && soloReflectionDef ? (
          <div className="tr-refl-layer" data-testid="block05-solo-reflection">
            <ReflectionView
              blocks={soloReflectionDef.blocks}
              background={
                // Fallback: reflection com sceneId já saiu do local → delegacia, nunca cenário antigo no hub.
                soloReflectionDef.sceneId ? HUB_REFLECTION_BACKGROUND : soloReflectionDef.background
              }
              onDone={() => {
                setFlag(`${soloReflectionId}_seen`, true)
                afterReflectionComplete(soloReflectionId)
              }}
            />
          </div>
        ) : null}
        {!soloReflectionActive && !locationScene && !hubPanel && !phoneOpen ? (
          <MemoryWordOverlay />
        ) : null}
        {returnFade ? <div className="tr-return" data-testid="vn-return-fade" aria-hidden /> : null}

        {!overlaysLocked ? <HubOverlay panel={hubPanel} onClose={handleCloseHub} /> : null}
      </div>
    </div>
  )
}

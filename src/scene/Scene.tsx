import { useEffect, useRef, useState } from 'react'
import { sceneObjects } from '../data/sceneComposition'
import { computeSceneScale } from '../lib/sceneLayout'
import { DESIGN_HEIGHT, DESIGN_WIDTH } from '../types/scene'
import { usePhoneSession } from '../app/PhoneSessionContext'
import { useGameHub } from '../app/GameHubContext'
import { PhoneShell } from '../phone/PhoneShell'
import { SceneObject } from './SceneObject'
import { HubOverlay } from '../components/investigation/HubOverlay'
import { ObjectivesStrip } from '../components/investigation/ObjectivesStrip'
import { ProvocationBanner } from '../components/investigation/ProvocationBanner'
import type { SceneObjectDef } from '../types/scene'
import '../styles/scene.css'

export function Scene() {
  const viewportRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(() => computeSceneScale(window.innerWidth, window.innerHeight))
  const { phoneOpen, openPhone, closePhone } = usePhoneSession()
  const { hubPanel, openHub, closeHub, setPhoneDevice } = useGameHub()

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

  const handleHub = (target: NonNullable<SceneObjectDef['hubTarget']>) => {
    if (target === 'mariana-phone') {
      setPhoneDevice('mariana')
      openPhone()
      return
    }
    if (target === 'augusto-phone') {
      setPhoneDevice('augusto')
      openPhone()
      return
    }
    openHub(target)
  }

  return (
    <div className="scene-viewport" ref={viewportRef} data-testid="investigation-scene">
      <header className="scene-hub-chrome" aria-label="Contexto da cena">
        <p className="scene-hub-chrome__place">Delegacia — sala de Augusto</p>
        <p className="scene-hub-chrome__hint">Clique nos objetos da mesa para trabalhar no caso</p>
      </header>
      <ObjectivesStrip />
      <ProvocationBanner />

      <div
        className={`scene-stage${phoneOpen ? ' scene-stage--phone-open' : ''}`}
        style={{
          left: scale.offsetX,
          top: scale.offsetY,
          width: scale.width,
          height: scale.height,
        }}
      >
        <div
          className="scene-canvas"
          style={{ width: DESIGN_WIDTH, height: DESIGN_HEIGHT, transform: `scale(${scale.scale})` }}
        >
          {sceneObjects.map((obj) => (
            <SceneObject
              key={obj.id}
              def={obj}
              onPhoneClick={
                obj.kind === 'phone'
                  ? () => {
                      setPhoneDevice(obj.hubTarget === 'augusto-phone' ? 'augusto' : 'mariana')
                      openPhone()
                    }
                  : undefined
              }
              onHubTarget={handleHub}
            />
          ))}
        </div>
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

      <HubOverlay panel={hubPanel} onClose={closeHub} />
    </div>
  )
}

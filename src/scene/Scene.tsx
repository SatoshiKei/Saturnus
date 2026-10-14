import { useEffect, useRef, useState } from 'react'
import { sceneObjects } from '../data/sceneComposition'
import { computeSceneScale } from '../lib/sceneLayout'
import { DESIGN_HEIGHT, DESIGN_WIDTH } from '../types/scene'
import { usePhoneSession } from '../app/PhoneSessionContext'
import { PhoneShell } from '../phone/PhoneShell'
import { SceneObject } from './SceneObject'
import '../styles/scene.css'

export function Scene() {
  const viewportRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(() => computeSceneScale(window.innerWidth, window.innerHeight))
  const { phoneOpen, openPhone, closePhone } = usePhoneSession()

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

  return (
    <div className="scene-viewport" ref={viewportRef} data-testid="investigation-scene">
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
              onPhoneClick={obj.kind === 'phone' ? openPhone : undefined}
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
    </div>
  )
}

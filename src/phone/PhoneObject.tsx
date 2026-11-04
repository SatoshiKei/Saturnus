import type { SceneObjectDef } from '../types/scene'
import type { ObjectFx } from '../scene/SceneObject'

interface PhoneObjectProps {
  def: SceneObjectDef
  onActivate?: (def: SceneObjectDef) => void
  onHover?: (id: string | null) => void
  fx?: ObjectFx
}

/**
 * Smartphone deitado sobre a mesa. Dois aparelhos distintos:
 *  - mariana: vidro preto, etiqueta de evidência (apreendido)
 *  - augusto: capa grafite, tela de bloqueio com hora
 * O corpo é desenhado em CSS (tela digital); sombra e rotação seguem a mesma luz da cena.
 */
export function PhoneObject({ def, onActivate, onHover, fx }: PhoneObjectProps) {
  const device = def.phoneDevice ?? 'mariana'
  return (
    <div
      className={`scene-object scene-object--phone scene-object--interactive${fx?.ringing ? ' scene-object--vibrate' : ''}`}
      data-scene-id={def.id}
      style={{
        left: def.x,
        top: def.y,
        width: def.width,
        height: def.height,
        zIndex: def.zIndex,
        transform: def.rotation ? `rotate(${def.rotation}deg)` : undefined,
      }}
    >
      {fx?.badge ? (
        <span className="hub-badge" data-testid={`badge-${def.id}`}>
          {fx.badge}
        </span>
      ) : null}
      <button
        type="button"
        className={`phone-object phone-object--${device}`}
        aria-label={def.ariaLabel}
        data-testid={`scene-${def.id}`}
        onClick={() => onActivate?.(def)}
        onMouseEnter={() => onHover?.(def.id)}
        onMouseLeave={() => onHover?.(null)}
        onFocus={() => onHover?.(def.id)}
        onBlur={() => onHover?.(null)}
      >
        <span className="phone-object__body">
          <span className="phone-object__screen">
            <span className="phone-object__island" />
            <span className="phone-object__time">22:14</span>
            <span className="phone-object__date">terça, 13 de outubro</span>
            {device === 'mariana' ? (
              <span className="phone-object__notif">
                <i />
                <b>WhatsApp</b>
                <em>Júlia: Você viu a Mariana?</em>
              </span>
            ) : (
              <span className="phone-object__notif phone-object__notif--dim">
                <i />
                <b>Chamadas</b>
                <em>2 perdidas</em>
              </span>
            )}
          </span>
        </span>
        {device === 'mariana' ? <span className="phone-object__tag">EV-01</span> : null}
      </button>
    </div>
  )
}

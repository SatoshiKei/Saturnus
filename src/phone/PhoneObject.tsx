import type { SceneObjectDef } from '../types/scene'

interface PhoneObjectProps {
  def: SceneObjectDef
  onActivate?: () => void
  variant: 'desk' | 'overlay'
}

export function PhoneObject({ def, onActivate, variant }: PhoneObjectProps) {
  return (
    <button
      type="button"
      className={`phone-object phone-object--${variant}`}
      style={{
        left: def.x,
        top: def.y,
        width: def.width,
        height: def.height,
        zIndex: def.zIndex,
        transform: def.rotation ? `rotate(${def.rotation}deg)` : undefined,
      }}
      aria-label={def.ariaLabel}
      data-testid={`scene-${def.id}`}
      onClick={onActivate}
    >
      <span className="phone-object__bezel">
        <span className="phone-object__screen phone-object__screen--lock">
          <span className="phone-object__time">22:14</span>
        </span>
      </span>
    </button>
  )
}

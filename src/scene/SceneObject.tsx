import { assetPath } from '../lib/assetPath'
import type { SceneObjectDef } from '../types/scene'
import { PhoneObject } from '../phone/PhoneObject'

interface SceneObjectProps {
  def: SceneObjectDef
  onPhoneClick?: () => void
}

export function SceneObject({ def, onPhoneClick }: SceneObjectProps) {
  if (def.kind === 'phone') {
    return <PhoneObject def={def} onActivate={onPhoneClick} variant="desk" />
  }

  const interactive = def.interactive
  const Tag = interactive ? 'button' : 'div'

  return (
    <Tag
      type={interactive ? 'button' : undefined}
      className={`scene-object${interactive ? ' scene-object--interactive' : ''}`}
      style={{
        left: def.x,
        top: def.y,
        width: def.width,
        height: def.height,
        zIndex: def.zIndex,
        transform: def.rotation ? `rotate(${def.rotation}deg)` : undefined,
        opacity: def.opacity ?? 1,
        cursor: def.cursor,
      }}
      aria-label={def.ariaLabel}
      data-scene-id={def.id}
      data-testid={`scene-${def.id}`}
    >
      {def.asset ? (
        <img src={assetPath(def.asset)} alt="" draggable={false} />
      ) : null}
    </Tag>
  )
}

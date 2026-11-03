import { assetPath } from '../lib/assetPath'
import type { SceneObjectDef } from '../types/scene'
import { PhoneObject } from '../phone/PhoneObject'

interface SceneObjectProps {
  def: SceneObjectDef
  onPhoneClick?: () => void
  onHubTarget?: (target: NonNullable<SceneObjectDef['hubTarget']>) => void
}

export function SceneObject({ def, onPhoneClick, onHubTarget }: SceneObjectProps) {
  if (def.kind === 'phone') {
    return <PhoneObject def={def} onActivate={onPhoneClick} variant="desk" />
  }

  const interactive = def.interactive || Boolean(def.hubTarget)
  const Tag = interactive ? 'button' : 'div'
  const propClass = def.visual === 'desk-prop' ? ' scene-object--desk-prop' : ''
  const fitClass =
    def.objectFit === 'cover' ? ' scene-object__img--cover' : ' scene-object__img--contain'

  return (
    <Tag
      type={interactive ? 'button' : undefined}
      className={`scene-object${interactive ? ' scene-object--interactive' : ''}${propClass}`}
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
      onClick={
        interactive && def.hubTarget && onHubTarget
          ? () => onHubTarget(def.hubTarget!)
          : undefined
      }
    >
      {def.asset ? (
        <img
          className={`scene-object__img${fitClass}`}
          src={assetPath(def.asset)}
          alt=""
          draggable={false}
          style={def.objectPosition ? { objectPosition: def.objectPosition } : undefined}
        />
      ) : null}
    </Tag>
  )
}

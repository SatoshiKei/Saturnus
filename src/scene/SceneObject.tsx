import { assetPath } from '../lib/assetPath'
import type { SceneObjectDef } from '../types/scene'
import { PhoneObject } from '../phone/PhoneObject'

interface SceneObjectProps {
  def: SceneObjectDef
  onActivate?: (def: SceneObjectDef) => void
  onHover?: (id: string | null) => void
}

export function SceneObject({ def, onActivate, onHover }: SceneObjectProps) {
  if (def.kind === 'phone') {
    return <PhoneObject def={def} onActivate={onActivate} onHover={onHover} />
  }

  const interactive = Boolean(def.interactive || def.hubTarget)
  const hit = def.hit ?? [0, 0, 1, 1]

  return (
    <div
      className={`scene-object${interactive ? ' scene-object--interactive' : ''}`}
      style={{
        left: def.x,
        top: def.y,
        width: def.width,
        height: def.height,
        zIndex: def.zIndex,
        transform: def.rotation ? `rotate(${def.rotation}deg)` : undefined,
        opacity: def.opacity ?? 1,
      }}
      data-scene-id={def.id}
    >
      {def.asset ? (
        <img
          className={`scene-object__img scene-object__img--${def.objectFit ?? 'contain'}`}
          src={assetPath(def.asset)}
          alt=""
          draggable={false}
          style={def.objectPosition ? { objectPosition: def.objectPosition } : undefined}
        />
      ) : null}
      {interactive ? (
        <button
          type="button"
          className="scene-object__hit"
          style={{
            left: `${hit[0] * 100}%`,
            top: `${hit[1] * 100}%`,
            width: `${hit[2] * 100}%`,
            height: `${hit[3] * 100}%`,
            cursor: def.cursor ?? 'pointer',
          }}
          aria-label={def.ariaLabel}
          data-testid={`scene-${def.id}`}
          onClick={() => onActivate?.(def)}
          onMouseEnter={() => onHover?.(def.id)}
          onMouseLeave={() => onHover?.(null)}
          onFocus={() => onHover?.(def.id)}
          onBlur={() => onHover?.(null)}
        />
      ) : null}
    </div>
  )
}

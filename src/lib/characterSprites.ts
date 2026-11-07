import { assetPath } from './assetPath'
import andre from '../assets/sprites/andre.png'
import augusto from '../assets/sprites/augusto.png'
import bia from '../assets/sprites/bia.png'
import caio from '../assets/sprites/caio.png'
import camila from '../assets/sprites/camila.png'
import cecilia from '../assets/sprites/cecilia.png'
import elisa from '../assets/sprites/elisa.png'
import geraldo from '../assets/sprites/geraldo.png'
import iara from '../assets/sprites/iara.png'
import jana from '../assets/sprites/jana.png'
import julia from '../assets/sprites/julia.png'
import livia from '../assets/sprites/livia.png'
import lucas from '../assets/sprites/lucas.png'
import mariana from '../assets/sprites/mariana.png'
import marianaDark from '../assets/sprites/mariana-dark.png'
import marianaDarkGunpoint from '../assets/sprites/mariana-dark-gunpoint.png'
import maskedMan from '../assets/sprites/masked man.png'
import miro from '../assets/sprites/miro.png'
import nico from '../assets/sprites/nico.png'
import paula from '../assets/sprites/paula.png'
import rafael from '../assets/sprites/rafael.png'
import ricardo from '../assets/sprites/ricardo.png'
import rui from '../assets/sprites/rui.png'
import samuel from '../assets/sprites/samuel.png'
import sandra from '../assets/sprites/sandra.png'
import sandro from '../assets/sprites/sandro.png'

/**
 * Retratos disponíveis — ids alinhados a `seedPeople` / chaves `sprite:<id>` no chat.
 * Cada PNG em `src/assets/sprites/` precisa de import + entrada aqui (Vite não inclui por nome sozinho).
 */
export const CHARACTER_SPRITE_URLS: Record<string, string> = {
  andre,
  augusto,
  bia,
  caio,
  camila,
  cecilia,
  elisa,
  geraldo,
  iara,
  jana,
  julia,
  livia,
  lucas,
  mariana,
  'mariana-dark': marianaDark,
  'mariana-dark-gunpoint': marianaDarkGunpoint,
  'masked-man': maskedMan,
  miro,
  nico,
  paula,
  rafael,
  ricardo,
  rui,
  samuel,
  sandra,
  sandro,
}

export function contactAvatarSrc(contactId: string): string | undefined {
  return CHARACTER_SPRITE_URLS[contactId]
}

/** `sprite:<id>` ou caminho público `/assets/...`. */
export function resolveChatMediaSrc(src: string): string {
  if (src.startsWith('sprite:')) {
    const id = src.slice('sprite:'.length)
    return CHARACTER_SPRITE_URLS[id] ?? ''
  }
  return assetPath(src)
}

export function portraitSrcForStory(id: string): string | undefined {
  return CHARACTER_SPRITE_URLS[id]
}

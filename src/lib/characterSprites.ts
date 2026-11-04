import { assetPath } from './assetPath'
import augusto from '../assets/sprites/augusto.png'
import camila from '../assets/sprites/camila.png'
import julia from '../assets/sprites/julia.png'
import mariana from '../assets/sprites/mariana.png'
import paula from '../assets/sprites/paula.png'
import rafael from '../assets/sprites/rafael.png'
import lucas from '../assets/sprites/lucas.png'
import nico from '../assets/sprites/nico.png'
import iara from '../assets/sprites/iara.png'
import sandro from '../assets/sprites/sandro.png'
import caio from '../assets/sprites/caio.png'

/** Retratos disponíveis — ids alinhados a `mockContacts` / personagens. */
export const CHARACTER_SPRITE_URLS: Record<string, string> = {
  augusto,
  camila,
  julia,
  mariana,
  paula,
  rafael,
  lucas,
  nico,
  iara,
  sandro,
  caio,
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

export function portraitSrcForStory(
  id: 'julia' | 'camila' | 'augusto' | 'lucas' | 'iara' | 'sandro' | 'caio',
): string | undefined {
  return CHARACTER_SPRITE_URLS[id]
}

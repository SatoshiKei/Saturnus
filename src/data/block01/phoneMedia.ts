/** Galeria Fotos / Arquivos — mídia diegética do Bloco 1 (sprites, sem spoilers). */

export type PhoneMediaProvenance =
  | 'existing'
  | 'existing_locked'
  | 'existing_hidden'
  | 'received'
  | 'exported'
  | 'forensic_restored'

export type PhoneMediaItem = {
  id: string
  label: string
  /** chave em `CHARACTER_SPRITE_URLS` ou vazio para ícone genérico */
  spriteId?: string
  folder?: 'WhatsApp' | 'Câmera' | 'Downloads'
  /** Como o arquivo chegou / foi localizado no aparelho (opcional). */
  provenance?: PhoneMediaProvenance
  /** Texto curto opcional sob o nome no app Arquivos. */
  provenanceNote?: string
}

export const PROVENANCE_LABEL: Record<PhoneMediaProvenance, string> = {
  existing: 'No aparelho',
  existing_locked: 'Bloqueado no aparelho',
  existing_hidden: 'Oculto no aparelho',
  received: 'Recebido',
  exported: 'Exportado',
  forensic_restored: 'Recuperado pela perícia',
}

/**
 * Fotos — catálogos ESTRITAMENTE separados por aparelho.
 * Cada item pertence a um único aparelho (`device`) e sempre tem imagem própria (`spriteId`);
 * nunca cai em fundo genérico da mesa/escritório (isso era o vazamento Augusto → Mariana).
 */
export type PhonePhotoDevice = 'mariana' | 'augusto'

export type PhonePhotoItem = PhoneMediaItem & {
  device: PhonePhotoDevice
  spriteId: string
}

export const marianaPhotosLibrary: PhonePhotoItem[] = [
  { id: 'mp-1', label: 'Plantão — corredor', spriteId: 'mariana', folder: 'Câmera', device: 'mariana' },
  { id: 'mp-2', label: 'Júlia', spriteId: 'julia', folder: 'Câmera', device: 'mariana' },
  { id: 'mp-3', label: 'Camila', spriteId: 'camila', folder: 'Câmera', device: 'mariana' },
  { id: 'mp-4', label: 'Equipe — PA', spriteId: 'paula', folder: 'Câmera', device: 'mariana' },
]

export const marianaFilesLibrary: PhoneMediaItem[] = [
  { id: 'mf-wa-1', label: 'Foto — documento turno', spriteId: 'julia', folder: 'WhatsApp' },
  { id: 'mf-wa-2', label: 'Contato — Rafael', spriteId: 'rafael', folder: 'WhatsApp' },
  { id: 'mf-dl-1', label: 'Escala outubro.pdf', folder: 'Downloads' },
]

export const augustoPhotosLibrary: PhonePhotoItem[] = [
  { id: 'ap-1', label: 'Identificação', spriteId: 'augusto', folder: 'Câmera', device: 'augusto' },
  { id: 'ap-2', label: 'Camila — plantão', spriteId: 'camila', folder: 'Câmera', device: 'augusto' },
]

export const augustoFilesLibrary: PhoneMediaItem[] = [
  { id: 'af-wa-1', label: 'Prontuário — trecho', spriteId: 'camila', folder: 'WhatsApp' },
]

/** Única porta de entrada para o app Fotos: só devolve o acervo do aparelho pedido. */
export function photosForDevice(device: PhonePhotoDevice): readonly PhonePhotoItem[] {
  return device === 'augusto' ? augustoPhotosLibrary : marianaPhotosLibrary
}

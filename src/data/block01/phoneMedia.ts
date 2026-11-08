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

export const marianaPhotosLibrary: PhoneMediaItem[] = [
  { id: 'mp-1', label: 'Plantão — corredor', spriteId: 'mariana', folder: 'Câmera' },
  { id: 'mp-2', label: 'Júlia', spriteId: 'julia', folder: 'Câmera' },
  { id: 'mp-3', label: 'Camila', spriteId: 'camila', folder: 'Câmera' },
  { id: 'mp-4', label: 'Equipe — PA', spriteId: 'paula', folder: 'Câmera' },
]

export const marianaFilesLibrary: PhoneMediaItem[] = [
  { id: 'mf-wa-1', label: 'Foto — documento turno', spriteId: 'julia', folder: 'WhatsApp' },
  { id: 'mf-wa-2', label: 'Contato — Rafael', spriteId: 'rafael', folder: 'WhatsApp' },
  { id: 'mf-dl-1', label: 'Escala outubro.pdf', folder: 'Downloads' },
]

export const augustoPhotosLibrary: PhoneMediaItem[] = [
  { id: 'ap-1', label: 'Identificação', spriteId: 'augusto', folder: 'Câmera' },
  { id: 'ap-2', label: 'Camila — plantão', spriteId: 'camila', folder: 'Câmera' },
]

export const augustoFilesLibrary: PhoneMediaItem[] = [
  { id: 'af-wa-1', label: 'Prontuário — trecho', spriteId: 'camila', folder: 'WhatsApp' },
]

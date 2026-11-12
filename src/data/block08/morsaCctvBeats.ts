/** Cutscene CAM 03 → 07 → 11 — revelação sem spoiler prévio. */
export type MorsaCctvBeat =
  | { kind: 'cam'; frameIndex: number; spriteIndex?: number; thought?: string }
  | { kind: 'thought'; text: string }
  | { kind: 'name'; text: string }
  | { kind: 'pause' }

export const MORSA_CCTV_BEATS: MorsaCctvBeat[] = [
  { kind: 'thought', text: 'A passagem de serviço. As câmeras cobriam o trecho.' },
  { kind: 'cam', frameIndex: 0, spriteIndex: 0, thought: 'Mochila. Rádio. Entra mascarado.' },
  { kind: 'cam', frameIndex: 0, spriteIndex: 2 },
  { kind: 'cam', frameIndex: 1, spriteIndex: 0, thought: 'Corredor. Ainda a máscara.' },
  { kind: 'cam', frameIndex: 1, spriteIndex: 1 },
  { kind: 'cam', frameIndex: 1, spriteIndex: 2 },
  { kind: 'cam', frameIndex: 1, spriteIndex: 3 },
  { kind: 'cam', frameIndex: 1, spriteIndex: 4 },
  { kind: 'cam', frameIndex: 2, spriteIndex: 0, thought: 'Área norte. Mesma mochila. Mesmo rádio.' },
  { kind: 'cam', frameIndex: 2, spriteIndex: 1 },
  { kind: 'cam', frameIndex: 2, spriteIndex: 2 },
  { kind: 'pause' },
  { kind: 'cam', frameIndex: 2, spriteIndex: 3 },
  { kind: 'pause' },
  { kind: 'name', text: 'André.' },
]

/** Relógio lido no rAF — ref estável, funções atualizadas a cada render. */
export type PlayheadLiveClock = {
  playing: boolean
  /** Tempo no eixo da timeline (incl. Compare). */
  timelineSec: () => number
  /** Tempo no arquivo em reprodução. */
  fileSec: () => number
}
import type { InvestigationState } from '../../game/types'

export interface AchievementDef {
  id: string
  title: string
  description: string
  /** Se true, título/descrição ficam ocultos até desbloquear. */
  spoiler?: boolean
  /** Condição genérica visível quando não é spoiler. */
  hint?: string
  unlocked: (s: InvestigationState) => boolean
}

/** Conquistas derivadas do estado já existente — sem conteúdo narrativo novo. */
export const seedAchievements: AchievementDef[] = [
  {
    id: 'ach-case-open',
    title: 'Caso aberto',
    description: 'O boletim chegou à mesa.',
    hint: 'Começar o caso.',
    unlocked: (s) => Boolean(s.flags.block01_started),
  },
  {
    id: 'ach-first-audio',
    title: 'Ouvir de verdade',
    description: 'Um áudio foi aberto na bancada.',
    hint: 'Analisar uma gravação.',
    unlocked: (s) => s.audioSeen.length > 0,
  },
  {
    id: 'ach-cassini-division',
    title: 'DIVISÃO DE CASSINI',
    description: 'Recuperou os cinco fragmentos inteligíveis da chamada de emergência.',
    hint: 'Restaurar a ligação de emergência na bancada forense.',
    unlocked: (s) => Boolean(s.flags.block01_emergency_provisional),
  },
  {
    id: 'ach-iapetus',
    title: 'IAPETUS',
    description: 'Reconstruiu a estrutura do áudio de Rafael.',
    hint: 'Reparar a estrutura de um arquivo de áudio na bancada.',
    unlocked: (s) => Boolean(s.flags.block02_rafael_forward_provisional),
  },
  {
    id: 'ach-rings',
    title: 'ANÉIS',
    description: 'Identificou o set correspondente à gravação antiga.',
    hint: 'Comparar a gravação de balada com os registros de set do Vértice.',
    unlocked: (s) => Boolean(s.flags.block02_rings_provisional),
  },
  {
    id: 'ach-janus-epimetheus',
    title: 'JANUS E EPIMETHEUS',
    description: 'Sincronizou duas fontes independentes da noite do Vértice.',
    hint: 'Alinhar a captura ambiente com o feed da mesa na bancada forense.',
    unlocked: (s) => Boolean(s.flags.block03_janus_done),
  },
  {
    id: 'ach-hospital',
    title: 'Plantão',
    description: 'A conversa no hospital foi registrada.',
    hint: 'Ir a um local anotado no mapa.',
    unlocked: (s) => Boolean(s.flags.block01_hospital_done),
  },
  {
    id: 'ach-block1',
    title: 'O desaparecimento',
    description: 'O primeiro bloco do caso foi encerrado.',
    hint: 'Concluir a primeira etapa.',
    unlocked: (s) => Boolean(s.flags.block01_complete),
  },
  {
    id: 'ach-block2',
    title: 'Duas trilhas',
    description: 'A investigação saiu do apartamento.',
    hint: 'Seguir as pistas do segundo dia.',
    unlocked: (s) => Boolean(s.flags.block02_complete),
  },
  {
    id: 'ach-block3',
    title: 'Noites fora de ordem',
    description: 'A cronologia da noite começou a falhar.',
    hint: 'Avançar a terceira etapa.',
    unlocked: (s) => Boolean(s.flags.block03_complete),
  },
  {
    id: 'ach-diary',
    title: 'Caderno escondido',
    description: 'O diário no aparelho foi aberto.',
    hint: 'Desbloquear um app oculto.',
    unlocked: (s) => Boolean(s.flags.block04_diary_opened || s.phones.mariana.diaryUnlocked),
  },
  {
    id: 'ach-block4',
    title: 'Memórias emprestadas',
    description: 'O quarto bloco foi encerrado.',
    hint: 'Concluir a quarta etapa.',
    unlocked: (s) => Boolean(s.flags.block04_complete),
  },
  {
    id: 'ach-hypothesis',
    title: 'Hipótese no caderno',
    description: 'Uma hipótese foi registrada.',
    hint: 'Formar uma leitura do caso.',
    unlocked: (s) => Object.keys(s.hypotheses).length > 0,
  },
  {
    id: 'ach-contradiction',
    title: 'Contradição',
    description: 'O caderno confrontou duas evidências.',
    hint: 'Reunir material incompatível.',
    unlocked: (s) => s.contradictionsConfirmed.length > 0,
  },
  {
    id: 'ach-block5',
    title: 'O percurso deixado',
    description: 'O caminho de Mariana ficou visível.',
    spoiler: true,
    unlocked: (s) => Boolean(s.flags.block05_complete),
  },
  {
    id: 'ach-block6',
    title: 'A pessoa errada',
    description: 'A operação e a detenção mudaram o quadro.',
    spoiler: true,
    unlocked: (s) => Boolean(s.flags.block06_complete),
  },
  {
    id: 'ach-block7',
    title: 'O homem que não era Ricardo',
    description: 'A identidade no cadastro não sustentou o nome.',
    spoiler: true,
    unlocked: (s) => Boolean(s.flags.block07_complete),
  },
  {
    id: 'ach-block8',
    title: 'A noite sem assassinato',
    description: 'A queda deixou de ser o que a sentença afirmou.',
    spoiler: true,
    unlocked: (s) => Boolean(s.flags.block08_complete),
  },
  {
    id: 'ach-block9',
    title: 'Memória',
    description: 'O caso chegou ao fim.',
    spoiler: true,
    unlocked: (s) => Boolean(s.flags.block09_complete),
  },
]

export function achievementProgress(state: InvestigationState) {
  const unlocked = seedAchievements.filter((a) => a.unlocked(state))
  return { unlocked: unlocked.length, total: seedAchievements.length }
}

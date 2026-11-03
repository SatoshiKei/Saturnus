import type { AnalysisModule } from '../../game/types'

/**
 * Módulos da bancada de áudio / forense digital.
 * Adicionar um novo módulo = nova entrada aqui + (opcional) renderer em AudioLabPanel.
 * `unlocked` é o estado inicial; a progressão futura pode liberar módulos via story engine.
 */
export const seedAnalysisModules: (AnalysisModule & { description: string })[] = [
  {
    id: 'metadata',
    title: 'Metadados',
    description: 'Propriedades do arquivo, formato e origem declarada.',
    accepts: ['audio', 'derived'],
    unlocked: true,
  },
  {
    id: 'spectrogram',
    title: 'Espectrograma',
    description: 'Energia por frequência ao longo do tempo (visualização demonstrativa).',
    accepts: ['audio', 'derived'],
    unlocked: true,
  },
  {
    id: 'channels',
    title: 'Canais L/R',
    description: 'Isolamento e comparação de canais.',
    accepts: ['audio'],
    unlocked: false,
  },
  {
    id: 'compare',
    title: 'Comparação',
    description: 'Alinhamento entre dois áudios.',
    accepts: ['audio', 'derived'],
    unlocked: false,
  },
  {
    id: 'network',
    title: 'Rede (PCAP/RTP)',
    description: 'Captura de pacotes e fluxos de mídia.',
    accepts: ['digital'],
    unlocked: false,
  },
  {
    id: 'sqlite',
    title: 'Banco (SQLite)',
    description: 'Inspeção de bases extraídas de aplicativos.',
    accepts: ['digital'],
    unlocked: false,
  },
]
